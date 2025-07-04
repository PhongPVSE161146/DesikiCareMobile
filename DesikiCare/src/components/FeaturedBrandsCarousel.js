import React from 'react';
import { View, Image, Dimensions, StyleSheet, TouchableOpacity, FlatList, Text } from 'react-native';

const { width, height } = Dimensions.get('window');

// Fixed dimensions for image and container
const ITEM_WIDTH = width * 0.3; // 30% of screen width
const ITEM_HEIGHT = height * 0.25; // 25% of screen height for compact brand cards

const brands = [
  {
    id: '1',
    image: 'https://rubee.com.vn/admin/webroot/upload/image/images/1-logo-loreal.jpg',
    bgColor: '#F6E4E4',
    borderColor: '#D9BEBE',
  },
  {
    id: '2',
    image: 'https://inchi.vn/data/cms_upload/files/blog/logo-my-pham/101.jpg',
    bgColor: '#E6E8F6',
    borderColor: '#BFC4DD',
  },
  {
    id: '3',
    image: 'https://inchi.vn/data/cms_upload/files/blog/logo-my-pham/121.jpg',
    bgColor: '#FCEAEA',
    borderColor: '#E7C6C6',
  },
  {
    id: '4',
    image: 'https://inchi.vn/data/cms_upload/files/blog/logo-my-pham/136.jpg',
    bgColor: '#E5E9E9',
    borderColor: '#C1C9C9',
  },
  {
    id: '5',
    image: 'https://inchi.vn/data/cms_upload/files/blog/logo-my-pham/129.jpg',
    bgColor: '#FBF9E8',
    borderColor: '#E4E1B4',
  },
  {
    id: '6',
    image: 'https://trungtamthuoc.com/images/supplier/cocoon-3-1833.jpg',
    bgColor: '#D9EDF9',
    borderColor: '#A8C9E1',
  },
  {
    id: '7',
    image: 'https://goldidea.vn/upload/123/thiet-ke-logo-my-pham.png',
    bgColor: '#F9EAD9',
    borderColor: '#E2C2A7',
  },
];

const Item = ({ image, bgColor, borderColor }) => (
  <TouchableOpacity style={[styles.item, { backgroundColor: bgColor, borderColor }]}>
    <Image
      source={{ uri: image }}
      style={styles.image}
      resizeMode="contain"
      onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
    />
  </TouchableOpacity>
);

export default function FeaturedBrandsFlatList() {
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Thương hiệu nổi bật</Text>
      <FlatList
        data={brands}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Item
            image={item.image}
            bgColor={item.bgColor}
            borderColor={item.borderColor}
          />
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        snapToInterval={ITEM_WIDTH + 16} // Enable snapping for carousel-like behavior
        decelerationRate="fast"
      />
      {/* <TouchableOpacity style={styles.viewAllButton}>
        <Text style={styles.viewAllText}>Xem tất cả</Text>
      </TouchableOpacity> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 25,
    backgroundColor: '#FFCCCC',
    paddingVertical: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#3B5323',
    marginBottom: 12,
    textAlign: 'center',
  },
  item: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    marginHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12, // Match container borderRadius
  },
  viewAllButton: {
    backgroundColor: '#6200ea',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  viewAllText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});