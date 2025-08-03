import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Animated,
  Dimensions,
  RefreshControl,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import orderService from "../../config/axios/Order/orderService";
import profileService from "../../config/axios/Home/AccountProfile/profileService";
import OrderCard from "../../components/OrderComponents/OrderCard";

const STATUS_CATEGORIES = ["Chờ xử lý", "Đang giao", "Đã giao", "Đã huỷ"];

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scaleFont = (size) => (SCREEN_WIDTH / 375) * size;
const scale = (size) => (SCREEN_WIDTH / 375) * size;

const OrderHistory = ({ route }) => {
  const [ordersByStatus, setOrdersByStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusCategories, setStatusCategories] = useState(STATUS_CATEGORIES);
  const [selectedStatus, setSelectedStatus] = useState(STATUS_CATEGORIES[0]);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const newOrder = route.params?.newOrder;

  const statusMap = {
    Pending: "Chờ xử lý",
    "Chờ xử lí": "Chờ xử lý",
    Shipping: "Đang giao",
    Delivered: "Đã giao",
    Cancelled: "Đã huỷ",
  };

  const fetchOrderStatuses = async () => {
    try {
      const result = await orderService.getOrderStatuses();
      console.log("Order Statuses Response:", result);
      if (result.success && Array.isArray(result.data)) {
        const mappedStatuses = result.data
          .map((status) => statusMap[status] || status)
          .filter((status) => STATUS_CATEGORIES.includes(status));
        setStatusCategories(
          mappedStatuses.length > 0 ? mappedStatuses : STATUS_CATEGORIES
        );
      } else {
        console.warn(
          "Failed to fetch order statuses, using default STATUS_CATEGORIES"
        );
        setStatusCategories(STATUS_CATEGORIES);
      }
    } catch (err) {
      console.error("Error fetching order statuses:", err.message);
      setStatusCategories(STATUS_CATEGORIES);
    }
  };

 const fetchOrders = async () => {
  setLoading(true);
  setError(null);
  try {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const result = await orderService.getOrders();
    console.log("Raw API Response:", JSON.stringify(result.data, null, 2));
    if (result.success && Array.isArray(result.data)) {
      // Sort orders by createdAt in descending order (newest first)
      const sortedOrders = result.data.sort((a, b) => {
        const dateA = new Date(a.order?.createdAt || 0);
        const dateB = new Date(b.order?.createdAt || 0);
        return dateB - dateA; // Descending order
      });

      const grouped = {};
      statusCategories.forEach((status) => (grouped[status] = []));

      sortedOrders.forEach((order) => {
        console.log("Order:", {
          id: order.order?._id,
          status: order.orderStatus?.name,
          items: order.orderItems,
          createdAt: order.order?.createdAt, // Log date for debugging
        });
        const statusName =
          statusMap[order.orderStatus?.name] || order.orderStatus?.name;
        if (statusName && grouped[statusName] && order.order?._id) {
          grouped[statusName].push({
            ...order,
            orderItems: (order.orderItems || []).filter(
              (item) => item && typeof item === "object" && item.product?.name
            ),
          });
        } else {
          console.warn(`Invalid status or order ID:`, {
            statusName,
            orderId: order.order?._id,
          });
        }
      });

      if (
        newOrder &&
        newOrder.orderStatus?.name &&
        newOrder.order?._id &&
        Array.isArray(newOrder.orderItems)
      ) {
        const statusName =
          statusMap[newOrder.orderStatus.name] || newOrder.orderStatus.name;
        if (grouped[statusName]) {
          if (
            !grouped[statusName].some(
              (order) => order.order._id === newOrder.order._id
            )
          ) {
            const validOrderItems = (newOrder.orderItems || []).filter(
              (item) => item && typeof item === "object" && item.product?.name
            );
            grouped[statusName].unshift({
              ...newOrder,
              orderItems: validOrderItems,
            });
          }
        }
      }

      console.log("Grouped Orders:", grouped);
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
    await fetchOrderStatuses();
    await fetchOrders();
    setRefreshing(false);
  };

  const handleCancelOrder = async (orderId) => {
    console.log("handleCancelOrder called with orderId:", orderId);
    Alert.alert(
      "Xác nhận hủy đơn hàng",
      "Bạn có chắc chắn muốn hủy đơn hàng này? Số tiền thanh toán sẽ được chuyển thành điểm tích lũy.",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xác nhận",
          onPress: async () => {
            setLoading(true);
            try {
              const profileResult = await profileService.getProfile();
              console.log("Profile Response:", profileResult);
              if (!profileResult.success || !profileResult.data.account?._id) {
                Alert.alert("Lỗi", "Không thể lấy thông tin tài khoản.");
                setLoading(false);
                return;
              }
              const accountId = profileResult.data.account._id;
              const currentLoyaltyPoints = profileResult.data.account.points || 0;

              const result = await orderService.cancelOrder(orderId);
              console.log("Cancel Order Result:", result);
              if (result.success) {
                const { totalPrice } = result.data.order || {};
                console.log("Total Price from Cancelled Order:", totalPrice);
                let pointsEarned = 0;

                if (totalPrice) {
                  pointsEarned = Math.floor(totalPrice);
                  const updateResult = await profileService.updateAccount(
                    accountId,
                    {
                      points: currentLoyaltyPoints + pointsEarned,
                    }
                  );
                  console.log("Update Account Response:", updateResult);

                  if (updateResult.success) {
                    Alert.alert(
                      "Thành công",
                      `Đơn hàng đã được hủy. Bạn đã nhận được ${pointsEarned} điểm tích lũy.`
                    );
                    setSelectedStatus("Đã huỷ");
                  } else {
                    Alert.alert(
                      "Lỗi",
                      "Đơn hàng đã hủy nhưng không thể cập nhật điểm tích lũy."
                    );
                    setSelectedStatus("Đã huỷ");
                  }
                } else {
                  Alert.alert("Thành công", "Đơn hàng đã được hủy.");
                  setSelectedStatus("Đã huỷ");
                }
                await fetchOrders();
              } else {
                Alert.alert(
                  "Lỗi",
                  result.message.includes("404")
                    ? "API hủy đơn hàng chưa được triển khai. Vui lòng liên hệ đội backend."
                    : result.message || "Không thể hủy đơn hàng."
                );
              }
            } catch (err) {
              Alert.alert("Lỗi", "Đã xảy ra lỗi khi hủy đơn hàng.");
              console.error("Error in handleCancelOrder:", err);
            }
            setLoading(false);
          },
        },
      ]
    );
  };

  useEffect(() => {
    const initialize = async () => {
      await fetchOrderStatuses();
      await fetchOrders();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      if (newOrder?.orderStatus?.name) {
        const statusName =
          statusMap[newOrder.orderStatus.name] || newOrder.orderStatus.name;
        if (statusCategories.includes(statusName)) {
          setSelectedStatus(statusName);
        }
      }
    };
    initialize();
  }, [newOrder]);

  const handleTabChange = (status) => {
    console.log("Tab changed to:", status);
    setSelectedStatus(status);
  };

  const renderOrder = ({ item, index }) => {
    console.log(`Rendering order ${index}:`, item.order._id, item.orderItems);
    return (
      <OrderCard
        key={`${item.order._id}-${index}`}
        orderItem={item.orderItems[0] || { product: { name: `Đơn hàng ${item.order._id}` } }}
        orderId={item.order._id}
        order={item.order}
        canCancel={selectedStatus === "Chờ xử lý"}
        onCancel={() => {
          console.log("onCancel triggered for orderId:", item.order._id);
          handleCancelOrder(item.order._id);
        }}
      />
    );
  };

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
        <TouchableOpacity
          style={styles.retryButton}
          onPress={async () => {
            await fetchOrderStatuses();
            await fetchOrders();
          }}
        >
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
      onPress={() => handleTabChange(status)}
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
          {statusCategories.map(renderTabItem)}
        </ScrollView>
      </Animated.View>

      <FlatList
        data={currentOrders}
        keyExtractor={(item, index) => `${item.order._id}-${index}`}
        renderItem={renderOrder}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Không có đơn hàng ở trạng thái này.
          </Text>
        }
      />
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