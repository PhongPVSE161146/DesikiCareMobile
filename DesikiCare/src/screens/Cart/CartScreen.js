import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList, TextInput, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, updateCartItemQuantity, applyDiscount } from '../../redux/cartSlice';

const CartScreen = ({ navigation }) => {
  const cartItems = useSelector(state => state.cart.items) || [];
  const discount = useSelector(state => state.cart.discount) || null;
  const dispatch = useDispatch();
  const [discountCode, setDiscountCode] = useState('');

  if (cartItems.length === 0) {
    return (
      <View style={styles.container}>
        <Image
          source={{ uri: 'https://media.istockphoto.com/id/1306977523/vi/anh/giỏ-hàng-bị-cô-lập-trên-nền-trắng.jpg?s=1024x1024&w=is&k=20&c=zIab22_ExyGuEiSrti1QsVR3ZygxEQcHYVVXmx2ClcM=' }}
          style={styles.icon}
          resizeMode="contain"
        />
        <Text style={styles.text}>Giỏ hàng của bạn chưa có sản phẩm nào</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation?.navigate?.('Home')}
        >
          <Text style={styles.buttonText}>TIẾP TỤC MUA SẮM</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity >= 1) {
      dispatch(updateCartItemQuantity({ id, quantity: newQuantity }));
    }
  };

  const handleApplyDiscount = () => {
    if (discountCode.trim() === 'SAVE10') {
      dispatch(applyDiscount({ code: 'SAVE10', amount: 0.1 })); // 10% discount
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

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image
        source={{ uri: item.image || item.img || 'https://via.placeholder.com/100x100.png?text=No+Image' }}
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
        onPress={() => dispatch(removeFromCart(item.id))}
      >
        <Text style={styles.removeButtonText}>Xóa</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={(item, index) => `${item.id || index}`}
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
        onPress={() => navigation?.navigate?.('Checkout')}
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