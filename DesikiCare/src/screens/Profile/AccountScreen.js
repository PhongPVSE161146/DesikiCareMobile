import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import profileService from '../../config/axios/Home/AccountProfile/profileService';
import { logout } from '../../redux/authSlice';
import Notification from '../../components/Notification';
import ProfileInfoSection from './ProfileInfoSection';
import PasswordChangeSection from './PasswordChangeSection';
import AddressListSection from './AddressListSection';
import AddAddressSection from './AddAddressSection';
import LogoutButton from './LogoutButton';
import styles from './styles';

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [profileData, setProfileData] = useState(null);
  const [deliveryAddresses, setDeliveryAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleUnauthorized = async (message) => {
    setNotification({ message, type: 'error' });
    await AsyncStorage.removeItem('userToken');
    dispatch(logout());
    navigation.replace('Login');
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const profileRes = await profileService.getProfile({
        headers: { 'ngrok-skip-browser-warning': 'true' },
      });
      if (profileRes.success && profileRes.data?.account) {
        const { account, deliveryAddress } = profileRes.data;
        setProfileData(profileRes.data);
        setDeliveryAddresses(deliveryAddress ? [deliveryAddress] : []);
      } else {
        if (profileRes.message.includes('hết hạn') || profileRes.message.includes('token')) {
          await handleUnauthorized(profileRes.message);
        } else {
          setNotification({ message: profileRes.message || 'Không thể tải hồ sơ.', type: 'error' });
        }
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
      setNotification({ message: 'Không thể tải thông tin người dùng.', type: 'error' });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      handleUnauthorized('Vui lòng đăng nhập để xem thông tin.');
    }
  }, [user]);

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loginPrompt}>Vui lòng đăng nhập để xem thông tin.</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginButton}>
          <Text style={styles.loginText}>Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading && !profileData) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loginPrompt}>Đang tải...</Text>
      </View>
    );
  }

  if (!profileData) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loginPrompt}>Không thể tải thông tin. Vui lòng thử lại.</Text>
        <TouchableOpacity onPress={fetchProfile} style={styles.resetButton}>
          <Text style={styles.resetText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Notification
        message={notification?.message}
        type={notification?.type}
        onDismiss={() => setNotification(null)}
      />
      <ProfileInfoSection
        profileData={profileData}
        setProfileData={setProfileData}
        fetchProfile={fetchProfile}
        setNotification={setNotification}
        handleUnauthorized={handleUnauthorized}
        loading={loading}
        setLoading={setLoading}
      />
      <PasswordChangeSection
        setNotification={setNotification}
        handleUnauthorized={handleUnauthorized}
        loading={loading}
        setLoading={setLoading}
      />
      <AddressListSection
        deliveryAddresses={deliveryAddresses}
        setNotification={setNotification}
        handleSetDefaultAddress={handleSetDefaultAddress}
        handleDeleteAddress={handleDeleteAddress}
        loading={loading}
      />
      <AddAddressSection
        profileData={profileData}
        fetchProfile={fetchProfile}
        setNotification={setNotification}
        handleUnauthorized={handleUnauthorized}
        loading={loading}
        setLoading={setLoading}
      />
      <LogoutButton navigation={navigation} setNotification={setNotification} loading={loading} />
    </ScrollView>
  );

  async function handleSetDefaultAddress(deliveryAddressId) {
    setLoading(true);
    try {
      const res = await profileService.setDefaultDeliveryAddress(deliveryAddressId);
      if (res.success) {
        setNotification({ message: 'Đặt địa chỉ mặc định thành công!', type: 'success' });
        await fetchProfile();
      } else {
        if (res.message.includes('hết hạn') || res.message.includes('token')) {
          await handleUnauthorized(res.message);
        } else {
          setNotification({ message: res.message || 'Đặt địa chỉ mặc định thất bại.', type: 'error' });
        }
      }
    } catch (error) {
      console.error('Set default address error:', error);
      setNotification({ message: 'Đặt địa chỉ mặc định thất bại.', type: 'error' });
    }
    setLoading(false);
  }

  async function handleDeleteAddress(deliveryAddressId) {
    Alert.alert('Xóa địa chỉ', 'Bạn có chắc muốn xóa địa chỉ này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            const res = await profileService.deleteDeliveryAddress(deliveryAddressId);
            if (res.success) {
              setNotification({ message: 'Xóa địa chỉ thành công!', type: 'success' });
              await fetchProfile();
            } else {
              if (res.message.includes('hết hạn') || res.message.includes('token')) {
                await handleUnauthorized(res.message);
              } else {
                setNotification({ message: res.message || 'Xóa địa chỉ thất bại.', type: 'error' });
              }
            }
          } catch (error) {
            console.error('Delete address error:', error);
            setNotification({ message: 'Xóa địa chỉ thất bại.', type: 'error' });
          }
          setLoading(false);
        },
      },
    ]);
  }
};

export default ProfileScreen;