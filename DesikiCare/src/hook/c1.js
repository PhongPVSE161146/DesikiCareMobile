"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Linking } from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"

const QRPaymentScreen = ({ route, navigation }) => {
  const { paymentData, orderData } = route.params || {}
  const [isProcessing, setIsProcessing] = useState(false)
  const [countdown, setCountdown] = useState(300) // 5 phút countdown

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          Alert.alert("Hết thời gian thanh toán", "Phiên thanh toán đã hết hạn. Vui lòng thử lại.", [
            { text: "OK", onPress: () => navigation.goBack() },
          ])
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const formatCurrency = (amount) => {
    return amount?.toLocaleString("vi-VN") + "đ" || "0đ"
  }

  const handleOpenPaymentLink = () => {
    const paymentUrl = paymentData?.paymentUrl || paymentData?.paymentLink

    if (paymentUrl) {
      console.log("Opening payment URL:", paymentUrl)
      Linking.openURL(paymentUrl).catch((err) => {
        console.error("Failed to open payment URL:", err)
        Alert.alert("Lỗi", "Không thể mở link thanh toán. Vui lòng thử lại.")
      })
    } else {
      Alert.alert("Lỗi", "Không tìm thấy link thanh toán.")
    }
  }

  const handlePaymentSuccess = () => {
    setIsProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)

      // Navigate to success screen
      navigation.navigate("ConfirmPaymentScreen", {
        paymentData: {
          ...paymentData,
          orderData,
          paymentMethod: "bank",
          desc: "Thanh toán thành công",
          code: "00",
          transactionDateTime: new Date().toISOString(),
        },
      })
    }, 2000)
  }

  const handleCancelPayment = () => {
    Alert.alert("Hủy thanh toán", "Bạn có chắc chắn muốn hủy thanh toán?", [
      { text: "Không", style: "cancel" },
      {
        text: "Có",
        onPress: () => navigation.goBack(),
        style: "destructive",
      },
    ])
  }

  // Debug log để kiểm tra data structure
  console.log("QRPaymentScreen received paymentData:", JSON.stringify(paymentData, null, 2))
  console.log("QRPaymentScreen received orderData:", JSON.stringify(orderData, null, 2))

  return (
    <View style={styles.container}>
      {/* Timer */}
      <View style={styles.timerContainer}>
        <Ionicons name="time-outline" size={20} color="#FF5722" />
        <Text style={styles.timerText}>Thời gian còn lại: {formatTime(countdown)}</Text>
      </View>

      {/* Payment Info */}
      <View style={styles.paymentInfo}>
        <Text style={styles.amountLabel}>Số tiền cần thanh toán</Text>
        <Text style={styles.amount}>{formatCurrency(paymentData?.amount)}</Text>
        <Text style={styles.orderCode}>Mã đơn hàng: {paymentData?.orderCode}</Text>
      </View>

      {/* Payment Link Section */}
      {(paymentData?.paymentUrl || paymentData?.paymentLink) && (
        <View style={styles.paymentLinkContainer}>
          <Text style={styles.paymentLinkTitle}>Link thanh toán</Text>
          <TouchableOpacity style={styles.paymentLinkButton} onPress={handleOpenPaymentLink}>
            <Ionicons name="link-outline" size={20} color="#fff" />
            <Text style={styles.paymentLinkButtonText}>Mở trang thanh toán</Text>
          </TouchableOpacity>
          <Text style={styles.paymentLinkInstruction}>
            Nhấn vào nút trên để mở trang thanh toán PayOS và hoàn tất giao dịch
          </Text>
        </View>
      )}

      {/* QR Code Section */}
      <View style={styles.qrContainer}>
        <View style={styles.qrCodeWrapper}>
          {paymentData?.qrCode ? (
            // Nếu có QR code thực tế từ API
            <Text style={styles.qrCodeText}>QR Code: {paymentData.qrCode}</Text>
          ) : (
            // Placeholder QR Code
            <View style={styles.qrPlaceholder}>
              <Ionicons name="qr-code-outline" size={120} color="#666" />
            </View>
          )}
        </View>
        <Text style={styles.qrInstruction}>
          {paymentData?.qrCode
            ? "Sử dụng ứng dụng ngân hàng để quét mã QR trên"
            : "Mở ứng dụng ngân hàng và quét mã QR để thanh toán"}
        </Text>
      </View>

      {/* Bank Info */}
      <View style={styles.bankInfo}>
        <Text style={styles.bankTitle}>Thông tin chuyển khoản</Text>
        <View style={styles.bankRow}>
          <Text style={styles.bankLabel}>Ngân hàng:</Text>
          <Text style={styles.bankValue}>Vietcombank</Text>
        </View>
        <View style={styles.bankRow}>
          <Text style={styles.bankLabel}>Số tài khoản:</Text>
          <Text style={styles.bankValue}>1234567890</Text>
        </View>
        <View style={styles.bankRow}>
          <Text style={styles.bankLabel}>Chủ tài khoản:</Text>
          <Text style={styles.bankValue}>CONG TY ABC</Text>
        </View>
        <View style={styles.bankRow}>
          <Text style={styles.bankLabel}>Nội dung:</Text>
          <Text style={styles.bankValue}>{paymentData?.orderCode}</Text>
        </View>
        <View style={styles.bankRow}>
          <Text style={styles.bankLabel}>Số tiền:</Text>
          <Text style={styles.bankValue}>{formatCurrency(paymentData?.amount)}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.successButton} onPress={handlePaymentSuccess} disabled={isProcessing}>
          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={styles.successButtonText}>Đã thanh toán</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={handleCancelPayment}>
          <Text style={styles.cancelButtonText}>Hủy thanh toán</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    backgroundColor: "#FFF3E0",
    margin: 16,
    borderRadius: 8,
  },
  timerText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#FF5722",
    fontWeight: "500",
  },
  paymentInfo: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  amountLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  amount: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#E91E63",
    marginBottom: 8,
  },
  orderCode: {
    fontSize: 14,
    color: "#666",
  },
  paymentLinkContainer: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  paymentLinkTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  paymentLinkButton: {
    backgroundColor: "#2196F3",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    minWidth: 200,
  },
  paymentLinkButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  paymentLinkInstruction: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    lineHeight: 18,
  },
  qrContainer: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  qrCodeWrapper: {
    padding: 20,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    marginBottom: 16,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
  },
  qrCodeText: {
    fontSize: 12,
    color: "#333",
    textAlign: "center",
    padding: 20,
  },
  qrInstruction: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  bankInfo: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  bankTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  bankRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  bankLabel: {
    fontSize: 14,
    color: "#666",
  },
  bankValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  buttonContainer: {
    padding: 16,
    marginTop: "auto",
  },
  successButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12,
  },
  successButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "500",
  },
})

export default QRPaymentScreen
