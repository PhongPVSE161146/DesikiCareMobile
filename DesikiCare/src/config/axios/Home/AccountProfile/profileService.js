import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://cda8-118-69-160-8.ngrok-free.app'; // Replace with your actual API URL

const profileService = {
  getProfile: async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        return { success: false, message: 'No token found. Please log in.' };
      }

      const response = await fetch(`${API_URL}/api/Account/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
      });

      const result = await response.json();
      if (response.ok) {
        return { success: true, data: result.data }; // Expecting { account, deliveryAddress }
      } else {
        return { success: false, message: result.message || 'Failed to fetch profile' };
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },
};

export default profileService;