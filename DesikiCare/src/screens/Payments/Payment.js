import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TextInput, ActivityIndicator, StyleSheet } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddressHandler from '../../components/PaymentComponents/AddressHandler';
import PaymentMethods from '../../components/PaymentComponents/PaymentMethods';
import OrderSummary from '../../components/PaymentComponents/OrderSummary';
import orderService from '../../config/axios/Order/orderService';
import { v4 as uuidv4 } from 'uuid';

// Validation schema
const validationSchema = Yup.object().shape({
  fullName: Yup.string().required('Vui lòng nhập họ và tên'),
  phone: Yup.string()
    .matches(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ')
    .required('Vui lòng nhập số điện thoại'),
  addressId: Yup.string().required('Vui lòng chọn địa chỉ giao hàng'),
  paymentMethod: Yup.string().required('Vui lòng chọn phương thức thanh toán'),
});

const Payment = ({ route, navigation }) => {
  const { cartItems: passedCartItems } = route.params || {};
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [addresses, setAddresses] = useState([]);
  const [orderId] = useState(`ORDER${Date.now()}`);
  const formikRef = useRef(null);
  const cartItems = passedCartItems?.length > 0 ? passedCartItems : [];

  // Load user info
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const userInfo = await AsyncStorage.getItem('userInfo');
        const parsedUserInfo = userInfo ? JSON.parse(userInfo) : { fullName: '', phone: '' };
        if (formikRef.current) {
          formikRef.current.setValues({
            ...formikRef.current.values,
            fullName: parsedUserInfo.fullName || '',
            phone: parsedUserInfo.phone || '',
          });
        }
      } catch (error) {
        console.error('Error fetching user info:', error.message);
        setNotification({ message: 'Không thể tải thông tin người dùng.', type: 'error' });
      }
    };
    loadUserInfo();
  }, []);

  const processPayment = async (values) => {
    try {
      console.log('Handle payment with values:', JSON.stringify(values, null, 2));
      console.log('Addresses:', JSON.stringify(addresses, null, 2));
      console.log('Cart items:', JSON.stringify(cartItems, null, 2));
      console.log('Received orderId:', orderId);

      if (!values.addressId) {
        setNotification({ message: 'Vui lòng chọn một địa chỉ giao hàng hợp lệ.', type: 'error' });
        return;
      }
      const selectedAddress = addresses.find((addr) => addr._id === values.addressId);
      if (!selectedAddress) {
        setNotification({ message: 'Địa chỉ giao hàng không hợp lệ.', type: 'error' });
        return;
      }

      const hexRegex = /^[0-9a-fA-F]{24}$/;
      if (!hexRegex.test(values.addressId)) {
        setNotification({ message: 'Địa chỉ giao hàng không hợp lệ: ID phải là chuỗi hex 24 ký tự.', type: 'error' });
        return;
      }

      const userInfo = await AsyncStorage.getItem('userInfo');
      const parsedUserInfo = userInfo ? JSON.parse(userInfo) : null;
      if (!parsedUserInfo?.accountId) {
        setNotification({ message: 'Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại.', type: 'error' });
        return;
      }

      if (!cartItems || cartItems.length === 0) {
        setNotification({ message: 'Giỏ hàng trống. Vui lòng thêm sản phẩm.', type: 'error' });
        return;
      }

      const subtotal = cartItems.reduce((total, item) => total + (item.price || 0) * (item.quantity || 1), 0);
      const shippingFee = subtotal >= 500000 ? 0 : 30000;
      const totalAmount = subtotal + shippingFee;

      const generatedOrderId = orderId || `ORDER${uuidv4().replace(/-/g, '').slice(0, 12)}`;
      console.log('Generated orderId:', generatedOrderId);

      const orderPayload = {
        order: {
          newOrderId: generatedOrderId,
          userId: parsedUserInfo.accountId,
          deliveryAddressId: values.addressId,
          cartItems: cartItems.map(item => ({
            productId: item.id,
            quantity: item.quantity || 1,
            price: item.price,
          })),
          subtotal,
          discount: 0,
          shippingFee,
          total: totalAmount,
          paymentMethod: values.paymentMethod,
          paymentStatus: values.paymentMethod === 'cod' ? 'Pending' : 'Paid',
          note: values.note || '',
          pointUsed: 0,
        },
      };

      console.log('Order Payload:', JSON.stringify(orderPayload, null, 2));

      const orderResponse = await orderService.createOrder(orderPayload);
      console.log('Create Order Response:', JSON.stringify(orderResponse, null, 2));

      if (!orderResponse.success) {
        setNotification({ message: orderResponse.message || 'Không thể tạo đơn hàng.', type: 'error' });
        return;
      }

      const orderData = {
        cartItems: cartItems.map(item => ({
          productId: item.id,
          title: item.title,
          quantity: item.quantity || 1,
          price: item.price,
        })),
        subtotal,
        discount: 0,
        shippingFee,
        total: totalAmount,
        pointUsed: 0,
        note: values.note || '',
      };

      const paymentPayload = {
        orderId: orderResponse.data.orderId || generatedOrderId,
        amount: totalAmount,
        currency: 'VND',
        paymentMethod: values.paymentMethod,
        description: values.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản ngân hàng',
        transactionDateTime: new Date().toISOString(),
      };

      console.log('Confirm Payment Payload:', JSON.stringify(paymentPayload, null, 2));
      const confirmResponse = await orderService.confirmPayment(paymentPayload);
      console.log('Confirm Payment Response:', JSON.stringify(confirmResponse, null, 2));

      if (confirmResponse.success) {
        navigation.navigate('ConfirmPaymentScreen', {
          paymentData: { ...confirmResponse.data, orderData },
        });
      } else {
        setNotification({ message: confirmResponse.message || 'Không thể xác nhận thanh toán.', type: 'error' });
      }
    } catch (error) {
      console.error('Payment error:', error.message, error.stack);
      setNotification({ message: 'Lỗi xử lý thanh toán: ' + error.message, type: 'error' });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#E53935" />
        <Text style={styles.summaryText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {notification.message ? (
        <View style={[styles.notification, notification.type === 'error' ? styles.errorNotification : styles.successNotification]}>
          <Text style={styles.notificationText}>{notification.message}</Text>
        </View>
      ) : null}
      <Text style={styles.title}>Thanh toán đơn hàng</Text>
      <Formik
        innerRef={formikRef}
        initialValues={{
          fullName: '',
          phone: '',
          addressId: '',
          note: '',
          paymentMethod: 'cod',
        }}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting }) => {
          console.log('Formik values before submit:', JSON.stringify(values, null, 2));
          setIsLoading(true);
          processPayment(values)
            .finally(() => {
              setIsLoading(false);
              setSubmitting(false);
            });
        }}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
        }) => (
          <View style={styles.formContainer}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Thông tin giao hàng</Text>
              <AddressHandler
                navigation={navigation}
                formikRef={formikRef}
                setNotification={setNotification}
                setAddresses={setAddresses}
              />
              {touched.addressId && errors.addressId && (
                <Text style={styles.errorText}>{errors.addressId}</Text>
              )}
              <Text style={styles.label}>Họ và tên</Text>
              <TextInput
                style={styles.input}
                value={values.fullName}
                onChangeText={handleChange('fullName')}
                onBlur={handleBlur('fullName')}
                placeholder="Nhập họ và tên"
                placeholderTextColor="#999"
              />
              {touched.fullName && errors.fullName && (
                <Text style={styles.errorText}>{errors.fullName}</Text>
              )}
              <Text style={styles.label}>Số điện thoại</Text>
              <TextInput
                style={styles.input}
                value={values.phone}
                onChangeText={handleChange('phone')}
                onBlur={handleBlur('phone')}
                placeholder="Nhập số điện thoại"
                keyboardType="phone-pad"
                placeholderTextColor="#999"
              />
              {touched.phone && errors.phone && (
                <Text style={styles.errorText}>{errors.phone}</Text>
              )}
              <Text style={styles.label}>Ghi chú</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                value={values.note}
                onChangeText={handleChange('note')}
                onBlur={handleBlur('note')}
                placeholder="Ghi chú (nếu có)"
                multiline
                numberOfLines={3}
                placeholderTextColor="#999"
              />
              <Text style={styles.label}>Phương thức thanh toán</Text>
              <PaymentMethods formikRef={formikRef} />
              {touched.paymentMethod && errors.paymentMethod && (
                <Text style={styles.errorText}>{errors.paymentMethod}</Text>
              )}
            </View>
            <OrderSummary
              cartItems={cartItems}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              addressId={values.addressId}
              paymentMethod={values.paymentMethod}
            />
          </View>
        )}
      </Formik>
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
    marginBottom: 16,
    color: '#333',
  },
  formContainer: {
    flex: 1,
  },
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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  errorText: {
    color: '#E53935',
    fontSize: 12,
    marginBottom: 8,
  },
  notification: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorNotification: {
    backgroundColor: '#ffebee',
    borderColor: '#E53935',
    borderWidth: 1,
  },
  successNotification: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  notificationText: {
    fontSize: 14,
    color: '#333',
  },
  summaryText: {
    fontSize: 16,
    color: '#424242',
    flex: 1,
    flexWrap: 'wrap',
    marginRight: 8,
  },
});

export default Payment;