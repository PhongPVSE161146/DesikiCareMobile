import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const OrderCard = ({ orderItem }) => {
  const product = orderItem.product;
  return (
    <View style={styles.card}>
      <Image source={{ uri: product.imageUrl }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.details}>Số lượng: {orderItem.orderItem.quantity}</Text>
        <Text style={styles.price}>{product.salePrice.toLocaleString()}₫</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 6,
    marginBottom: 6,
    backgroundColor: '#fdfdfd',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  info: {
    flex: 1,
    justifyContent: 'space-around',
  },
  name: {
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
  },
  details: {
    color: '#555',
    fontSize: 14,
  },
  price: {
    color: '#007bff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default OrderCard;
