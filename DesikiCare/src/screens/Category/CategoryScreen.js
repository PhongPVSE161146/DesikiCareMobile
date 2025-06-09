import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { categories } from '../../data/products'; // Assuming you have a categories data file
import { styles } from '../../assets/styles';

const CategoryScreen = ({ navigation }) => {
  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={localStyles.categoryItem}
      onPress={() => navigation.navigate('ProductDetail', { category: item })}
    >
      <Text style={localStyles.categoryText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh mục</Text>
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item}
      />
    </View>
  );
};

const localStyles = StyleSheet.create({
  categoryItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  categoryText: {
    fontSize: 16,
  },
});

export default CategoryScreen;