import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://cda8-118-69-160-8.ngrok-free.app'; // Replace with your actual API URL

const authService = {
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/Account/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      if (response.ok) {
        await AsyncStorage.setItem('userToken', result.token || '');
        return { success: true, data: result.data };
      } else {
        return { success: false, message: result.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  register: async (accountData) => {
    try {
      const response = await fetch(`${API_URL}/api/Account/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(accountData),
      });
      const result = await response.json();
      if (response.ok) {
        return { success: true, data: result.data };
      } else {
        return { success: false, message: result.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },
};

export default authService;