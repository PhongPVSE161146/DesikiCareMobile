import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const OrderSummary = ({ cartItems, handleSubmit, isLoading, addressId, paymentMethod, pointsApplied = 0 }) => {
  const subtotal = cartItems.reduce((total, item) => total + (item.price || 0) * (item.quantity || 0), 0);
  const discount = Number(pointsApplied);
  const total = Math.max(0, subtotal - discount);

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Tóm tắt đơn hàng</Text>
      {cartItems && cartItems.length > 0 ? (
        cartItems.map((item, index) => (
          <View key={index} style={styles.summaryItem}>
            <Text style={styles.summaryText}>
              {item.title} (x{item.quantity})
            </Text>
            <Text style={styles.summaryPrice}>
              {(item.price * item.quantity).toLocaleString('vi-VN')}₫
            </Text>
          </View>
        ))
      ) : (
        <View style={styles.summaryItem}>
          <Text style={styles.summaryText}>Không có sản phẩm</Text>
          <Text style={styles.summaryPrice}>0₫</Text>
        </View>
      )}
      <View style={styles.divider} />
      <View style={styles.summaryTotal}>
        <Text style={styles.summaryTotalText}>Tạm tính:</Text>
        <Text style={styles.summaryTotalPrice}>
          {subtotal.toLocaleString('vi-VN')}₫
        </Text>
      </View>
      {pointsApplied > 0 && (
        <View style={styles.summaryTotal}>
          <Text style={styles.discountText}>
            Giảm giá ({pointsApplied.toLocaleString('vi-VN')} điểm):
          </Text>
          <Text style={styles.discountPrice}>
            -{discount.toLocaleString('vi-VN')}₫
          </Text>
        </View>
      )}
      <View style={[styles.summaryTotal, styles.totalFinalRow]}>
        <Text style={styles.summaryTotalText}>Tổng cộng:</Text>
        <Text style={styles.summaryTotalPrice}>
          {total.toLocaleString('vi-VN')}₫
        </Text>
      </View>
      <TouchableOpacity
        onPress={handleSubmit}
        style={[styles.submitButton, isLoading || !addressId ? styles.disabledButton : null]}
        activeOpacity={0.8}
        disabled={isLoading || !addressId}
      >
        <Text style={styles.submitButtonText}>
          {paymentMethod === 'cod' ? 'Xác nhận đơn hàng' : 'Thanh toán'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: '#212121',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  summaryText: {
    fontSize: 16,
    color: '#424242',
    flex: 1,
    flexWrap: 'wrap',
    marginRight: 8,
  },
  summaryPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#d32f2f',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  summaryTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  totalFinalRow: {
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#E53935',
  },
  summaryTotalText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
  },
  summaryTotalPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#d32f2f',
  },
  discountText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#E53935',
  },
  discountPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E53935',
  },
  submitButton: {
    backgroundColor: '#E53935',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OrderSummary;