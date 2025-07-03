import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import ProductService from '../../config/axios/Product/productService';
import CustomHeader from '../../components/Header/CustomHeader';

const screenWidth = Dimensions.get('window').width;

const CategoryScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const animatedStyle = {
    opacity: animation,
    transform: [
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0],
        }),
      },
    ],
  };

  const predefinedCategories = [
    { _id: 0, name: 'Tất cả sản phẩm' },
    { _id: 1, name: 'Sữa rửa mặt' },
    { _id: 2, name: 'Kem dưỡng' },
    { _id: 3, name: 'Toner' },
    { _id: 4, name: 'Serum' },
    { _id: 5, name: 'Kem chống nắng' },
    { _id: 6, name: 'Tẩy tế bào chết' },
    { _id: 7, name: 'Mặt nạ' },
  ];

  const fetchCategories = useCallback(async () => {
    setIsLoadingCategories(true);
    try {
      const res = await ProductService.getCategories();
      console.log('fetchCategories Result:', JSON.stringify(res, null, 2));
      if (res.success) {
        let apiCategories = [];
        if (Array.isArray(res.data)) {
          apiCategories = res.data;
        } else if (res.data && Array.isArray(res.data.categories)) {
          apiCategories = res.data.categories;
        } else if (res.data && res.data.category && res.data.category._id != null) {
          apiCategories = [res.data.category];
        } else if (res.data && res.data._id != null) {
          apiCategories = [res.data];
        } else {
          console.warn('Unexpected API response format:', res.data);
          apiCategories = [];
        }
        console.log('Parsed API Categories:', apiCategories);

        // Merge API categories with predefined categories, prioritizing API names
        const mergedCategories = predefinedCategories.map(predefined => {
          const apiCategory = apiCategories.find(apiCat => String(apiCat._id) === String(predefined._id));
          return apiCategory ? { _id: apiCategory._id, name: apiCategory.name } : predefined;
        });

        console.log('Setting Categories (Merged):', mergedCategories);
        setCategories(mergedCategories);
        if (mergedCategories.length > 0 && !selectedCategory) {
          setSelectedCategory(mergedCategories[0]);
        }
      } else {
        console.warn('fetchCategories failed:', res.message);
        Alert.alert('Lỗi', res.message || 'Không thể lấy danh sách danh mục.', [
          { text: 'OK' },
          { text: 'Thử lại', onPress: () => fetchCategories() },
        ]);
        setFallbackCategories();
      }
    } catch (error) {
      console.error('fetchCategories Error:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
      });
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi lấy danh sách danh mục.', [
        { text: 'OK' },
        { text: 'Thử lại', onPress: () => fetchCategories() },
      ]);
      setFallbackCategories();
    } finally {
      setIsLoadingCategories(false);
    }
  }, [products]);

  const setFallbackCategories = () => {
    if (products.length > 0) {
      const uniqueCategoryIds = [...new Set(products.map(p => String(p.categoryId)).filter(id => id != null))];
      const fallbackCategories = predefinedCategories.filter(cat =>
        cat._id === 0 || uniqueCategoryIds.includes(String(cat._id))
      );
      console.log('Setting Fallback Categories:', fallbackCategories);
      setCategories(fallbackCategories);
      setSelectedCategory(fallbackCategories[0]);
    } else {
      console.log('Setting Default Categories:', predefinedCategories);
      setCategories(predefinedCategories);
      setSelectedCategory(predefinedCategories[0]);
    }
  };

  const fetchProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    try {
      const res = await ProductService.getProducts();
      console.log('fetchProducts Result:', res);
      if (res.success) {
        setProducts(Array.isArray(res.data) ? res.data : []);
      } else {
        Alert.alert('Lỗi', res.message || 'Không thể lấy danh sách sản phẩm.', [
          { text: 'OK' },
          { text: 'Thử lại', onPress: () => fetchProducts() },
        ]);
      }
    } catch (error) {
      console.error('fetchProducts Error:', error.message);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi lấy danh sách sản phẩm.');
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    console.log('Initializing animation:', animation);
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    console.log('Current Categories State:', categories);
    console.log('Selected Category:', selectedCategory);
  }, [categories, selectedCategory]);

  const filteredProducts = selectedCategory && selectedCategory._id !== 0
    ? products.filter((p) => String(p.categoryId) === String(selectedCategory._id))
    : products;

  useEffect(() => {
    console.log('Animating with selectedCategory:', selectedCategory);
    console.log('Filtered Products:', filteredProducts.map(p => ({ _id: p._id, name: p.name, categoryId: p.categoryId })));
    if (selectedCategory) {
      Animated.timing(animation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedCategory, animation]);

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      key={String(item._id)}
      style={[
        localStyles.categoryItem,
        selectedCategory?._id === item._id && localStyles.selectedCategoryItem,
      ]}
      onPress={() => setSelectedCategory(item)}
      accessibilityLabel={`Chọn danh mục ${item.name}`}
      accessibilityRole="button"
    >
      <Text style={localStyles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderProduct = ({ item }) => {
    const imageSource = item.imageUrl && item.imageUrl !== 'string'
      ? { uri: item.imageUrl }
      : { uri: 'https://via.placeholder.com/150x200.png?text=No+Image' };

    return (
      <TouchableOpacity
        style={localStyles.productItem}
        onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
        accessibilityLabel={`Xem chi tiết sản phẩm ${item.name}`}
        accessibilityRole="button"
      >
        <Image
          source={imageSource}
          style={localStyles.productImage}
          resizeMode="contain"
          accessibilityLabel={`Hình ảnh sản phẩm ${item.name}`}
        />
        <Text style={localStyles.productText} numberOfLines={2}>
          {item.name || 'Không có tên'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={localStyles.emptyContainer}>
      <Text style={localStyles.noProductsText}>
        {categories.length === 0
          ? 'Không có danh mục nào'
          : selectedCategory
          ? 'Không có sản phẩm trong danh mục này'
          : 'Chọn danh mục để xem sản phẩm'}
      </Text>
      {/* {(categories.length === 0 || filteredProducts.length === 0) && (
        <TouchableOpacity
          style={localStyles.retryButton}
          onPress={() => {
            fetchCategories();
            fetchProducts();
          }}
          accessibilityLabel="Thử lại tải dữ liệu"
          accessibilityRole="button"
        >
          <Text style={localStyles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      )} */}
    </View>
  );

  return (
    <View style={localStyles.container}>
      <CustomHeader />
      <View style={localStyles.content}>
        {isLoadingCategories ? (
          <ScrollView
            style={[localStyles.categoryContainer, localStyles.categoryContainerLoading]}
            contentContainerStyle={localStyles.categoryContentContainer}
          >
            {[...Array(5)].map((_, index) => (
              <View
                key={`skeleton-${index}`}
                style={[localStyles.categoryItem, { backgroundColor: '#eee' }]}
              >
                <Text style={localStyles.categoryText}>Đang tải...</Text>
              </View>
            ))}
          </ScrollView>
        ) : categories.length > 0 ? (
          <ScrollView
            style={localStyles.categoryContainer}
            contentContainerStyle={localStyles.categoryContentContainer}
          >
            {categories.map((item) => renderCategory({ item }))}
          </ScrollView>
        ) : (
          <View style={[localStyles.categoryContainer, localStyles.categoryContainerEmpty]}>
            <Text style={localStyles.noCategoriesText}>Không có danh mục</Text>
            <TouchableOpacity
              style={localStyles.retryButton}
              onPress={() => fetchCategories()}
              accessibilityLabel="Thử lại tải danh mục"
              accessibilityRole="button"
            >
              <Text style={localStyles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={localStyles.productContainer}>
          {isLoadingProducts ? (
            <ActivityIndicator size="large" color="#E53935" style={localStyles.loader} />
          ) : (
            <Animated.View style={[localStyles.animatedContainer, animatedStyle]}>
              {filteredProducts.length > 0 ? (
                <FlatList
                  data={filteredProducts}
                  renderItem={renderProduct}
                  keyExtractor={(item) => item._id.toString()}
                  numColumns={2}
                  columnWrapperStyle={localStyles.productWrapper}
                  contentContainerStyle={[localStyles.productList, { flexGrow: 1 }]}
                />
              ) : (
                renderEmpty()
              )}
            </Animated.View>
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
    width: '20%',
    backgroundColor: '#f5f5f5',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  categoryContainerLoading: {
    width: '20%',
  },
  categoryContainerEmpty: {
    width: 0,
    overflow: 'hidden',
  },
  categoryContentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  categoryItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedCategoryItem: {
    backgroundColor: '#e0e0e0',
  },
  categoryText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
  productContainer: {
    width: '80%',
    padding: 10,
  },
  productWrapper: {
    justifyContent: 'space-between',
  },
  productList: {
    paddingVertical: 5,
    flexGrow: 1,
  },
  productItem: {
    width: (screenWidth * 0.8 - 30) / 2,
    padding: 10,
    margin: 5,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  productImage: {
    width: '100%',
    height: 150,
    marginBottom: 10,
    borderRadius: 6,
  },
  productText: {
    fontSize: 13,
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  noProductsText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 14,
    marginTop: 20,
  },
  noCategoriesText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 14,
    marginTop: 20,
    paddingHorizontal: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  retryButton: {
    backgroundColor: '#E53935',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animatedContainer: {
    flex: 1,
  },
});

export default CategoryScreen;