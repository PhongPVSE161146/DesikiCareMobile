import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";

const OrderCard = ({ orderItem, orderId, canCancel, onCancel }) => {
  return (
    <View style={styles.card}>
      {orderItem?.imageUrl ? (
        <Image
          source={{ uri: orderItem.imageUrl }}
          style={styles.image}
          resizeMode="contain"
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={{ color: "#999" }}>No Image</Text>
        </View>
      )}
      <Text style={styles.title}>{orderItem.title}</Text>
      <Text>Giá: {orderItem.price?.toLocaleString()}đ</Text>
      <Text>Số lượng: {orderItem.quantity}</Text>
      <Text>Mã đơn: {orderId}</Text>
      {canCancel && (
        <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
          <Text style={{ color: "white" }}>Huỷ đơn</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 3,
  },
  image: {
    height: 100,
    width: "100%",
    marginBottom: 10,
  },
  imagePlaceholder: {
    height: 100,
    width: "100%",
    backgroundColor: "#EEE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelBtn: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#EF4444",
    borderRadius: 6,
    alignItems: "center",
  },
});

export default OrderCard;
