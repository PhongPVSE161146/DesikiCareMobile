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
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import orderService from '../../config/axios/Order/orderService';
import { CANCEL_URL, RETURN_URL } from '@env';

// Validation schema using Yup
const validationSchema = Yup.object().shape({
  fullName: Yup.string().required('Vui lòng nhập họ và tên'),
  phone: Yup.string()
    .matches(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ')
    .required('Vui lòng nhập số điện thoại'),
  address: Yup.string().required('Vui lòng nhập địa chỉ'),
  paymentMethod: Yup.string().required('Vui lòng chọn phương thức thanh toán'),
});

// Radio button options
const initialRadioButtons = [
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
    selected: false,
  },
  {
    id: 'momo',
    label: 'Ví MoMo',
    value: 'momo',
    selected: false,
  },
];

const Payment = ({ route, navigation }) => {
  const { paymentUrl, cartItems: passedCartItems } = route.params || {};
  const [isLoading, setIsLoading] = useState(!!paymentUrl);
  const [showWebView, setShowWebView] = useState(!!paymentUrl);
  const [radioButtons, setRadioButtons] = useState(initialRadioButtons);

  // Get cart items from Redux store
  const reduxCartItems = useSelector(state => state.cart.items) || [];

  // Use passed cartItems or fallback to Redux
  const cartItems = passedCartItems?.length > 0 ? passedCartItems : reduxCartItems;

  // Fetch user info from AsyncStorage
  const getUserInfo = async () => {
    try {
      const userInfo = await AsyncStorage.getItem('userInfo');
      return userInfo ? JSON.parse(userInfo) : { fullName: '', phone: '', address: '' };
    } catch (error) {
      console.error('Error fetching user info:', error.message);
      return { fullName: '', phone: '', address: '' };
    }
  };

  useEffect(() => {
    if (paymentUrl) {
      setShowWebView(true);
      setIsLoading(false);
    }
    console.log('Cart items in Payment:', cartItems);
  }, [paymentUrl, cartItems]);

  const handleSubmit = async (values) => {
  if (!cartItems || cartItems.length === 0) {
    alert('Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi thanh toán.');
    return;
  }

  const metaData = {
    cancelUrl: CANCEL_URL,
    returnUrl: RETURN_URL,
  };

  try {
    setIsLoading(true);
    const formattedCartItems = cartItems.map(item => ({
      id: item.id,
      quantity: item.quantity,
    }));

    if (values.paymentMethod === 'cod') {
      const response = await orderService.confirmPayment(
        {
          fullName: values.fullName,
          phone: values.phone,
          address: values.address,
          note: values.note || '',
          paymentMethod: 'cod',
          cartItems: formattedCartItems,
        },
        metaData
      );

      if (response.success) {
        const cartResult = await orderService.getCart();
        navigation.navigate('ConfirmPaymentScreen', { paymentData: response });
      } else {
        alert(response.message || 'Không thể xác nhận thanh toán COD.');
      }
    } else {
      // Fix: gửi đúng key là "deliveryAddress" thay vì "deliveryAddressId"
      const paymentResult = await orderService.getPaymentLink(
        {
          pointUsed: 0,
          deliveryAddress: values.address, // ✅ fix ở đây
          cartItems: formattedCartItems,
        },
        metaData
      );

      if (paymentResult.success && paymentResult.data?.paymentUrl) {
        setShowWebView(true);
        navigation.setParams({ paymentUrl: paymentResult.data.paymentUrl });
      } else {
        alert(paymentResult.message || 'Không thể tạo link thanh toán.');
      }
    }
  } catch (error) {
    console.error('Payment error:', error.message);
    alert('Có lỗi xảy ra: ' + error.message);
  } finally {
    setIsLoading(false);
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
      onNavigationStateChange={async (navState) => {
  if (navState.url.includes('success')) {
    const userInfo = await getUserInfo();
const payload = {
  fullName: userInfo.fullName || '',
  phone: userInfo.phone || '',
  deliveryAddress: userInfo.address || '', // ✅ đúng field name
  note: '',
  pointUsed: 0,
  paymentMethod: 'online',
  cartItems: cartItems.map(item => ({
    id: item.id,
    quantity: item.quantity,
  })),
};



    orderService
      .confirmPayment(payload, { cancelUrl: CANCEL_URL, returnUrl: RETURN_URL })
      .then((response) => {
        if (response.success) {
          orderService.getCart();
          navigation.navigate('ConfirmPaymentScreen', { paymentData: response });
        } else {
          alert(response.message || 'Không thể xác nhận thanh toán.');
        }
      })
      .catch((error) => {
        console.error('Confirm payment error:', error.message);
        alert('Lỗi xác nhận thanh toán: ' + error.message);
      });
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
                {radioButtons.map((button) => (
  <TouchableOpacity
    key={button.id}
    style={[
      styles.radioButton,
      button.selected && styles.radioButtonSelected,
    ]}
    onPress={() => {
      const updatedButtons = radioButtons.map((b) => ({
        ...b,
        selected: b.id === button.id,
      }));
      setRadioButtons(updatedButtons);
      setFieldValue('paymentMethod', button.value);
    }}
  >
    <Text style={styles.radioLabel}>{button.label}</Text>
    <View style={styles.radioCircle}>
      {button.selected && <View style={styles.radioInnerCircle} />}
    </View>
  </TouchableOpacity>
))}

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
                    <Text style={styles.summaryText}>
                      {item.title} (x{item.quantity})
                    </Text>
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
                style={[styles.submitButton, isLoading && styles.disabledButton]}
                activeOpacity={0.8}
                disabled={isLoading}
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
    fontWeight: '700',
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
    padding: 20,
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
    color: '#333',
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#d9d9d9',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fafafa',
  },
  textAreaContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#d9d9d9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 80,
    backgroundColor: '#fafafa',
    color: '#333',
  },
  radioContainer: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginLeft: -12, // Adjust to match card padding
    marginRight: -12, // Adjust to match card padding
    
  },
  radioGroup: {
    marginTop: 9,
    marginStart: 8,
    marginEnd: 8,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
  },
  
radioButton: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderRadius: 8,
  marginBottom: 8,
  backgroundColor: '#fff',
  borderWidth: 1,
  borderColor: '#e0e0e0',
},

radioButtonSelected: {
  borderColor: '#f06292',
  backgroundColor: '#fff0f5',
},

radioLabel: {
  flex: 1,
  fontSize: 16,
  color: '#333',
},

radioCircle: {
  width: 24,
  height: 24,
  borderRadius: 12,
  borderWidth: 2,
  borderColor: '#f06292',
  justifyContent: 'center',
  alignItems: 'center',
},

radioInnerCircle: {
  width: 12,
  height: 12,
  borderRadius: 6,
  backgroundColor: '#f06292',
},

  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
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
    paddingTop: 12,
  },
  summaryTotalText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#f06292',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
    height: 48,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
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