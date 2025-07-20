import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Formik } from 'formik';
import * as Yup from 'yup';
import QRCode from 'react-native-qrcode-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import orderService from '../../config/axios/Order/orderService';
import paymentService from '../../config/axios/Payments/paymentService';
import profileService from '../../config/axios/Home/AccountProfile/profileService';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { VIETQR_CLIENT_ID, VIETQR_API_KEY, CANCEL_URL, RETURN_URL } from '@env';

// Validation schema
const validationSchema = Yup.object().shape({
  fullName: Yup.string().required('Vui lòng nhập họ và tên'),
  phone: Yup.string()
    .matches(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ')
    .required('Vui lòng nhập số điện thoại'),
  addressId: Yup.string().required('Vui lòng chọn địa chỉ giao hàng'),
  paymentMethod: Yup.string().required('Vui lòng chọn phương thức thanh toán'),
});

const initialRadioButtons = [
  { id: 'cod', label: 'Thanh toán khi nhận hàng (COD)', value: 'cod', selected: true },
  { id: 'qr', label: 'Thanh toán qua mã QR', value: 'qr', selected: false },
  { id: 'momo', label: 'Thanh toán qua MoMo', value: 'momo', selected: false },
];

// Cache for provinces, districts, and wards
const cache = {
  provinces: null,
  districts: {},
  wards: {},
};

const Payment = ({ route, navigation }) => {
  const { cartItems: passedCartItems } = route.params || {};
  const [isLoading, setIsLoading] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [paymentLink, setPaymentLink] = useState(null);
  const [radioButtons, setRadioButtons] = useState(initialRadioButtons);
  const [qrString, setQrString] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [orderId, setOrderId] = useState(`ORDER${Date.now()}`);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const formikRef = useRef(null);

  const cartItems = passedCartItems?.length > 0 ? passedCartItems : [];

  // Map province, district, ward codes to names
  const mapCodeToName = async (provinceCode, districtCode, wardCode) => {
    try {
      const pCode = Number(provinceCode);
      const dCode = Number(districtCode);
      const wCode = Number(wardCode);

      if (!cache.provinces) {
        const response = await axios.get('https://provinces.open-api.vn/api/p/');
        cache.provinces = response.data || [];
      }
      const province = cache.provinces.find((p) => p.code === pCode)?.name || 'Tỉnh không xác định';

      if (!cache.districts[pCode]) {
        const response = await axios.get(`https://provinces.open-api.vn/api/p/${pCode}?depth=2`);
        cache.districts[pCode] = response.data.districts || [];
      }
      const district = cache.districts[pCode].find((d) => d.code === dCode)?.name || 'Quận/Huyện không xác định';

      if (!cache.wards[dCode]) {
        const response = await axios.get(`https://provinces.open-api.vn/api/d/${dCode}?depth=2`);
        cache.wards[dCode] = response.data.wards || [];
      }
      const ward = cache.wards[dCode].find((w) => w.code === wCode)?.name || 'Phường/Xã không xác định';

      return { province, district, ward };
    } catch (error) {
      console.error('Lỗi ánh xạ mã địa chỉ:', error);
      return {
        province: 'Tỉnh không xác định',
        district: 'Quận/Huyện không xác định',
        ward: 'Phường/Xã không xác định',
      };
    }
  };

  // Fetch provinces
  const fetchProvinces = async () => {
    try {
      if (!cache.provinces) {
        const response = await axios.get('https://provinces.open-api.vn/api/p/');
        cache.provinces = response.data || [];
      }
    } catch (error) {
      console.error('Lỗi tải danh sách tỉnh/thành phố:', error);
      setNotification({ message: 'Không thể tải danh sách tỉnh/thành phố.', type: 'error' });
    }
  };

  // Fetch delivery addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      setIsLoading(true);
      try {
        await fetchProvinces();
        const response = await profileService.getDeliveryAddresses();
        console.log('getDeliveryAddresses Response:', JSON.stringify(response, null, 2));
        if (response.success && response.data?.length > 0) {
          const mappedAddresses = await Promise.all(
            response.data.map(async (address) => {
              const { province, district, ward } = await mapCodeToName(
                address.provinceCode,
                address.districtCode,
                address.wardCode
              );
              return {
                ...address,
                provinceName: province,
                districtName: district,
                wardName: ward,
              };
            })
          );
          setAddresses(mappedAddresses);
          const defaultAddress = mappedAddresses.find((addr) => addr.isDefault);
          if (defaultAddress && formikRef.current) {
            formikRef.current.setValues({
              ...formikRef.current.values,
              addressId: defaultAddress._id,
              fullName: defaultAddress.receiverName,
              phone: defaultAddress.receiverPhone,
            });
          } else {
            setNotification({
              message: 'Không có địa chỉ mặc định. Vui lòng chọn hoặc thêm địa chỉ.',
              type: 'error',
            });
            setShowAddressModal(true);
          }
        } else {
          setNotification({
            message: 'Không có địa chỉ giao hàng. Vui lòng thêm địa chỉ mới.',
            type: 'error',
          });
          setShowAddressModal(true);
        }
      } catch (error) {
        console.error('Lỗi tải địa chỉ:', error);
        setNotification({ message: 'Không thể tải danh sách địa chỉ: ' + error.message, type: 'error' });
        setShowAddressModal(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAddresses();
  }, []);

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
        setRadioButtons(initialRadioButtons);
      } catch (error) {
        console.error('Error fetching user info:', error.message);
        setNotification({ message: 'Không thể tải thông tin người dùng.', type: 'error' });
      }
    };
    loadUserInfo();
  }, []);

  // Generate QR code
  const generateQR = async (amount) => {
    try {
      const response = await orderService.post(
        'https://api.vietqr.io/v2/generate',
        {
          accountNo: '113366668888',
          accountName: 'YOUR_ACCOUNT_NAME',
          acqId: '970415',
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
      return response.data.code === '00' ? response.data.data.qrDataURL : null;
    } catch (error) {
      console.error('Error generating QR:', error.message);
      return null;
    }
  };

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    if (!cartItems || cartItems.length === 0) {
      setNotification({ message: 'Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi thanh toán.', type: 'error' });
      return;
    }

    if (!values.addressId || !addresses.find((addr) => addr._id === values.addressId)) {
      setNotification({ message: 'Vui lòng chọn một địa chỉ giao hàng hợp lệ.', type: 'error' });
      setShowAddressModal(true);
      return;
    }

    const metaData = {
      cancelUrl: CANCEL_URL,
      returnUrl: `${RETURN_URL}?orderId=${orderId}`,
    };

    try {
      setIsLoading(true);
      const formattedCartItems = cartItems.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0) + 30000;

      const orderPayload = {
        pointUsed: 0,
        deliveryAddressId: values.addressId,
        cartItems: formattedCartItems,
        paymentMethod: values.paymentMethod,
        totalAmount,
        note: values.note || '',
      };

      console.log('Order Payload (flat):', JSON.stringify(orderPayload, null, 2));

      if (values.paymentMethod === 'cod') {
        const orderResponse = await orderService.createOrder(orderPayload);
        if (orderResponse.success) {
          const payload = {
            code: '00',
            desc: 'Xác nhận đơn hàng COD thành công',
            success: true,
            data: {
              orderCode: orderId,
              amount: totalAmount,
              description: 'Thanh toán khi nhận hàng (COD)',
              accountNumber: '',
              reference: '',
              transactionDateTime: new Date().toISOString(),
              currency: 'VND',
              paymentLinkId: '',
              code: '00',
              desc: 'Xác nhận đơn hàng COD',
              counterAccountBankId: '',
              counterAccountBankName: '',
              counterAccountName: '',
              counterAccountNumber: '',
              virtualAccountName: '',
              virtualAccountNumber: '',
            },
            signature: 'cod_signature',
          };
          const confirmResponse = await orderService.post('/api/Order/confirmPayment', payload);
          if (confirmResponse.success) {
            navigation.navigate('ConfirmPaymentScreen', { paymentData: confirmResponse });
          } else {
            setNotification({ message: confirmResponse.message || 'Không thể xác nhận thanh toán COD.', type: 'error' });
          }
        } else {
          setNotification({ message: orderResponse.message || 'Không thể tạo đơn hàng.', type: 'error' });
        }
      } else if (values.paymentMethod === 'qr') {
        const qrUrl = await generateQR(totalAmount);
        if (qrUrl) {
          setQrString(qrUrl);
          setShowQRModal(true);
        } else {
          setNotification({ message: 'Không thể tạo mã QR.', type: 'error' });
        }
      } else if (values.paymentMethod === 'momo') {
        const paymentResult = await paymentService.getCartPaymentLink({ order: orderPayload }, metaData);
        if (paymentResult.success && paymentResult.data?.paymentLink) {
          setPaymentLink(paymentResult.data.paymentLink);
          setShowWebView(true);
        } else {
          setNotification({ message: paymentResult.message || 'Không thể tạo link thanh toán.', type: 'error' });
        }
      }
    } catch (error) {
      console.error('Payment error:', error.message, error.response?.data);
      setNotification({ message: 'Có lỗi xảy ra: ' + (error.response?.data?.message || error.message), type: 'error' });
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  // Handle QR payment confirmation
  const handleConfirmQRPayment = async () => {
    try {
      setIsLoading(true);
      const totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0) + 30000;
      const payload = {
        code: '00',
        desc: 'Thanh toán QR thành công',
        success: true,
        data: {
          orderCode: orderId,
          amount: totalAmount,
          description: 'Thanh toán qua QR',
          accountNumber: '113366668888',
          reference: '',
          transactionDateTime: new Date().toISOString(),
          currency: 'VND',
          paymentLinkId: '',
          code: '00',
          desc: 'Thanh toán QR thành công',
          counterAccountBankId: '970415',
          counterAccountBankName: 'Vietcombank',
          counterAccountName: '',
          counterAccountNumber: '',
          virtualAccountName: '',
          virtualAccountNumber: '',
        },
        signature: 'qr_signature',
      };
      const response = await orderService.post('/api/Order/confirmPayment', payload);
      if (response.success) {
        setShowQRModal(false);
        navigation.navigate('ConfirmPaymentScreen', { paymentData: response });
      } else {
        setNotification({ message: response.message || 'Không thể xác nhận thanh toán.', type: 'error' });
      }
    } catch (error) {
      console.error('Confirm QR payment error:', error);
      setNotification({ message: 'Có lỗi xảy ra khi xác nhận thanh toán: ' + error.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle WebView navigation for MoMo
  const handleWebViewNavigation = async (navState) => {
    if (navState.url.includes('myapp://payment/success')) {
      const urlObj = new URL(navState.url);
      const params = Object.fromEntries(urlObj.searchParams);
      const totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0) + 30000;
      const payload = {
        code: '00',
        desc: 'Thanh toán thành công',
        success: true,
        data: {
          orderCode: params.orderId || orderId,
          amount: totalAmount,
          description: 'Thanh toán qua MoMo',
          accountNumber: '',
          reference: params.transId || '',
          transactionDateTime: new Date().toISOString(),
          currency: 'VND',
          paymentLinkId: paymentLink,
          code: '00',
          desc: 'Thanh toán MoMo thành công',
          counterAccountBankId: '',
          counterAccountBankName: '',
          counterAccountName: '',
          counterAccountNumber: '',
          virtualAccountName: '',
          virtualAccountNumber: '',
        },
        signature: params.signature || 'momo_signature',
      };
      const response = await orderService.post('/api/Order/confirmPayment', payload);
      if (response.success) {
        setShowWebView(false);
        navigation.navigate('ConfirmPaymentScreen', { paymentData: response });
      } else {
        setNotification({ message: response.message || 'Không thể xác nhận thanh toán.', type: 'error' });
      }
    } else if (navState.url.includes('myapp://payment/cancel')) {
      setShowWebView(false);
      navigation.navigate('CartScreen');
    }
  };

  // Render address item for modal
  const renderAddressItem = ({ item }) => (
    <TouchableOpacity
      style={styles.addressItem}
      onPress={() => {
        setShowAddressModal(false);
        formikRef.current?.setValues({
          ...formikRef.current.values,
          addressId: item._id,
          fullName: item.receiverName,
          phone: item.receiverPhone,
        });
      }}
    >
      <Text style={styles.addressText}>
        {item.receiverName} - {item.receiverPhone}
      </Text>
      <Text style={styles.addressText}>
        {item.addressDetailDescription}, {item.wardName}, {item.districtName}, {item.provinceName}
      </Text>
      {item.isDefault && <Text style={styles.defaultText}>Mặc định</Text>}
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#E53935" />
        <Text style={styles.summaryText}>Đang tải...</Text>
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
          setNotification({ message: 'Lỗi khi tải trang thanh toán.', type: 'error' });
          setShowWebView(false);
        }}
        onNavigationStateChange={handleWebViewNavigation}
      />
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

      <Modal
        visible={showQRModal}
        animationType="slide"
        onRequestClose={() => setShowQRModal(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Quét mã QR để thanh toán</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Chi tiết đơn hàng</Text>
            {cartItems.map((item, index) => (
              <View key={index} style={styles.summaryItem}>
                <Text style={styles.summaryText}>
                  {item.title} (x{item.quantity})
                </Text>
                <Text style={styles.summaryPrice}>
                  {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                </Text>
              </View>
            ))}
            <View style={styles.summaryItem}>
              <Text style={styles.summaryText}>Phí giao hàng</Text>
              <Text style={styles.summaryPrice}>30.000₫</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryTotal}>
              <Text style={styles.summaryTotalText}>Tổng cộng:</Text>
              <Text style={styles.summaryTotalPrice}>
                {(cartItems.reduce((total, item) => total + item.price * item.quantity, 0) + 30000).toLocaleString('vi-VN')}₫
              </Text>
            </View>
          </View>
          {qrString ? (
            <View style={styles.qrContainer}>
              <QRCode value={qrString} size={200} />
            </View>
          ) : (
            <Text style={styles.summaryText}>Đang tạo mã QR...</Text>
          )}
          <TouchableOpacity
            style={[styles.confirmButton, isLoading && styles.disabledButton]}
            onPress={handleConfirmQRPayment}
            disabled={isLoading}
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

      <Modal
        visible={showAddressModal}
        animationType="slide"
        onRequestClose={() => {
          if (addresses.length === 0) {
            setNotification({ message: 'Vui lòng thêm địa chỉ mới trước khi tiếp tục.', type: 'error' });
          } else {
            setShowAddressModal(false);
          }
        }}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Chọn địa chỉ giao hàng</Text>
          <FlatList
            data={addresses}
            renderItem={renderAddressItem}
            keyExtractor={(item) => item._id}
            ListEmptyComponent={<Text style={styles.summaryText}>Chưa có địa chỉ nào</Text>}
          />
          <TouchableOpacity
            style={styles.addAddressButton}
            onPress={async () => {
              setShowAddressModal(false);
              const userInfo = await AsyncStorage.getItem('userInfo');
              const accountId = userInfo ? JSON.parse(userInfo).accountId : null;
              if (!accountId) {
                setNotification({ message: 'Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại.', type: 'error' });
                return;
              }
              navigation.navigate('DeliveryAddressScreen', { accountId });
            }}
          >
            <Text style={styles.addAddressButtonText}>Thêm địa chỉ mới</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              if (addresses.length === 0) {
                setNotification({ message: 'Vui lòng thêm địa chỉ mới trước khi tiếp tục.', type: 'error' });
              } else {
                setShowAddressModal(false);
              }
            }}
          >
            <Text style={styles.closeButtonText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </Modal>

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
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Thông tin giao hàng</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowAddressModal(true)}
              >
                <Text style={values.addressId ? styles.inputText : styles.placeholderText}>
                  {addresses.find((addr) => addr._id === values.addressId)
                    ? `${addresses.find((addr) => addr._id === values.addressId).receiverName} - ${
                        addresses.find((addr) => addr._id === values.addressId).addressDetailDescription
                      }, ${addresses.find((addr) => addr._id === values.addressId).wardName}, ${
                        addresses.find((addr) => addr._id === values.addressId).districtName
                      }, ${addresses.find((addr) => addr._id === values.addressId).provinceName}`
                    : 'Chọn địa chỉ giao hàng'}
                </Text>
                <Icon name="arrow-drop-down" size={24} color="#E53935" />
              </TouchableOpacity>
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
              <View style={styles.radioContainer}>
                {radioButtons.map((button) => (
                  <TouchableOpacity
                    key={button.id}
                    style={[styles.radioButton, button.selected && styles.radioButtonSelected]}
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
            </View>
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
                <Text style={styles.summaryPrice}>30.000₫</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryTotal}>
                <Text style={styles.summaryTotalText}>Tổng cộng:</Text>
                <Text style={styles.summaryTotalPrice}>
                  {(cartItems.reduce((total, item) => total + item.price * item.quantity, 0) + 30000).toLocaleString('vi-VN')}₫
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleSubmit}
                style={[styles.submitButton, isLoading || !values.addressId ? styles.disabledButton : null]}
                activeOpacity={0.8}
                disabled={isLoading || !values.addressId}
              >
                <Text style={styles.submitButtonText}>
                  {values.paymentMethod === 'cod' ? 'Xác nhận đơn hàng' : 'Thanh toán'}
                </Text>
              </TouchableOpacity>
            </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  radioContainer: {
    marginBottom: 12,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  radioButtonSelected: {
    borderColor: '#E53935',
    backgroundColor: '#ffebee',
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
    borderColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInnerCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E53935',
  },
  errorText: {
    color: '#E53935',
    fontSize: 12,
    marginBottom: 8,
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
  webview: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    paddingTop: 50,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
    backgroundColor: '#c47385ff',
    padding: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
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
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#E53935',
    borderRadius: 40,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  addAddressButton: {
    backgroundColor: '#E53935',
    borderRadius: 40,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  addAddressButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  addressItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  addressText: {
    fontSize: 15,
    color: '#333',
  },
  defaultText: {
    fontSize: 14,
    color: '#E53935',
    fontWeight: '500',
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
});

export default Payment;