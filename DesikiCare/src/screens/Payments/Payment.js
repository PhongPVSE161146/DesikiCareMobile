import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Card, Input } from 'react-native-elements';
import { Picker } from '@react-native-picker/picker';
import QRCode from 'react-native-qrcode-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import orderService  from '../../config/axios/Order/orderService';
import paymentService from '../../config/axios/Payments/paymentService';
import { VIETQR_CLIENT_ID, VIETQR_API_KEY, CANCEL_URL, RETURN_URL } from '@env';

// Validation schema
const validationSchema = Yup.object().shape({
  fullName: Yup.string().required('Vui lòng nhập họ và tên'),
  phone: Yup.string()
    .matches(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ')
    .required('Vui lòng nhập số điện thoại'),
  address: Yup.string().required('Vui lòng nhập địa chỉ'),
  paymentMethod: Yup.string().required('Vui lòng chọn phương thức thanh toán'),
  bankId: Yup.string().when('paymentMethod', {
    is: 'bank',
    then: Yup.string().required('Vui lòng chọn ngân hàng'),
  }),
  accountNumber: Yup.string().when('paymentMethod', {
    is: 'bank',
    then: Yup.string().required('Vui lòng nhập số tài khoản'),
  }),
});

const initialRadioButtons = [
  { id: 'qr', label: 'Thanh toán qua mã QR', value: 'qr', selected: true },
  { id: 'bank', label: 'Thẻ ATM/Cơ Internet Banking', value: 'bank', selected: false },
  { id: 'international', label: 'Thẻ thanh toán quốc tế', value: 'international', selected: false },
];

const Payment = ({ route, navigation }) => {
  const { cartItems: passedCartItems } = route.params || {};
  const [isLoading, setIsLoading] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [paymentLink, setPaymentLink] = useState(null);
  const [radioButtons, setRadioButtons] = useState(initialRadioButtons);
  const [qrImageUrl, setQrImageUrl] = useState(null);
  const [banks, setBanks] = useState([]);
  const [orderId, setOrderId] = useState(`ORDER${Date.now()}`);

  const cartItems = passedCartItems?.length > 0 ? passedCartItems : [];

  // Fetch banks from VietQR API
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await orderService.get('https://api.vietqr.io/v2/banks', {
          headers: {
            'x-client-id': VIETQR_CLIENT_ID,
            'x-api-key': VIETQR_API_KEY,
          },
        });
        if (response.data.code === '00') {
          setBanks(
            response.data.data.map(bank => ({
              label: bank.shortName || bank.name,
              value: bank.bin,
            }))
          );
        } else {
          console.error('Error fetching banks:', response.data.desc);
        }
      } catch (error) {
        console.error('Error fetching banks:', error.message);
      }
    };
    fetchBanks();
  }, []);

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
    const loadUserInfo = async () => {
      const userInfo = await getUserInfo();
      setRadioButtons(initialRadioButtons);
    };
    loadUserInfo();
  }, []);

  const generateQR = async (amount, bankId, accountNumber) => {
    try {
      const response = await axiosInstance.post(
        'https://api.vietqr.io/v2/generate',
        {
          accountNo: accountNumber,
          accountName: 'YOUR_ACCOUNT_NAME', // Thay bằng tên tài khoản thực
          acqId: bankId,
          amount: amount.toString(),
          addInfo: orderId,
          template: 'compact',
        },
        {
          headers: {
            'x-client-id': VIETQR_CLIENT_ID,
            'x-api-key': VIETQR_API_KEY,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.data.code === '00') {
        return response.data.data.qrDataURL; // Base64 QR code
      } else {
        console.error('Error generating QR:', response.data.desc);
        return null;
      }
    } catch (error) {
      console.error('Error generating QR:', error.message);
      return null;
    }
  };

  const handleSubmit = async (values) => {
    if (!cartItems || cartItems.length === 0) {
      alert('Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi thanh toán.');
      return;
    }

    const metaData = {
      cancelUrl: CANCEL_URL,
      returnUrl: `${RETURN_URL}?orderId=${orderId}`,
    };

    try {
      setIsLoading(true);
      const formattedCartItems = cartItems.map(item => ({
        id: item.id,
        quantity: item.quantity,
      }));

      const totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0) + 30000;

      if (values.paymentMethod === 'qr') {
        const qrUrl = await generateQR(totalAmount, values.bankId, values.accountNumber);
        if (qrUrl) {
          setQrImageUrl(qrUrl);
          setShowQRModal(true);
        } else {
          alert('Không thể tạo mã QR.');
        }
      } else if (values.paymentMethod === 'bank') {
        const paymentResult = await paymentService.getCartPaymentLink(
          {
            pointUsed: 0,
            deliveryAddressId: values.address,
            cartItems: formattedCartItems,
          },
          metaData
        );
        if (paymentResult.success && paymentResult.data?.paymentLink) {
          setPaymentLink(paymentResult.data.paymentLink);
          setShowWebView(true);
        } else {
          alert(paymentResult.message || 'Không thể tạo link thanh toán.');
        }
      } else if (values.paymentMethod === 'international') {
        const paymentResult = await paymentService.getCartPaymentLink(
          {
            pointUsed: 0,
            deliveryAddressId: values.address,
            cartItems: formattedCartItems,
          },
          metaData
        );
        if (paymentResult.success && paymentResult.data?.paymentLink) {
          setPaymentLink(paymentResult.data.paymentLink);
          setShowWebView(true);
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

  const handleConfirmQRPayment = async (values) => {
    try {
      setIsLoading(true);
      const payload = {
        code: '00',
        desc: 'Thanh toán QR thành công',
        success: true,
        data: {
          orderCode: orderId,
          amount: cartItems.reduce((total, item) => total + item.price * item.quantity, 0) + 30000,
          description: 'Thanh toán qua QR',
          transactionDateTime: new Date().toISOString(),
          currency: 'VND',
          accountNumber: values.accountNumber || '113366668888',
          reference: '',
          paymentLinkId: '',
          counterAccountBankId: values.bankId || '970415',
          counterAccountBankName: banks.find(bank => bank.value === values.bankId)?.label || 'Vietcombank',
          counterAccountName: '',
          counterAccountNumber: '',
          virtualAccountName: '',
          virtualAccountNumber: '',
        },
        signature: 'qr_signature',
      };
      const response = await paymentService.confirmPayment(payload);
      if (response.success) {
        setShowQRModal(false);
        navigation.navigate('ConfirmPaymentScreen', { paymentData: response });
      } else {
        alert(response.message || 'Không thể xác nhận thanh toán.');
      }
    } catch (error) {
      console.error('Confirm QR payment error:', error);
      alert('Có lỗi xảy ra khi xác nhận thanh toán: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWebViewNavigation = async (navState) => {
    if (navState.url.includes('myapp://payment/success')) {
      const urlObj = new URL(navState.url);
      const params = Object.fromEntries(urlObj.searchParams);
      const payload = {
        code: '00',
        desc: 'Thanh toán thành công',
        success: true,
        data: {
          orderCode: params.orderId || orderId,
          amount: cartItems.reduce((total, item) => total + item.price * item.quantity, 0) + 30000,
          description: 'Thanh toán qua MoMo',
          transactionDateTime: new Date().toISOString(),
          currency: 'VND',
          paymentLinkId: paymentLink,
          accountNumber: '',
          reference: params.transId || '',
          counterAccountBankId: '',
          counterAccountBankName: '',
          counterAccountName: '',
          counterAccountNumber: '',
          virtualAccountName: '',
          virtualAccountNumber: '',
        },
        signature: params.signature || 'momo_signature',
      };
      const response = await paymentService.confirmPayment(payload);
      if (response.success) {
        navigation.navigate('ConfirmPaymentScreen', { paymentData: response });
      } else {
        alert(response.message || 'Không thể xác nhận thanh toán.');
      }
    } else if (navState.url.includes('myapp://payment/cancel')) {
      navigation.navigate('CartScreen');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#f06292" />
      </View>
    );
  }

  if (showWebView && paymentLink) {
    return (
      <WebView
        source={{ uri: paymentLink }}
        style={styles.webview}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error:', nativeEvent);
          alert('Lỗi khi tải trang thanh toán.');
          setShowWebView(false);
        }}
        onNavigationStateChange={handleWebViewNavigation}
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Thanh toán đơn hàng</Text>

      <Modal
        visible={showQRModal}
        animationType="slide"
        onRequestClose={() => setShowQRModal(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Quét mã QR để thanh toán</Text>
          <Card containerStyle={styles.card}>
            <Text style={styles.cardTitle}>Chi tiết đơn hàng</Text>
            {cartItems.map((item, index) => (
              <View key={index} style={styles.summaryItem}>
                <Text style={styles.summaryText}>
                  {item.title} (x{item.quantity})
                </Text>
                <Text style={styles.summaryText}>
                  {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                </Text>
              </View>
            ))}
            <View style={styles.summaryItem}>
              <Text style={styles.summaryText}>Phí giao hàng</Text>
              <Text style={styles.summaryText}>30.000₫</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryTotal}>
              <Text style={styles.summaryTotalText}>Tổng cộng:</Text>
              <Text style={styles.summaryTotalText}>
                {(
                  cartItems.reduce((total, item) => total + item.price * item.quantity, 0) + 30000
                ).toLocaleString('vi-VN')}₫
              </Text>
            </View>
          </Card>
          {qrImageUrl && (
            <View style={styles.qrContainer}>
              <QRCode value={qrImageUrl} size={200} />
            </View>
          )}
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => handleConfirmQRPayment({ bankId: cartItems.bankId, accountNumber: cartItems.accountNumber })}
          >
            <Text style={styles.confirmButtonText}>Xác nhận đã thanh toán</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              setShowQRModal(false);
              navigation.navigate('CartScreen');
            }}
          >
            <Text style={styles.closeButtonText}>Hủy</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Formik
        initialValues={{
          fullName: '',
          phone: '',
          address: '',
          note: '',
          paymentMethod: 'qr',
          bankId: '',
          accountNumber: '',
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
              {values.paymentMethod === 'bank' && (
                <View style={styles.bankContainer}>
                  <Text style={[styles.label, styles.inputLabel]}>Chọn ngân hàng</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={values.bankId}
                      onValueChange={(value) => {
                        setFieldValue('bankId', value);
                        cartItems.bankId = value; // Store bankId for confirmPayment
                      }}
                      style={styles.picker}
                    >
                      <Picker.Item label="Chọn ngân hàng" value="" />
                      {banks.map((bank) => (
                        <Picker.Item key={bank.value} label={bank.label} value={bank.value} />
                      ))}
                    </Picker>
                    {touched.bankId && errors.bankId && (
                      <Text style={styles.errorText}>{errors.bankId}</Text>
                    )}
                  </View>
                  <Input
                    label="Số tài khoản"
                    placeholder="Nhập số tài khoản"
                    value={values.accountNumber}
                    onChangeText={(text) => {
                      handleChange('accountNumber')(text);
                      cartItems.accountNumber = text; // Store accountNumber for confirmPayment
                    }}
                    onBlur={handleBlur('accountNumber')}
                    errorMessage={touched.accountNumber && errors.accountNumber}
                    keyboardType="numeric"
                    containerStyle={styles.input}
                    labelStyle={styles.inputLabel}
                    inputStyle={styles.inputText}
                    inputContainerStyle={styles.inputContainer}
                  />
                </View>
              )}
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
                  {values.paymentMethod === 'qr' ? 'Thanh toán' : 'Xác nhận đơn hàng'}
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#f2f4f7',
    padding: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
    height: 48,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#f06292',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
    height: 48,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bankContainer: {
    marginBottom: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d9d9d9',
    borderRadius: 8,
    backgroundColor: '#fafafa',
    marginBottom: 16,
  },
  picker: {
    height: 48,
    color: '#333',
  },
});

export default Payment;