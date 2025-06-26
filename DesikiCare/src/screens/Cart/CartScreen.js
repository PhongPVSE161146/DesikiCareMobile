import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, updateCartItemQuantity, applyDiscount, setCartItems } from '../../redux/cartSlice';
import orderService from '../../config/axios/Order/orderService'; // Adjust path based on your file structure

const CartScreen = ({ navigation }) => {
  const cartItems = useSelector(state => state.cart.items) || [];
  const discount = useSelector(state => state.cart.discount) || null;
  const dispatch = useDispatch();
  const [discountCode, setDiscountCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch cart data from API
  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching cart...');
      const result = await orderService.getCart();
      console.log('API Response:', JSON.stringify(result.data, null, 2));
      if (result.success) {
        const mappedItems = result.data.cartItems.map(({ cartItem, product }) => ({
          id: cartItem._id,
          title: product.name,
          price: product.salePrice,
          quantity: cartItem.quantity,
          image: product.imageUrl,
        }));
        console.log('Mapped Items:', mappedItems);
        dispatch(setCartItems(mappedItems));
      } else {
        setError(result.message);
      }
    } catch (e) {
      console.error('Fetch cart error:', e);
      setError('Lỗi không xác định. Vui lòng thử lại.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemoveItem = async (cartItemId) => {
    Alert.alert('Xóa sản phẩm', 'Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          console.log('Removing item:', cartItemId);
          const result = await orderService.deleteCartItem(cartItemId);
          if (result.success) {
            dispatch(removeFromCart(cartItemId));
            Alert.alert('Thành công', 'Đã phẩm đã được xóa khỏi giỏ hàng.');
          } else {
            console.log('Remove error:', result.message);
            if (result.message === 'No token found. Please log in.') {
              Alert.alert('Lỗi', 'Vui lòng đăng nhập để thực hiện thao tác này.', [
                { text: 'OK', onPress: () => navigation.navigate('Login') },
              ]);
            } else {
              Alert.alert('Lỗi', result.message || 'Không thể xóa sản phẩm. Vui lòng thử lại.');
            }
          }
        },
      },
    ]);
  };

  const handleQuantityChange = async (id, newQuantity) => {
    if (newQuantity >= 1) {
      console.log('Updating quantity for id:', id, 'to:', newQuantity);
      const result = await orderService.updateCartItemQuantity(id, newQuantity);
      if (result.success) {
        dispatch(updateCartItemQuantity({ id, quantity: newQuantity }));
      } else {
        if (result.message === 'No token found. Please log in.') {
          Alert.alert('Lỗi', 'Vui lòng đăng nhập để thực hiện thao tác này.', [
            { text: 'OK', onPress: () => navigation.navigate('Login') },
          ]);
        } else {
          Alert.alert('Lỗi', result.message || 'Không thể cập nhật số lượng. Vui lòng thử lại.');
        }
      }
    }
  };

  const handleApplyDiscount = () => {
    if (discountCode.trim() === 'SAVE10') {
      dispatch(applyDiscount({ code: 'SAVE10', amount: 0.1 }));
      Alert.alert('Thành công', 'Mã giảm giá đã được áp dụng!');
      setDiscountCode('');
    } else {
      Alert.alert('Lỗi', 'Mã giảm giá không hợp lệ.');
    }
  };

  const calculateTotal = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
    if (discount && discount.amount) {
      return subtotal * (1 - discount.amount);
    }
    return subtotal;
  };

  console.log('Cart Items:', cartItems);

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
          onPress={() => navigation?.navigate?.(error === 'No token found. Please log in.' ? 'Login' : 'Home')}
        >
          <Text style={styles.buttonText}>
            {error === 'No token found. Please log in.' ? 'ĐĂNG NHẬP' : 'TIẾP TỤC MUA SẮM'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderCartItem = ({ item }) => {
    console.log('Rendering item:', item);
    return (
      <View style={styles.cartItem}>
        <Image
          source={{ uri: item.image || 'https://via.placeholder.com/100x100.png?text=No+Image' }}
          style={styles.cartItemImage}
          resizeMode="contain"
        />
        <View style={styles.cartItemDetails}>
          <Text style={styles.cartItemName} numberOfLines={2}>
            {item.title || item.name}
          </Text>
          <Text style={styles.cartItemPrice}>
            {(item.price * (item.quantity || 1)).toLocaleString('vi-VN')} đ
          </Text>
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
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item.id)}
        >
          <Text style={styles.removeButtonText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 16, color: '#333' }}>Debug: Rendering {cartItems.length} items</Text>
      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={(item, index) => {
          console.log('Key for item:', item.id, 'Index:', index);
          return `${item.id || index}`;
        }}
        contentContainerStyle={styles.cartList}
      />
      <View style={styles.discountContainer}>
        <TextInput
          style={styles.discountInput}
          placeholder="Nhập mã giảm giá"
          value={discountCode}
          onChangeText={setDiscountCode}
        />
        <TouchableOpacity
          style={styles.applyDiscountButton}
          onPress={handleApplyDiscount}
        >
          <Text style={styles.applyDiscountButtonText}>Áp dụng</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>
          Tổng: {calculateTotal().toLocaleString('vi-VN')} đ
          {discount && <Text style={styles.discountApplied}> (Đã áp dụng {discount.code})</Text>}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.checkoutButton}
        onPress={() => navigation?.navigate?.('Payment') }
      >
        <Text style={styles.checkoutButtonText}>Tiến hành đặt hàng</Text>
      </TouchableOpacity>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 100,
    height: 100,
    marginBottom: 20,
    tintColor: '#999',
  },
  text: {
    fontSize: 16,
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#FF5C00',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  cartList: {
    paddingVertical: 10,
  },
  cartItem: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
    backgroundColor: '#f0f0f0', // Debug
  },
  cartItemImage: {
    width: 80,
    height: 80,
    marginRight: 10,
  },
  cartItemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  cartItemName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  cartItemPrice: {
    fontSize: 16,
    color: '#E53935',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#eee',
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  quantityButtonText: {
    fontSize: 20,
    color: '#333',
  },
  quantityText: {
    fontSize: 16,
    color: '#333',
    marginHorizontal: 10,
    width: 30,
    textAlign: 'center',
  },
  removeButton: {
    padding: 5,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  removeButtonText: {
    fontSize: 14,
    color: '#E53935',
    fontWeight: 'bold',
  },
  discountContainer: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  discountInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    fontSize: 16,
  },
  applyDiscountButton: {
    backgroundColor: '#FFA500',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    justifyContent: 'center',
  },
  applyDiscountButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  totalContainer: {
    marginVertical: 10,
    alignItems: 'flex-end',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  discountApplied: {
    fontSize: 14,
    color: '#E53935',
  },
  checkoutButton: {
    backgroundColor: '#E53935',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  checkoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CartScreen;