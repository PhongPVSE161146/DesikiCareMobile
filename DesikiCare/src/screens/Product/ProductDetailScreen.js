"use client"
import { useState, useEffect } from "react"
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native"
import { useDispatch } from "react-redux"
import { addToCart } from "../../redux/cartSlice" // Verify this path
import ProductService from "../../config/axios/Product/productService"
import orderService from "../../config/axios/Order/orderService"
import profileService from "../../config/axios/Home/AccountProfile/profileService"
import Notification from "../../components/NotiComponnets/Notification"
import { CANCEL_URL, RETURN_URL } from "@env"

const screenWidth = Dimensions.get("window").width

const ProductDetailScreen = ({ route, navigation }) => {
  const { productId } = route.params || {}
  const dispatch = useDispatch()

  const [productData, setProductData] = useState(null)
  const [notificationMessage, setNotificationMessage] = useState("")
  const [notificationType, setNotificationType] = useState("success")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true)
      try {
        const result = await ProductService.getProductById(productId)
        if (result.success) {
          setProductData(result.data)
        } else {
          Alert.alert("Lỗi", result.message || "Không thể lấy thông tin sản phẩm.", [
            { text: "OK", onPress: () => navigation.goBack() },
          ])
        }
      } catch (error) {
        console.error("Error fetching product:", error)
        Alert.alert("Lỗi", "Có lỗi xảy ra khi lấy thông tin sản phẩm.")
      } finally {
        setIsLoading(false)
      }
    }

    if (productId) {
      fetchProduct()
    } else {
      Alert.alert("Lỗi", "Không tìm thấy ID sản phẩm.")
      setIsLoading(false)
    }
  }, [productId, navigation])

  const getDefaultAddressId = async () => {
    try {
      const addressResponse = await profileService.getDeliveryAddresses()
      if (addressResponse.success && addressResponse.data.length > 0) {
        // Tìm địa chỉ mặc định hoặc lấy địa chỉ đầu tiên
        const defaultAddress = addressResponse.data.find((addr) => addr.isDefault) || addressResponse.data[0]
        return defaultAddress._id
      }
      return null
    } catch (error) {
      console.error("Error fetching default address:", error)
      return null
    }
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#E53935" />
      </View>
    )
  }

  if (!productData || !productData.product) {
    return (
      <View style={styles.container}>
        <Text>Không tìm thấy sản phẩm</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Quay lại danh sách sản phẩm"
        >
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const { product, category, productSkinTypes, productSkinStatuses, shipmentProducts } = productData
  const { name, description, salePrice, imageUrl, isDeactivated, volume } = product

  const categoryName = category?.name || "Không có danh mục"
  const skinTypes = productSkinTypes?.map((type) => type.name).join(", ") || "Không có loại da"
  const skinStatuses = productSkinStatuses?.map((status) => status.name).join(", ") || "Không có trạng thái da"
  const latestShipment = shipmentProducts?.length > 0 ? shipmentProducts[0].shipmentProduct : null

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const handleAddToCart = async () => {
    if (isDeactivated) {
      setNotificationMessage("")
      Alert.alert("", "Sản phẩm hiện không có sẵn.")
      return
    }

    try {
      const result = await orderService.addCartItem(product._id, 1) // Fixed quantity to 1
      if (result && (result.success || result.message === "Cart items added successfully")) {
        const productWithId = {
          id: product._id,
          title: name,
          price: salePrice,
          quantity: 1,
          image: imageUrl,
        }

        if (typeof addToCart === "function") {
          dispatch(addToCart(productWithId))
          setNotificationMessage("") // Clear notification in ProductDetailScreen

          // Navigate to Cart screen with notification params
          navigation.navigate("Main", {
            screen: "Cart",
            params: {
              screen: "CartMain",
              params: {
                notificationMessage: "Đã thêm vào giỏ hàng!",
                notificationType: "success",
              },
            },
          })
        } else {
          console.error("addToCart is not a function:", addToCart)
          Alert.alert("Lỗi", "Hành động thêm vào giỏ hàng không khả dụng. Vui lòng kiểm tra cấu hình Redux.")
        }
      } else {
        setNotificationMessage("")
        if (result?.message === "No token found. Please log in.") {
          Alert.alert("Lỗi", "Vui lòng đăng nhập để thêm sản phẩm.", [
            { text: "OK", onPress: () => navigation.navigate("Login") },
          ])
        } else {
          Alert.alert("Lỗi", result?.message || "Không thể thêm sản phẩm vào giỏ hàng.")
        }
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      setNotificationMessage("")
      Alert.alert("Lỗi", "Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng: " + error.message)
    }
  }

  const handleBuyNow = async () => {
    if (isDeactivated) {
      setNotificationMessage("")
      Alert.alert("Lỗi", "Sản phẩm hiện không có sẵn.")
      return
    }

    try {
      // Bước 1: Thêm sản phẩm vào giỏ hàng
      const addToCartResult = await orderService.addCartItem(product._id, 1)
      if (!addToCartResult.success) {
        setNotificationMessage("")
        if (addToCartResult.message === "No token found. Please log in.") {
          Alert.alert("Lỗi", "Vui lòng đăng nhập để mua sản phẩm.", [
            { text: "OK", onPress: () => navigation.navigate("Login") },
          ])
        } else {
          Alert.alert("Lỗi", addToCartResult.message || "Không thể thêm sản phẩm vào giỏ hàng.")
        }
        return
      }

      // Bước 2: Lấy địa chỉ giao hàng mặc định
      const deliveryAddressId = await getDefaultAddressId()
      if (!deliveryAddressId) {
        setNotificationMessage("")
        Alert.alert("Lỗi", "Vui lòng thiết lập địa chỉ giao hàng trước khi mua.", [
          { text: "OK", onPress: () => navigation.navigate("DeliveryAddress") },
        ])
        return
      }

      // Bước 3: Lấy payment link từ API
      const paymentResult = await orderService.getPaymentLink(
        {
          pointUsed: 0,
          deliveryAddressId: deliveryAddressId,
        },
        {
          cancelUrl: CANCEL_URL || "https://your-app.com/cancel",
          returnUrl: RETURN_URL || "https://your-app.com/success",
        },
      )

      console.log("Payment result:", JSON.stringify(paymentResult, null, 2))

      if (paymentResult.success) {
        // Bước 4: Tạo orderData cho QR screen - NO SHIPPING FEE
        const orderData = {
          cartItems: [
            {
              productId: product._id,
              title: name,
              quantity: 1,
              price: salePrice,
            },
          ],
          subtotal: salePrice,
          discount: 0,
          // Removed shipping fee calculation
          total: salePrice, // Total is now just the sale price
          pointUsed: 0,
          note: "",
        }

        // Bước 5: Tạo paymentData cho QR screen - using total without shipping
        const paymentData = {
          orderCode: paymentResult.data.orderCode || `ORDER${Date.now()}`,
          orderId: paymentResult.data.orderId || paymentResult.data.orderCode,
          amount: orderData.total, // This is now just the product price
          currency: "VND",
          paymentMethod: "bank",
          description: "Chuyển khoản ngân hàng",
          transactionDateTime: new Date().toISOString(),
          qrCode: paymentResult.data.qrCode,
          paymentUrl: paymentResult.data.paymentUrl,
        }

        console.log("Navigating to QRPaymentScreen with (no shipping):", { paymentData, orderData })

        // Bước 6: Navigate đến QR Payment Screen
        navigation.navigate("QRPaymentScreen", {
          paymentData,
          orderData,
        })

        setNotificationMessage("Đang chuyển tới trang thanh toán...")
        setNotificationType("success")
      } else {
        setNotificationMessage("")
        Alert.alert("Lỗi", paymentResult.message || "Không thể tạo link thanh toán.")
      }
    } catch (error) {
      console.error("Buy now error:", error)
      setNotificationMessage("")
      Alert.alert("Lỗi", "Có lỗi xảy ra khi xử lý mua ngay: " + error.message)
    }
  }

  const imageSource =
    imageUrl && imageUrl !== "string"
      ? { uri: imageUrl }
      : { uri: "https://via.placeholder.com/150x200.png?text=No+Image" }

  return (
    <View style={styles.container}>
      <Notification
        message={notificationMessage}
        type={notificationType}
        autoDismiss={3000}
        onDismiss={() => {
          setNotificationMessage("")
          setNotificationType("success")
        }}
      />

      <ScrollView>
        <View style={styles.imageContainer}>
          <Image
            source={imageSource}
            style={styles.detailImage}
            resizeMode="contain"
            accessibilityLabel={`Hình ảnh sản phẩm ${name}`}
          />
        </View>

        <View style={styles.detailsContainer}>
          <Text style={[styles.brand, isDeactivated ? styles.deactivatedText : null]}>
            {name || "Tên sản phẩm không có"}
          </Text>

          <Text style={styles.category}>Danh mục: {categoryName}</Text>

          <Text style={[styles.price, isDeactivated ? styles.deactivatedText : null]}>
            {(salePrice || 0).toLocaleString("vi-VN")} đ
          </Text>

          {/* Added free shipping notice */}
          <Text style={styles.freeShippingNotice}>🚚 Miễn phí giao hàng</Text>

          {isDeactivated && <Text style={styles.deactivatedLabel}>Hết hàng</Text>}

          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
            <Text style={styles.description}>{description || "Không có mô tả"}</Text>
          </View>

          <View style={styles.specificationContainer}>
            <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>
            <Text style={styles.specification}>• Thương hiệu: {name || "N/A"}</Text>
            <Text style={styles.specification}>• Dung tích: {volume ? `${volume}ml` : "N/A"}</Text>
            <Text style={styles.specification}>• Loại da: {skinTypes}</Text>
            <Text style={styles.specification}>• Trạng thái da: {skinStatuses}</Text>
            <Text style={styles.specification}>• Giao hàng: Miễn phí toàn quốc</Text>
            {latestShipment && (
              <>
                <Text style={styles.specification}>
                  • Ngày sản xuất: {formatDate(latestShipment.manufacturingDate)}
                </Text>
                <Text style={styles.specification}>• Hạn sử dụng: {formatDate(latestShipment.expiryDate)}</Text>
              </>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.addToCartButton, isDeactivated ? styles.disabledButton : null]}
              onPress={handleAddToCart}
              disabled={isDeactivated}
              accessibilityLabel="Thêm sản phẩm vào giỏ hàng"
            >
              <Text style={styles.buttonText}>Thêm vào giỏ hàng</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.buyNowButton, isDeactivated ? styles.disabledButton : null]}
              onPress={handleBuyNow}
              disabled={isDeactivated}
              accessibilityLabel="Mua ngay sản phẩm"
            >
              <Text style={styles.buttonText}>Mua ngay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  imageContainer: {
    backgroundColor: "#fff",
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  detailImage: {
    width: screenWidth - 40,
    height: 300,
    borderRadius: 10,
  },
  detailsContainer: {
    padding: 20,
    backgroundColor: "#fff",
    marginTop: 10,
    marginBottom: 20,
  },
  brand: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  category: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  price: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#E53935",
    marginBottom: 5,
  },
  freeShippingNotice: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "500",
    marginBottom: 10,
  },
  deactivatedText: {
    color: "#999",
  },
  deactivatedLabel: {
    fontSize: 16,
    color: "#E53935",
    fontWeight: "bold",
    marginBottom: 10,
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: "#555",
    lineHeight: 22,
  },
  specificationContainer: {
    marginBottom: 20,
  },
  specification: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  addToCartButton: {
    backgroundColor: "#FFA500",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },
  buyNowButton: {
    backgroundColor: "#E53935",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    paddingVertical: 15,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  backButtonText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },
})

export default ProductDetailScreen
