import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import profileService from '../../config/axios/Home/AccountProfile/profileService'; // Adjust path based on your file structure

const AccountScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user); // Original Redux user state
  const orders = useSelector(state => state.orders?.history || []); // Fallback to empty array
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch profile data using profileService
  const fetchProfile = async () => {
    setLoading(true);
    setError(null);

    const result = await profileService.getProfile();
    if (result.success) {
      setProfileData(result.data); // Expecting { account, deliveryAddress }
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleLogout = async () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('userToken');
            dispatch({ type: 'auth/logout' }); // Clear Redux auth state
            navigation.replace('Login');
          } catch (err) {
            console.error('Logout error:', err);
            Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
          }
        },
      },
    ]);
  };

  const handleRefresh = () => {
    if (user) {
      fetchProfile();
    }
  };

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

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loginPrompt}>Đang tải...</Text>
      </View>
    );
  }

  if (error && error !== 'No token found. Please log in.') {
    return (
      <View style={styles.centered}>
        <Text style={styles.loginPrompt}>{error}</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!profileData) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loginPrompt}>Vui lòng đăng nhập để xem thông tin.</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginButton}>
          <Text style={styles.loginText}>Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { account, deliveryAddress } = profileData;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerSection}>
        <Ionicons
          name="person-circle-outline"
          size={80}
          color={account.imageUrl ? '#4F46E5' : '#6B7280'}
        />
        <Text style={styles.username}>{account.fullName || 'Khách hàng'}</Text>
        <Text style={styles.email}>{account.email}</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Thông tin tài khoản</Text>
        <InfoRow label="Họ tên" value={account.fullName || 'Chưa cập nhật'} />
        <InfoRow label="Ngày sinh" value={account.dob || 'Chưa cập nhật'} />
        <InfoRow label="Giới tính" value={account.gender || 'Chưa cập nhật'} />
        <InfoRow label="Số điện thoại" value={account.phoneNumber || 'Chưa cập nhật'} />
        <InfoRow label="Điểm tích lũy" value={account.points.toString() || '0'} />
        <InfoRow label="Trạng thái" value={account.isDeactivated ? 'Ngưng hoạt động' : 'Hoạt động'} />
        <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('EditProfile')}>
          <Text style={styles.linkText}>Chỉnh sửa thông tin</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.addressSection}>
        <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
        <InfoRow label="Người nhận" value={deliveryAddress?.receiverName || 'Chưa cập nhật'} />
        <InfoRow label="Số điện thoại" value={deliveryAddress?.receiverPhone || 'Chưa cập nhật'} />
        <InfoRow
          label="Địa chỉ"
          value={
            deliveryAddress
              ? `${deliveryAddress.addressDetailDescription}, ${deliveryAddress.wardCode}, ${deliveryAddress.districtCode}, ${deliveryAddress.provinceCode}`
              : 'Chưa cập nhật'
          }
        />
        <InfoRow
          label="Mặc định"
          value={deliveryAddress?.isDefault ? 'Có' : 'Không'}
        />
        <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('EditAddress')}>
          <Text style={styles.linkText}>Chỉnh sửa địa chỉ</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.orderSection}>
        <Text style={styles.sectionTitle}>Lịch sử đơn hàng</Text>
        {orders.length === 0 ? (
          <Text style={styles.empty}>Bạn chưa có đơn hàng nào.</Text>
        ) : (
          orders.map((order, index) => (
            <View key={order.id || index} style={styles.orderCard}>
              <Text style={styles.orderItem}>Mã đơn: {order.id}</Text>
              <Text style={styles.orderItem}>Trạng thái: {order.status}</Text>
              <Text style={styles.orderItem}>Ngày: {order.date}</Text>
              <Text style={styles.orderItem}>Tổng tiền: {order.total}₫</Text>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  headerSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  email: {
    color: '#6B7280',
    fontSize: 14,
  },
  infoSection: {
    marginTop: 10,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addressSection: {
    marginTop: 20,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#111827',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  label: {
    color: '#4B5563',
    fontSize: 14,
    flex: 1,
  },
  value: {
    color: '#111827',
    fontSize: 14,
    flex: 2,
    textAlign: 'right',
  },
  link: {
    marginTop: 12,
    alignSelf: 'flex-end',
  },
  linkText: {
    color: '#4F46E5',
    fontWeight: '500',
    fontSize: 14,
  },
  orderSection: {
    marginTop: 20,
  },
  orderCard: {
    backgroundColor: '#fff',
    padding: 12,
    marginVertical: 6,
    borderRadius: 6,
    elevation: 1,
  },
  orderItem: {
    fontSize: 14,
    color: '#374151',
    marginVertical: 2,
  },
  empty: {
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 10,
  },
  logoutButton: {
    marginTop: 30,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    padding: 12,
    borderRadius: 6,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginPrompt: {
    fontSize: 16,
    marginBottom: 16,
    color: '#374151',
  },
  loginButton: {
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 6,
  },
  loginText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  retryButton: {
    marginTop: 10,
    backgroundColor: '#4F46E5',
    padding: 10,
    borderRadius: 6,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default AccountScreen;