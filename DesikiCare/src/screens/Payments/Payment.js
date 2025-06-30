import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Card, Input } from 'react-native-elements';
import RadioGroup from 'react-native-radio-buttons-group';
import orderService from '../../config/axios/Order/orderService';
import { CANCEL_URL, RETURN_URL } from '@env';

// Validation schema using Yup
const validationSchema = Yup.object().shape({
  fullName: Yup.string().required('Vui lòng nhập họ và tên'),
  phone: Yup.string().required('Vui lòng nhập số điện thoại'),
  address: Yup.string().required('Vui lòng nhập địa chỉ'),
  paymentMethod: Yup.string().required('Vui lòng chọn phương thức thanh toán'),
});

// Radio button options
const radioButtonsData = [
  {
    id: 'cod',
    label: 'Thanh toán khi nhận hàng (COD)',
    value: 'cod',
    selected: true,
  },
  {
    id: 'bank',
    label: 'Chuyển khoản ngân hàng',
    value: 'bank',
  },
  {
    id: 'momo',
    label: 'Ví MoMo',
    value: 'momo',
  },
];

const Payment = ({ route, navigation }) => {
  const { paymentUrl, cartItems } = route.params || {};
  const [isLoading, setIsLoading] = useState(!!paymentUrl);
  const [showWebView, setShowWebView] = useState(!!paymentUrl);

  useEffect(() => {
    if (paymentUrl) {
      setShowWebView(true);
      setIsLoading(false);
    }
  }, [paymentUrl]);

  const handleSubmit = async (values) => {
    const metaData = {
      cancelUrl: CANCEL_URL,
      returnUrl: RETURN_URL,
    };

    if (values.paymentMethod === 'cod') {
      try {
        setIsLoading(true);
        const response = await orderService.confirmPayment(
          {
            fullName: values.fullName,
            phone: values.phone,
            address: values.address,
            note: values.note || '',
            paymentMethod: 'cod',
            cartItems: cartItems || [],
          },
          metaData
        );

        if (response.success) {
          navigation.navigate('ConfirmPaymentScreen', { paymentData: response });
        } else {
          alert(response.message || 'Không thể xác nhận thanh toán COD.');
        }
      } catch (error) {
        console.error('COD payment error:', error);
        alert('Có lỗi xảy ra khi xác nhận thanh toán COD: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    } else {
      try {
        setIsLoading(true);
        const paymentResult = await orderService.getPaymentLink(
          { pointUsed: 0, deliveryAddressId: values.address },
          metaData
        );

        if (paymentResult.success && paymentResult.data.paymentUrl) {
          setShowWebView(true);
        } else {
          alert(paymentResult.message || 'Không thể tạo link thanh toán.');
        }
      } catch (error) {
        console.error('Payment link error:', error);
        alert('Có lỗi xảy ra khi tạo link thanh toán: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#f06292" />
      </View>
    );
  }

  if (showWebView && paymentUrl) {
    return (
      <WebView
        source={{ uri: paymentUrl }}
        style={styles.webview}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error:', nativeEvent);
          alert('Lỗi khi tải trang thanh toán.');
          setShowWebView(false);
        }}
        onNavigationStateChange={(navState) => {
          if (navState.url.includes('success')) {
            orderService
              .confirmPayment(
                {
                  fullName: '', // Thay bằng thông tin người dùng nếu có
                  phone: '',
                  address: '',
                  paymentMethod: route.params?.paymentMethod || 'online',
                  cartItems: cartItems || [],
                },
                {
                  cancelUrl: CANCEL_URL,
                  returnUrl: RETURN_URL,
                }
              )
              .then((response) => {
                if (response.success) {
                  navigation.navigate('ConfirmPaymentScreen', { paymentData: response });
                } else {
                  alert(response.message || 'Không thể xác nhận thanh toán.');
                }
              })
              .catch((error) => {
                console.error('Confirm payment error:', error);
                alert('Lỗi xác nhận thanh toán: ' + error.message);
              });
          } else if (navState.url.includes('cancel')) {
            navigation.goBack();
          }
        }}
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Thanh toán đơn hàng</Text>

      <Formik
        initialValues={{
          fullName: '',
          phone: '',
          address: '',
          note: '',
          paymentMethod: 'cod',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          setFieldValue,
          values,
          errors,
          touched,
        }) => (
          <View style={styles.formContainer}>
            <Card containerStyle={styles.card}>
              <Text style={styles.cardTitle}>Thông tin giao hàng</Text>

              <Input
                label="Họ và tên"
                placeholder="Nhập họ và tên"
                value={values.fullName}
                onChangeText={handleChange('fullName')}
                onBlur={handleBlur('fullName')}
                errorMessage={touched.fullName && errors.fullName}
                containerStyle={styles.input}
                labelStyle={styles.inputLabel}
                inputStyle={styles.inputText}
                inputContainerStyle={styles.inputContainer}
              />

              <Input
                label="Số điện thoại"
                placeholder="Nhập số điện thoại"
                value={values.phone}
                onChangeText={handleChange('phone')}
                onBlur={handleBlur('phone')}
                errorMessage={touched.phone && errors.phone}
                keyboardType="phone-pad"
                containerStyle={styles.input}
                labelStyle={styles.inputLabel}
                inputStyle={styles.inputText}
                inputContainerStyle={styles.inputContainer}
              />

              <Input
                label="Địa chỉ giao hàng"
                placeholder="Nhập địa chỉ"
                value={values.address}
                onChangeText={handleChange('address')}
                onBlur={handleBlur('address')}
                errorMessage={touched.address && errors.address}
                containerStyle={styles.input}
                labelStyle={styles.inputLabel}
                inputStyle={styles.inputText}
                inputContainerStyle={styles.inputContainer}
              />

              <View style={styles.textAreaContainer}>
                <Text style={[styles.label, styles.inputLabel]}>Ghi chú</Text>
                <TextInput
                  placeholder="Ghi chú (nếu có)"
                  value={values.note}
                  onChangeText={handleChange('note')}
                  onBlur={handleBlur('note')}
                  multiline
                  numberOfLines={3}
                  style={styles.textArea}
                />
              </View>

              <View style={styles.radioContainer}>
                <Text style={[styles.label, styles.inputLabel]}>Phương thức thanh toán</Text>
                <RadioGroup
                  radioButtons={radioButtonsData}
                  onPress={(data) => {
                    const selected = data.find((item) => item.selected);
                    if (selected) {
                      setFieldValue('paymentMethod', selected.value);
                    }
                  }}
                  layout="column"
                  containerStyle={styles.radioGroup}
                />
                {touched.paymentMethod && errors.paymentMethod && (
                  <Text style={styles.errorText}>{errors.paymentMethod}</Text>
                )}
              </View>
            </Card>

            <Card containerStyle={styles.card}>
              <Text style={styles.cardTitle}>Tóm tắt đơn hàng</Text>

              {cartItems && cartItems.length > 0 ? (
                cartItems.map((item, index) => (
                  <View key={index} style={styles.summaryItem}>
                    <Text style={styles.summaryText}>{item.title}</Text>
                    <Text style={styles.summaryText}>
                      {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                    </Text>
                  </View>
                ))
              ) : (
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryText}>Không có sản phẩm</Text>
                  <Text style={styles.summaryText}>0₫</Text>
                </View>
              )}
              <View style={styles.summaryItem}>
                <Text style={styles.summaryText}>Phí giao hàng</Text>
                <Text style={styles.summaryText}>30.000₫</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryTotal}>
                <Text style={styles.summaryTotalText}>Tổng cộng:</Text>
                <Text style={styles.summaryTotalText}>
                  {(
                    (cartItems?.reduce((total, item) => total + item.price * item.quantity, 0) || 0) + 30000
                  ).toLocaleString('vi-VN')}₫
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleSubmit}
                style={styles.submitButton}
                activeOpacity={0.8}
              >
                <Text style={styles.submitButtonText}>
                  {values.paymentMethod === 'cod' ? 'Xác nhận đơn hàng' : 'Thanh toán'}
                </Text>
              </TouchableOpacity>
            </Card>
          </View>
        )}
      </Formik>
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
  formContainer: {
    flex: 1,
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
  input: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  inputText: {
    fontSize: 16,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#d9d9d9',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  textAreaContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#d9d9d9',
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    height: 80,
  },
  radioContainer: {
    marginBottom: 16,
  },
  radioGroup: {
    marginTop: 8,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 15,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  summaryTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  summaryTotalText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
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
  webview: {
    flex: 1,
  },
});

export default Payment;