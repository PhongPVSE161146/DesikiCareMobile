import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL_LOGIN } from '@env';

// Hàm tiện ích để lấy token
const getUserToken = async () => {
  const token = await AsyncStorage.getItem('userToken');
  if (!token) {
    throw new Error('No token found. Please log in.');
  }
  return token;
};

// Cấu hình axios chung
const axiosInstance = axios.create({
  baseURL: `${API_URL_LOGIN}/api/Order`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

const orderService = {
  getCart: async () => {
    try {
      const userToken = await getUserToken();
      console.log('Fetching cart from:', `${API_URL_LOGIN}/api/Order/carts/me`);
      const response = await axiosInstance.get('/carts/me', {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      console.log('getCart Raw Response:', response.data);
      return response.status === 200
        ? { success: true, data: response.data }
        : { success: false, message: response.data.message || 'Failed to fetch cart' };
    } catch (error) {
      console.error('Get cart error:', error.message);
      return { success: false, message: error.message || 'Network error. Please try again.' };
    }
  },

  deleteCartItem: async (cartItemId) => {
    try {
      const userToken = await getUserToken();
      const response = await axiosInstance.delete(`/cartItems/${cartItemId}`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      return response.status === 200
        ? { success: true }
        : { success: false, message: response.data.message || 'Failed to delete cart item' };
    } catch (error) {
      console.error('Delete cart item error:', error.message);
      return { success: false, message: error.message || 'Network error. Please try again.' };
    }
  },

  updateCartItemQuantity: async (cartItemId, quantity) => {
    try {
      const userToken = await getUserToken();
      console.log('Updating cart item quantity:', { cartItemId, quantity });
      const response = await axiosInstance.patch(`/cartItems/${cartItemId}`, { quantity }, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      return response.status === 200
        ? { success: true }
        : { success: false, message: response.data.message || 'Failed to update quantity' };
    } catch (error) {
      console.error('Update cart item quantity error:', error.message);
      return { success: false, message: error.message || 'Network error. Please try again.' };
    }
  },

  addCartItem: async (productId, quantity = 1) => {
    try {
      const userToken = await getUserToken();
      console.log('Adding cart item:', { productId, quantity });
      const response = await axiosInstance.post('/cartItems', { productId, quantity }, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      return response.status === 200
        ? { success: true, data: response.data }
        : { success: false, message: response.data.message || 'Failed to add item to cart' };
    } catch (error) {
      console.error('Add cart item error:', error.message);
      return { success: false, message: error.message || 'Network error. Please try again.' };
    }
  },

  getPaymentLink: async (orderData, metaData) => {
    try {
      const userToken = await getUserToken();
      console.log('Generating payment link with:', { orderData, metaData });
      const response = await axiosInstance.post('/carts/getPaymentLink', {
        order: {
          pointUsed: orderData.pointUsed || 0,
          deliveryAddressId: orderData.deliveryAddressId,
        },
        metaData: {
          cancelUrl: metaData.cancelUrl,
          returnUrl: metaData.returnUrl,
        },
      }, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

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
      console.log('Confirming payment with:', { orderData, metaData });
      const response = await axiosInstance.post('/confirmPayment', {
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
      }, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

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

export default orderService;