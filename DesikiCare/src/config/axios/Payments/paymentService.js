// services/paymentService.js

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
  getPaymentLink: async (orderData, metaData) => {
    try {
      const userToken = await getUserToken();
      const response = await axiosInstance.post(
        '/carts/getPaymentLink',
        {
          order: {
            pointUsed: orderData.pointUsed || 0,
            deliveryAddressId: orderData.deliveryAddressId,
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
        : { success: false, message: response.data.message || 'Failed to generate payment link' };
    } catch (error) {
      console.error('Get payment link error:', error.message);
      return { success: false, message: error.message || 'Network error. Please try again.' };
    }
  },

  confirmPayment: async (orderData, metaData) => {
    try {
      const userToken = await getUserToken();
      const response = await axiosInstance.post(
        '/confirmPayment',
        {
          order: {
            fullName: orderData.fullName,
            phone: orderData.phone,
            address: orderData.address,
            note: orderData.note || '',
            paymentMethod: orderData.paymentMethod,
            cartItems: orderData.cartItems || [],
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
        ? {
            success: response.data.success,
            data: response.data.data,
            message: response.data.desc || 'Payment confirmed successfully',
            code: response.data.code,
            signature: response.data.signature,
          }
        : { success: false, message: response.data.desc || 'Failed to confirm payment' };
    } catch (error) {
      console.error('Confirm payment error:', error.message);
      return { success: false, message: error.message || 'Network error. Please try again.' };
    }
  },
};

export default paymentService;
