import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { Ionicons } from '@expo/vector-icons';

const AccountScreen = ({ navigation }) => {
  const user = useSelector(state => state.auth.user);
  const orders = useSelector(state => state.orders?.history || []); // Add fallback to empty array
  const dispatch = useDispatch();

  const handleLogout = () => {


          navigation.replace('Login');
    
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerSection}>
        <Ionicons name="person-circle-outline" size={80} color="#4F46E5" />
        <Text style={styles.username}>{user.name || 'Khách hàng'}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Thông tin tài khoản</Text>
        <InfoRow label="Số điện thoại" value={user.phone || 'Chưa cập nhật'} />
        <InfoRow label="Địa chỉ giao hàng" value={user.address || 'Chưa cập nhật'} />
        <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('EditProfile')}>
          <Text style={styles.linkText}>Chỉnh sửa thông tin</Text>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#111827',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  label: {
    color: '#4B5563',
  },
  value: {
    color: '#111827',
  },
  link: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  linkText: {
    color: '#4F46E5',
    fontWeight: '500',
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
  },
  empty: {
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  logoutButton: {
    marginTop: 30,
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
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginPrompt: {
    fontSize: 16,
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 6,
  },
  loginText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default AccountScreen;