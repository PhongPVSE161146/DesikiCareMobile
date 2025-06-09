import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { ProgressBar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

const baseProducts = [
  {
    img: 'https://bizweb.dktcdn.net/100/141/194/products/00502179-loreal-micellar-water-refreshing-400ml-nuoc-tay-trang-danh-cho-da-hon-hop-va-da-dau-2651-63db-large-f1207fa49a.jpg?v=1699015415277',
    name: 'Nước Tẩy Trang LOreal Làm Sạch Sâu Trang Điểm 400ml',
    price: 158000,
    oldPrice: 279000,
    discount: 43,
    sold: 0.4,
  },
  {
    img: 'https://img.lazcdn.com/g/p/e0e0b9a7f1299b712e7b883932509497.jpg_720x720q80.jpg',
    name: 'Phấn Phủ Carslan Dạng Nén Vỏ Đen Màu Tím 8g',
    price: 221000,
    oldPrice: 540000,
    discount: 59,
    sold: 0.25,
  },
  {
    img: 'https://product.hstatic.net/200000551679/product/tay-da-chet-toan-than-cocoon-tu_4141e9e2ed2c4de0bcea91c5d56125e9_1024x1024.jpg',
    name: 'Tẩy Da Chết Toàn Thân Cocoon Cà Phê Đắk Lắk 200ml',
    price: 66000,
    oldPrice: 125000,
    discount: 47,
    sold: 0.83,
  },
  {
    img: 'https://tunhalam.com/cdn/shop/files/image_b8cc9599-13fe-41dd-91ff-b3bedd5384d5.jpg?v=1684073642',
    name: 'Sữa Rửa Mặt Cetaphil Dịu Lành Cho Da Nhạy Cảm 500ml',
    price: 320000,
    oldPrice: 445000,
    discount: 28,
    sold: 0.51,
  },
   {
    img: "https://tunhalam.com/cdn/shop/files/image_b8cc9599-13fe-41dd-91ff-b3bedd5384d5.jpg?v=1684073642",
    name: "Sữa Rửa Mặt Cetaphil Dịu Lành Cho Da Nhạy Cảm 500ml",
    price: 320000,
    oldPrice: 445000,
    discount: 28,
    sold: 51,
  },
  {
    img: "https://vn-live-01.slatic.net/p/74a9eb2a023284e9c3fc2e04a38a1098.jpg",
    name: "Sữa Rửa Mặt Simple Giúp Da Sạch Thoáng 150ml",
    price: 81000,
    oldPrice: 132000,
    discount: 39,
    sold: 49,
  },
  {
    img: "https://product.hstatic.net/1000134629/product/z6116467131062_b30aa0c732c5a21ca3205460419a6e5a_281c75a206bf44199b15fc5ced09251a.jpg",
    name: "Smoothie Tẩy Da Chết Hương Lựu Đỏ 298g",
    price: 119000,
    oldPrice: 189000,
    discount: 64,
    sold: 64,
  },
   {
    img: "https://tunhalam.com/cdn/shop/files/image_b8cc9599-13fe-41dd-91ff-b3bedd5384d5.jpg?v=1684073642",
    name: "Sữa Rửa Mặt Cetaphil Dịu Lành Cho Da Nhạy Cảm 500ml",
    price: 320000,
    oldPrice: 445000,
    discount: 28,
    sold: 51,
  },
  {
    img: "https://vn-live-01.slatic.net/p/74a9eb2a023284e9c3fc2e04a38a1098.jpg",
    name: "Sữa Rửa Mặt Simple Giúp Da Sạch Thoáng 150ml",
    price: 81000,
    oldPrice: 132000,
    discount: 39,
    sold: 49,
  },
  {
    img: "https://product.hstatic.net/1000134629/product/z6116467131062_b30aa0c732c5a21ca3205460419a6e5a_281c75a206bf44199b15fc5ced09251a.jpg",
    name: "Smoothie Tẩy Da Chết Hương Lựu Đỏ 298g",
    price: 119000,
    oldPrice: 189000,
    discount: 64,
    sold: 64,
  },
];

const FlashSale = () => {
  const [timeLeft, setTimeLeft] = useState(7200);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev <= 1 ? 7200 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = seconds => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Flash Deals 🔥</Text>
        <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
        <TouchableOpacity>
          <Text style={styles.viewAll}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productList}>
        {baseProducts.map((item, index) => (
          <TouchableOpacity key={index} style={styles.card}>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{item.discount}%</Text>
            </View>
            <Image source={{ uri: item.img }} style={styles.productImage} />
            <View style={styles.info}>
              <Text numberOfLines={2} style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>
                {item.price.toLocaleString('vi-VN')}₫
              </Text>
              <Text style={styles.oldPrice}>
                {item.oldPrice.toLocaleString('vi-VN')}₫
              </Text>
              <ProgressBar progress={item.sold} color="#f97316" style={styles.progress} />
              <Text style={styles.sold}>
                {Math.round(item.sold * 100)}% đã bán
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fa7ca6',
    borderRadius: 8,
    margin: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  timer: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'white',
  },
  viewAll: {
    color: 'white',
    fontWeight: 'bold',
  },
  productList: {
    marginTop: 16,
  },
  card: {
    width: 160,
    backgroundColor: 'white',
    borderRadius: 8,
    marginRight: 12,
    paddingBottom: 10,
    overflow: 'hidden',
  },
  discountBadge: {
    position: 'absolute',
    backgroundColor: '#f97316',
    top: 8,
    left: 8,
    zIndex: 2,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    color: 'white',
    fontSize: 12,
  },
  productImage: {
    width: '100%',
    height: 140,
    resizeMode: 'contain',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  info: {
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    height: 40,
    color: '#333',
  },
  price: {
    color: 'red',
    fontWeight: 'bold',
  },
  oldPrice: {
    textDecorationLine: 'line-through',
    fontSize: 12,
    color: '#777',
  },
  progress: {
    height: 6,
    borderRadius: 4,
    backgroundColor: '#fcd34d',
    marginTop: 4,
  },
  sold: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});

export default FlashSale;
