import React, { useEffect, useState } from "react";
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
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import orderService from "../../config/axios/Order/orderService";
import OrderCard from "../../components/OrderComponents/OrderCard";

const STATUS_CATEGORIES = ["Chờ xử lý", "Đang giao", "Đã giao", "Đã huỷ"];

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scaleFont = (size) => (SCREEN_WIDTH / 375) * size;
const scale = (size) => (SCREEN_WIDTH / 375) * size;

const OrderHistory = ({ route }) => {
  const [ordersByStatus, setOrdersByStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(STATUS_CATEGORIES[0]);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const newOrder = route.params?.newOrder;

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      // Slight delay to ensure backend sync
      await new Promise((resolve) => setTimeout(resolve, 500));
      const result = await orderService.getOrders();
      console.log("API Response:", result); // Debug API response
      if (result.success) {
        const grouped = {};
        STATUS_CATEGORIES.forEach((status) => (grouped[status] = []));
        result.data.forEach((order) => {
          const statusName = order.orderStatus?.name;
          // Validate order and statusName
          if (statusName && grouped[statusName] && order.order?._id) {
            grouped[statusName].push({
              ...order,
              orderItems: (order.orderItems || []).filter(
                (item) => item && typeof item === "object" && item.title // Ensure item is valid
              ),
            });
          }
        });
        // Add newOrder to the appropriate status
        if (
          newOrder &&
          newOrder.orderStatus?.name &&
          newOrder.order?._id &&
          Array.isArray(newOrder.orderItems)
        ) {
          const statusName = newOrder.orderStatus.name;
          if (grouped[statusName]) {
            // Avoid duplicates by checking _id
            if (
              !grouped[statusName].some(
                (order) => order.order._id === newOrder.order._id
              )
            ) {
              // Filter valid orderItems in newOrder
              const validOrderItems = (newOrder.orderItems || []).filter(
                (item) => item && typeof item === "object" && item.title
              );
              grouped[statusName].unshift({
                ...newOrder,
                orderItems: validOrderItems,
              });
            }
          }
        }
        console.log("Grouped Orders:", grouped); // Debug grouped orders
        setOrdersByStatus(grouped);
      } else {
        setError("Không thể tải danh sách đơn hàng.");
      }
    } catch (err) {
      setError("Đã xảy ra lỗi khi tải đơn hàng.");
      console.error("Error:", err);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const handleCancelOrder = async (orderId) => {
    Alert.alert(
      "Xác nhận hủy đơn hàng",
      "Bạn có chắc chắn muốn hủy đơn hàng này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xác nhận",
          onPress: async () => {
            setLoading(true);
            const result = await orderService.cancelOrder(orderId);
            if (result.success) {
              Alert.alert("Thành công", "Đơn hàng đã được hủy.");
              await fetchOrders(); // Làm mới danh sách đơn hàng
            } else {
              Alert.alert("Lỗi", result.message || "Không thể hủy đơn hàng.");
            }
            setLoading(false);
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchOrders();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    if (newOrder?.orderStatus?.name) {
      setSelectedStatus(newOrder.orderStatus.name);
    }
  }, [newOrder]);

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
      case "Chờ xử lý":
        return { backgroundColor: "#FBBF24" };
      case "Đang giao":
        return { backgroundColor: "#8B5CF6" };
      case "Đã giao":
        return { backgroundColor: "#10B981" };
      case "Đã huỷ":
        return { backgroundColor: "#EF4444" };
      default:
        return { backgroundColor: "#007AFF" };
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
      <Text
        style={[
          styles.tabItemText,
          selectedStatus === status && styles.tabItemTextActive,
        ]}
      >
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {currentOrders.length === 0 ? (
          <Text style={styles.emptyText}>Không có đơn hàng ở trạng thái này.</Text>
        ) : (
          currentOrders.map((order, orderIndex) =>
            (order.orderItems || []).map((item, i) => {
              if (!item || typeof item !== "object" || !item.title) {
                console.warn(`Invalid orderItem at order ${order.order._id}, index ${i}`); // Debug
                return null; // Skip invalid items
              }
              return (
                <OrderCard
                  key={`${order.order._id}-${i}`}
                  orderItem={item}
                  orderId={order.order._id} // Thêm orderId
                  canCancel={selectedStatus === "Chờ xử lý"} // Chỉ cho phép hủy ở trạng thái "Chờ xử lý"
                  onCancel={() => handleCancelOrder(order.order._id)} // Truyền hàm hủy
                />
              );
            })
          )
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  tabsContainer: {
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
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
    flexDirection: "row",
    paddingHorizontal: scale(12),
    paddingVertical: scale(4),
    alignItems: "center",
    paddingBottom: scale(6),
    minHeight: scale(20),
    justifyContent: "flex-start",
    backgroundColor: "#FFFFFF",
    marginBottom: scale(8),
  },
  tabItem: {
    paddingVertical: scale(6),
    paddingHorizontal: scale(16),
    marginRight: scale(6),
    borderRadius: scale(16),
    backgroundColor: "#E8ECEF",
    minWidth: scale(70),
    minHeight: scale(32),
    alignItems: "center",
    justifyContent: "center",
  },
  tabItemActive: {},
  tabItemText: {
    color: "#1F2A44",
    fontSize: scaleFont(13),
    fontWeight: "600",
    textAlign: "center",
  },
  tabItemTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  contentContainer: {
    paddingHorizontal: scale(12),
    paddingBottom: scale(80),
  },
  emptyText: {
    padding: scale(30),
    textAlign: "center",
    fontSize: scaleFont(15),
    color: "#64748B",
    fontStyle: "italic",
    marginTop: scale(200),
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    marginTop: scale(12),
    fontSize: scaleFont(15),
    color: "#64748B",
  },
  errorText: {
    fontSize: scaleFont(15),
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: scale(16),
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingVertical: scale(10),
    paddingHorizontal: scale(20),
    borderRadius: scale(10),
    minHeight: scale(44),
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: scaleFont(15),
    fontWeight: "600",
  },
});

export default OrderHistory;