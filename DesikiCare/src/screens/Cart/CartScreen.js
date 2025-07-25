"use client"

import { useCallback, useState, useEffect } from "react"
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native"
import { useSelector, useDispatch } from "react-redux"
import { removeFromCart, updateCartItemQuantity, applyPoints, setCartItems } from "../../redux/cartSlice"
import orderService from "../../config/axios/Order/orderService"
import { useFocusEffect } from "@react-navigation/native"
import Notification from "../../components/NotiComponnets/Notification"

// Replace with your actual API base URL for images
const API_BASE_URL = "https://wdp301-desikicare.onrender.com"

// Multiple fallback placeholder images
const PLACEHOLDER_IMAGES = [
  "https://placehold.co/100x100/E0E0E0/666666?text=No+Image",
  "https://picsum.photos/100/100?grayscale&blur=1",
  "https://dummyimage.com/100x100/E0E0E0/666666&text=No+Image",
]

// Danh sách danh mục cố định
const predefinedCategories = [
  { _id: 0, name: "Tất cả sản phẩm" },
  { _id: 1, name: "Sữa rửa mặt" },
  { _id: 2, name: "Kem dưỡng" },
  { _id: 3, name: "Toner" },
  { _id: 4, name: "Serum" },
  { _id: 5, name: "Kem chống nắng" },
  { _id: 6, name: "Tẩy tế bào chết" },
  { _id: 7, name: "Mặt nạ" },
]

// Function to generate image URL from product ID
const generateImageUrlFromId = (productId) => {
  if (!productId || typeof productId !== "string") {
    return null
  }

  // Try different common image paths
  const possiblePaths = [
    `${API_BASE_URL}/public/images/products/${productId}/main.jpg`,
    `${API_BASE_URL}/public/images/products/${productId}/image.jpg`,
    `${API_BASE_URL}/public/images/products/${productId}/product.jpg`,
    `${API_BASE_URL}/public/images/products/${productId}/thumb.jpg`,
    `${API_BASE_URL}/images/products/${productId}/main.jpg`,
    `${API_BASE_URL}/uploads/products/${productId}/main.jpg`,
  ]

  return possiblePaths
}

