import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { styles } from '../../assets/styles';

const notifications = [
  { id: '1', message: 'Khuyến mãi 20% cho son môi Desiki!' },
  { id: '2', message: 'Đơn hàng #123 đã được giao.' },
  { id: '3', message: 'Sản phẩm mới: Kem nền Desiki 2025!' },
];

const NotificationScreen = () => {
  const renderNotification = ({ item }) => (
    <View style={styles.cartItem}>
      <Text>{item.message}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Thông báo</Text>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

export default NotificationScreen;