import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const PaymentMethods = ({ formikRef }) => {
  const handleSelectPaymentMethod = (method) => {
    if (formikRef.current) {
      formikRef.current.setValues({
        ...formikRef.current.values,
        paymentMethod: method,
      });
      console.log('Selected payment method:', method);
    } else {
      console.error('formikRef.current is undefined in PaymentMethods');
    }
  };

  return (
    <View>
      {/* <TouchableOpacity
        style={[
          styles.paymentOption,
          formikRef.current?.values.paymentMethod === 'cod' && styles.selectedOption,
        ]}
        onPress={() => handleSelectPaymentMethod('cod')}
      >
        <Text style={styles.paymentText}>Thanh toán khi nhận hàng (COD)</Text>
      </TouchableOpacity> */}
      <TouchableOpacity
        style={[
          styles.paymentOption,
          formikRef.current?.values.paymentMethod === 'bank' && styles.selectedOption,
        ]}
        onPress={() => handleSelectPaymentMethod('bank')}
      >
        <Text style={styles.paymentText}>Chuyển khoản ngân hàng</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  paymentOption: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  selectedOption: {
    borderColor: '#E53935',
    backgroundColor: '#FFEBEE',
  },
  paymentText: {
    fontSize: 16,
    color: '#333',
  },
});

export default PaymentMethods;