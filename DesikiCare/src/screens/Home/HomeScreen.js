import React, { useEffect, useState, useRef } from 'react';
import { View, FlatList, StyleSheet, Dimensions } from 'react-native';
import ProductList from '../../components/ProductList';
import FeatureButton from '../../components/FeatureButton';
import FeaturedBrandsCarousel from '../../components/FeaturedBrandsCarousel';
import { MaterialIcons } from '@expo/vector-icons';
import CustomHeader from '../../components/Header/CustomHeader';
import Notification from '../../components/Notification';
import PromoCarousel from '../../components/PromoCarousel';
import Canvas from 'react-native-canvas';

const features = [
  { title: 'Danh Mục', icon: <MaterialIcons name="menu" size={28} color="#555" /> },
  { title: 'Mini Game', icon: <MaterialIcons name="gamepad" size={28} color="#4CAF50" /> },
  { title: 'Hỗ Trợ', icon: <MaterialIcons name="support-agent" size={28} color="#9C27B0" /> },
  { title: 'Chính Sách', icon: <MaterialIcons name="policy" size={28} color="#795548" /> },
];

const HomeScreen = ({ navigation, route }) => {
  const [notification, setNotification] = useState(null);
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  });

  // Debounced dimension updates
  useEffect(() => {
    let timeout;
    const updateDimensions = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setDimensions({
          width: Dimensions.get('window').width,
          height: Dimensions.get('window').height,
        });
      }, 100); // Debounce by 100ms
    };

    const subscription = Dimensions.addEventListener('change', updateDimensions);
    return () => {
      subscription?.remove();
      clearTimeout(timeout);
    };
  }, []);

  // Canvas animation
  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      canvasRef.current.width = dimensions.width;
      canvasRef.current.height = dimensions.height;

      const scaleFactor = Math.min(dimensions.width / 414, 1); // Cap scale for small screens
      const numPetals = Math.floor(10 * scaleFactor); // Fewer petals for performance
      const petals = [];

      // Initialize petals
      for (let i = 0; i < numPetals; i++) {
        petals.push({
          x: Math.random() * dimensions.width,
          y: Math.random() * dimensions.height,
          size: (Math.random() * 8 + 6) * scaleFactor, // Smaller petals
          speedY: (Math.random() * 0.8 + 0.3) * scaleFactor, // Slower speed
          speedX: (Math.random() * 0.5 - 0.25) * scaleFactor,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() * 0.5 - 0.25) * scaleFactor,
        });
      }

      const drawPetal = (petal) => {
        ctx.save();
        ctx.translate(petal.x, petal.y);
        ctx.rotate((petal.rotation * Math.PI) / 180);
        ctx.fillStyle = 'rgba(255, 182, 193, 0.7)'; // Slightly more transparent
        ctx.beginPath();
        ctx.ellipse(0, 0, petal.size / 2, petal.size / 4, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
      };

      const updatePetals = () => {
        ctx.clearRect(0, 0, dimensions.width, dimensions.height);
        petals.forEach((petal) => {
          petal.y += petal.speedY;
          petal.x += petal.speedX;
          petal.rotation += petal.rotationSpeed;

          if (petal.y > dimensions.height) {
            petal.y = -petal.size;
            petal.x = Math.random() * dimensions.width;
          }

          drawPetal(petal);
        });
      };

      let animationFrameId;
      const animate = () => {
        updatePetals();
        animationFrameId = requestAnimationFrame(animate);
      };

      animate();

      return () => {
        cancelAnimationFrame(animationFrameId);
      };
    }
  }, [dimensions]);

  // Notification handling
  useEffect(() => {
    if (route.params?.notification) {
      setNotification(route.params.notification);
    }
  }, [route.params]);

  const handlePress = (title) => {
    switch (title) {
      case 'Danh Mục':
        navigation.navigate('Category');
        break;
      case 'Mini Game':
        navigation.navigate('MiniGameTabs', { screen: 'MiniGame' });
        break;
      case 'Hỗ Trợ':
        navigation.navigate('SupportScreen');
        break;
      case 'Chính Sách':
        navigation.navigate('PolicyScreen');
        break;
    }
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Notification
        message={notification?.message}
        type={notification?.type}
        onDismiss={() => setNotification(null)}
        style={styles.notification}
      />
      <PromoCarousel style={styles.promoCarousel} />
      <View style={styles.featureContainer}>
        {features.map((feature, index) => (
          <FeatureButton
            key={`feature-${index}`}
            title={feature.title}
            icon={feature.icon}
            onPress={() => handlePress(feature.title)}
            style={styles.featureButton}
          />
        ))}
      </View>
      <FeaturedBrandsCarousel style={styles.featuredBrands} />
    </View>
  );

  return (
    <View style={styles.container}>
      <CustomHeader />
      <Canvas ref={canvasRef} style={styles.canvas} />
      <FlatList
        ListHeaderComponent={renderHeader}
        data={[]}
        renderItem={() => null}
        keyExtractor={() => 'dummy'}
        contentContainerStyle={styles.scrollContainer}
        ListFooterComponent={<ProductList navigation={navigation} />}
        initialNumToRender={10} // Optimize for initial render
        maxToRenderPerBatch={10} // Batch rendering for performance
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Ensure consistent background
  },
  scrollContainer: {
    paddingBottom: 16, // Reduced padding for smaller screens
    paddingHorizontal: 8, // Add horizontal padding
  },
  headerContainer: {
    position: 'relative',
    zIndex: 5,
  },
  notification: {
    marginHorizontal: 8,
    marginTop: 8,
  },
  promoCarousel: {
    marginHorizontal: 8,
    marginVertical: 8,
  },
  featureContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fa7ca6',
    zIndex: 5,
  },
  featureButton: {
    width: '23%', // Ensure buttons fit on small screens
    minHeight: 60, // Minimum touch target size
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredBrands: {
    marginVertical: 8,
    zIndex: 5,
  },
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 10,
    pointerEvents: 'none',
  },
});

export default HomeScreen;