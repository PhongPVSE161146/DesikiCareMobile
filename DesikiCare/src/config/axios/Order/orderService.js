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
      // Validate payload
      if (!orderPayload.deliveryAddressId) {
        throw new Error('Delivery address ID is required');
      }
      if (!orderPayload.cartItems || !orderPayload.cartItems.length) {
        throw new Error('Cart items are required');
      }
      if (!orderPayload.paymentMethod) {
        throw new Error('Payment method is required');
      }
      if (typeof orderPayload.totalAmount !== 'number' || orderPayload.totalAmount <= 0) {
        throw new Error('Invalid total amount');
      }

      const payload = {
        pointUsed: orderPayload.pointUsed || 0,
        deliveryAddressId: orderPayload.deliveryAddressId,
        cartItems: orderPayload.cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        paymentMethod: orderPayload.paymentMethod,
        totalAmount: orderPayload.totalAmount,
        note: orderPayload.note || '',
      };

      console.log('createOrder Payload:', JSON.stringify(payload, null, 2));

      const response = await axiosInstance.post('/orders', payload, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      console.log('createOrder Response:', JSON.stringify(response.data, null, 2));
      return response.status === 201
        ? { success: true, data: response.data }
        : { success: false, message: response.data.message || 'Failed to create order' };
    } catch (error) {
      console.error('Create order error:', error.message, error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to create order due to server error.',
      };
    }
  },

  getCartPaymentLink: async (orderData, urls) => {
    try {
      const userToken = await getUserToken();
      const response = await axiosInstance.post('/carts/getPaymentLink', {
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
        metaData: urls,
      }, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      console.log('getCartPaymentLink Response:', JSON.stringify(response.data, null, 2));
      return response.status === 200
        ? { success: true, data: response.data }
        : { success: false, message: response.data.message || 'Failed to get payment link' };
    } catch (error) {
      console.error('Get cart payment link error:', error.message, error.response?.data);
      return { success: false, message: error.response?.data?.message || error.message || 'Network error. Please try again.' };
    }
  },

  getOrderPaymentLink: async (orderId, orderData, urls) => {
    try {
      const userToken = await getUserToken();
      const response = await axiosInstance.post(`/orders/${orderId}/getPaymentLink`, {
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
        metaData: urls,
      }, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      console.log('getOrderPaymentLink Response:', JSON.stringify(response.data, null, 2));
      return response.status === 200
        ? { success: true, data: response.data }
        : { success: false, message: response.data.message || 'Failed to get payment link' };
    } catch (error) {
      console.error('Get order payment link error:', error.message, error.response?.data);
      return { success: false, message: error.response?.data?.message || error.message || 'Network error. Please try again.' };
    }
  },

  post: async (url, data, config = {}) => {
    try {
      const userToken = await getUserToken();
      const response = await axiosInstance.post(url, data, {
        ...config,
        headers: {
          ...config.headers,
          Authorization: `Bearer ${userToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`POST ${url} error:`, error.message, error.response?.data);
      throw error;
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