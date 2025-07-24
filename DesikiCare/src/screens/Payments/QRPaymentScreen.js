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
  Image,
  ScrollView,
  Clipboard,
  BackHandler,
} from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import orderService from "../../config/axios/Order/orderService"

const QRPaymentScreen = ({ route, navigation }) => {
  const { paymentData, orderData } = route.params || {}
  const [isProcessing, setIsProcessing] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [countdown, setCountdown] = useState(300) // 5 phút countdown
  const [qrLoading, setQrLoading] = useState(true)
  const [qrError, setQrError] = useState(false)

  // SỬ DỤNG useRef ĐỂ TRACK INTERVALS
  const paymentCheckIntervalRef = useRef(null)
  const countdownTimerRef = useRef(null)
  const currentOrderIdRef = useRef(null)

  // Bank information
  const BANK_INFO = {
    bankId: "STB", // Sacombank
    accountNumber: "070113484770",
    accountName: "PHAM VAN PHONG",
    template: "compact2", // compact, compact2, qr_only
  }

  // FUNCTION ĐỂ CLEAR TẤT CẢ TIMERS
  const clearAllTimers = () => {
    console.log("🧹 Clearing all timers...")

    if (paymentCheckIntervalRef.current) {
      clearInterval(paymentCheckIntervalRef.current)
      paymentCheckIntervalRef.current = null
      console.log("✅ Payment check interval cleared")
    }

    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current)
      countdownTimerRef.current = null
      console.log("✅ Countdown timer cleared")
    }
  }

  // RESET TIMER KHI CÓ ĐỚN HÀNG MỚI
  useEffect(() => {
    const newOrderId = paymentData?.orderCode || paymentData?.orderId

    // Nếu là đơn hàng mới, reset timer
    if (newOrderId && newOrderId !== currentOrderIdRef.current) {
      console.log("🔄 New order detected, resetting timers...")
      console.log("Previous order:", currentOrderIdRef.current)
      console.log("New order:", newOrderId)

      // Clear old timers
      clearAllTimers()

      // Reset countdown cho đơn hàng mới
      setCountdown(300) // 5 phút
      currentOrderIdRef.current = newOrderId

      console.log("✅ Timers reset for new order")
    }
  }, [paymentData?.orderCode, paymentData?.orderId])

  // DISABLE BACK BUTTON/GESTURE
  useEffect(() => {
    const backAction = () => {
      Alert.alert("Thoát thanh toán?", "Bạn có chắc chắn muốn thoát? Giao dịch sẽ bị hủy.", [
        { text: "Ở lại", style: "cancel" },
        {
          text: "Thoát",
          style: "destructive",
          onPress: () => {
            clearAllTimers()
            navigation.goBack()
          },
        },
      ])
      return true // Prevent default back action
    }

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction)

    // Set navigation options to hide header back button
    navigation.setOptions({
      headerLeft: () => null, // Remove back button
      gestureEnabled: false, // Disable swipe back gesture on iOS
    })

    return () => {
      backHandler.remove()
    }
  }, [navigation])

  // AUTO CHECK PAYMENT STATUS
  useEffect(() => {
    const orderId = paymentData?.orderId

    if (orderId) {
      console.log("🔍 Setting up payment check for order:", orderId)

      // Clear existing interval first
      if (paymentCheckIntervalRef.current) {
        clearInterval(paymentCheckIntervalRef.current)
      }

      // Check payment status every 10 seconds
      paymentCheckIntervalRef.current = setInterval(() => {
        checkPaymentStatus(orderId)
      }, 10000)

      console.log("✅ Payment check interval started")
    }

    // Cleanup function
    return () => {
      if (paymentCheckIntervalRef.current) {
        clearInterval(paymentCheckIntervalRef.current)
        paymentCheckIntervalRef.current = null
        console.log("🧹 Payment check interval cleaned up")
      }
    }
  }, [paymentData?.orderId])

  // COUNTDOWN TIMER
  useEffect(() => {
    console.log("⏰ Setting up countdown timer, initial value:", countdown)

    // Clear existing timer first
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current)
    }

    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          console.log("⏰ Countdown finished, clearing timers...")
          clearAllTimers()

          Alert.alert("Hết thời gian thanh toán", "Phiên thanh toán đã hết hạn. Đơn hàng sẽ bị hủy.", [
            {
              text: "OK",
              onPress: () => {
                navigation.navigate("Main")
              },
            },
          ])
          return 0
        }
        return prev - 1
      })
    }, 1000)

    console.log("✅ Countdown timer started")

    // Cleanup function
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current)
        countdownTimerRef.current = null
        console.log("🧹 Countdown timer cleaned up")
      }
    }
  }, [countdown === 300]) // Chỉ chạy khi countdown được reset về 300

  // CLEANUP KHI COMPONENT UNMOUNT
  useEffect(() => {
    return () => {
      console.log("🧹 Component unmounting, clearing all timers...")
      clearAllTimers()
    }
  }, [])

  // CHECK PAYMENT STATUS FROM BACKEND
  const checkPaymentStatus = async (orderId) => {
    try {
      if (!orderId) {
        console.log("⚠️ No orderId provided for payment check")
        return
      }

      console.log("🔍 Checking payment status for order:", orderId)

      // Call API to check payment status
      const response = await orderService.getPaymentStatus(orderId)

      if (response.success && response.data) {
        const status = response.data.paymentStatus || response.data.status

        console.log("💳 Payment status:", status)

        if (status === "Paid" || status === "Success" || status === "Completed") {
          // Payment confirmed by backend
          console.log("✅ Payment confirmed, clearing timers...")
          clearAllTimers()

          Alert.alert("Thanh toán thành công!", "Giao dịch đã được xác nhận. Đơn hàng sẽ được xử lý.", [
            {
              text: "OK",
              onPress: () => {
                navigation.navigate("ConfirmPaymentScreen", {
                  paymentData: {
                    ...paymentData,
                    orderData,
                    paymentMethod: "bank",
                    desc: "Thanh toán thành công",
                    code: "00",
                    transactionDateTime: new Date().toISOString(),
                    verified: true,
                  },
                })
              },
            },
          ])
        }
      }
    } catch (error) {
      console.error("❌ Error checking payment status:", error.message)
      // Don't show error to user for auto-check
    }
  }

  // VERIFY PAYMENT BEFORE SUCCESS
  const verifyPaymentStatus = async () => {
    try {
      setIsVerifying(true)

      if (!paymentData?.orderId) {
        throw new Error("Không tìm thấy thông tin đơn hàng")
      }

      console.log("🔍 Verifying payment for order:", paymentData.orderId)

      // Call API to verify payment
      const response = await orderService.getPaymentStatus(paymentData.orderId)

      if (response.success && response.data) {
        const status = response.data.paymentStatus || response.data.status
        const amount = response.data.amount || response.data.total

        console.log("💳 Verification result:", { status, amount })

        if (status === "Paid" || status === "Success" || status === "Completed") {
          // Payment verified
          if (amount === paymentData.amount) {
            return { verified: true, status, amount }
          } else {
            throw new Error(`Số tiền không khớp. Mong đợi: ${paymentData.amount}, Thực tế: ${amount}`)
          }
        } else {
          throw new Error("Chưa nhận được thanh toán. Vui lòng kiểm tra lại.")
        }
      } else {
        throw new Error(response.message || "Không thể xác minh thanh toán")
      }
    } catch (error) {
      console.error("❌ Payment verification failed:", error.message)
      throw error
    } finally {
      setIsVerifying(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const formatCurrency = (amount) => {
    return amount?.toLocaleString("vi-VN") + "đ" || "0đ"
  }

  // Tạo dynamic VietQR URL
  const generateVietQRUrl = () => {
    const amount = paymentData?.amount || 0
    const orderCode = paymentData?.orderCode || ""
    const accountName = encodeURIComponent(BANK_INFO.accountName)
    const addInfo = encodeURIComponent(orderCode)

    const baseUrl = `https://img.vietqr.io/image/${BANK_INFO.bankId}-${BANK_INFO.accountNumber}-${BANK_INFO.template}.png`
    const params = new URLSearchParams({
      amount: amount.toString(),
      addInfo: addInfo,
      accountName: accountName,
    })

    const qrUrl = `${baseUrl}?${params.toString()}`
    console.log("Generated VietQR URL:", qrUrl)
    return qrUrl
  }

  const handleQRLoad = () => {
    setQrLoading(false)
    setQrError(false)
  }

  const handleQRError = () => {
    setQrLoading(false)
    setQrError(true)
    console.error("Failed to load VietQR image")
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

  // IMPROVED PAYMENT SUCCESS WITH VERIFICATION
  const handlePaymentSuccess = () => {
    Alert.alert(
      "Xác nhận thanh toán",
      "Bạn có chắc chắn đã hoàn tất thanh toán? Hệ thống sẽ kiểm tra giao dịch của bạn.",
      [
        { text: "Chưa thanh toán", style: "cancel" },
        {
          text: "Đã thanh toán",
          onPress: async () => {
            setIsProcessing(true)

            try {
              // Verify payment status
              const verification = await verifyPaymentStatus()

              if (verification.verified) {
                // Clear all timers
                console.log("✅ Payment verified, clearing timers...")
                clearAllTimers()

                // Navigate to success screen
                navigation.navigate("ConfirmPaymentScreen", {
                  paymentData: {
                    ...paymentData,
                    orderData,
                    paymentMethod: "bank",
                    desc: "Thanh toán thành công",
                    code: "00",
                    transactionDateTime: new Date().toISOString(),
                    verified: true,
                    verificationData: verification,
                  },
                })
              }
            } catch (error) {
              Alert.alert(
                "Xác minh thất bại",
                `${error.message}\n\nVui lòng đảm bảo bạn đã chuyển khoản đúng số tiền và nội dung, sau đó thử lại.`,
                [
                  { text: "Thử lại", onPress: () => setIsProcessing(false) },
                  {
                    text: "Kiểm tra lại",
                    onPress: () => {
                      setIsProcessing(false)
                      checkPaymentStatus(paymentData?.orderId)
                    },
                  },
                ],
              )
            }
          },
        },
      ],
    )
  }

  // SECURE CANCEL WITH CONFIRMATION VÀ CLEAR TIMERS
  const handleCancelPayment = () => {
    Alert.alert("Hủy thanh toán", "Bạn có chắc chắn muốn hủy thanh toán? Đơn hàng sẽ bị hủy và bạn cần đặt lại.", [
      { text: "Tiếp tục thanh toán", style: "cancel" },
      {
        text: "Hủy đơn hàng",
        style: "destructive",
        onPress: async () => {
          console.log("🚫 Cancelling order, clearing all timers...")

          // Clear all timers immediately
          clearAllTimers()

          // Reset current order reference
          currentOrderIdRef.current = null

          try {
            // Call API to cancel order if needed
            if (paymentData?.orderId) {
              console.log("📞 Calling cancel order API for:", paymentData.orderId)
              // await orderService.cancelOrder(paymentData.orderId)
            }
          } catch (error) {
            console.error("❌ Error cancelling order:", error.message)
          }

          // Navigate to home
          navigation.navigate("Main")
        },
      },
    ])
  }

  const handleRefreshQR = () => {
    setQrLoading(true)
    setQrError(false)
  }

  // Debug log
  console.log("🔍 QRPaymentScreen Debug Info:")
  console.log("  - Current Order ID:", currentOrderIdRef.current)
  console.log("  - Payment Data Order ID:", paymentData?.orderId)
  console.log("  - Payment Data Order Code:", paymentData?.orderCode)
  console.log("  - Countdown:", countdown)
  console.log("  - Payment Check Interval Active:", !!paymentCheckIntervalRef.current)
  console.log("  - Countdown Timer Active:", !!countdownTimerRef.current)

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Timer */}
        <View style={styles.timerContainer}>
          <Ionicons name="time-outline" size={20} color="#FF5722" />
          <Text style={styles.timerText}>Thời gian còn lại: {formatTime(countdown)}</Text>
        </View>

        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#4CAF50" />
          <Text style={styles.securityText}>Hệ thống sẽ tự động xác minh thanh toán của bạn</Text>
        </View>

        {/* Order Info */}
        <View style={styles.orderInfo}>
          <Text style={styles.orderInfoTitle}>Thông tin đơn hàng</Text>
          <Text style={styles.orderInfoText}>Mã đơn: {paymentData?.orderCode}</Text>
          <Text style={styles.orderInfoText}>Order ID: {paymentData?.orderId}</Text>
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
          <View style={styles.qrHeader}>
            <Text style={styles.qrTitle}>Quét mã QR để thanh toán</Text>
            <TouchableOpacity style={styles.refreshButton} onPress={handleRefreshQR}>
              <Ionicons name="refresh-outline" size={20} color="#2196F3" />
            </TouchableOpacity>
          </View>

          <View style={styles.qrCodeWrapper}>
            {qrLoading && (
              <View style={styles.qrLoadingContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={styles.qrLoadingText}>Đang tạo mã QR...</Text>
              </View>
            )}

            {qrError && (
              <View style={styles.qrErrorContainer}>
                <Ionicons name="alert-circle-outline" size={48} color="#FF5722" />
                <Text style={styles.qrErrorText}>Không thể tải mã QR</Text>
                <TouchableOpacity style={styles.retryButton} onPress={handleRefreshQR}>
                  <Text style={styles.retryButtonText}>Thử lại</Text>
                </TouchableOpacity>
              </View>
            )}

            {!qrError && (
              <Image
                source={{ uri: generateVietQRUrl() }}
                style={[styles.qrCodeImage, qrLoading && styles.qrCodeHidden]}
                resizeMode="contain"
                onLoad={handleQRLoad}
                onError={handleQRError}
              />
            )}
          </View>

          <View style={styles.qrInstructionContainer}>
            <Ionicons name="information-circle-outline" size={16} color="#2196F3" />
            <Text style={styles.qrInstruction}>
              Sử dụng ứng dụng ngân hàng để quét mã QR. Số tiền và nội dung chuyển khoản sẽ được điền tự động.
            </Text>
          </View>
        </View>

        {/* Bank Info */}
        <View style={styles.bankInfo}>
          <Text style={styles.bankTitle}>Thông tin chuyển khoản thủ công</Text>
          <Text style={styles.bankSubtitle}>Nếu không thể quét QR, vui lòng chuyển khoản thủ công</Text>

          <TouchableOpacity style={styles.bankRow} onPress={() => handleCopyBankInfo("Sacombank", "Tên ngân hàng")}>
            <Text style={styles.bankLabel}>Ngân hàng:</Text>
            <View style={styles.bankValueContainer}>
              <Text style={styles.bankValue}>Sacombank (STB)</Text>
              <Ionicons name="copy-outline" size={16} color="#2196F3" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bankRow}
            onPress={() => handleCopyBankInfo(BANK_INFO.accountNumber, "Số tài khoản")}
          >
            <Text style={styles.bankLabel}>Số tài khoản:</Text>
            <View style={styles.bankValueContainer}>
              <Text style={styles.bankValue}>{BANK_INFO.accountNumber}</Text>
              <Ionicons name="copy-outline" size={16} color="#2196F3" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bankRow}
            onPress={() => handleCopyBankInfo(BANK_INFO.accountName, "Chủ tài khoản")}
          >
            <Text style={styles.bankLabel}>Chủ tài khoản:</Text>
            <View style={styles.bankValueContainer}>
              <Text style={styles.bankValue}>{BANK_INFO.accountName}</Text>
              <Ionicons name="copy-outline" size={16} color="#2196F3" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bankRow}
            onPress={() => handleCopyBankInfo(paymentData?.orderCode || "", "Nội dung chuyển khoản")}
          >
            <Text style={styles.bankLabel}>Nội dung:</Text>
            <View style={styles.bankValueContainer}>
              <Text style={styles.bankValue}>{paymentData?.orderCode}</Text>
              <Ionicons name="copy-outline" size={16} color="#2196F3" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bankRow}
            onPress={() => handleCopyBankInfo(paymentData?.amount?.toString() || "0", "Số tiền")}
          >
            <Text style={styles.bankLabel}>Số tiền:</Text>
            <View style={styles.bankValueContainer}>
              <Text style={[styles.bankValue, styles.amountValue]}>{formatCurrency(paymentData?.amount)}</Text>
              <Ionicons name="copy-outline" size={16} color="#2196F3" />
            </View>
          </TouchableOpacity>

          <View style={styles.warningContainer}>
            <Ionicons name="warning-outline" size={16} color="#FF9800" />
            <Text style={styles.warningText}>
              Vui lòng chuyển khoản đúng số tiền và nội dung để đơn hàng được xử lý tự động
            </Text>
          </View>
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Action Buttons - Fixed at bottom */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.successButton}
          onPress={handlePaymentSuccess}
          disabled={isProcessing || isVerifying}
        >
          {isProcessing || isVerifying ? (
            <>
              <ActivityIndicator color="#fff" />
              <Text style={styles.successButtonText}>{isVerifying ? "Đang xác minh..." : "Đang xử lý..."}</Text>
            </>
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={styles.successButtonText}>Đã thanh toán</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={handleCancelPayment}>
          <Ionicons name="close-circle-outline" size={20} color="#FF5722" />
          <Text style={styles.cancelButtonText}>Hủy đơn hàng</Text>
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
  },
  paymentLinkContainer: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
  qrContainer: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  qrHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  qrTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  refreshButton: {
    padding: 8,
  },
  qrCodeWrapper: {
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    minHeight: 280,
  },
  qrLoadingContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  qrLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  qrErrorContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  qrErrorText: {
    marginTop: 12,
    fontSize: 14,
    color: "#FF5722",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 12,
    backgroundColor: "#2196F3",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  qrCodeImage: {
    width: 250,
    height: 250,
  },
  qrCodeHidden: {
    opacity: 0,
  },
  qrInstructionContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#E3F2FD",
    padding: 12,
    borderRadius: 8,
  },
  qrInstruction: {
    fontSize: 13,
    color: "#1976D2",
    lineHeight: 18,
    marginLeft: 8,
    flex: 1,
  },
  bankInfo: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
    shadowOffset: {
      width: 0,
      height: -2,
    },
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
})

export default QRPaymentScreen
