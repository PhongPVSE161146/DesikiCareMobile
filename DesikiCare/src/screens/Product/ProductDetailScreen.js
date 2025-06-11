import React, { useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/cartSlice';

const screenWidth = Dimensions.get('window').width;

const ProductDetailScreen = ({ route, navigation }) => {
  const { product } = route.params || {};
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <View style={styles.container}>
        <Text>Product not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleAddToCart = () => {
    const productWithId = {
      ...product,
      id: product.id || `${product.name}-${product.price}`,
      quantity,
    };
    dispatch(addToCart(productWithId));
    Alert.alert(
      'Thành công',
      'Đã thêm vào giỏ hàng! Bạn có muốn xem giỏ hàng?',
      [
        { text: 'Tiếp tục mua sắm', style: 'cancel' },
        { text: 'Xem giỏ hàng', onPress: () => navigation.navigate('Cart') },
      ],
      { cancelable: true }
    );
  };

  const handleBuyNow = () => {
    const productWithId = {
      ...product,
      id: product.id || `${product.name}-${product.price}`,
      quantity,
    };
    dispatch(addToCart(productWithId));
    navigation.navigate('Cart');
  };

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  const imageSource = product.image || product.img || 'https://via.placeholder.com/150x200.png?text=No+Image';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageSource }}
          style={styles.detailImage}
          resizeMode="contain"
        />
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.brand}>{product.name}</Text>
        <Text style={styles.title}>{product.title || product.name}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{product.price.toLocaleString()} đ</Text>
          <Text style={styles.oldPrice}>{product.oldPrice.toLocaleString()} đ</Text>
          <Text style={styles.discount}>-{product.discount}%</Text>
        </View>
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>
            ⭐ {product.rating || 'N/A'} ({product.reviews || 0} đánh giá) • Đã bán {product.sales || product.sold || 0}
          </Text>
        </View>
        <View style={styles.descriptionContainer}>
          <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
          <Text style={styles.description}>
            Sản phẩm {product.name} là giải pháp hoàn hảo cho làn da nhạy cảm, với công thức dịu nhẹ, không chứa paraben, không gây kích ứng. Sản phẩm cung cấp độ ẩm, làm dịu da và bảo vệ da khỏi tác nhân môi trường. Phù hợp với mọi loại da, đặc biệt là da dầu và da mụn.
          </Text>
        </View>
        <View style={styles.specificationContainer}>
          <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>
          <Text style={styles.specification}>• Thương hiệu: {product.name}</Text>
          <Text style={styles.specification}>• Xuất xứ: Hàn Quốc</Text>
          <Text style={styles.specification}>• Dung tích: 100ml</Text>
          <Text style={styles.specification}>• Loại da: Phù hợp mọi loại da</Text>
          <Text style={styles.specification}>• Hạn sử dụng: 24 tháng kể từ ngày sản xuất</Text>
        </View>
        <View style={styles.buttonContainer}>
          <View style={styles.quantityContainer}>
            <TouchableOpacity style={styles.quantityButton} onPress={decreaseQuantity}>
              <Text style={styles.quantityButtonText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity style={styles.quantityButton} onPress={increaseQuantity}>
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
            <Text style={styles.buttonText}>Thêm vào giỏ hàng</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buyNowButton} onPress={handleBuyNow}>
            <Text style={styles.buttonText}>Mua ngay</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
  title: {
    fontSize: 16,
    color: '#555',
    marginBottom: 15,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E53935',
    marginRight: 15,
  },
  oldPrice: {
    fontSize: 16,
    color: '#888',
    textDecorationLine: 'line-through',
    marginRight: 15,
  },
  discount: {
    fontSize: 16,
    color: '#E53935',
    fontWeight: 'bold',
  },
  ratingContainer: {
    marginBottom: 20,
  },
  rating: {
    fontSize: 14,
    color: '#666',
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