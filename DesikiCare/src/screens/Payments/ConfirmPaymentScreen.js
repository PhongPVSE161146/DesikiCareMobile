import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Card } from 'react-native-elements';

const ConfirmPaymentScreen = ({ route, navigation }) => {
  const { paymentData } = route.params || {};
  const { data, code, desc, success, signature } = paymentData || {};

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
          <Text style={styles.detailLabel}>Mô tả đơn hàng:</Text>
          <Text style={styles.detailValue}>{data?.description || 'N/A'}</Text>
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
          <Text style={styles.detailLabel}>Thời gian giao dịch:</Text>
          <Text style={styles.detailValue}>{formatDateTime(data?.transactionDateTime)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Mã liên kết thanh toán:</Text>
          <Text style={styles.detailValue}>{data?.paymentLinkId || 'N/A'}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Mã ngân hàng:</Text>
          <Text style={styles.detailValue}>{data?.counterAccountBankId || 'N/A'}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Tên ngân hàng:</Text>
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
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
  },
  card: {
    borderRadius: 12,
    marginBottom: 24,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
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
    paddingVertical: 6,
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
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
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 24,
    height: 45,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ConfirmPaymentScreen;