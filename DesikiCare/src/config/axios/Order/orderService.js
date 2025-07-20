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
      const response = await axiosInstance.get('/carts/me', {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      console.log('getCart Raw Response:', JSON.stringify(response.data, null, 2));
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
      const response = await axiosInstance.put(`/cartItems/${cartItemId}`, { quantity }, {
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
      console.log('Adding to cart with payload:', { productId, quantity });

      const response = await axiosInstance.post('/cartItems', { productId, quantity }, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      console.log('AddCartItem API response:', JSON.stringify(response.data, null, 2));
      return response.status === 200
        ? { success: true, data: response.data, cartItemId: response.data.cartItem?._id }
        : { success: false, message: response.data.message || 'Failed to add item to cart' };
    } catch (error) {
      console.error('Add cart item error:', error.message);
      return { success: false, message: error.message || 'Network error. Please try again.' };
    }
  },

  createOrder: async (orderPayload) => {
    try {
      const userToken = await getUserToken();
      const response = await axiosInstance.post('/orders', {
        ...orderPayload,
        cartItems: orderPayload.cartItems.map((item) => ({
          productId: item.id, // Map `id` to `productId` for backend
          quantity: item.quantity,
        })),
      }, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      console.log('createOrder Response:', JSON.stringify(response.data, null, 2));
      return response.status === 201
        ? { success: true, data: response.data }
        : { success: false, message: response.data.message || 'Failed to create order' };
    } catch (error) {
      console.error('Create order error:', error.message);
      return { success: false, message: error.message || 'Network error. Please try again.' };
    }
  },

  getCartPaymentLink: async (orderData, urls) => {
    try {
      const userToken = await getUserToken();
      const response = await axiosInstance.post('/carts/getPaymentLink', {
        ...orderData,
        cartItems: orderData.cartItems.map((item) => ({
          productId: item.id, // Map `id` to `productId` for backend
          quantity: item.quantity,
        })),
        ...urls,
      }, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      console.log('getCartPaymentLink Response:', JSON.stringify(response.data, null, 2));
      return response.status === 200
        ? { success: true, data: response.data }
        : { success: false, message: response.data.message || 'Failed to get payment link' };
    } catch (error) {
      console.error('Get cart payment link error:', error.message);
      return { success: false, message: error.message || 'Network error. Please try again.' };
    }
  },

  getOrderPaymentLink: async (orderId, orderData, urls) => {
    try {
      const userToken = await getUserToken();
      const response = await axiosInstance.post(`/orders/${orderId}/getPaymentLink`, {
        ...orderData,
        cartItems: orderData.cartItems.map((item) => ({
          productId: item.id, // Map `id` to `productId` for backend
          quantity: item.quantity,
        })),
        ...urls,
      }, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      console.log('getOrderPaymentLink Response:', JSON.stringify(response.data, null, 2));
      return response.status === 200
        ? { success: true, data: response.data }
        : { success: false, message: response.data.message || 'Failed to get payment link' };
    } catch (error) {
      console.error('Get order payment link error:', error.message);
      return { success: false, message: error.message || 'Network error. Please try again.' };
    }
  },

  confirmPayment: async (paymentData) => {
    try {
      const userToken = await getUserToken();
      const response = await axiosInstance.post('/confirmPayment', paymentData, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      console.log('confirmPayment Response:', JSON.stringify(response.data, null, 2));
      return response.status === 200
        ? { success: true, data: response.data }
        : { success: false, message: response.data.message || 'Failed to confirm payment' };
    } catch (error) {
      console.error('Confirm payment error:', error.message);
      return { success: false, message: error.message || 'Network error. Please try again.' };
    }
  },

  getOrders: async () => {
    try {
      const userToken = await getUserToken();
      const response = await axiosInstance.get('/orders', {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      console.log('getOrders Response:', JSON.stringify(response.data, null, 2));
      return response.status === 200
        ? { success: true, data: response.data.orders }
        : { success: false, message: response.data.message || 'Failed to fetch orders' };
    } catch (error) {
      console.error('Get orders error:', error.message);
      return { success: false, message: error.message || 'Network error. Please try again.' };
    }
  },
};

export default orderService;