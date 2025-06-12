import React, { useState } from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity, StyleSheet, Animated, Image } from 'react-native';
import { categories, products } from '../../data/products'; // Verify this import
import CustomHeader from '../../components/Header/CustomHeader';

const CategoryScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [animation] = useState(new Animated.Value(0)); // Animation value for opacity and height

  // Fallback if categories is undefined
  const safeCategories = categories || [];

  // Filter products based on selected category
  const filteredProducts = selectedCategory
    ? products.filter((product) => product.category === selectedCategory)
    : [];

  // Trigger animation when category changes
  React.useEffect(() => {
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
  }, [selectedCategory, animation]);

  const renderCategory = ({ item }) => {
    // Split the category text into words
    const words = item.split(' ');
    const firstLine = words.slice(0, 2).join(' '); // First 2 words
    const secondLine = words.length > 2 ? words.slice(2).join(' ') : ''; // Remaining words

    return (
      <TouchableOpacity
        style={[
          localStyles.categoryItem,
          selectedCategory === item && localStyles.selectedCategoryItem,
        ]}
        onPress={() => setSelectedCategory(item)}
      >
        <Text style={localStyles.categoryText}>
          {firstLine}
          {secondLine ? `\n${secondLine}` : ''}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={localStyles.productItem}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
    >
      <Image
        source={{ uri: item.image }}
        style={localStyles.productImage}
        resizeMode="contain"
      />
      <Text style={localStyles.productText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const animatedStyle = {
    opacity: animation,
    height: animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 'auto'],
    }),
  };

  return (
    <View style={localStyles.container}>
      <CustomHeader />
      <View style={localStyles.content}>
        <ScrollView style={localStyles.categoryContainer}>
          {safeCategories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                localStyles.categoryItem,
                selectedCategory === category && localStyles.selectedCategoryItem,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={localStyles.categoryText}>
                {category.split(' ').slice(0, 2).join(' ')}
                {category.split(' ').length > 2 ? `\n${category.split(' ').slice(2).join(' ')}` : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={localStyles.productContainer}>
          {selectedCategory ? (
            <Animated.View style={animatedStyle}>
              {filteredProducts.length > 0 ? (
                <FlatList
                  data={filteredProducts}
                  renderItem={renderProduct}
                  keyExtractor={(item) => item.id}
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
    width: '15%',
    backgroundColor: '#f5f5f5',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  categoryItem: {
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    minHeight: 60,
    justifyContent: 'center',
  },
  selectedCategoryItem: {
    backgroundColor: '#e0e0e0',
  },
  categoryText: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
    lineHeight: 15,
  },
  productContainer: {
    flex: 5,
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
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    alignItems: 'center',
  },
  productImage: {
    width: 100, // Fixed width for the image
    height: 150, // Fixed height for the image
    marginBottom: 5, // Space between image and text
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