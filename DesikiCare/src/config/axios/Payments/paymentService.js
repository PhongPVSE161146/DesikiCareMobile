import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL_LOGIN } from '@env';

const getUserToken = async () => {
  const token = await AsyncStorage.getItem('userToken');
  if (!token) {
    throw new Error('No token found. Please log in.');
  }
  return token;
};

const axiosInstance = axios.create({
  baseURL: `${API_URL_LOGIN}/api/Order`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

const paymentService = {
  getOrderPaymentLink: async (orderId, metaData) => {
    try {
      const userToken = await getUserToken();
      const response = await axiosInstance.post(
        `/orders/${orderId}/getPaymentLink`,
        {
          metaData: {
            cancelUrl: metaData.cancelUrl,
            returnUrl: metaData.returnUrl,
          },
        },
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );

      return response.status === 200
        ? { success: true, data: response.data }
        : { success: false, message: response.data.message || 'Failed to generate payment link for order' };
    } catch (error) {
      console.error('Get order payment link error:', error.message, error.response?.data);
      return { success: false, message: error.response?.data?.message || error.message || 'Network error. Please try again.' };
    }
  },

  getCartPaymentLink: async (orderData, metaData) => {
    try {
      const userToken = await getUserToken();
      const response = await axiosInstance.post(
        '/carts/getPaymentLink',
        {
          order: {
            pointUsed: orderData.pointUsed || 0,
            deliveryAddressId: orderData.deliveryAddressId,
            cartItems: orderData.cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
            paymentMethod: orderData.paymentMethod,
            totalAmount: orderData.totalAmount,
            note: orderData.note || '',
          },
          metaData: {
            cancelUrl: metaData.cancelUrl,
            returnUrl: metaData.returnUrl,
          },
        },
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );

      return response.status === 200
        ? { success: true, data: response.data }
        : { success: false, message: response.data.message || 'Failed to generate payment link for cart' };
    } catch (error) {
      console.error('Get cart payment link error:', error.message, error.response?.data);
      return { success: false, message: error.response?.data?.message || error.message || 'Network error. Please try again.' };
    }
  },

  confirmPayment: async (paymentData) => {
    try {
      const userToken = await getUserToken();
      const response = await axiosInstance.post(
        '/confirmPayment',
        paymentData,
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );

      return response.status === 200
        ? {
            success: response.data.success,
            message: response.data.message || 'Payment confirmed successfully',
            data: response.data.data,
            code: response.data.code,
            signature: response.data.signature,
          }
        : { success: false, message: response.data.message || 'Failed to confirm payment' };
    } catch (error) {
      console.error('Confirm payment error:', error.message, error.response?.data);
      return { success: false, message: error.response?.data?.message || error.message || 'Network error. Please try again.' };
    }
  },
};

export default paymentService;