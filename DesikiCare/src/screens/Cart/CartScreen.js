import React, { useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, updateCartItemQuantity, applyDiscount, setCartItems } from '../../redux/cartSlice';
import orderService from '../../config/axios/Order/orderService';
import { useFocusEffect } from '@react-navigation/native';

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

const CartScreen = ({ navigation }) => {
  const cartItems = useSelector(state => state.cart.items) || [];
  const discount = useSelector(state => state.cart.discount) || null;
  const dispatch = useDispatch();
  const [discountCode, setDiscountCode] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await orderService.getCart();
      if (result.success && Array.isArray(result.data.cartItems)) {
        const mappedItems = result.data.cartItems.map(({ cartItem, product }) => ({
          id: cartItem._id && typeof cartItem._id === 'string' ? cartItem._id : `temp-${Math.random().toString(36).substr(2, 9)}`,
          title: product.name && typeof product.name === 'string' ? product.name : 'Sản phẩm không tên',
          price: typeof product.salePrice === 'number' ? product.salePrice : 0,
          quantity: typeof cartItem.quantity === 'number' && cartItem.quantity > 0 ? cartItem.quantity : 1,
          image: product.imageUrl && typeof product.imageUrl === 'string' ? product.imageUrl : 'https://via.placeholder.com/100x100.png?text=No+Image',
          categoryId: typeof product.categoryId === 'number' ? product.categoryId.toString() : '0',
        }));
        dispatch(setCartItems(mappedItems));
      } else {
        setError(result.message || 'Không thể tải giỏ hàng.');
      }
    } catch (e) {
      console.error('Fetch cart error:', e.message);
      setError('Lỗi kết nối. Vui lòng thử lại.');
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
            console.error('Remove item error:', error.message);
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
    if (newQuantity < 1) {
      Alert.alert('Lỗi', 'Số lượng phải lớn hơn hoặc bằng 1.');
      return;
    }
    try {
      const result = await orderService.updateCartItemQuantity(id, newQuantity);
      if (result.success) {
        dispatch(updateCartItemQuantity({ id, quantity: newQuantity }));
        Alert.alert('Thành công', 'Số lượng đã được cập nhật.');
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
      console.error('Update quantity error:', error.message);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi cập nhật số lượng. Vui lòng thử lại.');
    }
  };

  const calculateTotal = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
    return discount && discount.amount ? subtotal * (1 - discount.amount) : subtotal;
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
          source={{ uri: 'https://media.istockphoto.com/id/1306977523/vi/anh/giỏ-hàng-bị-cô-lập-trên-nền-trắng.jpg?s=1024x1024&w=is&k=20&c=zIab22_ExyGuEiSrti1QsVR3ZygxEQcHYVVXmx2ClcM=' }}
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

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.cartItemImage} resizeMode="contain" />
      <View style={styles.cartItemDetails}>
        <Text style={styles.cartItemName} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.cartItemCategory}>Danh mục: {getCategoryName(item.categoryId)}</Text>
        <Text style={styles.cartItemPrice}>{(item.price * (item.quantity || 1)).toLocaleString('vi-VN')} đ</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(item.id, (item.quantity || 1) - 1)}
          >
            <Text style={styles.quantityButtonText}>−</Text>
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
      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.cartList}
      />
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>
          Tổng: {calculateTotal().toLocaleString('vi-VN')} đ
          {discount && <Text style={styles.discountApplied}> (Đã áp dụng {discount.code})</Text>}
        </Text>
      </View>
      <TouchableOpacity style={styles.checkoutButton} onPress={() => navigation.navigate('Payment')}>
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
  cartItemImage: { width: 80, height: 80, marginRight: 10, borderRadius: 5 },
  cartItemDetails: { flex: 1, justifyContent: 'center' },
  cartItemName: { fontSize: 16, color: '#333', marginBottom: 5 },
  cartItemCategory: { fontSize: 14, color: '#666', marginBottom: 5 },
  cartItemPrice: { fontSize: 16, color: '#E53935', fontWeight: 'bold', marginBottom: 5 },
  quantityContainer: { flexDirection: 'row', alignItems: 'center' },
  quantityButton: { backgroundColor: '#eee', width: 32, height: 32, justifyContent: 'center', alignItems: 'center', borderRadius: 4 },
  quantityButtonText: { fontSize: 20, color: '#333' },
  quantityText: { fontSize: 16, color: '#333', marginHorizontal: 10, width: 30, textAlign: 'center' },
  removeButton: { padding: 5, backgroundColor: '#f5f5f5', borderRadius: 4 },
  removeButtonText: { fontSize: 14, color: '#E53935', fontWeight: 'bold' },
  discountContainer: { flexDirection: 'row', marginVertical: 10 },
  discountInput: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 5, padding: 10, marginRight: 10, fontSize: 16 },
  applyDiscountButton: { backgroundColor: '#E53935', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5, justifyContent: 'center' },
  applyDiscountButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  totalContainer: { marginVertical: 10, alignItems: 'flex-end' },
  totalText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  discountApplied: { fontSize: 14, color: '#E53935' },
  checkoutButton: { backgroundColor: '#E53935', paddingVertical: 15, borderRadius: 5, alignItems: 'center', marginVertical: 10 },
  checkoutButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default CartScreen;