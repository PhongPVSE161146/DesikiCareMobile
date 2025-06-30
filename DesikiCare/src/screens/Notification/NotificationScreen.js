import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { styles } from '../../assets/styles';

const notifications = [

  { id: 1, message: "Khuyến mãi 20% cho son môi Desiki!", type: "info" },
  { id: 2, message: "Đơn hàng #127 đã được giao.", type: "success" },
  { id: 3, message: "Sản phẩm mới: Kem nền Desiki 2025!", type: "info" },
  { id: 4, message: "Giảm giá 15% cho nước hoa Desiki trong tuần này!", type: "info" },
  { id: 5, message: "Đơn hàng #124 đang được xử lý.", type: "warning" },
  { id: 6, message: "Sản phẩm mới: Phấn mắt Desiki Glow 2025!", type: "info" },
  { id: 7, message: "Mua 2 tặng 1 cho dòng son dưỡng Desiki!", type: "info" },
  { id: 8, message: "Đơn hàng #125 đã được giao thành công.", type: "success" },
  { id: 9, message: "Khám phá bộ sưu tập mỹ phẩm Desiki Xuân 2025!", type: "info" },
  { id: 10, message: "Tặng mã giảm giá 10% khi mua hàng qua app!", type: "info" },
  { id: 11, message: "Đơn hàng #126 đang chờ xác nhận.", type: "warning" },
  { id: 12, message: "Sản phẩm mới: Sữa rửa mặt Desiki Pure!", type: "info" },
  { id: 13, message: "Ưu đãi đặc biệt: Miễn phí vận chuyển cho đơn từ 500k!", type: "info" }

];

const NotificationScreen = () => {
  const renderNotification = ({ item }) => (
    <View style={styles.cartItem}>
      <Text>{item.message}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* <Text style={styles.header}>Thông báo</Text> */}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

export default NotificationScreen;