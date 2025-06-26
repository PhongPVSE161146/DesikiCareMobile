import axios from 'axios';
import { API_URL_LOGIN } from '@env';

const ProductService = {
  // Get list of products
  getProducts: async (page = 1) => {
    try {
      console.log(`Fetching products from API: ${API_URL_LOGIN}/api/Product/products?page=${page}`);
      const response = await axios.get(`${API_URL_LOGIN}/api/Product/products`, {
        params: { page },
        headers: {
          Accept: 'application/json',
          // Nếu API yêu cầu token, thêm vào đây:
          // Authorization: `Bearer YOUR_TOKEN_HERE`,
        },
      });

      console.log('API Response Status:', response.status);
      console.log('API Response Data:', JSON.stringify(response.data, null, 2));

      // Kiểm tra nếu response.data là HTML
      if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html')) {
        console.log('Error: API returned HTML instead of JSON');
        return {
          success: false,
          message: 'API returned HTML. Please bypass ngrok confirmation or check server configuration.',
        };
      }

      if (response.status === 200) {
        // Kiểm tra cấu trúc JSON
        if (response.data.products && Array.isArray(response.data.products)) {
          const products = response.data.products
            .map(item => item.product)
            .filter(product => product && product._id);
          console.log('Mapped Products:', products);
          return { success: true, data: products };
        } else if (Array.isArray(response.data)) {
          const products = response.data.filter(product => product && product._id);
          console.log('Direct Array Products:', products);
          return { success: true, data: products };
        } else {
          console.log('No products found or invalid data structure:', response.data);
          return { success: false, message: 'No products found or invalid data structure.' };
        }
      }

      console.log('API Error Response:', response.data);
      return { success: false, message: response.data.message || 'Failed to fetch products.' };
    } catch (error) {
      console.error('Get products error:', error.message);
      console.log('Error Response Data:', error.response?.data);
      console.log('Error Status:', error.response?.status);
      console.log('Error Headers:', error.response?.headers);
      return {
        success: false,
        message: error.response?.data?.message || 'Error fetching products. Please check API connection.',
      };
    }
  },

  // Get product by ID
  getProductById: async (id) => {
    try {
      console.log(`Fetching product by ID: ${API_URL_LOGIN}/api/Product/products/${id}`);
      const response = await axios.get(`${API_URL_LOGIN}/api/Product/products/${id}`, {
        headers: {
          Accept: 'application/json',
          // Nếu API yêu cầu token, thêm vào đây:
          // Authorization: `Bearer YOUR_TOKEN_HERE`,
        },
      });

      console.log('API Response for Product by ID:', response.data);

      if (response.status === 200) {
        const product = response.data.product;
        if (product && product._id) {
          console.log('Mapped Product:', product);
          return { success: true, data: product };
        }
        console.log('No product found or invalid data:', response.data);
        return { success: false, message: 'No product found or invalid data.' };
      }
      console.log('API Error Response:', response.data);
      return { success: false, message: response.data.message || 'Failed to fetch product.' };
    } catch (error) {
      console.error('Get product by ID error:', error.message);
      console.log('Error Response Data:', error.response?.data);
      console.log('Error Status:', error.response?.status);
      return {
        success: false,
        message: error.response?.data?.message || 'Error fetching product.',
      };
    }
  },
};

export default ProductService;