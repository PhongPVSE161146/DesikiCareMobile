// profileService.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL_LOGIN } from '@env';

const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    return token;
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
};

const profileService = {
  // Get account information
  getProfile: async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        return { success: false, message: 'No authentication token found.' };
      }

      console.log(`Fetching account info from API: ${API_URL_LOGIN}/api/Account/me`);
      const response = await axios.get(`${API_URL_LOGIN}/api/Account/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('API Response for Account Info:', response.data);

      if (response.status === 200 && response.data.account) {
        return { success: true, data: response.data };
      }
      return { success: false, message: response.data.message || 'Failed to fetch account information.' };
    } catch (error) {
      console.error('Get account info error:', error);
      const message = error.response?.status === 401 
        ? 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.' 
        : error.response?.data?.message || 'Error fetching account information.';
      return { success: false, message };
    }
  },

  // Update account information
  updateAccount: async (payload) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        return { success: false, message: 'No authentication token found.' };
      }

      console.log(`Updating account with payload:`, payload);
      const response = await axios.put(`${API_URL_LOGIN}/api/Account/me`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Update Account Response:', response.data);

      if (response.status === 200) {
        return { success: true, data: response.data };
      }
      return { success: false, message: response.data.message || 'Failed to update account.' };
    } catch (error) {
      console.error('Update account error:', error);
      const message = error.response?.status === 401 
        ? 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.' 
        : error.response?.data?.message || 'Error updating account.';
      return { success: false, message };
    }
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        return { success: false, message: 'No authentication token found.' };
      }

      const payload = { currentPassword, newPassword };
      console.log(`Changing password with payload:`, payload);
      const response = await axios.put(`${API_URL_LOGIN}/api/Account/change-password`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // console.log('Change Password Response:', response.data);

      if (response.status === 200) {
        return { success: true, data: response.data };
      }
      return { success: false, message: response.data.message || 'Failed to change password.' };
    } catch (error) {
      console.error('Change password error:', error);
      const message = error.response?.status === 401 
        ? 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.' 
        : error.response?.data?.message || 'Error changing password.';
      return { success: false, message };
    }
  },

  // Get delivery addresses (mocked to handle single address from API)
  getDeliveryAddresses: async (accountId) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        return { success: false, message: 'No authentication token found.' };
      }

      // console.log(`Fetching delivery addresses for account ID: ${accountId}`);
      const response = await axios.get(`${API_URL_LOGIN}/api/Account/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Delivery Addresses Response:', response.data);

      if (response.status === 200 && response.data.deliveryAddress) {
        // Convert single deliveryAddress to array for consistency
        const addresses = [response.data.deliveryAddress];
        return { success: true, data: addresses };
      }
      return { success: true, data: [] }; // Return empty array if no addresses
    } catch (error) {
      console.error('Get delivery addresses error:', error);
      const message = error.response?.status === 401 
        ? 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.' 
        : error.response?.data?.message || 'Error fetching delivery addresses.';
      return { success: false, message };
    }
  },

  // Add delivery address
  addDeliveryAddress: async (accountId, payload) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        return { success: false, message: 'No authentication token found.' };
      }

      console.log(`Adding delivery address for account ID: ${accountId}`, payload);
      const response = await axios.post(`${API_URL_LOGIN}/api/Account/delivery-address`, {
        accountId,
        ...payload,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Add Delivery Address Response:', response.data);

      if (response.status === 201) {
        return { success: true, data: response.data };
      }
      return { success: false, message: response.data.message || 'Failed to add delivery address.' };
    } catch (error) {
      console.error('Add delivery address error:', error);
      const message = error.response?.status === 401 
        ? 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.' 
        : error.response?.data?.message || 'Error adding delivery address.';
      return { success: false, message };
    }
  },

  // Set default delivery address
  setDefaultDeliveryAddress: async (deliveryAddressId) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        return { success: false, message: 'No authentication token found.' };
      }

      console.log(`Setting default delivery address ID: ${deliveryAddressId}`);
      const response = await axios.put(`${API_URL_LOGIN}/api/Account/delivery-address/${deliveryAddressId}/default`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Set Default Address Response:', response.data);

      if (response.status === 200) {
        return { success: true, data: response.data };
      }
      return { success: false, message: response.data.message || 'Failed to set default address.' };
    } catch (error) {
      console.error('Set default address error:', error);
      const message = error.response?.status === 401 
        ? 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.' 
        : error.response?.data?.message || 'Error setting default address.';
      return { success: false, message };
    }
  },

  // Delete delivery address
  deleteDeliveryAddress: async (deliveryAddressId) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        return { success: false, message: 'No authentication token found.' };
      }

      console.log(`Deleting delivery address ID: ${deliveryAddressId}`);
      const response = await axios.delete(`${API_URL_LOGIN}/api/Account/delivery-address/${deliveryAddressId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Delete Address Response:', response.data);

      if (response.status === 200) {
        return { success: true, data: response.data };
      }
      return { success: false, message: response.data.message || 'Failed to delete address.' };
    } catch (error) {
      console.error('Delete address error:', error);
      const message = error.response?.status === 401 
        ? 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.' 
        : error.response?.data?.message || 'Error deleting address.';
      return { success: false, message };
    }
  },
};

export default profileService;