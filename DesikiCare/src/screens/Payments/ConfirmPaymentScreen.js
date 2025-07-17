import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Card } from 'react-native-elements';
import paymentService from '../../config/axios/Payments/paymentService'; // Adjust the import path as necessary

const ConfirmPaymentScreen = ({ route, navigation }) => {
  const { paymentData } = route.params || {};
  const [isLoading, setIsLoading] = useState(true);
  const [confirmedData, setConfirmedData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const confirmPayment = async () => {
      if (!paymentData) {
        setError('Không có dữ liệu thanh toán.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await paymentService.confirmPayment(paymentData);
        if (response.success) {
          setConfirmedData(response);
        } else {
          setError(response.message || 'Không thể xác nhận thanh toán.');
        }
      } catch (err) {
        setError(err.message || 'Có lỗi xảy ra khi xác nhận thanh toán.');
      } finally {
        setIsLoading(false);
      }
    };

    confirmPayment();
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
        <ActivityIndicator size="large" color="#f06292" />
      </View>
    );
  }

  if (error) {
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Xác nhận thanh toán thất bại</Text>
        <Card containerStyle={styles.card}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            style={styles.submitButton}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>Quay về trang chủ</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    );
  }

  const { data, code, desc, success, signature } = confirmedData || {};

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {success ? 'Xác nhận thanh toán thành công' : 'Xác nhận thanh toán thất bại'}
      </Text>
      <Card containerStyle={styles.card}>
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
        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
          style={styles.submitButton}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>Quay về trang chủ</Text>
        </TouchableOpacity>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f7',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
  },
  card: {
    borderRadius: 12,
    marginBottom: 24,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    backgroundColor: '#fff',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
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
  },
  detailValue: {
    fontSize: 15,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  submitButton: {
    backgroundColor: '#f06292',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
    height: 48,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default ConfirmPaymentScreen;