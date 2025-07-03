import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ProductService from '../config/axios/Product/productService';

const screenWidth = Dimensions.get('window').width;

// ProductCard Component
const ProductCard = ({ product, onPress }) => {
  const { _id, name, description, volume, salePrice, imageUrl, isDeactivated } = product;

  console.log('Rendering ProductCard:', { _id, name, salePrice, imageUrl });

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.card, isDeactivated ? styles.deactivatedCard : null]}
      disabled={isDeactivated}
    >
      <Image
        source={{
          uri: imageUrl && imageUrl !== 'string' ? imageUrl : 'https://via.placeholder.com/150',
        }}
        style={styles.image}
        resizeMode="contain"
        onError={() => console.log('Error loading image:', imageUrl)}
      />
      <Text style={[styles.brand, isDeactivated ? styles.deactivatedText : null]}>
        {name || 'Không có tên'}
      </Text>
      <Text
        numberOfLines={2}
        style={[styles.title, isDeactivated ? styles.deactivatedText : null]}
      >
        {description || 'Không có mô tả'}
      </Text>
      <Text style={[styles.price, isDeactivated ? styles.deactivatedText : null]}>
        {(salePrice > 0 ? salePrice : 'Liên hệ').toLocaleString('vi-VN')} đ
      </Text>
      {volume > 0 && (
        <Text style={styles.volume}>Dung tích: {volume} ml</Text>
      )}
      {isDeactivated && (
        <Text style={styles.deactivatedLabel}>Hết hàng</Text>
      )}
    </TouchableOpacity>
  );
};

export default function ProductList({ navigation }) {
  const navigationHook = useNavigation();
  const nav = navigation || navigationHook;
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchProducts = useCallback(async (pageNum = 1) => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      console.log(`Fetching products for page ${pageNum}`);
      const result = await ProductService.getProducts(pageNum);
      console.log('Fetch Products Result:', result);

      if (result.success) {
        const newProducts = result.data || [];
        console.log('New Products:', newProducts);
        if (newProducts.length === 0) {
          setHasMore(false);
          console.log('No more products to load');
        } else {
          const validProducts = newProducts
            .filter((product) => product && product._id && product.name)
            .filter(
              (product, index, self) =>
                self.findIndex((p) => p._id === product._id) === index &&
                !products.some((existing) => existing._id === product._id)
            );
          console.log('Valid Products:', validProducts);
          if (validProducts.length > 0) {
            setProducts((prev) =>
              pageNum === 1 ? validProducts : [...prev, ...validProducts]
            );
            setPage(pageNum);
          } else {
            setHasMore(false); // No new valid products, stop loading
            console.log('No new valid products, stopping pagination');
          }
        }
      } else {
        setHasMore(false); // Stop loading on API failure
        Alert.alert(
          'Lỗi',
          result.message || 'Không thể lấy danh sách sản phẩm. Vui lòng kiểm tra kết nối hoặc thử lại sau.'
        );
      }
    } catch (error) {
      console.error('Fetch products error:', error.message);
      setHasMore(false); // Stop loading on error
      Alert.alert(
        'Lỗi',
        'Có lỗi xảy ra khi lấy danh sách sản phẩm. Vui lòng kiểm tra kết nối hoặc server API.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, products]);

  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  const loadMoreProducts = useCallback(() => {
    if (hasMore && !isLoading) {
      console.log('Triggering loadMoreProducts for page:', page + 1);
      fetchProducts(page + 1);
    }
  }, [hasMore, isLoading, page, fetchProducts]);

  const renderProduct = ({ item }) => (
    <ProductCard
      product={item}
      onPress={() => nav.navigate('ProductDetail', { productId: item._id })}
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
      data={products}
      keyExtractor={(item) => item._id.toString()}
      numColumns={2}
      columnWrapperStyle={{
        justifyContent: 'space-between',
        paddingHorizontal: 10,
      }}
      contentContainerStyle={{ paddingVertical: 10, paddingHorizontal: 5 }}
      renderItem={renderProduct}
      ListFooterComponent={renderFooter}
      onEndReached={loadMoreProducts}
      onEndReachedThreshold={0.2} // Adjusted to prevent premature triggering
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
  deactivatedCard: {
    backgroundColor: '#f5f5f5',
    opacity: 0.6,
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
  volume: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  deactivatedText: {
    color: '#999',
  },
  deactivatedLabel: {
    fontSize: 12,
    color: '#E53935',
    fontWeight: 'bold',
    marginTop: 4,
    textAlign: 'center',
  },
  loader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});