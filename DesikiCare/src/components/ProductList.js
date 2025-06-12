import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

// Sample product data
const initialProducts = [
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
    name: 'L\'Oreal',
    title: 'Nước Tẩy Trang L\'Oreal Tươi Mát Cho Da Dầu...',
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
  // Additional products to simulate more data
  {
    id: '5',
    name: 'Cetaphil',
    title: 'Sữa Rửa Mặt Cetaphil Cho Da Dầu...',
    price: 180000,
    oldPrice: 300000,
    discount: 40,
    rating: 4.7,
    reviews: 200,
    sales: '1.2k/tháng',
    image: 'https://via.placeholder.com/150x200.png?text=Cetaphil',
  },
  {
    id: '6',
    name: 'Neutrogena',
    title: 'Kem Dưỡng Ẩm Neutrogena Cho Da Khô...',
    price: 250000,
    oldPrice: 400000,
    discount: 37,
    rating: 4.9,
    reviews: 150,
    sales: '1.5k/tháng',
    image: 'https://via.placeholder.com/150x200.png?text=Neutrogena',
  },
  {
    id: '7',
    name: 'Avene',
    title: 'Nước Thermal Avene Cho Da Nhạy Cảm...',
    price: 300000,
    oldPrice: 500000,
    discount: 40,
    rating: 4.6,
    reviews: 120,
    sales: '1.0k/tháng',
    image: 'https://via.placeholder.com/150x200.png?text=Avene',
  },
  {
    id: '8',
    name: 'Bioderma',
    title: 'Sữa Rửa Mặt Bioderma Sebium...',
    price: 220000,
    oldPrice: 350000,
    discount: 37,
    rating: 4.8,
    reviews: 180,
    sales: '1.3k/tháng',
    image: 'https://via.placeholder.com/150x200.png?text=Bioderma',
  },
  {
    id: '9',
    name: 'The Ordinary',
    title: 'Serum Niacinamide The Ordinary...',
    price: 190000,
    oldPrice: 320000,
    discount: 41,
    rating: 4.7,
    reviews: 160,
    sales: '1.1k/tháng',
    image: 'https://via.placeholder.com/150x200.png?text=TheOrdinary',
  },
  {
    id: '10',
    name: 'CeraVe',
    title: 'Kem Dưỡng CeraVe PM...',
    price: 270000,
    oldPrice: 450000,
    discount: 40,
    rating: 4.9,
    reviews: 140,
    sales: '1.4k/tháng',
    image: 'https://via.placeholder.com/150x200.png?text=CeraVe',
  },
  {
    id: '11',
    name: 'Hada Labo',
    title: 'Nước Hoa Hồng Hada Labo Gokujyun...',
    price: 150000,
    oldPrice: 250000,
    discount: 40,
    rating: 4.6,
    reviews: 130,
    sales: '1.0k/tháng',
    image: 'https://via.placeholder.com/150x200.png?text=HadaLabo',
  },
  {
    id: '12',
    name: 'Innisfree',
    title: 'Kem Chống Nắng Innisfree Daily UV...',
    price: 200000,
    oldPrice: 330000,
    discount: 39,
    rating: 4.7,
    reviews: 170,
    sales: '1.2k/tháng',
    image: 'https://via.placeholder.com/150x200.png?text=Innisfree',
  },
];

// Component
const ProductCard = ({ product, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.card}>
      <View style={styles.discountBadge}>
        <Text style={styles.discountText}>{product.discount}%</Text>
      </View>
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
  const [displayedProducts, setDisplayedProducts] = useState(initialProducts.slice(0, 8));
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);

  const loadMoreProducts = () => {
    if (isLoading) return;

    setIsLoading(true);
    const nextPage = page + 1;
    const nextProducts = initialProducts.slice(page * 8, nextPage * 8);

    setTimeout(() => {
      setDisplayedProducts((prev) => [...prev, ...nextProducts]);
      setPage(nextPage);
      setIsLoading(false);
    }, 1000); // Simulate network delay
  };

  const renderProduct = ({ item }) => (
    <ProductCard
      product={item}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
    />
  );

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#E53935" />
      </View>
    );
  };

  return (
    <FlatList
      data={displayedProducts}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={{
        justifyContent: 'space-between',
        paddingHorizontal: 10,
      }}
      contentContainerStyle={{ paddingVertical: 10, paddingHorizontal: 5 }}
      renderItem={renderProduct}
      ListFooterComponent={renderFooter}
      onEndReached={loadMoreProducts}
      onEndReachedThreshold={0.5}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    width: (screenWidth - 40) / 2,
    borderRadius: 10,
    padding: 10,
    margin: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#E53935',
    borderRadius: 5,
    paddingVertical: 2,
    paddingHorizontal: 6,
    zIndex: 1,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  image: {
    width: '100',
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
  loader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});