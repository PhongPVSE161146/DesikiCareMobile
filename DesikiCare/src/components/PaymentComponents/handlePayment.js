import AsyncStorage from "@react-native-async-storage/async-storage"
import orderService from "../../config/axios/Order/orderService"
import { v4 as uuidv4 } from "uuid"

const handlePayment = async (cartItems, orderId, navigation, setNotification, addresses, values) => {
  try {
    console.log("Handle payment with values:", JSON.stringify(values, null, 2))
    console.log("Addresses:", JSON.stringify(addresses, null, 2))
    console.log("Cart items:", JSON.stringify(cartItems, null, 2))
    console.log("Received orderId:", orderId)

    if (!values.addressId) {
      setNotification({ message: "Vui lòng chọn một địa chỉ giao hàng hợp lệ.", type: "error" })
      return
    }

    const selectedAddress = addresses.find((addr) => addr._id === values.addressId)
    if (!selectedAddress) {
      setNotification({ message: "Địa chỉ giao hàng không hợp lệ.", type: "error" })
      return
    }

    const hexRegex = /^[0-9a-fA-F]{24}$/
    if (!hexRegex.test(values.addressId)) {
      setNotification({ message: "Địa chỉ giao hàng không hợp lệ: ID phải là chuỗi hex 24 ký tự.", type: "error" })
      return
    }

    let parsedUserInfo = null
    try {
      const userInfo = await AsyncStorage.getItem("userInfo")
      console.log("Raw userInfo from AsyncStorage:", userInfo)
      if (!userInfo) {
        setNotification({ message: "Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại.", type: "error" })
        navigation.navigate("LoginScreen")
        return
      }
      parsedUserInfo = JSON.parse(userInfo)
      console.log("Parsed userInfo:", JSON.stringify(parsedUserInfo, null, 2))
      if (!parsedUserInfo?.accountId) {
        setNotification({ message: "Thông tin tài khoản không đầy đủ. Vui lòng đăng nhập lại.", type: "error" })
        navigation.navigate("LoginScreen")
        return
      }
    } catch (error) {
      console.error("Error parsing userInfo:", error.message, error.stack)
      setNotification({ message: "Lỗi khi đọc thông tin tài khoản. Vui lòng đăng nhập lại.", type: "error" })
      navigation.navigate("LoginScreen")
      return
    }

    if (!cartItems || cartItems.length === 0) {
      setNotification({ message: "Giỏ hàng trống. Vui lòng thêm sản phẩm.", type: "error" })
      return
    }

    const subtotal = cartItems.reduce((total, item) => total + (item.price || 0) * (item.quantity || 1), 0)
    const shippingFee = subtotal >= 500000 ? 0 : 30000
    const totalAmount = subtotal + shippingFee

    const generatedOrderId = orderId || `ORDER${uuidv4().replace(/-/g, "").slice(0, 12)}`
    console.log("Generated orderId:", generatedOrderId)

    // SỬ DỤNG CẤU TRÚC ĐÃ BIẾT LÀ WORK
    const orderPayload = {
      order: {
        newOrderId: generatedOrderId,
        userId: parsedUserInfo.accountId,
        deliveryAddressId: values.addressId,
        cartItems: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity || 1,
          price: item.price,
        })),
        subtotal,
        discount: 0,
        shippingFee,
        total: totalAmount,
        paymentMethod: values.paymentMethod,
        paymentStatus: values.paymentMethod === "cod" ? "Pending" : "Paid",
        note: values.note || "",
        pointUsed: 0,
      },
    }

    console.log("Order Payload:", JSON.stringify(orderPayload, null, 2))

    const orderResponse = await orderService.createOrder(orderPayload)
    console.log("Create Order Response:", JSON.stringify(orderResponse, null, 2))

    if (!orderResponse.success) {
      setNotification({ message: orderResponse.message || "Không thể tạo đơn hàng.", type: "error" })
      return
    }

    const orderData = {
      cartItems: cartItems.map((item) => ({
        productId: item.id,
        title: item.title,
        quantity: item.quantity || 1,
        price: item.price,
      })),
      subtotal,
      discount: 0,
      shippingFee,
      total: totalAmount,
      pointUsed: 0,
      note: values.note || "",
    }

    // CẢI THIỆN PAYMENT PAYLOAD THEO API DOC
    const paymentPayload = {
      orderId: orderResponse.data.orderId || generatedOrderId,
      amount: totalAmount,
      currency: "VND",
      paymentMethod: values.paymentMethod,
      description: values.paymentMethod === "cod" ? "Thanh toán khi nhận hàng (COD)" : "Chuyển khoản ngân hàng",
      transactionDateTime: new Date().toISOString(),
    }

    console.log("Confirm Payment Payload:", JSON.stringify(paymentPayload, null, 2))

    const confirmResponse = await orderService.confirmPayment(paymentPayload)
    console.log("Confirm Payment Response:", JSON.stringify(confirmResponse, null, 2))

    if (confirmResponse.success) {
      // XỬ LÝ RESPONSE THEO API DOC STRUCTURE
      const responseData = confirmResponse.data || {}
      const paymentData = {
        ...responseData,
        orderData,
        // Thêm các field từ API response
        orderCode: responseData.orderCode,
        amount: responseData.amount || totalAmount,
        description: responseData.description,
        accountNumber: responseData.accountNumber,
        reference: responseData.reference,
        transactionDateTime: responseData.transactionDateTime,
        currency: responseData.currency || "VND",
        paymentLinkId: responseData.paymentLinkId,
        code: responseData.code,
        desc: responseData.desc,
        counterAccountBankId: responseData.counterAccountBankId,
        counterAccountBankName: responseData.counterAccountBankName,
        counterAccountName: responseData.counterAccountName,
        counterAccountNumber: responseData.counterAccountNumber,
        virtualAccountName: responseData.virtualAccountName,
        virtualAccountNumber: responseData.virtualAccountNumber,
      }

      navigation.navigate("ConfirmPaymentScreen", {
        paymentData,
      })
    } else {
      setNotification({ message: confirmResponse.message || "Không thể xác nhận thanh toán.", type: "error" })
    }
  } catch (error) {
    console.error("Payment error:", error.message, error.stack)
    setNotification({ message: "Lỗi xử lý thanh toán: " + error.message, type: "error" })
  }
}

export default handlePayment
