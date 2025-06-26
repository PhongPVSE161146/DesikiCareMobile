
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/cartSlice';
import ProductService from '../../config/axios/Product/productService';
import orderService from '../../config/axios/Order/orderService';
import Notification from '../../components/Notification';

const screenWidth = Dimensions.get('window').width;

const ProductDetailScreen = ({ route, navigation }) => {
  const { productId } = route.params || {};
  const dispatch = useDispatch();
  const [productData, setProductData] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const result = await ProductService.getProductById(productId);
        if (result.success) {
          setProductData(result.data);
        } else {
          Alert.alert('Lỗi', result.message || 'Không thể lấy thông tin sản phẩm.', [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
        }
      } catch (error) {
        Alert.alert('Lỗi', 'Có lỗi xảy ra khi lấy thông tin sản phẩm.');
        console.error('Fetch product error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    } else {
      Alert.alert('Lỗi', 'Không tìm thấy ID sản phẩm.');
      setIsLoading(false);
    }
  }, [productId, navigation]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#E53935" />
      </View>
    );
  }

  if (!productData) {
    return (
      <View style={styles.container}>
        <Text>Không tìm thấy sản phẩm</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { product, category, productSkinTypes, productSkinStatuses, shipmentProducts } = productData;
  const { name, description, salePrice, imageUrl, isDeactivated, volume } = product;
  const categoryName = category?.name || 'No Category';
  const skinTypes = productSkinTypes?.map(type => type.name).join(', ') || 'No Skin Types';
  const skinStatuses = productSkinStatuses?.map(status => status.name).join(', ') || 'No Skin Statuses';
  const latestShipment = shipmentProducts?.length > 0 ? shipmentProducts[0].shipmentProduct : null;

  const handleAddToCart = async () => {
    if (isDeactivated) {
      Alert.alert('Lỗi', 'Sản phẩm hiện không có sẵn.');
      return;
    }
    try {
      const result = await orderService.addCartItem(product._id, quantity);
      if (result.success) {
        const productWithId = {
          id: product._id,
          title: name,
          price: salePrice,
          quantity,
          image: imageUrl,
        };
        dispatch(addToCart(productWithId));
        setNotificationMessage('Đã thêm vào giỏ hàng!');
        setNotificationType('success');
      } else {
        if (result.message === 'No token found. Please log in.') {
          Alert.alert('Lỗi', 'Vui lòng đăng nhập để thêm sản phẩm.', [
            { text: 'OK', onPress: () => navigation.navigate('Login') },
          ]);
        } else {
          Alert.alert('Lỗi', result.message || 'Không thể thêm sản phẩm vào giỏ hàng.');
        }
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.');
      console.error('Add to cart error:', error);
    }
  };

  const handleBuyNow = async () => {
    if (isDeactivated) {
      Alert.alert('Lỗi', 'Sản phẩm hiện không có sẵn.');
      return;
    }
    try {
      const result = await orderService.addCartItem(product._id, quantity);
      if (result.success) {
        const productWithId = {
          id: product._id,
          title: name,
          price: salePrice,
          quantity,
          image: imageUrl,
        };
        dispatch(addToCart(productWithId));
        setNotificationMessage('Đã thêm vào giỏ hàng! Chuyển tới giỏ hàng...');
        setNotificationType('success');
        setTimeout(() => {
          navigation.navigate('Cart');
        }, 1000);
      } else {
        if (Спрятатьresult.message === 'No token found. Please log in.') {
          Alert.alert('Lỗi', 'Vui lòng đăng nhập để thêm sản phẩm.', [
            { text: 'OK', onPress: () => navigation.navigate('Login') },
          ]);
        } else {
          Alert.alert('Lỗi', result.message || 'Không thể thêm sản phẩm vào giỏ hàng.');
        }
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.');
      console.error('Buy now error:', error);
    }
  };

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  const imageSource = imageUrl || 'https://via.placeholder.com/150x200.png?text=No+Image';

  return (
    <View style={styles.container}>
      <Notification
        message={notificationMessage}
        type={notificationType}
        autoDismiss={3000}
       onDismiss={() => setNotificationMessage('')}

      />
      <ScrollView>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageSource }}
            style={styles.detailImage}
            resizeMode="contain"
          />
        </View>
        <View style={styles.detailsContainer}>
          <Text style={[styles.brand, isDeactivated ? styles.deactivatedText : null]}>
            {name}
          </Text>
          <Text style={styles.category}>Danh mục: {categoryName}</Text>
          <Text style={[styles.price, isDeactivated ? styles.deactivatedText : null]}>
            {(salePrice || 0).toLocaleString()} đ
          </Text>
          {isDeactivated && (
            <Text style={styles.deactivatedLabel}>Hết hàng</Text>
          )}
          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
            <Text style={styles.description}>
              {description || 'Không có mô tả'}
            </Text>
          </View>
          <View style={styles.specificationContainer}>
            <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>
            <Text style={styles.specification}>• Thương hiệu: {name}</Text>
            <Text style={styles.specification}>• Dung tích: {volume || 'N/A'}ml</Text>
            <Text style={styles.specification}>• Loại da: {skinTypes}</Text>
            <Text style={styles.specification}>• Trạng thái da: {skinStatuses}</Text>
            {latestShipment && (
              <>
                <Text style={styles.specification}>
                  • Ngày sản xuất: {latestShipment.manufacturingDate || 'N/A'}
                </Text>
                <Text style={styles.specification}>
                  • Hạn sử dụng: {latestShipment.expiryDate || 'N/A'}
                </Text>
              </>
            )}
          </View>
          <View style={styles.buttonContainer}>
            <View style={styles.quantityContainer}>
              <TouchableOpacity 
                style={styles.quantityButton} 
                onPress={decreaseQuantity}
                disabled={isDeactivated}
              >
                <Text style={styles.quantityButtonText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity 
                style={styles.quantityButton} 
                onPress={increaseQuantity}
                disabled={isDeactivated}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={[styles.addToCartButton, isDeactivated ? styles.disabledButton : null]} 
              onPress={handleAddToCart}
              disabled={isDeactivated}
            >
              <Text style={styles.buttonText}>Thêm vào giỏ hàng</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.buyNowButton, isDeactivated ? styles.disabledButton : null]} 
              onPress={handleBuyNow}
              disabled={isDeactivated}
            >
              <Text style={styles.buttonText}>Mua ngay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  imageContainer: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailImage: {
    width: screenWidth - 40,
    height: 300,
    borderRadius: 10,
  },
  detailsContainer: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
    marginBottom: 20,
  },
  brand: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  category: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E53935',
    marginBottom: 10,
  },
  deactivatedText: {
    color: '#999',
  },
  deactivatedLabel: {
    fontSize: 16,
    color: '#E53935',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  specificationContainer: {
    marginBottom: 20,
  },
  specification: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
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
  addToCartButton: {
    backgroundColor: '#FFA500',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  buyNowButton: {
    backgroundColor: '#E53935',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    paddingVertical: 15,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  backButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
});

export default ProductDetailScreen;
