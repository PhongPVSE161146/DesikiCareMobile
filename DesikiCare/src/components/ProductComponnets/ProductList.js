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
import ProductService from '../../config/axios/Product/productService';

const screenWidth = Dimensions.get('window').width;

// ProductCard Component
const ProductCard = ({ product, onPress }) => {
  const { _id, name, description, volume, salePrice, imageUrl, isDeactivated, stock } = product;

  console.log('Rendering ProductCard:', { _id, name, salePrice, imageUrl, stock, isDeactivated });

  const isOutOfStock = stock === 0 || isDeactivated;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.card, isOutOfStock ? styles.deactivatedCard : null]}
      disabled={isOutOfStock}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: imageUrl && imageUrl !== 'string' ? imageUrl : 'https://via.placeholder.com/150',
          }}
          style={styles.image}
          resizeMode="contain"
          onError={(error) => console.log(`Error loading image for ${name}:`, error.nativeEvent)}
        />
        {isOutOfStock && (
          <View style={styles.deactivatedBadge}>
            <Text style={styles.deactivatedBadgeText}>
              {isDeactivated ? 'Ngừng kinh doanh' : 'Hết hàng'}
            </Text>
          </View>
        )}
      </View>
      <Text style={[styles.brand, isOutOfStock ? styles.deactivatedText : null]}>
        {name || 'Không có tên'}
      </Text>
      <Text
        numberOfLines={2}
        style={[styles.title, isOutOfStock ? styles.deactivatedText : null]}
      >
        {description || 'Không có mô tả'}
      </Text>
      <Text style={[styles.price, isOutOfStock ? styles.deactivatedText : null]}>
        {(salePrice > 0 ? salePrice.toLocaleString('vi-VN') : 'Liên hệ')} đ
      </Text>
      {volume > 0 && (
        <Text style={styles.volume}>Dung tích: {volume} ml</Text>
      )}
      {typeof stock === 'number' && (
        <Text style={[styles.stock, isOutOfStock ? styles.deactivatedText : styles.activeText]}>
          Tồn kho: {stock.toLocaleString('vi-VN')} sản phẩm
        </Text>
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
      console.log('Fetch Products Result:', JSON.stringify(result, null, 2));

      if (result.success) {
        const newProducts = result.data || [];
        console.log('New Products:', newProducts.map(p => ({
          _id: p._id,
          name: p.name,
          stock: p.stock,
          isDeactivated: p.isDeactivated,
        })));
        if (newProducts.length === 0) {
          setHasMore(false);
          console.log('No more products to load');
        } else {
          const validProducts = newProducts
            .filter((product) => product && product._id && product.name && typeof product.stock === 'number')
            .filter(
              (product, index, self) =>
                self.findIndex((p) => p._id === product._id) === index &&
                !products.some((existing) => existing._id === product._id)
            );
          console.log('Valid Products:', validProducts.map(p => ({
            _id: p._id,
            name: p.name,
            stock: p.stock,
            isDeactivated: p.isDeactivated,
          })));
          if (validProducts.length > 0) {
            setProducts((prev) => {
              const updatedProducts = pageNum === 1 ? validProducts : [...prev, ...validProducts];
              // Log specifically for "Mặt nạ giấy"
              const maskProduct = updatedProducts.find(p => p._id === '6890de3a2b4ddc8d91daa397');
              if (maskProduct) {
                console.log('Mặt nạ giấy in Updated Products:', {
                  _id: maskProduct._id,
                  name: maskProduct.name,
                  stock: maskProduct.stock,
                  isDeactivated: maskProduct.isDeactivated,
                });
              }
              console.log('Updated Products State:', updatedProducts.map(p => ({
                _id: p._id,
                name: p.name,
                stock: p.stock,
                isDeactivated: p.isDeactivated,
              })));
              return updatedProducts;
            });
            setPage(pageNum);
          } else {
            setHasMore(false);
            console.log('No new valid products, stopping pagination');
          }
        }
      } else {
        setHasMore(false);
        Alert.alert(
          'Lỗi',
          result.message || 'Không thể lấy danh sách sản phẩm. Vui lòng kiểm tra kết nối hoặc thử lại sau.'
        );
      }
    } catch (error) {
      console.error('Fetch products error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setHasMore(false);
      Alert.alert(
        'Lỗi',
        'Có lỗi xảy ra khi lấy danh sách sản phẩm. Vui lòng kiểm tra kết nối hoặc server API.'
      );
    } finally {
      setIsLoading(false);
      console.log('Loading state set to false');
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

  const renderProduct = useCallback(({ item }) => (
    <ProductCard
      product={item}
      onPress={() => nav.navigate('ProductDetail', { productId: item._id })}
    />
  ), [nav]);

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#E53935" />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Tất cả sản phẩm</Text>
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
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không có sản phẩm nào.</Text>
          </View>
        )}
        onEndReached={loadMoreProducts}
        onEndReachedThreshold={0.2}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 15,
    color: '#333',
  },
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
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 130,
    marginBottom: 10,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
  },
  deactivatedBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: '#E53935',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  deactivatedBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  brand: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
    color: '#333',
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
  stock: {
    fontSize: 11,
    marginTop: 4,
  },
  activeText: {
    color: '#4CAF50', // Green for available products
  },
  deactivatedText: {
    color: '#999',
  },
  loader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});