import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

// Sample product data
const products = [
  {
    id: '1',
    name: 'Klairs',
    title: 'Nước Hoa Hồng Klairs Không Mùi Cho Da Nhạy...',
    price: 259000,
    oldPrice: 435000,
    discount: 40,
    rating: 4.8,
    reviews: 133,
    sales: '1.7k/tháng',
    image: 'https://bizweb.dktcdn.net/100/141/194/products/00502179-loreal-micellar-water-refreshing-400ml-nuoc-tay-trang-danh-cho-da-hon-hop-va-da-dau-2651-63db-large-f1207fa49a.jpg?v=1699015415277',
  },
  {
    id: '2',
    name: "L'Oreal",
    title: "Nước Tẩy Trang L'Oreal Tươi Mát Cho Da Dầu...",
    price: 152000,
    oldPrice: 239000,
    discount: 36,
    rating: 4.8,
    reviews: 290,
    sales: '2.1k/tháng',
    image: 'https://via.placeholder.com/150x200.png?text=Loreal',
  },
  {
    id: '3',
    name: 'Skin1004',
    title: 'Kem Chống Nắng Skin1004 Cho Da Nhạy C...',
    price: 236000,
    oldPrice: 465000,
    discount: 49,
    rating: 4.8,
    reviews: 104,
    sales: '1.4k/tháng',
    image: 'https://via.placeholder.com/150x200.png?text=Skin1004',
  },
  {
    id: '4',
    name: 'La Roche-Posay',
    title: 'Kem Chống Nắng La Roche-Posay Phổ Rộng...',
    price: 359000,
    oldPrice: 560000,
    discount: 36,
    rating: 5.0,
    reviews: 100,
    sales: '148/tháng',
    image: 'https://via.placeholder.com/150x200.png?text=LaRoche',
  },
];

const ProductCard = ({ product, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.card}>
      <Image
        source={{ uri: product.image }}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.brand}>{product.name}</Text>
      <Text numberOfLines={2} style={styles.title}>
        {product.title}
      </Text>
      <Text style={styles.price}>
        {product.price.toLocaleString()} đ
      </Text>
      <Text style={styles.oldPrice}>
        {product.oldPrice.toLocaleString()} đ
      </Text>
      <Text style={styles.rating}>
        ⭐ {product.rating} ({product.reviews}) • {product.sales}
      </Text>
    </TouchableOpacity>
  );
};

export default function ProductList() {
  const navigation = useNavigation();
  const firstFourProducts = products.slice(0, 4);

  const renderProduct = ({ item }) => (
    <ProductCard
      product={item}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
    />
  );

  return (
    <FlatList
      data={firstFourProducts}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={{
        justifyContent: 'space-between',
        paddingHorizontal: 10,
      }}
      contentContainerStyle={{ paddingVertical: 13 }}
      renderItem={renderProduct}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    width: (screenWidth - 30) / 2,
    borderRadius: 10,
    padding: 13,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 130,
    marginBottom: 10,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
  },
  brand: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
  },
  title: {
    fontSize: 12,
    color: '#555',
    height: 32,
    marginBottom: 4,
  },
  price: {
    fontWeight: 'bold',
    color: '#E53935',
    fontSize: 14,
  },
  oldPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
    color: '#888',
    marginBottom: 4,
  },
  rating: {
    fontSize: 11,
    color: '#666',
  },
});