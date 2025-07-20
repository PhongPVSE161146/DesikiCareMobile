import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';

const ConfirmPaymentScreen = ({ route, navigation }) => {
  const { paymentData } = route.params || {};
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!paymentData) {
      setError('Không có dữ liệu thanh toán.');
      setIsLoading(false);
    }
  }, [paymentData]);

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#E53935" />
      </View>
    );
  }

  if (error) {
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Xác nhận thanh toán thất bại</Text>
        <View style={styles.card}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            style={styles.submitButton}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>Quay về trang chủ</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  const { data, code, desc, success, signature, orderData } = paymentData || {};
  const { subtotal, discount, shippingFee, total } = orderData || {};

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {success ? 'Xác nhận thanh toán thành công' : 'Xác nhận thanh toán thất bại'}
      </Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Chi tiết đơn hàng</Text>
        {orderData?.cartItems?.length > 0 ? (
          orderData.cartItems.map((item, index) => (
            <View key={index} style={styles.summaryItem}>
              <Text style={styles.summaryText} numberOfLines={1}>
                {item.title} (x{item.quantity})
              </Text>
              <Text style={styles.summaryPrice}>
                {(item.price * item.quantity).toLocaleString('vi-VN')}₫
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.summaryText}>Không có sản phẩm</Text>
        )}
        <View style={styles.summaryItem}>
          <Text style={styles.summaryText}>Tạm tính</Text>
          <Text style={styles.summaryPrice}>
            {subtotal?.toLocaleString('vi-VN') || '0'}₫
          </Text>
        </View>
        {discount > 0 && (
          <View style={styles.summaryItem}>
            <Text style={styles.summaryDiscountText}>Giảm giá ({orderData?.pointUsed} điểm)</Text>
            <Text style={styles.summaryDiscountPrice}>
              -{discount.toLocaleString('vi-VN')}₫
            </Text>
          </View>
        )}
        <View style={styles.summaryItem}>
          <Text style={styles.summaryText}>Phí giao hàng</Text>
          <Text style={styles.summaryPrice}>
            {shippingFee?.toLocaleString('vi-VN') || '0'}₫
            {shippingFee === 0 && (
              <Text style={styles.summaryDiscountText}> (Miễn phí cho đơn hàng trên 500,000₫)</Text>
            )}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryTotal}>
          <Text style={styles.summaryTotalText}>Tổng cộng</Text>
          <Text style={styles.summaryTotalPrice}>
            {total?.toLocaleString('vi-VN') || '0'}₫
          </Text>
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Chi tiết thanh toán</Text>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Mã trạng thái:</Text>
          <Text style={styles.detailValue}>{code || 'N/A'}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Mô tả:</Text>
          <Text style={styles.detailValue}>{desc || 'N/A'}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Mã đơn hàng:</Text>
          <Text style={styles.detailValue}>{data?.orderCode || 'N/A'}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Số tiền:</Text>
          <Text style={styles.detailValue}>
            {data?.amount ? data.amount.toLocaleString('vi-VN') + ' ' + (data.currency || 'VND') : 'N/A'}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Thời gian giao dịch:</Text>
          <Text style={styles.detailValue}>{formatDateTime(data?.transactionDateTime)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Số tài khoản:</Text>
          <Text style={styles.detailValue}>{data?.accountNumber || 'N/A'}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Mã tham chiếu:</Text>
          <Text style={styles.detailValue}>{data?.reference || 'N/A'}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Mã liên kết thanh toán:</Text>
          <Text style={styles.detailValue}>{data?.paymentLinkId || 'N/A'}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Mã ngân hàng đối tác:</Text>
          <Text style={styles.detailValue}>{data?.counterAccountBankId || 'N/A'}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Tên ngân hàng đối tác:</Text>
          <Text style={styles.detailValue}>{data?.counterAccountBankName || 'N/A'}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Tên tài khoản đối tác:</Text>
          <Text style={styles.detailValue}>{data?.counterAccountName || 'N/A'}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Số tài khoản đối tác:</Text>
          <Text style={styles.detailValue}>{data?.counterAccountNumber || 'N/A'}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Tên tài khoản ảo:</Text>
          <Text style={styles.detailValue}>{data?.virtualAccountName || 'N/A'}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Số tài khoản ảo:</Text>
          <Text style={styles.detailValue}>{data?.virtualAccountNumber || 'N/A'}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Chữ ký:</Text>
          <Text style={styles.detailValue}>{signature || 'N/A'}</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
          style={styles.submitButton}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>Quay về trang chủ</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginVertical: 16,
    color: '#333',
  },
  card: {
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  detailValue: {
    fontSize: 15,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  summaryPrice: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  summaryDiscountText: {
    fontSize: 14,
    color: '#E53935',
  },
  summaryDiscountPrice: {
    fontSize: 14,
    color: '#E53935',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  summaryTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  summaryTotalText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
  },
  summaryTotalPrice: {
    fontSize: 17,
    fontWeight: '700',
    color: '#E53935',
  },
  submitButton: {
    backgroundColor: '#E53935',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#E53935',
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default ConfirmPaymentScreen;