import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text } from 'react-native';
import ProductList from '../../components/ProductComponnets/ProductList';
import FeatureButton from '../../components/HomeComponents/FeatureButton';
import FeaturedBrandsCarousel from '../../components/HomeComponents/FeaturedBrandsCarousel';
import { MaterialIcons } from '@expo/vector-icons';
import CustomHeader from '../../components/Header/CustomHeader';
import Notification from '../../components/NotiComponnets/Notification';
import PromoCarousel from '../../components/HomeComponents/PromoCarousel';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

const features = [
  { title: 'Danh Mục', icon: <MaterialIcons name="menu" size={28} color="#555" /> },
  { title: 'Mini Game', icon: <MaterialIcons name="gamepad" size={28} color="#4CAF50" /> },
  { title: 'Hỗ Trợ', icon: <MaterialIcons name="support-agent" size={28} color="#9C27B0" /> },
  { title: 'Chính Sách', icon: <MaterialIcons name="policy" size={28} color="#795548" /> },
];

const HomeScreen = ({ navigation, route }) => {
  const [notificationMessage, setNotificationMessage] = useState(route.params?.notification?.message || '');
  const [notificationType, setNotificationType] = useState(route.params?.notification?.type || 'success');
  const [reloadTrigger, setReloadTrigger] = useState(0); // Trigger for reloading components
  const user = useSelector((state) => state.auth.user);

  // Handle notification auto-dismiss
  useEffect(() => {
    if (notificationMessage) {
      const timer = setTimeout(() => {
        setNotificationMessage('');
        setNotificationType('success');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notificationMessage]);

  // Reload function to trigger data refresh
  const reload = useCallback(() => {
    setReloadTrigger((prev) => prev + 1); // Increment to trigger re-fetch in components
    // Reset notifications from route params
    setNotificationMessage(route.params?.notification?.message || '');
    setNotificationType(route.params?.notification?.type || 'success');
  }, [route.params]);

  // Auto-reload when screen is focused
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const timer = setTimeout(() => {
        if (isActive) {
          reload(); // Trigger reload on focus
        }
      }, 0);
      return () => {
        isActive = false;
        clearTimeout(timer);
      };
    }, [reload])
  );

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
      <TouchableOpacity style={styles.refreshButton} onPress={reload}>
        <MaterialIcons name="refresh" size={24} color="#fff" />
        <Text style={styles.refreshButtonText}>Làm mới</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <CustomHeader />
      <FlatList
        ListHeaderComponent={renderHeader}
        data={[]}
        renderItem={() => null}
        keyExtractor={() => 'dummy'}
        contentContainerStyle={styles.scrollContainer}
        ListFooterComponent={<ProductList navigation={navigation} reloadTrigger={reloadTrigger} />}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
      />
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
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E53935',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 8,
    marginHorizontal: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
  },
});

export default HomeScreen;