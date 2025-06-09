import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { styles } from '../assets/styles';

const ProductCard = ({ product, onPress }) => {
  return (
    <TouchableOpacity style={styles.productCard} onPress={onPress}>
      <Image source={{ uri: product.image }} style={styles.productImage} />
      <Text style={styles.productName}>{product.name}</Text>
      <Text style={styles.productPrice}>{product.price.toLocaleString()} VND</Text>
    </TouchableOpacity>
  );
};

export default ProductCard;