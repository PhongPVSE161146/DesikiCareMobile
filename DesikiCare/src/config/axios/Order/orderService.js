import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://cda8-118-69-160-8.ngrok-free.app'; // Replace with your actual API URL

const orderService = {
  getCategories: async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        return { success: false, message: 'No token found. Please log in.' };
      }

      const response = await fetch(`${API_URL}/api/Product/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
      });

      const result = await response.json();
      if (response.ok) {
        return { success: true, data: result.categories }; // Expecting { categories: [{ _id, name }] }
      } else {
        return { success: false, message: result.message || 'Failed to fetch categories' };
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

      const response = await fetch(`${API_URL}/api/Order/cartItems/${cartItemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        return { success: true };
      } else {
        const result = await response.json();
        return { success: false, message: result.message || 'Failed to delete cart item' };
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

      const response = await fetch(`${API_URL}/api/Order/carts/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
      });

      const result = await response.json();
      if (response.ok) {
        return { success: true, data: result }; // Expecting { cart, cartItems }
      } else {
        return { success: false, message: result.message || 'Failed to fetch cart' };
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

      const response = await fetch(`${API_URL}/api/Order/cartItems/${cartItemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({ quantity }),
      });

      if (response.ok) {
        return { success: true };
      } else {
        const result = await response.json();
        return { success: false, message: result.message || 'Failed to update quantity' };
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

      const response = await fetch(`${API_URL}/api/Order/cartItems`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({ productId, quantity }),
      });

      const result = await response.json();
      if (response.ok) {
        return { success: true, data: result };
      } else {
        return { success: false, message: result.message || 'Failed to add item to cart' };
      }
    } catch (error) {
      console.error('Add cart item error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },
};

export default orderService;