import React from 'react';
import { View, FlatList, ScrollView, StyleSheet, Text } from 'react-native';
import ProductList from '../../components/ProductList';
import { products } from '../../data/products';
import FeatureButton from '../../components/FeatureButton';
import FlashSale from '../../components/FlashSale'; // ✅ Import component FlashSale
import ListItem from '../../components/ListItem';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

const features = [
  { title: 'Danh Mục', icon: <MaterialIcons name="menu" size={32} color="#555" /> },
  { title: 'Hàng Mới', icon: <MaterialCommunityIcons name="new-box" size={32} color="#E91E63" /> },
  { title: 'Mini Game', icon: <MaterialIcons name="gamepad" size={32} color="#4CAF50" /> },
  { title: 'Cẩm Nang', icon: <MaterialIcons name="menu-book" size={32} color="#607D8B" /> },
  { title: 'Deals', icon: <MaterialCommunityIcons name="sale" size={32} color="#FF5722" /> },
  { title: 'Hỗ Trợ', icon: <MaterialIcons name="support-agent" size={32} color="#9C27B0" /> },
  { title: 'Giờ Vàng', icon: <MaterialCommunityIcons name="alarm" size={32} color="#FFC107" /> },
  { title: 'Chính Sách', icon: <MaterialIcons name="policy" size={32} color="#795548" /> },
];

const HomeScreen = ({ navigation }) => {
  const renderProduct = ({ item }) => (
    <ProductList
      product={item}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
    />
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
     
      <View style={styles.featureContainer}>
        {features.map((feature, index) => (
          <FeatureButton key={index} title={feature.title} icon={feature.icon} />
        ))}
      </View>

      <FlashSale />
  <ListItem />
    
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        scrollEnabled={false}
        contentContainerStyle={styles.productList}
      />
    
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 20,
  },
  featureContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: '#2ecc71',
  },
  productList: {
    paddingHorizontal: 8,
  },
});

export default HomeScreen;
