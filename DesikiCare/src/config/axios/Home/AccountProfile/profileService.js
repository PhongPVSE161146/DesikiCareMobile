import axios from 'axios';
import { API_URL_LOGIN } from '@env';

const ProductService = {
  // Get list of products
  getProducts: async (page = 1) => {
    try {
      console.log(`Fetching products from API: ${API_URL_LOGIN}/api/Product/products?page=${page}`);
      const response = await axios.get(`${API_URL_LOGIN}/api/Product/products`, {
        params: { page } // Đảm bảo truyền tham số page nếu API yêu cầu
      });

      console.log('API Response:', response.data); // Log dữ liệu thô từ API

      if (response.status === 200) {
        // Map response to return only the 'product' object
        const products = response.data.products.map(item => item.product);
        console.log('Mapped Products:', products); // Log dữ liệu sau khi ánh xạ
        return { success: true, data: products };
      }
      console.log('API Error Response:', response.data);
      return { success: false, message: response.data.message || 'Failed to fetch products.' };
    } catch (error) {
      console.error('Get products error:', error);
      console.log('Error Response Data:', error.response?.data); // Log dữ liệu lỗi nếu có
      return { success: false, message: error.response?.data?.message || 'Error fetching products.' };
    }
  },

  // Get product by ID
  getProductById: async (id) => {
    try {
      console.log(`Fetching product by ID: ${API_URL_LOGIN}/api/Product/products/${id}`);
      const response = await axios.get(`${API_URL_LOGIN}/api/Product/products/${id}`);

      console.log('API Response for Product by ID:', response.data); // Log dữ liệu thô

      if (response.status === 200) {
        // Return only the 'product' object
        console.log('Mapped Product:', response.data.product); // Log dữ liệu product
        return { success: true, data: response.data.product };
      }
      console.log('API Error Response:', response.data);
      return { success: false, message: response.data.message || 'Failed to fetch product.' };
    } catch (error) {
      console.error('Get product by ID error:', error);
      console.log('Error Response Data:', error.response?.data); // Log dữ liệu lỗi
      return { success: false, message: error.response?.data?.message || 'Error fetching product.' };
    }
  },
};

export default ProductService;