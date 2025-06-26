import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Image,
} from 'react-native';
import ProductService from '../../config/axios/Product/productService';
import CustomHeader from '../../components/Header/CustomHeader';

const CategoryScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    const res = await ProductService.getCategories();
    if (res.success) {
      setCategories(res.data);
    }
  };

  const fetchProducts = async () => {
    const res = await ProductService.getProducts();
    if (res.success) {
      setProducts(res.data);
    }
  };

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.product.categoryId === selectedCategory._id)
    : [];

  useEffect(() => {
    if (selectedCategory) {
      Animated.timing(animation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [selectedCategory]);

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      key={item._id}
      style={[
        localStyles.categoryItem,
        selectedCategory?._id === item._id && localStyles.selectedCategoryItem,
      ]}
      onPress={() => setSelectedCategory(item)}
    >
      <Text style={localStyles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={localStyles.productItem}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
    >
      <Image
        source={{ uri: item.product.imageUrl }}
        style={localStyles.productImage}
        resizeMode="contain"
      />
      <Text style={localStyles.productText}>{item.product.name}</Text>
    </TouchableOpacity>
  );

  const animatedStyle = {
    opacity: animation,
    height: animation.interpolate({ inputRange: [0, 1], outputRange: [0, 'auto'] }),
  };

  return (
    <View style={localStyles.container}>
      <CustomHeader />
      <View style={localStyles.content}>
        <ScrollView style={localStyles.categoryContainer}>
          {categories.map(renderCategory)}
        </ScrollView>
        <View style={localStyles.productContainer}>
          {selectedCategory ? (
            <Animated.View style={animatedStyle}>
              {filteredProducts.length > 0 ? (
                <FlatList
                  data={filteredProducts}
                  renderItem={renderProduct}
                  keyExtractor={(item) => item.product._id}
                  numColumns={2}
                  columnWrapperStyle={localStyles.productWrapper}
                  contentContainerStyle={localStyles.productList}
                />
              ) : (
                <Text style={localStyles.noProductsText}>Không có sản phẩm</Text>
              )}
            </Animated.View>
          ) : (
            <Text style={localStyles.noSelectionText}>Chọn danh mục để xem sản phẩm</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flexDirection: 'row',
    flex: 1,
  },
  categoryContainer: {
    width: '25%',
    backgroundColor: '#f5f5f5',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  categoryItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedCategoryItem: {
    backgroundColor: '#e0e0e0',
  },
  categoryText: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
  },
  productContainer: {
    flex: 1,
    padding: 10,
  },
  productWrapper: {
    justifyContent: 'space-between',
  },
  productList: {
    paddingVertical: 5,
  },
  productItem: {
    width: '48%',
    padding: 5,
    marginBottom: 5,
    backgroundColor: '#fff',
    borderRadius: 5,
    elevation: 1,
    alignItems: 'center',
  },
  productImage: {
    width: 100,
    height: 150,
    marginBottom: 5,
  },
  productText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  noSelectionText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 14,
    marginTop: 10,
  },
  noProductsText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 14,
    marginTop: 10,
  },
});

export default CategoryScreen;
