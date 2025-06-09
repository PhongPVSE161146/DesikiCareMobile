import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

const CartScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://png.pngtree.com/png-vector/20230726/ourmid/pngtree-black-and-white-smiley-face-drawing-drawn-on-a-white-background-vector-png-image_6746557.png' }} // Hoặc thay bằng icon tùy bạn
        style={styles.icon}
        resizeMode="contain"
      />
      <Text style={styles.text}>Giỏ hàng của bạn chưa có sản phẩm nào</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation?.navigate?.('Home')} // Hoặc route bạn muốn
      >
        <Text style={styles.buttonText}>TIẾP TỤC MUA SẮM</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  icon: {
    width: 100,
    height: 100,
    marginBottom: 20,
    tintColor: '#999', // Xám nhẹ
  },
  text: {
    fontSize: 16,
    color: '#333',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#FF5C00',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
