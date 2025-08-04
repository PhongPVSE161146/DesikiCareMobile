import axios from 'axios';
import { API_URL_LOGIN } from '@env';

const ProductService = {
  // Get list of products
  getProducts: async () => {
    try {
      const response = await axios.get(`${API_URL_LOGIN}/api/Product/products`, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html')) {
        return {
          success: false,
          message: 'API returned HTML. Please check server configuration.',
        };
      }

      if (response.status === 200) {
        let products = [];
        if (response.data.products && Array.isArray(response.data.products)) {
          products = response.data.products
            .map(item => item.product)
            .filter(product => product && product._id && product.name);
        } else if (Array.isArray(response.data)) {
          products = response.data.filter(product => product && product._id && product.name);
        } else {
          return { success: false, message: 'No products found or invalid data structure.' };
        }
        return { success: true, data: products };
      }

      return { success: false, message: response.data.message || 'Failed to fetch products.' };
    } catch (error) {
      const message = error.response?.status === 404
        ? 'No products found.'
        : error.response?.status === 401
        ? 'Unauthorized. Please log in.'
        : error.response?.data?.message || 'Error fetching products.';
      return { success: false, message };
    }
  },

  // Get product by ID
  getProductById: async (id) => {
    try {
      const response = await axios.get(`${API_URL_LOGIN}/api/Product/products/${id}`, {
        headers: {
          Accept: 'application/json',
          'Cache-Control': 'no-cache',
        },
        params: { t: Date.now() }, // Cache-busting
      });

      if (response.status === 200 && response.data?.product?._id) {
        const productData = response.data;
        const latestShipment = productData.shipmentProducts?.[0]?.shipmentProduct;

        // Check stock and expiry
        const isOutOfStock = latestShipment?.quantity === 0 || latestShipment?.availableStock === 0;
        const isExpired = latestShipment?.expiryDate && new Date(latestShipment.expiryDate) < new Date();
        const isAvailable = !productData.product.isDeactivated && !isOutOfStock && !isExpired;

        return {
          success: true,
          data: {
            ...productData,
            isAvailable,
            availabilityStatus: isAvailable
              ? 'available'
              : isExpired
              ? 'expired'
              : isOutOfStock
              ? 'outOfStock'
              : 'deactivated',
          },
        };
      }
      return { success: false, message: response.data.message || 'Failed to fetch product.' };
    } catch (error) {
      const message = error.response?.status === 404
        ? 'Product not found.'
        : error.response?.status === 401
        ? 'Unauthorized. Please log in.'
        : error.response?.data?.message || 'Error fetching product.';
      return { success: false, message };
    }
  },

  // Get categories
  getCategories: async () => {
    try {
      const response = await axios.get(`${API_URL_LOGIN}/api/Product/categories`, {
        headers: {
          Accept: 'application/json',
        },
        timeout: 10000,
      });

      if (response.status === 200) {
        const categories = Array.isArray(response.data)
          ? response.data.filter(category => category && category._id && category.name)
          : [];
        if (categories.length === 0) {
          console.warn('No valid categories found in response.');
        }
        return { success: true, data: categories };
      }
      console.warn('getCategories Failed:', response.data.message);
      return { success: false, message: response.data.message || 'Failed to fetch categories.' };
    } catch (error) {
      console.error('getCategories Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      const message = error.response?.status === 404
        ? 'No categories found.'
        : error.response?.status === 401
        ? 'Unauthorized. Please log in.'
        : error.response?.data?.message || 'Error fetching categories.';
      return { success: false, message };
    }
  },
};

export default ProductService;