import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import orderService from '../../config/axios/Order/orderService';
import OrderCard from '../../components/OrderCard';

const STATUS_CATEGORIES = ['Chờ xử lý', 'Đang giao', 'Đã giao', 'Đã huỷ'];

const OrderHistory = () => {
  const [ordersByStatus, setOrdersByStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState(STATUS_CATEGORIES[0]);

  const fetchOrders = async () => {
    setLoading(true);
    const result = await orderService.getOrders();
    if (result.success) {
      const grouped = {};
      STATUS_CATEGORIES.forEach(status => (grouped[status] = []));
      result.data.forEach(order => {
        const statusName = order.orderStatus.name;
        if (grouped[statusName]) {
          grouped[statusName].push(order);
        }
      });
      setOrdersByStatus(grouped);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4a90e2" />
      </View>
    );
  }

  const renderTabItem = (status) => (
    <TouchableOpacity
      key={status}
      style={[
        styles.tabItem,
        selectedStatus === status && styles.tabItemActive,
      ]}
      onPress={() => setSelectedStatus(status)}
    >
      <Text style={[
        styles.tabItemText,
        selectedStatus === status && styles.tabItemTextActive,
      ]}>
        {status}
      </Text>
    </TouchableOpacity>
  );

  const currentOrders = ordersByStatus[selectedStatus] || [];

  return (
    <View style={styles.container}>
      {/* Tabs ngang */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
      >
        {STATUS_CATEGORIES.map(renderTabItem)}
      </ScrollView>

      {/* Danh sách đơn */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {currentOrders.length === 0 ? (
          <Text style={styles.emptyText}>Không có đơn hàng ở trạng thái này.</Text>
        ) : (
          currentOrders.map(order =>
            (order.orderItems || []).map((item, i) => (
              <OrderCard key={`${order.order._id}-${i}`} orderItem={item} />
            ))
          )
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 2,
    backgroundColor: '#f5f7fa',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingTop: 12,
    paddingBottom: 250,
    alignItems: 'center',
  },
  tabItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 19,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    maxWidth: 100,
    flexShrink: 2,
  },
  tabItemActive: {
    backgroundColor: '#4a90e2',
  },
  tabItemText: {
    color: '#333',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  tabItemTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  contentContainer: {
    padding: 12,
  },
  emptyText: {
    padding: 16,
    marginBottom: 300,
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#999',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OrderHistory;
