import React from 'react';
import { View, Text, Button } from 'react-native';
import { styles } from '../assets/styles';

const CartItem = ({ item, onRemove }) => {
  return (
    <View style={styles.cartItem}>
      <Text>{item.name} (x{item.quantity})</Text>
      <Text>{(item.price * item.quantity).toLocaleString()} VND</Text>
      <Button title="Remove" onPress={() => onRemove(item.id)} />
    </View>
  );
};

export default CartItem;