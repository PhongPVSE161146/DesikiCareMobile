import React from 'react';
import { View, Text, Image, Button } from 'react-native';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/cartSlice';
import { styles } from '../../assets/styles';

const ProductDetailScreen = ({ route, navigation }) => {
  const { product } = route.params;
  const dispatch = useDispatch();

  return (
    <View style={styles.container}>
      <Image source={{ uri: product.image }} style={styles.detailImage} />
      <Text style={styles.productName}>{product.name}</Text>
      <Text style={styles.productPrice}>{product.price.toLocaleString()} VND</Text>
      <Button
        title="Thêm vào giỏ hàng"
        onPress={() => {
          dispatch(addToCart(product));
          alert('Đã thêm vào giỏ hàng!');
        }}
      />
      <Button title="Quay lại" onPress={() => navigation.goBack()} />
    </View>
  );
};

export default ProductDetailScreen;