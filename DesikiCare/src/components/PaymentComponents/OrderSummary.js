import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const OrderSummary = ({ cartItems, handleSubmit, isLoading, addressId, paymentMethod }) => {
  const subtotal = cartItems.reduce((total, item) => total + (item.price || 0) * (item.quantity || 0), 0);
  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const total = subtotal + shippingFee;

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
      <View style={styles.summaryItem}>
        <Text style={styles.summaryText}>Phí giao hàng</Text>
        <Text style={styles.summaryPrice}>
          {shippingFee.toLocaleString('vi-VN')}₫
          {shippingFee === 0 && (
            <Text style={styles.freeShippingText}> (Miễn phí đơn 500,000 đ)</Text>
          )}
        </Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.summaryTotal}>
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
  freeShippingText: {
    fontSize: 14,
    color: '#E53935',
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