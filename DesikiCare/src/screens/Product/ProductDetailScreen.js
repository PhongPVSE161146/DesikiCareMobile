import React, { useState, useEffect, useCallback } from 'react';
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
import profileService from '../../config/axios/Home/AccountProfile/profileService';
import Notification from '../../components/NotiComponnets/Notification';
import { CANCEL_URL, RETURN_URL } from '@env';

const screenWidth = Dimensions.get('window').width;

const ProductDetailScreen = ({ route, navigation }) => {
  const { productId } = route.params || {};
  const dispatch = useDispatch();

  const [productData, setProductData] = useState(null);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');
  const [isLoading, setIsLoading] = useState(true);

  const fetchProduct = useCallback(async () => {
    if (!productId) {
      console.error('No productId provided');
      Alert.alert('Lỗi', 'Không tìm thấy ID sản phẩm.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const result = await ProductService.getProductById(productId);
      console.log('Product Data:', JSON.stringify(result.data, null, 2));
      if (result.success) {
        setProductData(result.data);
      } else {
        console.warn('Failed to fetch product:', result.message);
        Alert.alert('Lỗi', result.message || 'Không thể lấy thông tin sản phẩm.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi lấy thông tin sản phẩm.');
    } finally {
      setIsLoading(false);
      console.log('Loading state set to false');
    }
  }, [productId, navigation]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const getDefaultAddressId = async () => {
    try {
      const addressResponse = await profileService.getDeliveryAddresses();
      if (addressResponse.success && addressResponse.data.length > 0) {
        const defaultAddress = addressResponse.data.find((addr) => addr.isDefault) || addressResponse.data[0];
        return defaultAddress._id;
      }
      console.warn('No delivery addresses found');
      return null;
    } catch (error) {
      console.error('Error fetching default address:', error);
      return null;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#E53935" />
      </View>
    );
  }

  if (!productData || !productData.product) {
    return (
      <View style={styles.container}>
        <Text>Không tìm thấy sản phẩm</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Quay lại danh sách sản phẩm"
        >
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { product, category, productSkinTypes, productSkinStatuses, shipmentProducts, isAvailable, availabilityStatus } = productData;
  const { name, description, salePrice, imageUrl, isDeactivated, volume, gameTicketReward, stock } = product;

  // Recalculate stock as a fallback
  const totalStock = shipmentProducts
    ?.filter(sp => !sp.shipmentProduct.isDeactivated && !sp.shipment.isDeleted)
    ?.reduce((sum, sp) => {
      const stock = sp.shipmentProduct.importQuantity - sp.shipmentProduct.saleQuantity;
      return sum + (typeof stock === 'number' && stock >= 0 ? stock : 0);
    }, 0) || 0;
  const finalStock = typeof totalStock === 'number' && totalStock >= 0 ? totalStock : (typeof stock === 'number' ? stock : 0);

  // Determine availability and status
  const isExpired = shipmentProducts?.some(sp => sp.shipmentProduct.expiryDate && new Date(sp.shipmentProduct.expiryDate) < new Date());
  const isProductAvailable = !isDeactivated && finalStock > 0 && !isExpired;
  const statusLabel = isDeactivated
    ? 'Sản phẩm đã ngừng kinh doanh'
    : finalStock === 0
    ? 'Hết hàng'
    : isExpired
    ? 'Sản phẩm đã hết hạn'
    : 'Đang được bán';

  console.log('Product Status:', {
    productId,
    name,
    stock: finalStock,
    isDeactivated,
    isAvailable,
    availabilityStatus,
    statusLabel,
    isProductAvailable,
    shipmentCount: shipmentProducts?.length || 0,
    shipments: shipmentProducts?.map(sp => ({
      shipmentId: sp.shipment._id,
      importQuantity: sp.shipmentProduct.importQuantity,
      saleQuantity: sp.shipmentProduct.saleQuantity,
      stock: sp.shipmentProduct.importQuantity - sp.shipmentProduct.saleQuantity,
      isDeactivated: sp.shipmentProduct.isDeactivated,
      isDeleted: sp.shipment.isDeleted,
      expiryDate: sp.shipmentProduct.expiryDate,
    })),
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleAddToCart = async () => {
    if (!isProductAvailable) {
      setNotificationMessage('');
      Alert.alert('Lỗi', statusLabel);
      return;
    }

    try {
      console.log('addCartItem Input:', { productId: product._id, quantity: 1 });
      const result = await orderService.addCartItem(product._id, 1);
      console.log('addCartItem Response:', JSON.stringify(result, null, 2));

      if (result && (result.success || result.message === 'Cart items added successfully')) {
        const productWithId = {
          id: product._id,
          title: name,
          price: salePrice,
          quantity: 1,
          image: imageUrl,
          gameTicketReward,
          stock: finalStock,
        };

        dispatch(addToCart(productWithId));
        setNotificationMessage(`Đã thêm vào giỏ hàng! Nhận ${gameTicketReward || 0} vé thưởng.`);
        setNotificationType('success');

        navigation.navigate('Main', {
          screen: 'Cart',
          params: {
            screen: 'CartMain',
            params: {
              notificationMessage: `Đã thêm vào giỏ hàng! Nhận ${gameTicketReward || 0} vé thưởng.`,
              notificationType: 'success',
            },
          },
        });
      } else {
        setNotificationMessage('');
        if (result?.message === 'No token found. Please log in.') {
          Alert.alert('Lỗi', 'Vui lòng đăng nhập để thêm sản phẩm.', [
            { text: 'OK', onPress: () => navigation.navigate('Login') },
          ]);
        } else {
          Alert.alert('Lỗi', result?.message || 'Không thể thêm sản phẩm vào giỏ hàng.');
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setNotificationMessage('');
      Alert.alert('Lỗi', `Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng: ${error.message}`);
    }
  };

  const handleBuyNow = async () => {
    if (!isProductAvailable) {
      setNotificationMessage('');
      Alert.alert('Lỗi', statusLabel);
      return;
    }

    if (!product._id || !salePrice || salePrice <= 0) {
      setNotificationMessage('');
      Alert.alert('Lỗi', 'Thông tin sản phẩm không hợp lệ (ID hoặc giá bán).');
      return;
    }

    try {
      console.log('addCartItem Input:', { productId: product._id, quantity: 1 });
      const addToCartResult = await orderService.addCartItem(product._id, 1);
      console.log('addCartItem Response:', JSON.stringify(addToCartResult, null, 2));

      if (!addToCartResult.success) {
        setNotificationMessage('');
        if (addToCartResult.message === 'No token found. Please log in.') {
          Alert.alert('Lỗi', 'Vui lòng đăng nhập để mua sản phẩm.', [
            { text: 'OK', onPress: () => navigation.navigate('Login') },
          ]);
        } else {
          Alert.alert('Lỗi', addToCartResult.message || 'Không thể thêm sản phẩm vào giỏ hàng.');
        }
        return;
      }

      const deliveryAddressId = await getDefaultAddressId();
      if (!deliveryAddressId) {
        setNotificationMessage('');
        Alert.alert('Lỗi', 'Vui lòng thiết lập địa chỉ giao hàng trước khi mua.', [
          { text: 'OK', onPress: () => navigation.navigate('DeliveryAddress') },
        ]);
        return;
      }

      console.log('getPaymentLink Input:', {
        orderData: { pointUsed: 0, deliveryAddressId },
        paymentData: { cancelUrl: CANCEL_URL, returnUrl: RETURN_URL },
      });
      const paymentResult = await orderService.getPaymentLink(
        {
          pointUsed: 0,
          deliveryAddressId: deliveryAddressId,
        },
        {
          cancelUrl: CANCEL_URL || 'https://your-app.com/cancel',
          returnUrl: RETURN_URL || 'https://your-app.com/success',
        }
      );
      console.log('getPaymentLink Response:', JSON.stringify(paymentResult, null, 2));

      if (paymentResult.success) {
        const orderData = {
          cartItems: [
            {
              productId: product._id,
              title: name,
              quantity: 1,
              price: salePrice,
              gameTicketReward,
              stock: finalStock,
            },
          ],
          subtotal: salePrice,
          discount: 0,
          total: salePrice,
          pointUsed: 0,
          note: '',
        };

        const paymentData = {
          orderCode: paymentResult.data.orderCode || `ORDER${Date.now()}`,
          orderId: paymentResult.data.orderId || paymentResult.data.orderCode,
          amount: orderData.total,
          currency: 'VND',
          paymentMethod: 'bank',
          description: 'Chuyển khoản ngân hàng',
          transactionDateTime: new Date().toISOString(),
          qrCode: paymentResult.data.qrCode,
          paymentUrl: paymentResult.data.paymentUrl,
        };

        console.log('Navigating to QRPaymentScreen with:', { paymentData, orderData });

        navigation.navigate('QRPaymentScreen', {
          paymentData,
          orderData,
        });

        setNotificationMessage(`Đang chuyển tới trang thanh toán... Nhận ${gameTicketReward || 0} vé thưởng.`);
        setNotificationType('success');
      } else {
        setNotificationMessage('');
        Alert.alert('Lỗi', paymentResult.message || 'Không thể tạo link thanh toán.');
      }
    } catch (error) {
      console.error('Buy now error:', error);
      setNotificationMessage('');
      let errorMessage = 'Có lỗi xảy ra khi xử lý mua ngay.';
      if (error.response?.status === 500) {
        errorMessage = 'Lỗi server nội bộ. Vui lòng thử lại sau hoặc kiểm tra dữ liệu sản phẩm.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      Alert.alert('Lỗi', errorMessage);
    }
  };

  const imageSource =
    imageUrl && imageUrl !== 'string'
      ? { uri: imageUrl }
      : { uri: 'https://via.placeholder.com/150x200.png?text=No+Image' };

  return (
    <View style={styles.container}>
      <Notification
        message={notificationMessage}
        type={notificationType}
        autoDismiss={3000}
        onDismiss={() => {
          setNotificationMessage('');
          setNotificationType('success');
        }}
      />

      <ScrollView>
        <View style={styles.imageContainer}>
          <Image
            source={imageSource}
            style={styles.detailImage}
            resizeMode="contain"
            accessibilityLabel={`Hình ảnh sản phẩm ${name}`}
          />
        </View>

        <View style={styles.detailsContainer}>
          <Text style={[styles.brand, !isProductAvailable ? styles.deactivatedText : null]}>
            {name || 'Tên sản phẩm không có'}
          </Text>

          <Text style={styles.category}>Danh mục: {category?.name || 'Không có danh mục'}</Text>

          <Text style={[styles.price, !isProductAvailable ? styles.deactivatedText : null]}>
            {(salePrice || 0).toLocaleString('vi-VN')} đ
          </Text>

          <Text style={styles.freeShippingNotice}>🚚 Miễn phí giao hàng</Text>

          <Text style={isProductAvailable ? styles.activeLabel : styles.deactivatedLabel}>
            {statusLabel}
          </Text>

          {isProductAvailable && (
            <Text style={styles.rewardTickets}>
              🎟️ Nhận {gameTicketReward || 0} vé thưởng khi mua sản phẩm
            </Text>
          )}

          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
            <Text style={styles.description}>{description || 'Không có mô tả'}</Text>
          </View>

          <View style={styles.specificationContainer}>
            <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>
            <Text style={styles.specification}>• Thương hiệu: {name || 'N/A'}</Text>
            <Text style={styles.specification}>• Dung tích: {volume ? `${volume}ml` : 'N/A'}</Text>
            <Text style={styles.specification}>• Loại da: {productSkinTypes?.map((type) => type.name).join(', ') || 'Không có loại da'}</Text>
            <Text style={styles.specification}>• Trạng thái da: {productSkinStatuses?.map((status) => status.name).join(', ') || 'Không có trạng thái da'}</Text>
            <Text style={styles.specification}>• Giao hàng: Miễn phí toàn quốc</Text>
            <Text style={styles.specification}>• Trạng thái: {statusLabel}</Text>
            <Text style={[styles.specification, !isProductAvailable ? styles.deactivatedText : null]}>
              • Tồn kho: {finalStock.toLocaleString('vi-VN')} sản phẩm
            </Text>
            {isProductAvailable && (
              <Text style={styles.specification}>• Vé thưởng: {gameTicketReward || 0} vé</Text>
            )}
            {shipmentProducts?.length > 0 && (
              <>
                <Text style={styles.specification}>
                  • Ngày sản xuất: {formatDate(shipmentProducts[0].shipmentProduct.manufacturingDate)}
                </Text>
                <Text style={styles.specification}>
                  • Hạn sử dụng: {formatDate(shipmentProducts[0].shipmentProduct.expiryDate)}
                </Text>
              </>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.addToCartButton, !isProductAvailable ? styles.disabledButton : null]}
              onPress={handleAddToCart}
              disabled={!isProductAvailable}
              accessibilityLabel="Thêm sản phẩm vào giỏ hàng"
            >
              <Text style={styles.buttonText}>Thêm vào giỏ hàng</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.buyNowButton, !isProductAvailable ? styles.disabledButton : null]}
              onPress={handleBuyNow}
              disabled={!isProductAvailable}
              accessibilityLabel="Mua ngay sản phẩm"
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
    marginBottom: 5,
  },
  freeShippingNotice: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
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
  activeLabel: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  rewardTickets: {
    fontSize: 14,
    color: '#FFA500',
    fontWeight: '500',
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