// Image component with robust error handling and fallbacks
const ProductImage = ({ imageUrl, title, style, productId }) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [currentImageUrl, setCurrentImageUrl] = useState("")
  const [fallbackIndex, setFallbackIndex] = useState(0)
  const [showPlaceholder, setShowPlaceholder] = useState(false)
  const [imageUrlsToTry, setImageUrlsToTry] = useState([])

  useEffect(() => {
    const processImageUrl = () => {
      setLoading(true)
      setError(false)
      setShowPlaceholder(false)
      setFallbackIndex(0)

      console.log(`🖼️ Processing image for ${title}:`, {
        imageUrl,
        productId,
        type: typeof imageUrl,
      })

      const urlsToTry = []

      // First, try the provided imageUrl if it exists and is valid
      if (imageUrl && typeof imageUrl === "string" && imageUrl.trim()) {
        let processedUrl = imageUrl.trim()

        if (processedUrl.startsWith("http://") || processedUrl.startsWith("https://")) {
          urlsToTry.push(processedUrl)
        } else {
          // Remove leading slash if present to avoid double slashes
          if (processedUrl.startsWith("/")) {
            processedUrl = processedUrl.substring(1)
          }
          urlsToTry.push(`${API_BASE_URL}/${processedUrl}`)
        }
      }

      // If imageUrl is null/empty but we have productId, try to generate URLs
      if ((!imageUrl || imageUrl === null) && productId) {
        console.log(`🔍 imageUrl is null for ${title}, trying to generate from productId: ${productId}`)
        const generatedUrls = generateImageUrlFromId(productId)
        if (generatedUrls) {
          urlsToTry.push(...generatedUrls)
        }
      }

      // Add placeholder images as final fallbacks
      urlsToTry.push(...PLACEHOLDER_IMAGES)

      console.log(`📋 URLs to try for ${title}:`, urlsToTry)

      setImageUrlsToTry(urlsToTry)

      // Start with the first URL
      if (urlsToTry.length > 0) {
        setCurrentImageUrl(urlsToTry[0])
      } else {

        setShowPlaceholder(true)
        setLoading(false)
      }
    }

    processImageUrl()
  }, [imageUrl, title, productId])

  const handleLoadStart = () => {
    setLoading(true)
    setError(false)
  }

  const handleLoadEnd = () => {
    setLoading(false)
    console.log(`✅ Successfully loaded image for ${title}: ${currentImageUrl}`)
  }

  const handleError = (e) => {
    console.error(`❌ Failed to load image for ${title}:`, {
      originalUrl: imageUrl,
      currentUrl: currentImageUrl,
      error: e.nativeEvent?.error || "Unknown error",
      fallbackIndex,
      totalUrls: imageUrlsToTry.length,
    })

    setLoading(false)

    // Try next URL in the list
    const nextIndex = fallbackIndex + 1
    if (nextIndex < imageUrlsToTry.length) {
      console.log(`🔄 Trying fallback image ${nextIndex + 1}/${imageUrlsToTry.length} for ${title}`)
      setCurrentImageUrl(imageUrlsToTry[nextIndex])
      setFallbackIndex(nextIndex)
      setError(false)
    } else {
      // All URLs failed, show custom placeholder
      console.log(`💥 All image sources failed for ${title}, showing custom placeholder`)
      setError(true)
      setShowPlaceholder(true)
    }
  }

  // Custom placeholder component
  const renderCustomPlaceholder = () => (
    <View style={[style, styles.customPlaceholder]}>
      <View style={styles.placeholderIcon}>
        <Text style={styles.placeholderEmoji}>📷</Text>
      </View>
      <Text style={styles.placeholderText} numberOfLines={1}>
        Không có ảnh
      </Text>
    </View>
  )

  if (showPlaceholder) {
    return renderCustomPlaceholder()
  }

  return (
    <View style={[style, styles.imageContainer]}>
      {currentImageUrl ? (
        <Image
          source={{ uri: currentImageUrl }}
          style={[style, { position: "absolute" }]}
          resizeMode="cover"
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          // onError={handleError}
        />
      ) : (
        renderCustomPlaceholder()
      )}

      {loading && !error && (
        <View style={[style, styles.imageLoading]}>
          <ActivityIndicator size="small" color="#E53935" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      )}

      {error && !showPlaceholder && (
        <View style={[style, styles.imageError]}>
          <Text style={styles.imageErrorText}>⚠️</Text>
          <Text style={styles.imageErrorLabel}>Lỗi tải ảnh</Text>
        </View>
      )}
    </View>
  )
}

