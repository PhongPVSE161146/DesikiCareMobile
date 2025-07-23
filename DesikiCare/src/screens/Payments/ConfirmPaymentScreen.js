import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"

const ConfirmPaymentScreen = ({ route, navigation }) => {
  const { paymentData } = route.params || {}

  const formatCurrency = (amount) => {
    return amount?.toLocaleString("vi-VN") + "đ" || "0đ"
  }

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "N/A"
    try {
      return new Date(dateTime).toLocaleString("vi-VN")
    } catch (e) {
      return dateTime
    }
  }

  const handleNavigateToOrders = () => {
    try {
      // SỬA: Navigate đến Main tab navigator và chọn PaidOrderHistory tab
      navigation.navigate("Main", {
        screen: "PaidOrderHistory",
      })
    } catch (error) {
      console.log("Navigation error:", error)
      // Fallback: Navigate về Main và user tự chọn tab
      navigation.navigate("Main")
    }
  }

  const handleNavigateToHome = () => {
    try {
      // Navigate đến Main tab navigator và chọn Home tab
      navigation.navigate("Main", {
        screen: "Home",
      })
    } catch (error) {
      console.log("Navigation error:", error)
      // Fallback: Navigate về Main
      navigation.navigate("Main")
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
        <Text style={styles.title}>Đặt hàng thành công!</Text>
        <Text style={styles.subtitle}>Cảm ơn bạn đã đặt hàng</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Thông tin đơn hàng</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Mã đơn hàng:</Text>
          <Text style={styles.value}>{paymentData?.orderCode || "N/A"}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Tổng tiền:</Text>
          <Text style={[styles.value, styles.amount]}>{formatCurrency(paymentData?.amount)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Phương thức thanh toán:</Text>
          <Text style={styles.value}>
            {paymentData?.paymentMethod === "cod" ? "Thanh toán khi nhận hàng" : "Chuyển khoản ngân hàng"}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Thời gian:</Text>
          <Text style={styles.value}>{formatDateTime(paymentData?.transactionDateTime)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Trạng thái:</Text>
          <Text style={[styles.value, styles.status]}>{paymentData?.desc || "Đã xác nhận"}</Text>
        </View>
      </View>

      {paymentData?.orderData?.cartItems && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sản phẩm đã đặt</Text>
          {paymentData.orderData.cartItems.map((item, index) => (
            <View key={index} style={styles.productItem}>
              <Text style={styles.productName} numberOfLines={2}>
                {item.title}
              </Text>
              <View style={styles.productDetails}>
                <Text style={styles.productQuantity}>SL: {item.quantity}</Text>
                <Text style={styles.productPrice}>{formatCurrency(item.price)}</Text>
              </View>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tạm tính:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(paymentData.orderData.subtotal)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí vận chuyển:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(paymentData.orderData.shippingFee)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Tổng cộng:</Text>
            <Text style={styles.totalValue}>{formatCurrency(paymentData.orderData.total)}</Text>
          </View>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleNavigateToOrders}>
          <Text style={styles.primaryButtonText}>Xem đơn hàng</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleNavigateToHome}>
          <Text style={styles.secondaryButtonText}>Về trang chủ</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    alignItems: "center",
    padding: 32,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
  },
  card: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  label: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  amount: {
    color: "#E91E63",
    fontWeight: "bold",
  },
  status: {
    color: "#4CAF50",
  },
  productItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  productName: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  productDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productQuantity: {
    fontSize: 12,
    color: "#666",
  },
  productPrice: {
    fontSize: 14,
    color: "#E91E63",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    color: "#333",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E91E63",
  },
  buttonContainer: {
    padding: 16,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: "#E91E63",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E91E63",
  },
  secondaryButtonText: {
    color: "#E91E63",
    fontSize: 16,
    fontWeight: "500",
  },
})

export default ConfirmPaymentScreen
