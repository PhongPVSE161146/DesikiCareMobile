import React from 'react';
import { View, Text, FlatList } from 'react-native';
import ProductCard from '../../components/ProductCard';
import { products } from '../../data/products'; // Assuming you have a products data file
import { styles } from '../../assets/styles';
const HomeScreen = ({ navigation }) => {
  const renderItem = ({ item }) => (
    <ProductCard
      product={item}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>DesikiCare</Text>
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2}
      />
    </View>
  );
};

export default HomeScreen;