const CartScreen = ({ route, navigation }) => {
  const cartItems = useSelector((state) => state.cart.items) || []
  const pointsApplied = useSelector((state) => state.cart.points) || 0
  const dispatch = useDispatch()

  const [pointsInput, setPointsInput] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [notificationMessage, setNotificationMessage] = useState(route.params?.notificationMessage || "")
  const [notificationType, setNotificationType] = useState(route.params?.notificationType || "success")

  // Handle notification auto-dismiss
  useEffect(() => {
    if (notificationMessage) {
      const timer = setTimeout(() => {
        setNotificationMessage("")
        setNotificationType("success")
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [notificationMessage])

  // Enhanced image URL processing function
  const processImageUrl = (imageUrl) => {
    if (!imageUrl || typeof imageUrl !== "string") {
      return null // Return null instead of placeholder URL
    }

    const trimmedUrl = imageUrl.trim()

    // If it's already a full URL, return as is
    if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
      return trimmedUrl
    }

    // Remove leading slash to avoid double slashes
    const cleanUrl = trimmedUrl.startsWith("/") ? trimmedUrl.substring(1) : trimmedUrl

    // Construct full URL
    return `${API_BASE_URL}/${cleanUrl}`
  }

  const fetchCart = useCallback(async () => {
    setLoading(true)
    setError("")

    try {
      console.log("🛒 Fetching cart data...")
      const result = await orderService.getCart()
      console.log("🛒 Raw API response:", JSON.stringify(result, null, 2))

      let cartItems = []

      if (result.success) {
        if (Array.isArray(result.data?.cartItems)) {
          cartItems = result.data.cartItems.map(({ cartItem, product }) => ({
            _id: cartItem._id,
            quantity: cartItem.quantity,
            product: {
              _id: product._id, // Include product ID
              name: product.name,
              salePrice: product.salePrice,
              imageUrl: product.imageUrl,
              categoryId: product.categoryId,
            },
          }))
        } else if (Array.isArray(result.data?.items)) {
          cartItems = result.data.items
        } else if (Array.isArray(result.data?.cart?.items)) {
          cartItems = result.data.cart.items
        } else {
          setError("Dữ liệu giỏ hàng không đúng định dạng.")
          console.error("❌ Invalid cart data structure:", result.data)
          return
        }

        console.log("🛒 Processed cartItems:", JSON.stringify(cartItems, null, 2))

        const mappedItems = cartItems.map((item) => {
          const processedImageUrl = processImageUrl(item.product?.imageUrl)

          console.log(`🖼️ Image processing for ${item.product?.name}:`, {
            productId: item.product?._id,
            original: item.product?.imageUrl,
            processed: processedImageUrl,
          })

          return {
            id: item._id && typeof item._id === "string" ? item._id : `temp-${Math.random().toString(36).substr(2, 9)}`,
            productId: item.product?._id, // Include product ID for image generation
            title:
              item.product?.name && typeof item.product.name === "string" ? item.product.name : "Sản phẩm không tên",
            price: typeof item.product?.salePrice === "number" ? item.product.salePrice : 0,
            quantity: typeof item.quantity === "number" && item.quantity > 0 ? item.quantity : 1,
            image: processedImageUrl, // Can be null
            originalImageUrl: item.product?.imageUrl, // Keep original for debugging
            categoryId: typeof item.product?.categoryId === "number" ? item.product.categoryId.toString() : "0",
          }
        })

        console.log("🛒 Final mapped cart items:", JSON.stringify(mappedItems, null, 2))
        dispatch(setCartItems(mappedItems))
      } else {
        setError(result.message || "Không thể tải giỏ hàng.")
        console.error("❌ API error:", result.message)
      }
    } catch (e) {
      console.error("❌ Fetch cart error:", e.message, e.response?.data)
      setError(e.response?.data?.message || e.message || "Lỗi kết nối. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }, [dispatch])

  useFocusEffect(
    useCallback(() => {
      fetchCart()
    }, [fetchCart]),
  )

  const handleRemoveItem = async (cartItemId) => {
    if (cartItemId.startsWith("temp-")) {
      Alert.alert("Lỗi", "Không thể xóa sản phẩm với ID tạm thời.")
      return
    }

    Alert.alert("Xóa sản phẩm", "Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            const result = await orderService.deleteCartItem(cartItemId)
            if (result.success) {
              dispatch(removeFromCart(cartItemId))
              setNotificationMessage("Sản phẩm đã được xóa khỏi giỏ hàng")
              setNotificationType("success")
            } else {
              if (result.message === "No token found. Please log in.") {
                Alert.alert("Lỗi", "Vui lòng đăng nhập.", [{ text: "OK", onPress: () => navigation.navigate("Login") }])
              } else {
                Alert.alert("Lỗi", result.message || "Không thể xóa sản phẩm.")
              }
            }
          } catch (error) {
            console.error("❌ Remove item error:", error.message, error.response?.data)
            Alert.alert("Lỗi", "Có lỗi xảy ra khi xóa sản phẩm. Vui lòng thử lại.")
          }
        },
      },
    ])
  }

  const handleQuantityChange = async (id, newQuantity) => {
    if (id.startsWith("temp-")) {
      Alert.alert("Lỗi", "Không thể cập nhật số lượng cho sản phẩm với ID tạm thời.")
      return
    }

    const quantity = Math.max(1, newQuantity)

    try {
      console.log("🔄 Updating cart item:", { id, quantity })
      const result = await orderService.updateCartItemQuantity(id, quantity)

      if (result.success) {
        dispatch(updateCartItemQuantity({ id, quantity }))
        setNotificationMessage(`Đã cập nhật số lượng thành ${quantity}`)
        setNotificationType("success")
      } else {
        if (result.message === "No token found. Please log in.") {
          Alert.alert("Lỗi", "Vui lòng đăng nhập.", [{ text: "OK", onPress: () => navigation.navigate("Login") }])
        } else {
          Alert.alert("Lỗi", result.message || "Không thể cập nhật số lượng.")
        }
      }
    } catch (error) {
      console.error("❌ Update quantity error:", error.response?.status, error.response?.data)
      Alert.alert("Lỗi", `Có lỗi khi cập nhật số lượng: ${error.message}`)
    }
  }

  const handleApplyPoints = async () => {
    const points = Number.parseInt(pointsInput, 10)

    if (isNaN(points) || points <= 0) {
      Alert.alert("Lỗi", "Vui lòng nhập số điểm hợp lệ (lớn hơn 0).")
      return
    }

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0)
    const maxPoints = Math.floor(subtotal / 1000)

    if (points > maxPoints) {
      Alert.alert("Lỗi", `Bạn chỉ có thể sử dụng tối đa ${maxPoints} điểm cho đơn hàng này.`)
      return
    }

    try {
      const result = await orderService.applyPoints(points)
      if (result.success) {
        dispatch(applyPoints(points))
        setNotificationMessage(`Đã áp dụng ${points} điểm (giảm ${points * 1000} đ)`)
        setNotificationType("success")
        setPointsInput("")
      } else {
        Alert.alert("Lỗi", result.message || "Không thể áp dụng điểm.")
      }
    } catch (error) {
      console.error("❌ Apply points error:", error.message, error.response?.data)
      Alert.alert("Lỗi", "Có lỗi xảy ra khi áp dụng điểm. Vui lòng thử lại.")
    }
  }

  const calculateTotal = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0)
    const discount = pointsApplied * 1000
    const shippingFee = subtotal > 500000 ? 0 : 30000

    return {
      subtotal,
      discount,
      shippingFee,
      total: Math.max(0, subtotal - discount + shippingFee),
    }
  }

  const getCategoryName = (categoryId) => {
    const category = predefinedCategories.find((cat) => cat._id === Number.parseInt(categoryId, 10))
    return category ? category.name : `Category ${categoryId}`
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#E53935" />
        <Text style={styles.text}>Đang tải giỏ hàng...</Text>
      </View>
    )
  }

  if (error && error !== "No token found. Please log in.") {
    return (
      <View style={styles.centered}>
        <Text style={styles.text}>{error}</Text>
        <TouchableOpacity onPress={fetchCart} style={styles.button}>
          <Text style={styles.buttonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (error === "No token found. Please log in." || cartItems.length === 0) {
    return (
      <View style={styles.centered}>
        <View style={styles.emptyCartIcon}>
          <Text style={styles.emptyCartEmoji}>🛒</Text>
        </View>
        <Text style={styles.text}>
          {error === "No token found. Please log in."
            ? "Vui lòng đăng nhập để xem giỏ hàng."
            : "Giỏ hàng của bạn chưa có sản phẩm nào"}
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate(error === "No token found. Please log in." ? "Login" : "Home")}
        >
          <Text style={styles.buttonText}>
            {error === "No token found. Please log in." ? "ĐĂNG NHẬP" : "TIẾP TỤC MUA SẮM"}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  const { subtotal, discount, shippingFee, total } = calculateTotal()

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <ProductImage imageUrl={item.image} title={item.title} style={styles.cartItemImage} productId={item.productId} />

      <View style={styles.cartItemDetails}>
        <Text style={styles.cartItemName} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.cartItemCategory}>Danh mục: {getCategoryName(item.categoryId)}</Text>
        <Text style={styles.cartItemPrice}>{(item.price * (item.quantity || 1)).toLocaleString("vi-VN")} đ</Text>

        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={[styles.quantityButton, item.quantity <= 1 && styles.quantityButtonDisabled]}
            onPress={() => handleQuantityChange(item.id, (item.quantity || 1) - 1)}
            disabled={item.quantity <= 1}
          >
            <Text style={[styles.quantityButtonText, item.quantity <= 1 && styles.quantityButtonTextDisabled]}>−</Text>
          </TouchableOpacity>

          <Text style={styles.quantityText}>{item.quantity || 1}</Text>

          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(item.id, (item.quantity || 1) + 1)}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveItem(item.id)}>
        <Text style={styles.removeButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  )

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

      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.cartList}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.pointsContainer}>
        <TextInput
          style={styles.pointsInput}
          value={pointsInput}
          onChangeText={setPointsInput}
          placeholder="Nhập số điểm"
          keyboardType="numeric"
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.applyPointsButton} onPress={handleApplyPoints}>
          <Text style={styles.applyPointsButtonText}>Áp dụng điểm</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.totalContainer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tạm tính:</Text>
          <Text style={styles.totalValue}>{subtotal.toLocaleString("vi-VN")} đ</Text>
        </View>

        {discount > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.discountLabel}>Giảm giá ({pointsApplied} điểm):</Text>
            <Text style={styles.discountValue}>-{discount.toLocaleString("vi-VN")} đ</Text>
          </View>
        )}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Phí vận chuyển:</Text>
          <Text style={styles.totalValue}>
            {shippingFee.toLocaleString("vi-VN")} đ
            {shippingFee === 0 && <Text style={styles.discountLabel}> (Miễn phí đơn 500,000 đ)</Text>}
          </Text>
        </View>

        <View style={[styles.totalRow, styles.totalFinalRow]}>
          <Text style={styles.totalFinalLabel}>Tổng cộng:</Text>
          <Text style={styles.totalFinalValue}>{total.toLocaleString("vi-VN")} đ</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.checkoutButton}
        onPress={() => {
          console.log("🚀 Navigating to Payment with cartItems:", JSON.stringify(cartItems, null, 2))
          navigation.navigate("Payment", { cartItems, pointsApplied })
        }}
      >
        <Text style={styles.checkoutButtonText}>Tiến hành đặt hàng ({cartItems.length})</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyCartIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyCartEmoji: {
    fontSize: 40,
  },
  text: {
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 24,
  },
  button: {
    backgroundColor: "#E53935",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  cartList: {
    paddingVertical: 10,
  },
  cartItem: {
    flexDirection: "row",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    alignItems: "flex-start",
    backgroundColor: "#fff",
  },

  // Enhanced Image container styles
  imageContainer: {
    position: "relative",
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  cartItemImage: {
    width: 80,
    height: 80,
    marginRight: 12,
    borderRadius: 8,
  },
  imageLoading: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
  },
  loadingText: {
    fontSize: 10,
    color: "#666",
    marginTop: 4,
  },
  imageError: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffebee",
  },
  imageErrorText: {
    fontSize: 20,
    marginBottom: 2,
  },
  imageErrorLabel: {
    fontSize: 9,
    color: "#d32f2f",
    textAlign: "center",
    fontWeight: "500",
  },

  // Custom placeholder styles
  customPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
  },
  placeholderIcon: {
    marginBottom: 4,
  },
  placeholderEmoji: {
    fontSize: 24,
    opacity: 0.5,
  },
  placeholderText: {
    fontSize: 10,
    color: "#999",
    textAlign: "center",
    fontWeight: "500",
  },

  cartItemDetails: {
    flex: 1,
    justifyContent: "flex-start",
    paddingRight: 8,
  },
  cartItemName: {
    fontSize: 16,
    color: "#333",
    marginBottom: 6,
    fontWeight: "600",
    lineHeight: 20,
  },
  cartItemCategory: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
  },
  cartItemPrice: {
    fontSize: 16,
    color: "#E53935",
    fontWeight: "bold",
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  quantityButton: {
    backgroundColor: "#f0f0f0",
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  quantityButtonDisabled: {
    backgroundColor: "#f8f8f8",
    borderColor: "#f0f0f0",
  },
  quantityButtonText: {
    fontSize: 18,
    color: "#333",
    fontWeight: "600",
  },
  quantityButtonTextDisabled: {
    color: "#ccc",
  },
  quantityText: {
    fontSize: 16,
    color: "#333",
    marginHorizontal: 12,
    minWidth: 30,
    textAlign: "center",
    fontWeight: "500",
  },
  removeButton: {
    padding: 8,
    backgroundColor: "#ffebee",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ffcdd2",
    marginLeft: 8,
  },
  removeButtonText: {
    fontSize: 16,
    color: "#E53935",
    fontWeight: "bold",
  },
  pointsContainer: {
    flexDirection: "row",
    marginVertical: 15,
    paddingHorizontal: 4,
  },
  pointsInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  applyPointsButton: {
    backgroundColor: "#E53935",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#E53935",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  applyPointsButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  totalContainer: {
    marginVertical: 15,
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  totalFinalRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: "#E53935",
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  totalValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  discountLabel: {
    fontSize: 14,
    color: "#E53935",
    fontWeight: "500",
  },
  discountValue: {
    fontSize: 14,
    color: "#E53935",
    fontWeight: "600",
  },
  totalFinalLabel: {
    fontSize: 18,
    color: "#333",
    fontWeight: "700",
  },
  totalFinalValue: {
    fontSize: 20,
    color: "#E53935",
    fontWeight: "700",
  },
  checkoutButton: {
    backgroundColor: "#E53935",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 10,
    elevation: 3,
    shadowColor: "#E53935",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  checkoutButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
})

export default CartScreen
