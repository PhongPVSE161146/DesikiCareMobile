"use client"

import "react-native-get-random-values"
import { useState, useEffect, useRef } from "react"
import { View, Text, ScrollView, TextInput, ActivityIndicator, StyleSheet } from "react-native"
import { Formik } from "formik"
import * as Yup from "yup"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { v4 as uuidv4 } from "uuid"
import AddressHandler from "../../components/PaymentComponents/AddressHandler"
import PaymentMethods from "../../components/PaymentComponents/PaymentMethods"
import OrderSummary from "../../components/PaymentComponents/OrderSummary"
import orderService from "../../config/axios/Order/orderService"
import profileService from "../../config/axios/Home/AccountProfile/profileService"

// Validation schema
const validationSchema = Yup.object().shape({
  fullName: Yup.string().required("Vui lòng nhập họ và tên"),
  phone: Yup.string()
    .matches(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ")
    .required("Vui lòng nhập số điện thoại"),
  addressId: Yup.string().required("Vui lòng chọn địa chỉ giao hàng"),
  paymentMethod: Yup.string().required("Vui lòng chọn phương thức thanh toán"),
})

const Payment = ({ route, navigation }) => {
  const { cartItems: passedCartItems } = route.params || {}
  const [isLoading, setIsLoading] = useState(false)
  const [notification, setNotification] = useState({ message: "", type: "" })
  const [addresses, setAddresses] = useState([])

  // Generate order ID with UUID or fallback
  const generateOrderId = () => {
    try {
      return `ORDER${uuidv4().replace(/-/g, "").slice(0, 12)}`
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("UUID generation failed, using timestamp fallback:", error.message)
      }
      return `ORDER${Date.now().toString().slice(-12)}`
    }
  }

  const [orderId] = useState(generateOrderId())
  const formikRef = useRef(null)
  const cartItems = passedCartItems?.length > 0 ? passedCartItems : []

  // Validate 24-character hex string
  const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id)

  // THÊM FUNCTION VALIDATE TẤT CẢ IDs TRONG PAYLOAD
  const validateOrderPayload = (payload) => {
    console.log("=== VALIDATING ORDER PAYLOAD ===")
    const errors = []

    // Validate userId
    if (!payload.order.userId || !isValidObjectId(payload.order.userId)) {
      errors.push(`Invalid userId: ${payload.order.userId}`)
    } else {
      console.log("✅ userId valid:", payload.order.userId)
    }

    // Validate deliveryAddressId
    if (!payload.order.deliveryAddressId || !isValidObjectId(payload.order.deliveryAddressId)) {
      errors.push(`Invalid deliveryAddressId: ${payload.order.deliveryAddressId}`)
    } else {
      console.log("✅ deliveryAddressId valid:", payload.order.deliveryAddressId)
    }

    // Validate newOrderId (should be string, not ObjectId)
    if (!payload.order.newOrderId || typeof payload.order.newOrderId !== "string") {
      errors.push(`Invalid newOrderId: ${payload.order.newOrderId}`)
    } else {
      console.log("✅ newOrderId valid:", payload.order.newOrderId)
    }

    // Validate cartItems
    payload.order.cartItems.forEach((item, index) => {
      if (!item.productId || !isValidObjectId(item.productId)) {
        errors.push(`Invalid productId at index ${index}: ${item.productId}`)
      } else {
        console.log(`✅ cartItem[${index}] productId valid:`, item.productId)
      }

      if (!item.quantity || typeof item.quantity !== "number" || item.quantity <= 0) {
        errors.push(`Invalid quantity at index ${index}: ${item.quantity}`)
      } else {
        console.log(`✅ cartItem[${index}] quantity valid:`, item.quantity)
      }

      if (!item.price || typeof item.price !== "number" || item.price <= 0) {
        errors.push(`Invalid price at index ${index}: ${item.price}`)
      } else {
        console.log(`✅ cartItem[${index}] price valid:`, item.price)
      }
    })

    // Validate numeric fields
    const numericFields = ["subtotal", "discount", "shippingFee", "total", "pointUsed"]
    numericFields.forEach((field) => {
      if (typeof payload.order[field] !== "number") {
        errors.push(`Invalid ${field}: ${payload.order[field]} (type: ${typeof payload.order[field]})`)
      } else {
        console.log(`✅ ${field} valid:`, payload.order[field])
      }
    })

    // Validate string fields
    const stringFields = ["paymentMethod", "paymentStatus", "note"]
    stringFields.forEach((field) => {
      if (typeof payload.order[field] !== "string") {
        errors.push(`Invalid ${field}: ${payload.order[field]} (type: ${typeof payload.order[field]})`)
      } else {
        console.log(`✅ ${field} valid:`, payload.order[field])
      }
    })

    console.log("=== END VALIDATION ===")
    if (errors.length > 0) {
      console.error("❌ VALIDATION ERRORS:", errors)
      return { valid: false, errors }
    }

    console.log("✅ ALL VALIDATIONS PASSED")
    return { valid: true, errors: [] }
  }

  // Load user info and addresses
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        setIsLoading(true)
        const userInfo = await AsyncStorage.getItem("userInfo")
        let parsedUserInfo = userInfo ? JSON.parse(userInfo) : null

        // Fetch user profile if userInfo is missing or invalid
        if (!parsedUserInfo || !parsedUserInfo.accountId || !isValidObjectId(parsedUserInfo.accountId)) {
          const profileResponse = await profileService.getProfile()
          if (profileResponse.success && profileResponse.data.account) {
            parsedUserInfo = {
              accountId: profileResponse.data.account._id,
              fullName: profileResponse.data.account.fullName,
              phone: profileResponse.data.account.phoneNumber,
            }
            await AsyncStorage.setItem("userInfo", JSON.stringify(parsedUserInfo))
          } else {
            setNotification({
              message: profileResponse.message || "Không thể tải thông tin người dùng.",
              type: "error",
            })
            return
          }
        }

        // Validate userId
        if (!isValidObjectId(parsedUserInfo.accountId)) {
          setNotification({ message: "ID tài khoản không hợp lệ.", type: "error" })
          return
        }

        // Set form values
        if (formikRef.current) {
          formikRef.current.setValues({
            ...formikRef.current.values,
            fullName: parsedUserInfo.fullName || "",
            phone: parsedUserInfo.phone || "",
          })
        }

        // Load addresses
        const addressResponse = await profileService.getDeliveryAddresses()
        if (addressResponse.success) {
          const validAddresses = addressResponse.data.filter((addr) => isValidObjectId(addr._id))
          setAddresses(validAddresses)
          const defaultAddress = validAddresses.find((addr) => addr.isDefault)
          if (defaultAddress && formikRef.current) {
            formikRef.current.setFieldValue("addressId", defaultAddress._id)
          }
        } else {
          setNotification({ message: addressResponse.message || "Không thể tải địa chỉ giao hàng.", type: "error" })
        }
      } catch (error) {
        console.error("Error loading user info or addresses:", error.message, error.stack)
        setNotification({ message: "Lỗi hệ thống. Vui lòng thử lại.", type: "error" })
      } finally {
        setIsLoading(false)
      }
    }

    loadUserInfo()
  }, [])

  const processPayment = async (values) => {
    try {
      console.log("Handle payment with values:", JSON.stringify(values, null, 2))
      console.log("Cart items:", JSON.stringify(cartItems, null, 2))
      console.log("Order ID:", orderId)

      // Validate addressId
      if (!values.addressId || !isValidObjectId(values.addressId)) {
        setNotification({ message: "Vui lòng chọn một địa chỉ giao hàng hợp lệ.", type: "error" })
        return
      }

      const selectedAddress = addresses.find((addr) => addr._id === values.addressId)
      if (!selectedAddress) {
        setNotification({ message: "Địa chỉ giao hàng không hợp lệ.", type: "error" })
        return
      }

      // Validate userId
      const userInfo = await AsyncStorage.getItem("userInfo")
      const parsedUserInfo = userInfo ? JSON.parse(userInfo) : null
      if (!parsedUserInfo?.accountId || !isValidObjectId(parsedUserInfo.accountId)) {
        setNotification({ message: "Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại.", type: "error" })
        return
      }

      // Validate cartItems
      if (!cartItems || cartItems.length === 0) {
        setNotification({ message: "Giỏ hàng trống. Vui lòng thêm sản phẩm.", type: "error" })
        return
      }

      // Validate product IDs in cartItems
      for (let i = 0; i < cartItems.length; i++) {
        const item = cartItems[i]
        const itemName = item.name || item.title || item.productName || `Sản phẩm #${i + 1}`
        const productId = item._id || item.id
        const productPrice = item.salePrice || item.price

        if (!productId || !isValidObjectId(productId)) {
          setNotification({
            message: `ID sản phẩm không hợp lệ: ${itemName} (ID: ${productId || "không có"})`,
            type: "error",
          })
          return
        }

        if (!productPrice || typeof productPrice !== "number") {
          setNotification({
            message: `Giá sản phẩm không hợp lệ: ${itemName} (Giá: ${productPrice})`,
            type: "error",
          })
          return
        }
      }

      // Calculate totals
      const subtotal = cartItems.reduce((total, item) => {
        const price = item.salePrice || item.price || 0
        const quantity = item.quantity || 1
        return total + price * quantity
      }, 0)
      const shippingFee = subtotal >= 500000 ? 0 : 30000
      const totalAmount = subtotal + shippingFee

      // CREATE ORDER PAYLOAD WITH PROPER TYPES
      const orderPayload = {
        order: {
          newOrderId: String(orderId), // Ensure string
          userId: String(parsedUserInfo.accountId), // Ensure string
          deliveryAddressId: String(values.addressId), // Ensure string
          cartItems: cartItems.map((item) => {
            const productId = item._id || item.id
            const price = item.salePrice || item.price
            const quantity = item.quantity || 1
            return {
              productId: String(productId), // Ensure string
              quantity: Number(quantity), // Ensure number
              price: Number(price), // Ensure number
            }
          }),
          subtotal: Number(subtotal), // Ensure number
          discount: Number(0), // Ensure number
          shippingFee: Number(shippingFee), // Ensure number
          total: Number(totalAmount), // Ensure number
          paymentMethod: String(values.paymentMethod), // Ensure string
          paymentStatus: String(values.paymentMethod === "cod" ? "Pending" : "Paid"), // Ensure string
          note: String(values.note || ""), // Ensure string
          pointUsed: Number(0), // Ensure number
        },
      }

      // VALIDATE PAYLOAD BEFORE SENDING
      const validation = validateOrderPayload(orderPayload)
      if (!validation.valid) {
        setNotification({
          message: `Dữ liệu đơn hàng không hợp lệ: ${validation.errors.join(", ")}`,
          type: "error",
        })
        return
      }

      console.log("Final Order Payload:", JSON.stringify(orderPayload, null, 2))

      const orderResponse = await orderService.createOrder(orderPayload)
      console.log("Create Order Response:", JSON.stringify(orderResponse, null, 2))

      if (!orderResponse.success) {
        setNotification({ message: orderResponse.message || "Không thể tạo đơn hàng.", type: "error" })
        return
      }

      const orderData = {
        cartItems: cartItems.map((item) => ({
          productId: item._id || item.id,
          title: item.name || item.title || item.productName || "Sản phẩm",
          quantity: item.quantity || 1,
          price: item.salePrice || item.price,
        })),
        subtotal,
        discount: 0,
        shippingFee,
        total: totalAmount,
        pointUsed: 0,
        note: values.note || "",
      }

      // XỬ LÝ THEO PHƯƠNG THỨC THANH TOÁN
      if (values.paymentMethod === "bank") {
        // THANH TOÁN NGÂN HÀNG - Navigate đến QR Payment Screen
        const paymentData = {
          orderCode: orderResponse.data.orderId || orderId,
          amount: totalAmount,
          currency: "VND",
          paymentMethod: values.paymentMethod,
          description: "Chuyển khoản ngân hàng",
          transactionDateTime: new Date().toISOString(),
        }

        console.log("Navigating to QRPaymentScreen with data:", JSON.stringify({ paymentData, orderData }, null, 2))

        navigation.navigate("QRPaymentScreen", {
          paymentData,
          orderData,
        })
        return
      }

      // COD PAYMENT - Xử lý như cũ
      const paymentPayload = {
        orderId: orderResponse.data.orderId || orderId,
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
        navigation.navigate("ConfirmPaymentScreen", {
          paymentData: { ...confirmResponse.data, orderData },
        })
      } else {
        setNotification({ message: confirmResponse.message || "Không thể xác nhận thanh toán.", type: "error" })
      }
    } catch (error) {
      console.error("Payment error:", error.message, error.stack)
      setNotification({ message: `Lỗi xử lý thanh toán: ${error.message}`, type: "error" })
    }
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#E53935" />
        <Text style={styles.summaryText}>Đang tải...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      {notification.message ? (
        <View
          style={[
            styles.notification,
            notification.type === "error" ? styles.errorNotification : styles.successNotification,
          ]}
        >
          <Text style={styles.notificationText}>{notification.message}</Text>
        </View>
      ) : null}
      <Text style={styles.title}>Thanh toán đơn hàng</Text>
      <Formik
        innerRef={formikRef}
        initialValues={{
          fullName: "",
          phone: "",
          addressId: "",
          note: "",
          paymentMethod: "cod",
        }}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting }) => {
          console.log("Formik values before submit:", JSON.stringify(values, null, 2))
          setIsLoading(true)
          processPayment(values).finally(() => {
            setIsLoading(false)
            setSubmitting(false)
          })
        }}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View style={styles.formContainer}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Thông tin giao hàng</Text>
              <AddressHandler
                navigation={navigation}
                formikRef={formikRef}
                setNotification={setNotification}
                setAddresses={setAddresses}
              />
              {touched.addressId && errors.addressId && <Text style={styles.errorText}>{errors.addressId}</Text>}
              <Text style={styles.label}>Họ và tên</Text>
              <TextInput
                style={styles.input}
                value={values.fullName}
                onChangeText={handleChange("fullName")}
                onBlur={handleBlur("fullName")}
                placeholder="Nhập họ và tên"
                placeholderTextColor="#999"
              />
              {touched.fullName && errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
              <Text style={styles.label}>Số điện thoại</Text>
              <TextInput
                style={styles.input}
                value={values.phone}
                onChangeText={handleChange("phone")}
                onBlur={handleBlur("phone")}
                placeholder="Nhập số điện thoại"
                keyboardType="phone-pad"
                placeholderTextColor="#999"
              />
              {touched.phone && errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
              <Text style={styles.label}>Ghi chú</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: "top" }]}
                value={values.note}
                onChangeText={handleChange("note")}
                onBlur={handleBlur("note")}
                placeholder="Ghi chú (nếu có)"
                multiline
                numberOfLines={3}
                placeholderTextColor="#999"
              />
              <Text style={styles.label}>Phương thức thanh toán</Text>
              <PaymentMethods formikRef={formikRef} />
              {touched.paymentMethod && errors.paymentMethod && (
                <Text style={styles.errorText}>{errors.paymentMethod}</Text>
              )}
            </View>
            <OrderSummary
              cartItems={cartItems}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              addressId={values.addressId}
              paymentMethod={values.paymentMethod}
            />
          </View>
        )}
      </Formik>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
    color: "#333",
  },
  formContainer: {
    flex: 1,
  },
  card: {
    borderRadius: 12,
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    color: "#212121",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  errorText: {
    color: "#E53935",
    fontSize: 12,
    marginBottom: 8,
  },
  notification: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorNotification: {
    backgroundColor: "#ffebee",
    borderColor: "#E53935",
    borderWidth: 1,
  },
  successNotification: {
    backgroundColor: "#e8f5e9",
    borderColor: "#4CAF50",
    borderWidth: 1,
  },
  notificationText: {
    fontSize: 14,
    color: "#333",
  },
  summaryText: {
    fontSize: 16,
    color: "#424242",
    flex: 1,
    flexWrap: "wrap",
    marginRight: 8,
  },
})

export default Payment
