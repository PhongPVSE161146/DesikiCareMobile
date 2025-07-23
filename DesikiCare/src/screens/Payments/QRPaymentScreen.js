"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native"
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

      {/* QR Code */}
      <View style={styles.qrContainer}>
        <View style={styles.qrCodeWrapper}>
          {/* Placeholder QR Code - Replace with actual QR generation */}
          <View style={styles.qrPlaceholder}>
            <Ionicons name="qr-code-outline" size={120} color="#666" />
          </View>
          {/* You can replace this with actual QR code using react-native-qrcode-svg */}
        </View>
        <Text style={styles.qrInstruction}>Mở ứng dụng ngân hàng và quét mã QR để thanh toán</Text>
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
