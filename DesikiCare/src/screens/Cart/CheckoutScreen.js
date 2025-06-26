import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { useDispatch } from 'react-redux';
import { clearCart } from '../../redux/cartSlice';
import { styles } from '../../assets/styles';

const CheckoutScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const dispatch = useDispatch();

  const handleCheckout = () => {
    if (name && address) {
      alert('Đặt hàng thành công!');
      dispatch(clearCart());
      navigation.navigate('Payment');
    } else {
      alert('Vui lòng điền đầy đủ thông tin.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Thanh toán</Text>
      <TextInput
        style={styles.input}
        placeholder="Họ và tên"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Địa chỉ"
        value={address}
        onChangeText={setAddress}
      />
      <Button title="Đặt hàng" onPress={handleCheckout} />
    </View>
  );
};

export default CheckoutScreen;