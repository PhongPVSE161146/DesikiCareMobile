import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";

const OrderCard = ({ orderItem, orderId, order, canCancel, onCancel }) => {
  console.log("Rendering OrderCard:", { orderId, orderItem, order });

  // Lấy số lượng từ orderItem.orderItem.quantity
  const quantity = orderItem?.orderItem?.quantity || "Chưa có thông tin";

  // Lấy trạng thái thanh toán
  const paymentStatus =
    order?.isPaid !== undefined
      ? order.isPaid
        ? "Đã thanh toán"
        : "Chưa thanh toán"
      : "Đã thanh toán";

  // Lấy tên sản phẩm và hình ảnh từ orderItem.product
  const productName = orderItem?.product?.name || `Đơn hàng ${orderId}`;
  const imageUrl = orderItem?.product?.imageUrl;

  // Lấy giá từ order.totalPrice hoặc orderItem.orderItem.unitPrice
  const price = order?.totalPrice || orderItem?.orderItem?.unitPrice || 0;

  return (
    <View style={styles.card}>
      {/* Hình ảnh */}
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="contain"
          onError={(e) => console.log("Error loading image:", imageUrl)}
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.placeholderText}>No Image</Text>
        </View>
      )}

      {/* Tiêu đề */}
      <Text style={styles.title}>{productName}</Text>

      {/* Giá */}
      <Text style={styles.price}>
        Giá: {price.toLocaleString("vi-VN")} đ
      </Text>

      {/* Số lượng */}
      <Text style={styles.quantity}>Số lượng: {quantity}</Text>

      {/* Mã đơn */}
      <Text style={styles.orderId}>Mã đơn: {orderId}</Text>

      {/* Ngày đặt hàng */}
      {order?.createdAt && (
        <Text style={styles.date}>
          Ngày đặt: {new Date(order.createdAt).toLocaleDateString("vi-VN")}
        </Text>
      )}

      {/* Trạng thái thanh toán */}
      <Text style={styles.paymentStatus}>
        Trạng thái thanh toán: {paymentStatus}
      </Text>

      {/* Nút hủy */}
      {canCancel && (
        <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
          <Text style={styles.cancelBtnText}>Hủy đơn</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 10,
    marginHorizontal: 12,
    borderRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    minHeight: 180,
  },
  image: {
    height: 100,
    width: "100%",
    marginBottom: 10,
    borderRadius: 6,
  },
  imagePlaceholder: {
    height: 100,
    width: "100%",
    backgroundColor: "#EEE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    borderRadius: 6,
  },
  placeholderText: {
    color: "#999",
    fontSize: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  price: {
    fontSize: 14,
    color: "#E53935",
    marginBottom: 5,
  },
  quantity: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  orderId: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  date: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  paymentStatus: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  cancelBtn: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#EF4444",
    borderRadius: 6,
    alignItems: "center",
  },
  cancelBtnText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default OrderCard;