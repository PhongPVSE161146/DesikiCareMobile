import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL_LOGIN } from '@env';

const quizService = {
  getQuizQuestions: async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`${API_URL_LOGIN}/api/Quiz`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      console.log('API quiz response:', response.data);
      if (response.status === 200 || response.status === 201) {
        return {
          success: true,
          data: response.data.quizQuestions || [],
          message: 'Lấy câu hỏi quiz thành công',
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Lấy câu hỏi quiz thất bại',
        };
      }
    } catch (error) {
      console.error('Quiz fetch error:', error.response?.data || error.message);
      const message = error.response?.data?.message || 'Lỗi kết nối. Vui lòng thử lại.';
      return { success: false, message };
    }
  },

  submitQuizResult: async (quizOptionIds) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.post(
        `${API_URL_LOGIN}/api/Quiz/result`,
        { quizOptionIds },
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      console.log('API quiz result response:', response.data);
      if (response.status === 200 || response.status === 201) {
        return {
          success: true,
          data: {
            skinTypes: response.data.skinTypes || [],
            skinStatuses: response.data.skinStatuses || [],
            recommendedProducts: response.data.recommendedProducts || [],
          },
          message: 'Gửi kết quả quiz thành công',
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Gửi kết quả quiz thất bại',
        };
      }
    } catch (error) {
      console.error('Quiz result submission error:', error.response?.data || error.message);
      const message = error.response?.data?.message || 'Lỗi kết nối. Vui lòng thử lại.';
      return { success: false, message };
    }
  },
};

export default quizService;