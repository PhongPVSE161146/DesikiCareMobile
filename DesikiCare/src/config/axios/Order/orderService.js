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
      console.log('Adding to cart with payload:', { productId, quantity });

      const response = await axiosInstance.post('/cartItems', {
        productId,
       
      }, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      console.log('AddCartItem API response:', response.data);
      return response.status === 200
        ? { success: true, data: response.data, cartItemId: response.data.cartItem?._id }
        : { success: false, message: response.data.message || 'Failed to add item to cart' };
    } catch (error) {
      console.error('Add cart item error:', error.message);
      return { success: false, message: error.message || 'Network error. Please try again.' };
    }
  },

  getPaymentLink: async (orderData, urls) => {
    try {
      const userToken = await getUserToken();
      const response = await axiosInstance.post('/payment', { ...orderData, ...urls }, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      return response.status === 200
        ? { success: true, data: response.data }
        : { success: false, message: response.data.message || 'Failed to get payment link' };
    } catch (error) {
      console.error('Get payment link error:', error.message);
      return { success: false, message: error.message || 'Network error. Please try again.' };
    }
  },
    // Hàm để tạo đơn hàng
  getOrders: async () => {
  try {
    const userToken = await getUserToken();

    const response = await axiosInstance.get('/orders', {
      headers: { Authorization: `Bearer ${userToken}` },
    });

    console.log('getOrders Response:', response.data);

    return response.status === 200
      ? { success: true, data: response.data.orders } // Dữ liệu nằm trong `orders`
      : { success: false, message: response.data.message || 'Failed to fetch orders' };
  } catch (error) {
    console.error('Get orders error:', error.message);
    return { success: false, message: error.message || 'Network error. Please try again.' };
  }
},

};

export default orderService;