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
  { title: 'Danh Mục', icon: <MaterialIcons name="menu" size={32} color="#555" /> },
  { title: 'Mini Game', icon: <MaterialIcons name="gamepad" size={32} color="#4CAF50" /> },
  { title: 'Hỗ Trợ', icon: <MaterialIcons name="support-agent" size={32} color="#9C27B0" /> },
  { title: 'Chính Sách', icon: <MaterialIcons name="policy" size={32} color="#795548" /> },
];

const HomeScreen = ({ navigation, route }) => {
  const [notification, setNotification] = useState(null);
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
      });
    };

    const subscription = Dimensions.addEventListener('change', updateDimensions);
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      canvasRef.current.width = dimensions.width;
      canvasRef.current.height = dimensions.height;

      const scaleFactor = dimensions.width / 414; // Base width (e.g., iPhone 12 Pro)
      const numPetals = Math.floor(15 * scaleFactor); // Reduced for performance
      const petals = [];

      // Initialize petals
      for (let i = 0; i < numPetals; i++) {
        petals.push({
          x: Math.random() * dimensions.width,
          y: Math.random() * dimensions.height,
          size: (Math.random() * 10 + 8) * scaleFactor,
          speedY: (Math.random() * 1 + 0.5) * scaleFactor, // Slower falling speed
          speedX: (Math.random() * 1 - 0.5) * scaleFactor,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() * 1 - 0.5) * scaleFactor,
        });
      }

      const drawPetal = (petal) => {
        ctx.save();
        ctx.translate(petal.x, petal.y);
        ctx.rotate((petal.rotation * Math.PI) / 180);
        ctx.fillStyle = 'rgba(255, 182, 193, 0.8)';
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
      />
      <PromoCarousel />
     
      <View style={styles.featureContainer}>
        {features.map((feature, index) => (
          <FeatureButton
            key={`feature-${index}`}
            title={feature.title}
            icon={feature.icon}
            onPress={() => handlePress(feature.title)}
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
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  headerContainer: {
    position: 'relative',
    zIndex: 5, // Ensure header components are above FlatList but below canvas
  },
  featureContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: '#fa7ca6',
    zIndex: 5, // Ensure buttons are clickable
  },
  featuredBrands: {
    zIndex: 5, // Ensure FeaturedBrandsCarousel is above FlatList content
    backgroundColor: '#fff', // Temporary background to confirm visibility
  },
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 10,
    pointerEvents: 'none', // Allow touch events to pass through
  },
});

export default HomeScreen;