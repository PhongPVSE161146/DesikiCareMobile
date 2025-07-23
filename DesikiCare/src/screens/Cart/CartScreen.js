import React, { useCallback, useState, useEffect } from 'react';
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
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, updateCartItemQuantity, applyPoints, setCartItems } from '../../redux/cartSlice';
import orderService from '../../config/axios/Order/orderService';
import { useFocusEffect } from '@react-navigation/native';
import Notification from '../../components/NotiComponnets/Notification';

// Replace with your actual API base URL for images
const API_BASE_URL = 'https://wdp301-desikicare.onrender.com';

// Danh sách danh mục cố định
const predefinedCategories = [
  { _id: 0, name: 'Tất cả sản phẩm' },
  { _id: 1, name: 'Sữa rửa mặt' },
  { _id: 2, name: 'Kem dưỡng' },
  { _id: 3, name: 'Toner' },
  { _id: 4, name: 'Serum' },
  { _id: 5, name: 'Kem chống nắng' },
  { _id: 6, name: 'Tẩy tế bào chết' },
  { _id: 7, name: 'Mặt nạ' },
];

const CartScreen = ({ route, navigation }) => {
  const cartItems = useSelector(state => state.cart.items) || [];
  const pointsApplied = useSelector(state => state.cart.points) || 0;
  const dispatch = useDispatch();
  const [pointsInput, setPointsInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notificationMessage, setNotificationMessage] = useState(route.params?.notificationMessage || '');
  const [notificationType, setNotificationType] = useState(route.params?.notificationType || 'success');

  // Handle notification auto-dismiss
  useEffect(() => {
    if (notificationMessage) {
      const timer = setTimeout(() => {
        setNotificationMessage('');
        setNotificationType('success');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notificationMessage]);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await orderService.getCart();
      console.log('Raw API response:', JSON.stringify(result, null, 2));
      let cartItems = [];
      if (result.success) {
        if (Array.isArray(result.data?.cartItems)) {
          cartItems = result.data.cartItems.map(({ cartItem, product }) => ({
            _id: cartItem._id,
            quantity: cartItem.quantity,
            product: {
              name: product.name,
              salePrice: product.salePrice,
              imageUrl: product.imageUrl,
              categoryId: product.categoryId,
            },
          }));
        } else if (Array.isArray(result.data?.items)) {
          cartItems = result.data.items;
        } else if (Array.isArray(result.data?.cart?.items)) {
          cartItems = result.data.cart.items;
        } else {
          setError('Dữ liệu giỏ hàng không đúng định dạng.');
          console.log('Invalid cart data structure:', result.data);
          return;
        }
        console.log('Processed cartItems:', JSON.stringify(cartItems, null, 2));
        const mappedItems = cartItems.map(item => ({
          id: item._id && typeof item._id === 'string' ? item._id : `temp-${Math.random().toString(36).substr(2, 9)}`,
          title: item.product?.name && typeof item.product.name === 'string' ? item.product.name : 'Sản phẩm không tên',
          price: typeof item.product?.salePrice === 'number' ? item.product.salePrice : 0,
          quantity: typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1,
          image: item.product?.imageUrl && typeof item.product.imageUrl === 'string'
            ? (item.product.imageUrl.startsWith('http') ? item.product.imageUrl : `${API_BASE_URL}/${item.product.imageUrl}`)
            : 'https://placehold.co/100x100?text=No+Image',
          categoryId: typeof item.product?.categoryId === 'number' ? item.product.categoryId.toString() : '0',
        }));
        console.log('Mapped cart items:', JSON.stringify(mappedItems, null, 2));
        dispatch(setCartItems(mappedItems));
      } else {
        setError(result.message || 'Không thể tải giỏ hàng.');
        console.log('API error:', result.message);
      }
    } catch (e) {
      console.error('Fetch cart error:', e.message, e.response?.data);
      setError(e.response?.data?.message || e.message || 'Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [fetchCart])
  );

  const handleRemoveItem = async (cartItemId) => {
    if (cartItemId.startsWith('temp-')) {
      Alert.alert('Lỗi', 'Không thể xóa sản phẩm với ID tạm thời.');
      return;
    }
    Alert.alert('Xóa sản phẩm', 'Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            const result = await orderService.deleteCartItem(cartItemId);
            if (result.success) {
              dispatch(removeFromCart(cartItemId));
              Alert.alert('Thành công', 'Sản phẩm đã được xóa.');
            } else {
              if (result.message === 'No token found. Please log in.') {
                Alert.alert('Lỗi', 'Vui lòng đăng nhập.', [
                  { text: 'OK', onPress: () => navigation.navigate('Login') },
                ]);
              } else {
                Alert.alert('Lỗi', result.message || 'Không thể xóa sản phẩm.');
              }
            }
          } catch (error) {
            console.error('Remove item error:', error.message, error.response?.data);
            Alert.alert('Lỗi', 'Có lỗi xảy ra khi xóa sản phẩm. Vui lòng thử lại.');
          }
        },
      },
    ]);
  };

  const handleQuantityChange = async (id, newQuantity) => {
    if (id.startsWith('temp-')) {
      Alert.alert('Lỗi', 'Không thể cập nhật số lượng cho sản phẩm với ID tạm thời.');
      return;
    }
    const quantity = Math.max(1, newQuantity);
    try {
      console.log('Updating cart item:', { id, quantity });
      const result = await orderService.updateCartItemQuantity(id, quantity);
      if (result.success) {
        dispatch(updateCartItemQuantity({ id, quantity }));
     
      } else {
        if (result.message === 'No token found. Please log in.') {
          Alert.alert('Lỗi', 'Vui lòng đăng nhập.', [
            { text: 'OK', onPress: () => navigation.navigate('Login') },
          ]);
        } else {
          Alert.alert('Lỗi', result.message || 'Không thể cập nhật số lượng.');
        }
      }
    } catch (error) {
      console.error('Update quantity error:', error.response?.status, error.response?.data);
      Alert.alert('Lỗi', `Có lỗi khi cập nhật số lượng: ${error.message}`);
    }
  };

  const handleApplyPoints = async () => {
    const points = parseInt(pointsInput, 10);
    if (isNaN(points) || points <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điểm hợp lệ (lớn hơn 0).');
      return;
    }
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
    const maxPoints = Math.floor(subtotal / 1000);
    if (points > maxPoints) {
      Alert.alert('Lỗi', `Bạn chỉ có thể sử dụng tối đa ${maxPoints} điểm cho đơn hàng này.`);
      return;
    }
    try {
      const result = await orderService.applyPoints(points);
      if (result.success) {
        dispatch(applyPoints(points));
        Alert.alert('Thành công', `Đã áp dụng ${points} điểm (giảm ${points * 1000} đ).`);
        setPointsInput('');
      } else {
        Alert.alert('Lỗi', result.message || 'Không thể áp dụng điểm.');
      }
    } catch (error) {
      console.error('Apply points error:', error.message, error.response?.data);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi áp dụng điểm. Vui lòng thử lại.');
    }
  };

  const calculateTotal = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
    const discount = pointsApplied * 1000;
    const shippingFee = subtotal > 500000 ? 0 : 30000;
    return {
      subtotal,
      discount,
      shippingFee,
      total: Math.max(0, subtotal - discount + shippingFee),
    };
  };

  const getCategoryName = (categoryId) => {
    const category = predefinedCategories.find(cat => cat._id === parseInt(categoryId, 10));
    return category ? category.name : `Category ${categoryId}`;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#E53935" />
        <Text style={styles.text}>Đang tải giỏ hàng...</Text>
      </View>
    );
  }

  if (error && error !== 'No token found. Please log in.') {
    return (
      <View style={styles.centered}>
        <Text style={styles.text}>{error}</Text>
        <TouchableOpacity onPress={fetchCart} style={styles.button}>
          <Text style={styles.buttonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (error === 'No token found. Please log in.' || cartItems.length === 0) {
    return (
      <View style={styles.centered}>
        <Image
          source={{ uri: 'https://placehold.co/100x100?text=No+Image' }}
          style={styles.icon}
          resizeMode="contain"
        />
        <Text style={styles.text}>
          {error === 'No token found. Please log in.' ? 'Vui lòng đăng nhập để xem giỏ hàng.' : 'Giỏ hàng của bạn chưa có sản phẩm nào'}
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate(error === 'No token found. Please log in.' ? 'Login' : 'Home')}
        >
          <Text style={styles.buttonText}>
            {error === 'No token found. Please log in.' ? 'ĐĂNG NHẬP' : 'TIẾP TỤC MUA SẮM'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { subtotal, discount, shippingFee, total } = calculateTotal();

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image
        source={{ uri: item.image || 'https://placehold.co/100x100?text=No+Image' }}
        style={styles.cartItemImage}
        resizeMode="contain"
        onError={(e) => console.log(`Failed to load image for ${item.title}: ${item.image}, error: ${e.nativeEvent.error}`)}
      />
      <View style={styles.cartItemDetails}>
        <Text style={styles.cartItemName} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.cartItemCategory}>Danh mục: {getCategoryName(item.categoryId)}</Text>
        <Text style={styles.cartItemPrice}>{(item.price * (item.quantity || 1)).toLocaleString('vi-VN')} đ</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(item.id, (item.quantity || 1) - 1)}
            disabled={item.quantity <= 1}
          >
            <Text style={[styles.quantityButtonText, item.quantity <= 1 && { color: '#ccc' }]}>−</Text>
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
        <Text style={styles.removeButtonText}>Xóa</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Notification
        message={notificationMessage}
        type={notificationType}
        autoDismiss={3000}
        onDismiss={() => {
          setNotificationMessage('');
          setNotificationType('success');
        }}
      />
      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.cartList}
      />
      <View style={styles.pointsContainer}>
        <TextInput
          style={styles.pointsInput}
          value={pointsInput}
          onChangeText={setPointsInput}
          placeholder="Nhập số điểm"
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.applyPointsButton} onPress={handleApplyPoints}>
          <Text style={styles.applyPointsButtonText}>Áp dụng điểm</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.totalContainer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tạm tính:</Text>
          <Text style={styles.totalValue}>{subtotal.toLocaleString('vi-VN')} đ</Text>
        </View>
        {discount > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.discountLabel}>Giảm giá ({pointsApplied} điểm):</Text>
            <Text style={styles.discountValue}>-{discount.toLocaleString('vi-VN')} đ</Text>
          </View>
        )}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Phí vận chuyển:</Text>
          <Text style={styles.totalValue}>
            {shippingFee.toLocaleString('vi-VN')} đ
            {shippingFee === 0 && <Text style={styles.discountLabel}> (Miễn phí cho đơn hàng trên 500,000 đ)</Text>}
          </Text>
        </View>
        <View style={[styles.totalRow, styles.totalFinalRow]}>
          <Text style={styles.totalFinalLabel}>Tổng cộng:</Text>
          <Text style={styles.totalFinalValue}>{total.toLocaleString('vi-VN')} đ</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.checkoutButton}
        onPress={() => {
          console.log('Navigating to Payment with cartItems:', JSON.stringify(cartItems, null, 2));
          navigation.navigate('Payment', { cartItems, pointsApplied });
        }}
      >
        <Text style={styles.checkoutButtonText}>Tiến hành đặt hàng</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  icon: { width: 100, height: 100, marginBottom: 20 },
  text: { fontSize: 16, color: '#333', marginBottom: 20, textAlign: 'center' },
  button: { backgroundColor: '#E53935', paddingVertical: 12, paddingHorizontal: 40, borderRadius: 5 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  cartList: { paddingVertical: 10 },
  cartItem: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee', alignItems: 'center' },
  cartItemImage: { width: 80, height: 80, marginRight: 10, borderRadius: 5, backgroundColor: '#f5f5f5' },
  cartItemDetails: { flex: 1, justifyContent: 'center' },
  cartItemName: { fontSize: 16, color: '#333', marginBottom: 5, fontWeight: '600' },
  cartItemCategory: { fontSize: 14, color: '#666', marginBottom: 5 },
  cartItemPrice: { fontSize: 16, color: '#E53935', fontWeight: 'bold', marginBottom: 5 },
  quantityContainer: { flexDirection: 'row', alignItems: 'center' },
  quantityButton: { backgroundColor: '#eee', width: 32, height: 32, justifyContent: 'center', alignItems: 'center', borderRadius: 4 },
  quantityButtonText: { fontSize: 20, color: '#333' },
  quantityText: { fontSize: 16, color: '#333', marginHorizontal: 10, width: 30, textAlign: 'center' },
  removeButton: { padding: 5, backgroundColor: '#f5f5f5', borderRadius: 4 },
  removeButtonText: { fontSize: 14, color: '#E53935', fontWeight: 'bold' },
  pointsContainer: { flexDirection: 'row', marginVertical: 10 },
  pointsInput: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 5, padding: 10, marginRight: 10, fontSize: 16 },
  applyPointsButton: { backgroundColor: '#E53935', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5, justifyContent: 'center' },
  applyPointsButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  totalContainer: {
    marginVertical: 15,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalFinalRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  totalLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  totalValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  discountLabel: {
    fontSize: 14,
    color: '#E53935',
    fontWeight: '500',
  },
  discountValue: {
    fontSize: 14,
    color: '#E53935',
    fontWeight: '600',
  },
  totalFinalLabel: {
    fontSize: 18,
    color: '#333',
    fontWeight: '700',
  },
  totalFinalValue: {
    fontSize: 18,
    color: '#E53935',
    fontWeight: '700',
  },
  checkoutButton: { backgroundColor: '#E53935', paddingVertical: 15, borderRadius: 5, alignItems: 'center', marginVertical: 10 },
  checkoutButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default CartScreen;