import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { styles } from '../../../assets/styles';

const categories = [
  { id: '1', name: 'Son' },
  { id: '2', name: 'Trang Điểm' },
  { id: '3', name: 'Nước Hoa' },
  { id: '4', name: 'Chăm Sóc Da' },
];

const CategoryScreen = () => {
  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => alert(`Xem sản phẩm trong danh mục: ${item.name}`)}
    >
      <Text style={styles.productName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Danh mục</Text>
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={item => item.id}
        numColumns={2}
      />
    </View>
  );
};

export default CategoryScreen;