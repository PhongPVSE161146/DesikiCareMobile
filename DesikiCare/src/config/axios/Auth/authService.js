import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL_LOGIN } from '@env';

const authService = {
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL_LOGIN}/api/Account/login`, {
        loginInfo: {
          email: email.trim(),
          password,
        },
      }, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      console.log('API login response:', response.data); // Debugging API response

      // Check for success based on status and response data
      if (response.status === 200 || response.status === 201) {
        const { token, data, message } = response.data;
        // Consider login successful if token exists or message indicates success
        if (token || message?.toLowerCase().includes('success')) {
          if (token) {
            await AsyncStorage.setItem('userToken', token);
          }
          return { success: true, data: data || response.data, message: message || 'Đăng nhập thành công' };
        } else {
          return { success: false, message: message || 'Đăng nhập thất bại' };
        }
      } else {
        return { success: false, message: response.data.message || 'Đăng nhập thất bại' };
      }
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      const message = error.response?.data?.message || 'Lỗi kết nối. Vui lòng thử lại.';
      return { success: false, message };
    }
  },

  register: async (accountData) => {
    try {
      const response = await axios.post(`${API_URL_LOGIN}/api/Account/register`, {
        account: {
          email: accountData.email?.trim(),
          password: accountData.password,
          fullName: accountData.fullName?.trim(),
          phoneNumber: accountData.phoneNumber?.trim(),
          gender: accountData.gender,
          dob: accountData.dob,
          roleId: accountData.roleId || 0,
          imageBase64: accountData.imageBase64 || '',
        },
      }, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200 || response.status === 201) {
        return { success: true, data: response.data.data || response.data };
      } else {
        return { success: false, message: response.data.message || 'Đăng ký thất bại' };
      }
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      const message = error.response?.data?.message || 'Lỗi kết nối. Vui lòng thử lại.';
      return { success: false, message };
    }
  },
};

export default authService;