import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text, Animated, RefreshControl } from 'react-native';
import ProductList from '../../components/ProductComponnets/ProductList';
import FeatureButton from '../../components/HomeComponents/FeatureButton';
import FeaturedBrandsCarousel from '../../components/HomeComponents/FeaturedBrandsCarousel';
import { MaterialIcons } from '@expo/vector-icons';
import CustomHeader from '../../components/Header/CustomHeader';
import Notification from '../../components/NotiComponnets/Notification';
import PromoCarousel from '../../components/HomeComponents/PromoCarousel';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const features = [
  { title: 'Danh Mục', icon: <MaterialIcons name="menu" size={28} color="#555" /> },
  { title: 'Mini Game', icon: <MaterialIcons name="gamepad" size={28} color="#4CAF50" /> },
  { title: 'Hỗ Trợ', icon: <MaterialIcons name="support-agent" size={28} color="#9C27B0" /> },
  { title: 'Chính Sách', icon: <MaterialIcons name="policy" size={28} color="#795548" /> },
];

const HomeScreen = ({ navigation, route }) => {
  const [notificationMessage, setNotificationMessage] = useState(route.params?.notification?.message || '');
  const [notificationType, setNotificationType] = useState(route.params?.notification?.type || 'success');
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [refreshing, setRefreshing] = useState(false); // Thêm trạng thái refreshing
  const user = useSelector((state) => state.auth.user);
  const flatListRef = useRef(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (notificationMessage) {
      const timer = setTimeout(() => {
        setNotificationMessage('');
        setNotificationType('success');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notificationMessage]);

  const reload = useCallback(async () => {
    setRefreshing(true); // Bật trạng thái refreshing
    try {
      setReloadTrigger((prev) => prev + 1); // Kích hoạt làm mới dữ liệu
      setNotificationMessage(route.params?.notification?.message || '');
      setNotificationType(route.params?.notification?.type || 'success');
    } catch (error) {
      console.error('Lỗi khi làm mới:', error);
      setNotificationMessage('Lỗi khi làm mới dữ liệu.');
      setNotificationType('error');
    } finally {
      setRefreshing(false); // Tắt trạng thái refreshing
    }
  }, [route.params]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const timer = setTimeout(() => {
        if (isActive) {
          reload();
        }
      }, 0);
      return () => {
        isActive = false;
        clearTimeout(timer);
      };
    }, [reload])
  );

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true,
      listener: (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setShowScrollToTop(offsetY > 300);
      },
    }
  );

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const handleQuizPress = () => {
    if (!user) {
      setNotificationMessage('Vui lòng đăng nhập để tham gia Quiz.');
      setNotificationType('error');
      navigation.navigate('Login');
      return;
    }
    navigation.navigate('QuizScreen');
  };

  const handlePress = (title) => {
    switch (title) {
      case 'Danh Mục':
        navigation.navigate('Category');
        break;
      case 'Mini Game':
        if (!user) {
          setNotificationMessage('Vui lòng đăng nhập để chơi Mini Game.');
          setNotificationType('error');
          navigation.navigate('Login');
          return;
        }
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
        message={notificationMessage}
        type={notificationType}
        autoDismiss={3000}
        onDismiss={() => {
          setNotificationMessage('');
          setNotificationType('success');
        }}
        style={styles.notification}
      />
      <PromoCarousel style={styles.promoCarousel} reloadTrigger={reloadTrigger} />
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
      <FeaturedBrandsCarousel style={styles.featuredBrands} reloadTrigger={reloadTrigger} />
    </View>
  );

  return (
    <View style={styles.container}>
      <CustomHeader />
      <AnimatedFlatList
        ref={flatListRef}
        ListHeaderComponent={renderHeader}
        data={[]}
        renderItem={() => null}
        keyExtractor={() => 'dummy'}
        contentContainerStyle={styles.scrollContainer}
        ListFooterComponent={<ProductList navigation={navigation} reloadTrigger={reloadTrigger} />}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={reload} />
        }
      />
      <Animated.View
        style={[
          styles.quizButton,
          {
            opacity: scrollY.interpolate({
              inputRange: [0, 200],
              outputRange: [1, 0.7],
              extrapolate: 'clamp',
            }),
          },
        ]}
      >
        <TouchableOpacity onPress={handleQuizPress}>
          <MaterialIcons name="quiz" size={24} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
      {showScrollToTop && (
        <Animated.View
          style={[
            styles.scrollToTopButton,
            {
              opacity: scrollY.interpolate({
                inputRange: [300, 500],
                outputRange: [0, 1],
                extrapolate: 'clamp',
              }),
            },
          ]}
        >
          <TouchableOpacity onPress={scrollToTop}>
            <MaterialIcons name="arrow-upward" size={24} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    paddingBottom: 16,
    paddingHorizontal: 8,
  },
  headerContainer: {
    position: 'relative',
    zIndex: 5,
  },
  notification: {
    marginHorizontal: 8,
    marginTop: 8,
    zIndex: 20,
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
    width: '23%',
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredBrands: {
    marginVertical: 8,
    zIndex: 5,
  },
  quizButton: {
    position: 'absolute',
    right: 20,
    bottom: 80,
    backgroundColor: '#FF5722',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  scrollToTopButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#E53935',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default HomeScreen;