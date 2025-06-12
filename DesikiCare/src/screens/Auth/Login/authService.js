import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create an Axios instance with base URL and default headers
const api = axios.create({
  baseURL: 'https://67dfd1057635238f9aaadfe4.mockapi.io',
});

// Add interceptor to include token in requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Login function
export const login = async (email, password) => {
  try {
    const response = await api.post('/Code', { email, password });
    if (response.status === 200) {
      const token = response.data.token || 'mock-token'; // Adjust based on API response
      await AsyncStorage.setItem('userToken', token);
      return { success: true, token };
    } else {
      return { success: false, message: response.data.message || 'Đăng nhập thất bại' };
    }
  } catch (error) {
    return { success: false, message: error.message || 'Lỗi kết nối máy chủ' };
  }
};

// Logout function (optional)
export const logout = async () => {
  await AsyncStorage.removeItem('userToken');
};

// Get token function (optional)
export const getToken = async () => {
  return await AsyncStorage.getItem('userToken');
};

export default { login, logout, getToken };