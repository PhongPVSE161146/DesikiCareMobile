import React from 'react';
import { TouchableOpacity, Text, View, Alert } from 'react-native'; // Thêm TouchableOpacity và Alert
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/authSlice';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from './styles';

const LogoutButton = ({ navigation, setNotification, loading }) => {
  const dispatch = useDispatch();

  const handleLogout = async () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('userToken');
            dispatch(logout());
            navigation.replace('Login');
          } catch (error) {
            console.error('Logout error:', error);
            setNotification({ message: 'Không thể đăng xuất. Vui lòng thử lại.', type: 'error' });
          }
        },
      },
    ]);
  };

  return (
    <TouchableOpacity
      style={[styles.logoutButton, loading && styles.buttonDisabled]}
      onPress={handleLogout}
      disabled={loading}
      accessible={true}
      accessibilityLabel="Đăng xuất"
    >
      <Icon name="logout" size={20} color="#fff" />
      <Text style={styles.logoutText}>Đăng xuất</Text>
    </TouchableOpacity>
  );
};

export default LogoutButton;