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
      console.log('API Response for Account Info:', JSON.stringify(response.data, null, 2));

      if (response.status === 200 && response.data.account) {
        return { success: true, data: response.data };
      }
      return { success: false, message: response.data.message || 'Failed to fetch account information.' };
    } catch (error) {
      console.error('Get account info error:', error, `Status: ${error.response?.status}`, `Response:`, error.response?.data);
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
      console.log(`Updating account with payload for accountId ${accountId}:`, JSON.stringify(requestPayload, null, 2));
      const response = await axios.put(`${API_URL_LOGIN}/api/Account/accounts/${accountId}`, requestPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Update Account Response:', JSON.stringify(response.data, null, 2));

      if (response.status === 200) {
        return { success: true, data: response.data };
      }
      return { success: false, message: response.data.message || 'Failed to update account.' };
    } catch (error) {
      console.error('Update account error:', error, `Status: ${error.response?.status}`, `Response:`, error.response?.data);
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
      console.log(`Changing password with payload:`, JSON.stringify(payload, null, 2));
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
      console.error('Change password error:', error, `Status: ${error.response?.status}`, `Response:`, error.response?.data);
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
        console.log('No authentication token found.');
        return { success: false, message: 'No authentication token found.' };
      }

      console.log(`Fetching delivery addresses from API: ${API_URL_LOGIN}/api/Account/me`);
      const response = await axios.get(`${API_URL_LOGIN}/api/Account/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache',
        },
      });
      console.log('Delivery Addresses Raw Response:', JSON.stringify(response.data, null));

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
        } else {
          console.log('No valid address data found in response.');
        }
        console.log('Processed addresses:', JSON.stringify(addresses, null));
        return { success: true, data: addresses };
      }
      console.log('Unexpected response status:', response.status);
      return { success: true, data: [] };
    } catch (error) {
      console.error(
        'Get delivery addresses error:',
        error,
        `Status: ${error.response?.status}`,
        `URL: ${API_URL_LOGIN}/api/Account/me`,
        `Response:`,
        JSON.stringify(error.response?.data, null)
      );
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
        console.log('No authentication token found.');
        return { success: false, message: 'No authentication token found.' };
      }
      if (!accountId) {
        console.log('Account ID is missing.');
        return { success: false, message: 'Account ID is missing.' };
      }

      const requestPayload = {
        deliveryAddress: {
          ...payload,
          isDefault: payload.isDefault !== undefined ? payload.isDefault : true,
        },
      };
      console.log(
        `Adding delivery address for account ID: ${accountId} to API: ${API_URL_LOGIN}/api/Account/accounts/${accountId}/deliveryAddresses`,
        JSON.stringify(requestPayload, null)
      );
      const response = await axios.post(
        `${API_URL_LOGIN}/api/Account/accounts/${accountId}/deliveryAddresses`,
        requestPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Add Delivery Address Response:', JSON.stringify(response.data, null, 2));

      if (response.status === 201) {
        return { success: true, data: response.data };
      }
      return { success: false, message: response.data.message || 'Failed to add delivery address.' };
    } catch (error) {
      console.error(
        'Add delivery address error:',
        error,
        `Status: ${error.response?.status}`,
        `URL: ${API_URL_LOGIN}/api/Account/accounts/${accountId}/deliveryAddresses`,
        `Payload:`,
        JSON.stringify(requestPayload, null)
      );
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
        console.log('No authentication token found.');
        return { success: false, message: 'No authentication token found.' };
      }

      console.log(
        `Setting default delivery address ID: ${deliveryAddressId} to API: ${API_URL_LOGIN}/api/Account/deliveryAddresses/${deliveryAddressId}/set-default`
      );
      const response = await axios.put(
        `${API_URL_LOGIN}/api/Account/deliveryAddresses/${deliveryAddressId}/set-default`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Set Default Address Response:', JSON.stringify(response.data, null, 2));

      if (response.status === 200) {
        return { success: true, data: response.data };
      }
      return { success: false, message: response.data.message || 'Failed to set default address.' };
    } catch (error) {
      console.error(
        'Set default address error:',
        error,
        `Status: ${error.response?.status}`,
        `URL: ${API_URL_LOGIN}/api/Account/deliveryAddresses/${deliveryAddressId}/set-default`,
        `Response:`,
        JSON.stringify(error.response?.data, null, 2)
      );
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
        console.log('No authentication token found.');
        return { success: false, message: 'No authentication token found.' };
      }

      console.log(
        `Deleting delivery address ID: ${deliveryAddressId} from API: ${API_URL_LOGIN}/api/Account/deliveryAddresses/${deliveryAddressId}`
      );
      const response = await axios.delete(
        `${API_URL_LOGIN}/api/Account/deliveryAddresses/${deliveryAddressId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Delete Address Response:', JSON.stringify(response.data, null, 2));

      if (response.status === 200) {
        return { success: true, data: response.data };
      }
      return { success: false, message: response.data.message || 'Failed to delete address.' };
    } catch (error) {
      console.error(
        'Delete address error:',
        error,
        `Status: ${error.response?.status}`,
        `URL: ${API_URL_LOGIN}/api/Account/deliveryAddresses/${deliveryAddressId}`,
        `Response:`,
        JSON.stringify(error.response?.data, null, 2)
      );
      const message = error.response?.status === 401
        ? 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.'
        : error.response?.data?.message || `Error deleting address: ${error.message}`;
      return { success: false, message };
    }
  },
};

export default profileService;