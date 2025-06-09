import React from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';

const data = [
  {
    id: '1',
    title1: 'Trang',
    title2: 'Điểm Môi',
    image: 'https://i.imgur.com/LU7vyx7.png', // Thay bằng ảnh thật của bạn
    bgColor: '#F6E4E4',
    borderColor: '#D9BEBE',
  },
  {
    id: '2',
    title1: 'Trang',
    title2: 'Điểm Mặt',
    image: 'https://i.imgur.com/0pzM7yi.png',
    bgColor: '#E6E8F6',
    borderColor: '#BFC4DD',
  },
  {
    id: '3',
    title1: 'Trang',
    title2: 'Điểm Mắt',
    image: 'https://i.imgur.com/NFlOxLc.png',
    bgColor: '#FCEAEA',
    borderColor: '#E7C6C6',
  },
  {
    id: '4',
    title1: 'Chống',
    title2: 'Da L',
    image: 'https://i.imgur.com/WvST0lE.png',
    bgColor: '#E5E9E9',
    borderColor: '#C1C9C9',
  },
  {
    id: '5',
    title1: 'Mặt Nạ',
    title2: '',
    image: 'https://i.imgur.com/nhH1GGm.png',
    bgColor: '#FBF9E8',
    borderColor: '#E4E1B4',
  },
  {
    id: '6',
    title1: 'Sữa Rửa',
    title2: 'Mặt',
    image: 'https://i.imgur.com/jfXZl3P.png',
    bgColor: '#D9EDF9',
    borderColor: '#A8C9E1',
  },
  {
    id: '7',
    title1: 'Dầu Gội Và',
    title2: 'Dầu Xả',
    image: 'https://i.imgur.com/ZFqkDjv.png',
    bgColor: '#F9EAD9',
    borderColor: '#E2C2A7',
  },
  {
    id: '8',
    title1: 'Tẩy Tế',
    title2: 'Mặt',
    image: 'https://i.imgur.com/W6ZHCxP.png',
    bgColor: '#D7F0F1',
    borderColor: '#A3C8C9',
  },
];

const Item = ({ title1, title2, image, bgColor, borderColor }) => (
  <TouchableOpacity style={[styles.item, { backgroundColor: bgColor, borderColor }]}>
    <Image source={{ uri: image }} style={styles.image} />
    <Text style={styles.text}>{title1}</Text>
    {title2 ? <Text style={styles.text}>{title2}</Text> : null}
  </TouchableOpacity>
);

export default function ListItem() {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Danh mục</Text>
        <Text style={styles.headerViewAll}>Xem tất cả</Text>
      </View>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Item
            title1={item.title1}
            title2={item.title2}
            image={item.image}
            bgColor={item.bgColor}
            borderColor={item.borderColor}
          />
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 25,
    backgroundColor: 'gray',
    paddingVertical: 16,
    borderRadius: 12,
  
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 19,
    marginBottom: 12,
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#3B5323',
  },
  headerViewAll: {
    color: '#666',
    fontSize: 14,
  },
  item: {
    width: 100,
    height: 130,
    marginRight: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  image: {
    width: 50,
    height: 50,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  text: {
    fontSize: 13,
    color: '#444',
    textAlign: 'center',
    fontWeight: '600',
  },
});
