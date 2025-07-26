"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Linking,
  ScrollView,
  Clipboard,
  BackHandler,
} from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import orderService from "../../config/axios/Order/orderService"

const QRPaymentScreen = ({ route, navigation }) => {
  const { paymentData, orderData } = route.params || {}
  const [isProcessing, setIsProcessing] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [paymentCompleted, setPaymentCompleted] = useState(false)

  // Bank information for manual transfer
  const BANK_INFO = {
    bankId: "STB", // Sacombank
    accountNumber: "070113484770",
    accountName: "PHAM VAN PHONG",
  }

  // Track current order ID
  const currentOrderIdRef = useRef(null)

  // Enhanced order ID detection
  const getOrderIdentifier = () => {
    const orderId = paymentData?.orderId || paymentData?.orderCode || paymentData?.id
    console.log("🔍 Detecting order identifier:", {
      orderId: paymentData?.orderId,
      orderCode: paymentData?.orderCode,
      id: paymentData?.id,
      finalId: orderId,
      isObjectId: paymentData?.orderId && paymentData.orderId.length === 24,
    })
    return orderId
  }

  // Reset for new order
  useEffect(() => {
    const newOrderId = getOrderIdentifier()
    if (newOrderId && newOrderId !== currentOrderIdRef.current) {
      console.log("🔄 New order detected, resetting state...")
      console.log("Previous order:", currentOrderIdRef.current)
      console.log("New order:", newOrderId)
      console.log("New order amount (no shipping):", paymentData?.amount)
      currentOrderIdRef.current = newOrderId
      setPaymentCompleted(false)
      console.log("✅ Reset for new order")
    }
  }, [paymentData?.orderCode, paymentData?.orderId])

  // Disable back button/gesture
  useEffect(() => {
    const backAction = () => {
      if (paymentCompleted) {
        return false
      }

      Alert.alert("Thoát thanh toán?", "Bạn có chắc chắn muốn thoát? Giao dịch sẽ bị hủy.", [
        { text: "Ở lại", style: "cancel" },
        {
          text: "Thoát",
          style: "destructive",
          onPress: () => handleCancelPayment(true),
        },
      ])
      return true
    }

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction)

    navigation.setOptions({
      headerLeft: () => null,
      gestureEnabled: false,
    })

    return () => backHandler.remove()
  }, [navigation, paymentCompleted])

  // Cancel payment link API call
  const cancelPaymentLink = async (orderId, orderCode) => {
    try {
      console.log("🚫 Attempting to cancel payment link for:", { orderId, orderCode })
      const cancelResult = await orderService.cancelPaymentLink?.(orderId || orderCode)
      if (cancelResult?.success) {
        console.log("✅ Payment link cancelled successfully")
        return true
      } else {
        console.log("⚠️ Payment link cancellation failed:", cancelResult?.message)
        return false
      }
    } catch (error) {
      console.error("❌ Error cancelling payment link:", error.message)
      return false
    }
  }

  // Cancel order API call
  const cancelOrder = async (orderId) => {
    try {
      console.log("🚫 Attempting to cancel order:", orderId)
      const cancelResult = await orderService.cancelOrder?.(orderId)
      if (cancelResult?.success) {
        console.log("✅ Order cancelled successfully")
        return true
      } else {
        console.log("⚠️ Order cancellation failed:", cancelResult?.message)
        return false
      }
    } catch (error) {
      console.error("❌ Error cancelling order:", error.message)
      return false
    }
  }

  const formatCurrency = (amount) => {
    return amount?.toLocaleString("vi-VN") + "đ" || "0đ"
  }

  const handleCopyBankInfo = async (text, label) => {
    try {
      await Clipboard.setString(text)
      Alert.alert("Đã sao chép", `${label} đã được sao chép vào clipboard`)
    } catch (error) {
      console.error("Failed to copy to clipboard:", error)
      Alert.alert("Lỗi", "Không thể sao chép. Vui lòng thử lại.")
    }
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

  const handlePaymentSuccess = async (autoDetected = false) => {
    if (paymentCompleted) {
      console.log("⚠️ Payment already completed, ignoring duplicate success call")
      return
    }

    console.log("✅ Payment success detected, auto:", autoDetected)
    setIsProcessing(true)

    // Confirm payment with server
    const paymentPayload = {
      orderId: getOrderIdentifier(),
      amount: paymentData.amount,
      paymentMethod: paymentData.paymentMethod || "bank",
      description: "Thanh toán thành công",
      transactionDateTime: new Date().toISOString(),
      currency: "VND",
    }

    try {
      console.log("📤 Sending confirmPayment with payload:", JSON.stringify(paymentPayload, null, 2))
      const confirmResult = await orderService.confirmPayment(paymentPayload)
      console.log("✅ Confirm Payment Result:", JSON.stringify(confirmResult, null, 2))

      if (!confirmResult.success) {
        console.error("❌ Payment confirmation failed:", confirmResult.message)
        Alert.alert("Lỗi", "Không thể xác nhận thanh toán. Vui lòng liên hệ hỗ trợ.")
        setIsProcessing(false)
        return
      }

      setPaymentCompleted(true)
      const successMessage = autoDetected ? "Thanh toán đã được xác nhận tự động!" : "Xác nhận thanh toán thành công!"

      if (autoDetected) {
        navigation.navigate("ConfirmPaymentScreen", {
          paymentData: {
            ...paymentData,
            orderData,
            paymentMethod: "bank",
            desc: confirmResult.data.desc || "Thanh toán thành công",
            code: confirmResult.data.code || "00",
            transactionDateTime: confirmResult.data.transactionDateTime,
            verified: true,
            autoDetected: true,
          },
        })
      } else {
        Alert.alert("Xác nhận thanh toán", successMessage, [
          {
            text: "OK",
            onPress: () => {
              navigation.navigate("ConfirmPaymentScreen", {
                paymentData: {
                  ...paymentData,
                  orderData,
                  paymentMethod: "bank",
                  desc: confirmResult.data.desc || "Thanh toán thành công",
                  code: confirmResult.data.code || "00",
                  transactionDateTime: confirmResult.data.transactionDateTime,
                  verified: true,
                  manualConfirm: true,
                },
              })
            },
          },
        ])
      }
    } catch (error) {
      console.error("❌ Error confirming payment:", error.message, error.response?.data)
      Alert.alert("Lỗi", "Không thể xác nhận thanh toán. Vui lòng liên hệ hỗ trợ.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleManualPaymentSuccess = () => {
    if (paymentCompleted) {
      Alert.alert("Thông báo", "Thanh toán đã được xác nhận rồi.")
      return
    }

    Alert.alert(
      "Xác nhận thanh toán",
      "Bạn có chắc chắn đã hoàn tất thanh toán? Hệ thống sẽ xác nhận giao dịch của bạn.",
      [
        { text: "Chưa thanh toán", style: "cancel" },
        {
          text: "Đã thanh toán",
          onPress: () => handlePaymentSuccess(false),
        },
      ]
    )
  }

  const handleCancelPayment = async (isAutoCancel = false) => {
    if (paymentCompleted) {
      navigation.navigate("Main")
      return
    }

    const message = isAutoCancel
      ? "Phiên thanh toán đã bị hủy. Đơn hàng và link thanh toán sẽ bị hủy."
      : "Bạn có chắc chắn muốn hủy thanh toán? Đơn hàng và link thanh toán sẽ bị hủy."

    const confirmCancel = () => {
      Alert.alert("Hủy thanh toán", message, [
        ...(isAutoCancel ? [] : [{ text: "Tiếp tục thanh toán", style: "cancel" }]),
        {
          text: isAutoCancel ? "OK" : "Hủy đơn hàng",
          style: "destructive",
          onPress: async () => {
            setIsCancelling(true)
            console.log("🚫 Starting cancellation process...")

            try {
              const orderIdentifier = getOrderIdentifier()

              if (orderIdentifier) {
                console.log("🚫 Cancelling payment link...")
                const paymentCancelled = await cancelPaymentLink(orderIdentifier, orderIdentifier)
                if (paymentCancelled) {
                  console.log("✅ Payment link cancelled successfully")
                } else {
                  console.log("⚠️ Payment link cancellation failed, but continuing...")
                }

                console.log("🚫 Cancelling order...")
                const orderCancelled = await cancelOrder(orderIdentifier)
                if (orderCancelled) {
                  console.log("✅ Order cancelled successfully")
                } else {
                  console.log("⚠️ Order cancellation failed, but continuing...")
                }
              }

              currentOrderIdRef.current = null
              console.log("🔄 Order reference reset")
            } catch (error) {
              console.error("❌ Error during cancellation:", error.message)
            } finally {
              setIsCancelling(false)
              navigation.navigate("Main")
            }
          },
        },
      ])
    }

    confirmCancel()
  }

  const orderIdentifier = getOrderIdentifier()
  const isObjectId = orderIdentifier && orderIdentifier.length === 24 && /^[0-9a-fA-F]{24}$/.test(orderIdentifier)
  console.log("🔍 QRPaymentScreen Debug Info:")
  console.log("  - Current Order ID:", currentOrderIdRef.current)
  console.log("  - Payment Data Order ID:", paymentData?.orderId)
  console.log("  - Payment Data Order Code:", paymentData?.orderCode)
  console.log("  - Detected Order Identifier:", orderIdentifier)
  console.log("  - Is Valid ObjectId:", isObjectId)
  console.log("  - Payment Amount (no shipping):", paymentData?.amount)
  console.log("  - Is Cancelling:", isCancelling)
  console.log("  - Payment Completed:", paymentCompleted)

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#4CAF50" />
          <Text style={styles.securityText}>
            Vui lòng xác nhận thủ công sau khi chuyển khoản
          </Text>
        </View>

        {/* Order Info */}
        <View style={styles.orderInfo}>
          <Text style={styles.orderInfoTitle}>Thông tin đơn hàng</Text>
          <Text style={styles.orderInfoText}>Mã đơn: {paymentData?.orderCode}</Text>
          {paymentData?.orderId && <Text style={styles.orderInfoText}>Order ID: {paymentData.orderId}</Text>}
          <Text style={styles.orderInfoText}>Loại: Đơn hàng (xác minh thủ công)</Text>
        </View>

        {/* Payment Info */}
        <View style={styles.paymentInfo}>
          <Text style={styles.amountLabel}>Tổng thanh toán</Text>
          <Text style={styles.amount}>{formatCurrency(paymentData?.amount)}</Text>
          <Text style={styles.orderCode}>Mã đơn hàng: {paymentData?.orderCode}</Text>
          <Text style={styles.paymentNote}>Miễn phí giao hàng</Text>
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

   

        <View style={styles.spacer} />
      </ScrollView>

      {/* Action Buttons */}
      {!paymentCompleted && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.successButton}
            onPress={handleManualPaymentSuccess}
            disabled={isProcessing || isCancelling}
          >
            {isProcessing ? (
              <>
                <ActivityIndicator color="#fff" />
                <Text style={styles.successButtonText}>Đang xử lý...</Text>
              </>
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                <Text style={styles.successButtonText}>Đã thanh toán</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cancelButton, isCancelling && styles.disabledButton]}
            onPress={() => handleCancelPayment(false)}
            disabled={isCancelling}
          >
            {isCancelling ? (
              <>
                <ActivityIndicator color="#FF5722" />
                <Text style={styles.cancelButtonText}>Đang hủy...</Text>
              </>
            ) : (
              <>
                <Ionicons name="close-circle-outline" size={20} color="#FF5722" />
                <Text style={styles.cancelButtonText}>Hủy đơn hàng</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {paymentCompleted && (
        <View style={styles.completedContainer}>
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          <Text style={styles.completedText}>Thanh toán đã được xác nhận!</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  spacer: {
    height: 20,
  },
  securityNotice: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    backgroundColor: "#E8F5E9",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  securityText: {
    marginLeft: 8,
    fontSize: 13,
    color: "#2E7D32",
    fontWeight: "500",
  },
  orderInfo: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  orderInfoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  orderInfoText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  paymentInfo: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
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
    marginBottom: 4,
  },
  paymentNote: {
    fontSize: 12,
    color: "#4CAF50",
    fontStyle: "italic",
  },
  paymentLinkContainer: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
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
    shadowColor: "#2196F3",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
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
  bankInfo: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bankTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  bankSubtitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 16,
  },
  bankRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  bankLabel: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  bankValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
  },
  bankValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    marginRight: 8,
  },
  amountValue: {
    color: "#E91E63",
    fontWeight: "bold",
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF8E1",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  warningText: {
    fontSize: 12,
    color: "#F57C00",
    lineHeight: 16,
    marginLeft: 8,
    flex: 1,
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  successButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
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
    flexDirection: "row",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FF5722",
  },
  cancelButtonText: {
    color: "#FF5722",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  completedContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#E8F5E9",
    borderTopWidth: 1,
    borderTopColor: "#4CAF50",
  },
  completedText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E7D32",
  },
})

export default QRPaymentScreen