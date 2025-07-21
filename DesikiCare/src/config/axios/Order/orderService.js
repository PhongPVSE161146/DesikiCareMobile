import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL_LOGIN } from '@env';

const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw new Error('No authentication token found.');
    }
    console.log('Retrieved userToken:', token);
    return token;
  } catch (error) {
    console.error('Error retrieving token:', error);
    throw error;
  }
};

const axiosInstance = axios.create({
  baseURL: 'https://7ed47c8da389.ngrok-free.app/api/Order',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

const orderService = {
  createOrder: async (orderPayload) => {
    try {
      const userToken = await getAuthToken();
      if (!orderPayload.order?.deliveryAddressId) {
        throw new Error('Delivery address ID is required');
      }
      const hexRegex = /^[0-9a-fA-F]{24}$/;
      if (!hexRegex.test(orderPayload.order.deliveryAddressId)) {
        throw new Error('Delivery address ID must be a 24 character hex string');
      }

      console.log('createOrder Payload:', JSON.stringify(orderPayload, null, 2));
      console.log('Request URL:', 'https://7ed47c8da389.ngrok-free.app/api/Order/orders');
      console.log('Request Headers:', {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      });

      const response = await axiosInstance.post('/orders', orderPayload, {
        headers: { Authorization: `Bearer ${userToken}`, 'Content-Type': 'application/json' },
      });

      console.log('createOrder Response:', JSON.stringify(response.data, null, 2));
      return response.status === 201
        ? { success: true, data: response.data }
        : { success: false, message: response.data.message || 'Failed to create order' };
    } catch (error) {
      console.error('Create order error:', error.message, error.response?.data);
      console.error('Error response:', JSON.stringify(error.response?.data, null, 2));
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to create order due to server error.',
      };
    }
  },

  confirmPayment: async (paymentPayload) => {
    try {
      const userToken = await getAuthToken();
      if (!paymentPayload.orderId || !paymentPayload.amount || !paymentPayload.paymentMethod) {
        throw new Error('Missing required payment fields');
      }

      console.log('confirmPayment Payload:', JSON.stringify(paymentPayload, null, 2));
      console.log('Request URL:', 'https://7ed47c8da389.ngrok-free.app/api/Order/confirmPayment');
      console.log('Request Headers:', {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      });

      const response = await axiosInstance.post('/confirmPayment', paymentPayload, {
        headers: { Authorization: `Bearer ${userToken}`, 'Content-Type': 'application/json' },
      });

      console.log('confirmPayment Response:', JSON.stringify(response.data, null, 2));
      return response.status === 200 || response.status === 201
        ? { success: true, data: response.data }
        : { success: false, message: response.data.message || 'Failed to confirm payment' };
    } catch (error) {
      console.error('Confirm payment error:', error.message, error.response?.data);
      console.error('Error response:', JSON.stringify(error.response?.data, null, 2));
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to confirm payment due to server error.',
      };
    }
  },

  post: async (url, data, config = {}) => {
    try {
      const userToken = await getAuthToken();
      console.log(`Posting to ${url} with payload:`, JSON.stringify(data, null, 2));
      const response = await axiosInstance.post(url, data, {
        ...config,
        headers: {
          ...config.headers,
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      });
      console.log(`Response from ${url}:`, JSON.stringify(response.data, null, 2));
      return response.status === 200 || response.status === 201
        ? { success: true, data: response.data }
        : { success: false, message: response.data.message || `Failed to post to ${url}` };
    } catch (error) {
      console.error(`POST ${url} error:`, error.message, error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || error.message || `Failed to post to ${url}`,
      };
    }
  },

  getCart: async () => {
    try {
      const userToken = await getAuthToken();
      const response = await axiosInstance.get('/carts/me', {
        headers: { Authorization: `Bearer ${userToken}`, 'Content-Type': 'application/json' },
      });

      console.log('getCart Raw Response:', JSON.stringify(response.data, null, 2));
      return response.status === 200
        ? { success: true, data: response.data }
        : { success: false, message: response.data.message || 'Failed to fetch cart' };
    } catch (error) {
      console.error('Get cart error:', error.message, error.response?.data);
      return { success: false, message: error.message || 'Network error. Please try again.' };
    }
  },

  deleteCartItem: async (cartItemId) => {
    try {
      const userToken = await getAuthToken();
      const response = await axiosInstance.delete(`/cartItems/${cartItemId}`, {
        headers: { Authorization: `Bearer ${userToken}`, 'Content-Type': 'application/json' },
      });

      return response.status === 200
        ? { success: true }
        : { success: false, message: response.data.message || 'Failed to delete cart item' };
    } catch (error) {
      console.error('Delete cart item error:', error.message, error.response?.data);
      return { success: false, message: error.message || 'Network error. Please try again.' };
    }
  },

  updateCartItemQuantity: async (cartItemId, quantity) => {
    try {
      const userToken = await getAuthToken();
      const response = await axiosInstance.put(`/cartItems/${cartItemId}`, { quantity }, {
        headers: { Authorization: `Bearer ${userToken}`, 'Content-Type': 'application/json' },
      });

      return response.status === 200
        ? { success: true }
        : { success: false, message: response.data.message || 'Failed to update quantity' };
    } catch (error) {
      console.error('Update cart item quantity error:', error.message, error.response?.data);
      return { success: false, message: error.message || 'Network error. Please try again.' };
    }
  },

  addCartItem: async (productId, quantity = 1) => {
    try {
      const userToken = await getAuthToken();
      console.log('Adding to cart with payload:', { productId, quantity });

      const response = await axiosInstance.post('/cartItems', { productId, quantity }, {
        headers: { Authorization: `Bearer ${userToken}`, 'Content-Type': 'application/json' },
      });

      console.log('AddCartItem API response:', JSON.stringify(response.data, null, 2));
      return response.status === 200
        ? { success: true, data: response.data, cartItemId: response.data.cartItem?._id }
        : { success: false, message: response.data.message || 'Failed to add item to cart' };
    } catch (error) {
      console.error('Add cart item error:', error.message, error.response?.data);
      return { success: false, message: error.message || 'Network error. Please try again.' };
    }
  },

  getOrders: async () => {
    try {
      const userToken = await getAuthToken();
      const response = await axiosInstance.get('/orders', {
        headers: { Authorization: `Bearer ${userToken}`, 'Content-Type': 'application/json' },
      });

      console.log('getOrders Response:', JSON.stringify(response.data, null, 2));
      return response.status === 200
        ? { success: true, data: response.data.orders }
        : { success: false, message: response.data.message || 'Failed to fetch orders' };
    } catch (error) {
      console.error('Get orders error:', error.message, error.response?.data);
      return { success: false, message: error.message || 'Network error. Please try again.' };
    }
  },
};

export default orderService;