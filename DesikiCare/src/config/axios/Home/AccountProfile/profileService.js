import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL_LOGIN } from '@env';

const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    return token;
  } catch (error) {
    return null;
  }
};

const profileService = {

  getProfile: async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        return { success: false, message: 'No authentication token found.' };
      }

      const response = await axios.get(`${API_URL_LOGIN}/api/Account/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200 && response.data.account) {
        return { success: true, data: response.data };
      }
      return { success: false, message: response.data.message || 'Failed to fetch account information.' };
    } catch (error) {
      const message = error.response?.status === 401 
        ? 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.' 
        : error.response?.data?.message || 'Error fetching account information.';
      return { success: false, message };
    }
  },

  updateAccount: async (accountId, payload) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        return { success: false, message: 'No authentication token found.' };
      }
      if (!accountId) {
        return { success: false, message: 'Account ID is missing.' };
      }
      if (!payload || typeof payload !== 'object') {
        return { success: false, message: 'Invalid payload provided.' };
      }

      const requestPayload = { account: payload };
      const response = await axios.put(`${API_URL_LOGIN}/api/Account/accounts/${accountId}`, requestPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        return { success: true, data: response.data };
      }
      return { success: false, message: response.data.message || 'Failed to update account.' };
    } catch (error) {
      const message = error.response?.status === 401 
        ? 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.' 
        : error.response?.data?.message || `Error updating account: ${error.message}`;
      return { success: false, message };
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        return { success: false, message: 'No authentication token found.' };
      }

      const payload = { currentPassword, newPassword };
      const response = await axios.put(`${API_URL_LOGIN}/api/Account/change-password`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        return { success: true, data: response.data };
      }
      return { success: false, message: response.data.message || 'Failed to change password.' };
    } catch (error) {
      const message = error.response?.status === 401 
        ? 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.' 
        : error.response?.data?.message || 'Error changing password.';
      return { success: false, message };
    }
  },

  getDeliveryAddresses: async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        return { success: false, message: 'No authentication token found.' };
      }

      const response = await axios.get(`${API_URL_LOGIN}/api/Account/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache',
        },
      });

      if (response.status === 200) {
        let addresses = [];
        if (response.data?.deliveryAddresses) {
          // Xử lý mảng deliveryAddresses
          addresses = response.data.deliveryAddresses;
        } else if (response.data?.deliveryAddress) {
          // Xử lý object deliveryAddress
          addresses = Array.isArray(response.data.deliveryAddress)
            ? response.data.deliveryAddress
            : [response.data.deliveryAddress];
        } else if (response.data && response.data._id) {
          // Xử lý response là object địa chỉ trực tiếp
          addresses = [response.data];
        } else if (Array.isArray(response.data)) {
          // Xử lý response là mảng địa chỉ
          addresses = response.data;
        }
        return { success: true, data: addresses };
      }
      return { success: true, data: [] };
    } catch (error) {
      const message = error.response?.status === 401
        ? 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.'
        : error.response?.data?.message || `Error fetching delivery addresses: ${error.message}`;
      return { success: false, message };
    }
  },

  addDeliveryAddress: async (accountId, payload) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        return { success: false, message: 'No authentication token found.' };
      }
      if (!accountId) {
        return { success: false, message: 'Account ID is missing.' };
      }

      const requestPayload = {
        deliveryAddress: {
          ...payload,
          isDefault: payload.isDefault !== undefined ? payload.isDefault : true,
        },
      };
      const response = await axios.post(
        `${API_URL_LOGIN}/api/Account/accounts/${accountId}/deliveryAddresses`,
        requestPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        return { success: true, data: response.data };
      }
      return { success: false, message: response.data.message || 'Failed to add delivery address.' };
    } catch (error) {
      const message = error.response?.status === 401
        ? 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.'
        : error.response?.data?.message || `Error adding delivery address: ${error.message}`;
      return { success: false, message };
    }
  },

  setDefaultDeliveryAddress: async (deliveryAddressId) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        return { success: false, message: 'No authentication token found.' };
      }

      const response = await axios.put(
        `${API_URL_LOGIN}/api/Account/deliveryAddresses/${deliveryAddressId}/set-default`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        return { success: true, data: response.data };
      }
      return { success: false, message: response.data.message || 'Failed to set default address.' };
    } catch (error) {
      const message = error.response?.status === 401
        ? 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.'
        : error.response?.data?.message || `Error setting default address: ${error.message}`;
      return { success: false, message };
    }
  },

  deleteDeliveryAddress: async (deliveryAddressId) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        return { success: false, message: 'No authentication token found.' };
      }

      const response = await axios.delete(
        `${API_URL_LOGIN}/api/Account/deliveryAddresses/${deliveryAddressId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        return { success: true, data: response.data };
      }
      return { success: false, message: response.data.message || 'Failed to delete address.' };
    } catch (error) {
      const message = error.response?.status === 401
        ? 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.'
        : error.response?.data?.message || `Error deleting address: ${error.message}`;
      return { success: false, message };
    }
  },
};

export default profileService;