import React, { useState, useEffect, useRef } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import QRCode from 'qrcode.react';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Simulated for web
import orderService from '../../config/axios/Order/orderService';
import paymentService from '../../config/axios/Payments/paymentService';
import profileService from '../../config/axios/Home/AccountProfile/profileService';
import { VIETQR_CLIENT_ID, VIETQR_API_KEY, CANCEL_URL, RETURN_URL } from '@env';

const validationSchema = Yup.object().shape({
  fullName: Yup.string().required('Vui lòng nhập họ và tên'),
  phone: Yup.string()
    .matches(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ')
    .required('Vui lòng nhập số điện thoại'),
  addressId: Yup.string().required('Vui lòng chọn địa chỉ giao hàng'),
  paymentMethod: Yup.string().required('Vui lòng chọn phương thức thanh toán'),
});

const Payment = ({ cartItems }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [paymentLink, setPaymentLink] = useState(null);
  const [qrImageUrl, setQrImageUrl] = useState(null);
  const [banks, setBanks] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [orderId, setOrderId] = useState(`ORDER${Date.now()}`);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const formikRef = useRef(null);

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
          setBanks(response.data.data.map(bank => ({
            label: bank.shortName || bank.name,
            value: bank.bin,
          })));
        }
      } catch (error) {
        console.error('Error fetching banks:', error.message);
      }
    };
    fetchBanks();
  }, []);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await profileService.getDeliveryAddresses();
        if (response.success) {
          setAddresses(response.data);
        }
      } catch (error) {
        console.error('Error fetching addresses:', error.message);
      }
    };
    fetchAddresses();
  }, []);

  const getUserInfo = async () => {
    try {
      const userInfo = await AsyncStorage.getItem('userInfo');
      return userInfo ? JSON.parse(userInfo) : { fullName: '', phone: '' };
    } catch (error) {
      return { fullName: '', phone: '' };
    }
  };

  useEffect(() => {
    const loadUserInfo = async () => {
      const userInfo = await getUserInfo();
      formikRef.current?.setValues({
        ...formikRef.current.values,
        fullName: userInfo.fullName,
        phone: userInfo.phone,
      });
    };
    loadUserInfo();
  }, []);

  const generateQR = async (amount) => {
    try {
      const response = await orderService.post(
        'https://api.vietqr.io/v2/generate',
        {
          accountNo: '113366668888', // Default account number
          accountName: 'YOUR_ACCOUNT_NAME',
          acqId: '970415', // Default bank (Vietcombank)
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

  const handleSubmit = async (values, { setSubmitting }) => {
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

      const orderPayload = {
        pointUsed: 0,
        deliveryAddressId: values.addressId,
        cartItems: formattedCartItems,
        paymentMethod: values.paymentMethod,
        totalAmount,
      };

      if (values.paymentMethod === 'cod') {
        const orderResponse = await orderService.createOrder(orderPayload);
        if (orderResponse.success) {
          window.location.href = '/confirm-payment?success=true';
        } else {
          alert(orderResponse.message || 'Không thể tạo đơn hàng.');
        }
      } else if (values.paymentMethod === 'qr') {
        const qrUrl = await generateQR(totalAmount);
        if (qrUrl) {
          setQrImageUrl(qrUrl);
          setShowQRModal(true);
        } else {
          alert('Không thể tạo mã QR.');
        }
      } else if (values.paymentMethod === 'momo') {
        const paymentResult = await paymentService.getCartPaymentLink(orderPayload, metaData);
        if (paymentResult.success && paymentResult.data?.paymentLink) {
          setPaymentLink(paymentResult.data.paymentLink);
          window.location.href = paymentResult.data.paymentLink;
        } else {
          alert(paymentResult.message || 'Không thể tạo link thanh toán.');
        }
      }
    } catch (error) {
      alert('Có lỗi xảy ra: ' + error.message);
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  const handleConfirmQRPayment = async () => {
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
          accountNumber: '113366668888',
          reference: '',
          paymentLinkId: '',
          counterAccountBankId: '970415',
          counterAccountBankName: 'Vietcombank',
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
        window.location.href = '/confirm-payment?success=true';
      } else {
        alert(response.message || 'Không thể xác nhận thanh toán.');
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi xác nhận thanh toán: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 bg-white">
      <h1 className="text-2xl font-bold text-center mb-4">Thanh toán đơn hàng</h1>

      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold text-center mb-4">Quét mã QR để thanh toán</h2>
            <div className="p-4 bg-gray-100 rounded-lg mb-4">
              <h3 className="text-lg font-semibold mb-2">Chi tiết đơn hàng</h3>
              {cartItems.map((item, index) => (
                <div key={index} className="flex justify-between mb-2">
                  <span>{item.title} (x{item.quantity})</span>
                  <span>{(item.price * item.quantity).toLocaleString('vi-VN')}₫</span>
                </div>
              ))}
              <div className="flex justify-between mb-2">
                <span>Phí giao hàng</span>
                <span>30.000₫</span>
              </div>
              <div className="border-t border-gray-300 my-2" />
              <div className="flex justify-between font-bold">
                <span>Tổng cộng:</span>
                <span>{(cartItems.reduce((total, item) => total + item.price * item.quantity, 0) + 30000).toLocaleString('vi-VN')}₫</span>
              </div>
            </div>
            {qrImageUrl && (
              <div className="flex justify-center mb-4">
                <QRCode value={qrImageUrl} size={200} />
              </div>
            )}
            <button
              className="w-full bg-green-500 text-white py-3 rounded-lg mb-2"
              onClick={handleConfirmQRPayment}
            >
              Xác nhận đã thanh toán
            </button>
            <button
              className="w-full bg-red-500 text-white py-3 rounded-lg"
              onClick={() => setShowQRModal(false)}
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold text-center mb-4">Chọn địa chỉ giao hàng</h2>
            {addresses.map(item => (
              <div
                key={item._id}
                className="p-3 border-b border-gray-300 cursor-pointer"
                onClick={() => {
                  formikRef.current?.setValues({
                    ...formikRef.current.values,
                    addressId: item._id,
                    fullName: item.receiverName,
                    phone: item.receiverPhone,
                  });
                  setShowAddressModal(false);
                }}
              >
                <p>{item.receiverName} - {item.receiverPhone}</p>
                <p>{item.addressDetailDescription}, {item.wardName}, {item.districtName}, {item.provinceName}</p>
                {item.isDefault && <p className="text-red-500 font-medium">Mặc định</p>}
              </div>
            ))}
            {addresses.length === 0 && <p className="text-center">Chưa có địa chỉ nào</p>}
            <button
              className="w-full bg-red-500 text-white py-3 rounded-lg mt-4"
              onClick={() => setShowAddressModal(false)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}

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
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
          <div className="space-y-4">
            <div className="p-4 bg-gray-100 rounded-lg border">
              <h2 className="text-lg font-semibold mb-3">Thông tin giao hàng</h2>
              <div
                className="border border-gray-300 rounded-lg p-3 flex justify-between items-center cursor-pointer"
                onClick={() => setShowAddressModal(true)}
              >
                <span className={values.addressId ? 'text-black' : 'text-gray-500'}>
                  {addresses.find(addr => addr._id === values.addressId)
                    ? `${addresses.find(addr => addr._id === values.addressId).receiverName} - ${addresses.find(addr => addr._id === values.addressId).addressDetailDescription}, ${addresses.find(addr => addr._id === values.addressId).wardName}, ${addresses.find(addr => addr._id === values.addressId).districtName}, ${addresses.find(addr => addr._id === values.addressId).provinceName}`
                    : 'Chọn địa chỉ giao hàng'}
                </span>
                <span>▼</span>
              </div>
              {touched.addressId && errors.addressId && (
                <p className="text-red-500 text-sm">{errors.addressId}</p>
              )}
              <label className="block text-sm font-medium mt-2">Họ và tên</label>
              <input
                className="w-full border border-gray-300 rounded-lg p-3"
                value={values.fullName}
                onChange={handleChange('fullName')}
                onBlur={handleBlur('fullName')}
                placeholder="Nhập họ và tên"
              />
              {touched.fullName && errors.fullName && (
                <p className="text-red-500 text-sm">{errors.fullName}</p>
              )}
              <label className="block text-sm font-medium mt-2">Số điện thoại</label>
              <input
                className="w-full border border-gray-300 rounded-lg p-3"
                value={values.phone}
                onChange={handleChange('phone')}
                onBlur={handleBlur('phone')}
                placeholder="Nhập số điện thoại"
                type="tel"
              />
              {touched.phone && errors.phone && (
                <p className="text-red-500 text-sm">{errors.phone}</p>
              )}
              <label className="block text-sm font-medium mt-2">Ghi chú</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3"
                value={values.note}
                onChange={handleChange('note')}
                onBlur={handleBlur('note')}
                placeholder="Ghi chú (nếu có)"
                rows="3"
              />
              <label className="block text-sm font-medium mt-2">Phương thức thanh toán</label>
              <div className="space-y-2">
                {[
                  { id: 'cod', label: 'Thanh toán khi nhận hàng (COD)', value: 'cod' },
                  { id: 'qr', label: 'Thanh toán qua mã QR', value: 'qr' },
                  { id: 'momo', label: 'Thanh toán qua MoMo', value: 'momo' },
                ].map(button => (
                  <div
                    key={button.id}
                    className={`flex items-center p-3 rounded-lg border ${values.paymentMethod === button.value ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                    onClick={() => setFieldValue('paymentMethod', button.value)}
                  >
                    <span className="flex-1">{button.label}</span>
                    <div className={`w-6 h-6 rounded-full border-2 border-red-500 flex items-center justify-center ${values.paymentMethod === button.value ? 'bg-red-500' : ''}`}>
                      {values.paymentMethod === button.value && <div className="w-3 h-3 rounded-full bg-white" />}
                    </div>
                  </div>
                ))}
                {touched.paymentMethod && errors.paymentMethod && (
                  <p className="text-red-500 text-sm">{errors.paymentMethod}</p>
                )}
              </div>
            </div>
            <div className="p-4 bg-gray-100 rounded-lg border">
              <h2 className="text-lg font-semibold mb-3">Tóm tắt đơn hàng</h2>
              {cartItems && cartItems.length > 0 ? (
                cartItems.map((item, index) => (
                  <div key={index} className="flex justify-between mb-2">
                    <span>{item.title} (x{item.quantity})</span>
                    <span>{(item.price * item.quantity).toLocaleString('vi-VN')}₫</span>
                  </div>
                ))
              ) : (
                <div className="flex justify-between mb-2">
                  <span>Không có sản phẩm</span>
                  <span>0₫</span>
                </div>
              )}
              <div className="flex justify-between mb-2">
                <span>Phí giao hàng</span>
                <span>30.000₫</span>
              </div>
              <div className="border-t border-gray-300 my-2" />
              <div className="flex justify-between font-bold">
                <span>Tổng cộng:</span>
                <span>{((cartItems?.reduce((total, item) => total + item.price * item.quantity, 0) || 0) + 30000).toLocaleString('vi-VN')}₫</span>
              </div>
              <button
                onClick={handleSubmit}
                className={`w-full py-3 rounded-lg mt-4 ${isLoading ? 'bg-gray-400' : 'bg-red-500'} text-white font-semibold`}
                disabled={isLoading}
              >
                {values.paymentMethod === 'cod' ? 'Xác nhận đơn hàng' : 'Thanh toán'}
              </button>
            </div>
          </div>
        )}
      </Formik>
    </div>
  );
};

export default Payment;