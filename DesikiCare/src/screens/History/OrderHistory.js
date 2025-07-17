import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import orderService from '../../config/axios/Order/orderService';
import OrderCard from '../../components/OrderCard';

const STATUS_CATEGORIES = ['Chờ xử lý', 'Đang giao', 'Đã giao', 'Đã huỷ'];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scaleFont = (size) => (SCREEN_WIDTH / 375) * size;
const scale = (size) => (SCREEN_WIDTH / 375) * size;

const OrderHistory = () => {
  const [ordersByStatus, setOrdersByStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(STATUS_CATEGORIES[0]);
  const [fadeAnim] = useState(new Animated.Value(0));

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
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
      } else {
        setError('Không thể tải danh sách đơn hàng.');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi tải đơn hàng.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchOrders}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const getTabActiveStyle = (status) => {
    switch (status) {
      case 'Chờ xử lý':
        return { backgroundColor: '#FBBF24' }; // Yellow
      case 'Đang giao':
        return { backgroundColor: '#8B5CF6' }; // Purple
      case 'Đã giao':
        return { backgroundColor: '#10B981' }; // Green
      case 'Đã huỷ':
        return { backgroundColor: '#EF4444' }; // Red
      default:
        return { backgroundColor: '#007AFF' }; // Fallback
    }
  };

  const renderTabItem = (status) => (
    <TouchableOpacity
      key={status}
      style={[
        styles.tabItem,
        selectedStatus === status && styles.tabItemActive,
        selectedStatus === status && getTabActiveStyle(status),
      ]}
      onPress={() => setSelectedStatus(status)}
      activeOpacity={0.7}
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
      <Animated.View style={[styles.tabsContainer, { opacity: fadeAnim }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsInnerContainer}
        >
          {STATUS_CATEGORIES.map(renderTabItem)}
        </ScrollView>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
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
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  tabsContainer: {
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  tabsInnerContainer: {
    flexDirection: 'row',
    paddingHorizontal: scale(12),
    paddingVertical: scale(4), // Further reduced from 6 to align closer to order items
    alignItems: 'center',
    paddingBottom: scale(6), // Further reduced from 6
    minHeight: scale(20), // Further reduced from 40 to make tabs more compact
    justifyContent: 'flex-start',
    backgroundColor: '#FFFFFF',
    marginBottom: scale(8), // Further reduced from 12

 
  },
  tabItem: {
    paddingVertical: scale(6),
    paddingHorizontal: scale(16),
    marginRight: scale(6),
    borderRadius: scale(16),
    backgroundColor: '#E8ECEF',
    minWidth: scale(70),
    minHeight: scale(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItemActive: {
    // Base active style, overridden by getTabActiveStyle
  },
  tabItemText: {
    color: '#1F2A44',
    fontSize: scaleFont(13),
    fontWeight: '600',
    textAlign: 'center',
  },
  tabItemTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  contentContainer: {
    paddingHorizontal: scale(12),
    paddingBottom: scale(80),
  },
  emptyText: {
    padding: scale(30),
    textAlign: 'center',
    fontSize: scaleFont(15),
    color: '#64748B',
    fontStyle: 'italic',
    marginTop: scale(200),
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    
  },
  loadingText: {
    marginTop: scale(12),
    fontSize: scaleFont(15),
    color: '#64748B',
  },
  errorText: {
    fontSize: scaleFont(15),
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: scale(16),
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: scale(10),
    paddingHorizontal: scale(20),
    borderRadius: scale(10),
    minHeight: scale(44),
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: scaleFont(15),
    fontWeight: '600',
  },
});

export default OrderHistory;