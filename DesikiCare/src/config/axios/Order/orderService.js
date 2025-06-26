
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@env';

const orderService = {
  getCategories: async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        return { success: false, message: 'No token found. Please log in.' };
      }

      const response = await axios.get(`${API_URL}/api/Product/categories`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
      });

      if (response.status === 200) {
        return { success: true, data: response.data.categories }; // Expecting { categories: [{ _id, name }] }
      } else {
        return { success: false, message: response.data.message || 'Failed to fetch categories' };
      }
    } catch (error) {
      console.error('Categories fetch error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  deleteCartItem: async (cartItemId) => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        return { success: false, message: 'No token found. Please log in.' };
      }

      const response = await axios.delete(`${API_URL}/api/Order/cartItems/${cartItemId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
      });

      if (response.status === 200) {
        return { success: true };
      } else {
        return { success: false, message: response.data.message || 'Failed to delete cart item' };
      }
    } catch (error) {
      console.error('Delete cart item error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  getCart: async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        return { success: false, message: 'No token found. Please log in.' };
      }

      const response = await axios.get(`${API_URL}/api/Order/carts/me`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
      });

      if (response.status === 200) {
        return { success: true, data: response.data }; // Expecting { cart, cartItems }
      } else {
        return { success: false, message: response.data.message || 'Failed to fetch cart' };
      }
    } catch (error) {
      console.error('Get cart error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  updateCartItemQuantity: async (cartItemId, quantity) => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        return { success: false, message: 'No token found. Please log in.' };
      }

      const response = await axios.patch(`${API_URL}/api/Order/cartItems/${cartItemId}`, { quantity }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
      });

      if (response.status === 200) {
        return { success: true };
      } else {
        return { success: false, message: response.data.message || 'Failed to update quantity' };
      }
    } catch (error) {
      console.error('Update cart item quantity error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  addCartItem: async (productId, quantity = 1) => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        return { success: false, message: 'No token found. Please log in.' };
      }

      const response = await axios.post(`${API_URL}/api/Order/cartItems`, { productId, quantity }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
      });

      if (response.status === 200) {
        return { success: true, data: response.data };
      } else {
        return { success: false, message: response.data.message || 'Failed to add item to cart' };
      }
    } catch (error) {
      console.error('Add cart item error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },
};

export default orderService;
