import axios from 'axios';
import { API_URL_LOGIN } from '@env';

const ProductService = {
  // Get list of products
  getProducts: async (pageNum = 1) => {
    try {
      const response = await axios.get(`${API_URL_LOGIN}/api/Product/products?page=${pageNum}`, {
        headers: {
          Accept: 'application/json',
          'Cache-Control': 'no-cache',
        },
        params: { t: Date.now() }, // Cache-busting
      });

      console.log('getProducts API Response:', JSON.stringify(response.data, null, 2)); // Debug log

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
            .map(item => {
              const product = item.product;
              // Sum stock across all non-deactivated, non-deleted shipments
              const totalStock = item.shipmentProducts
                ?.filter(sp => !sp.shipmentProduct.isDeactivated && !sp.shipment.isDeleted)
                ?.reduce((sum, sp) => {
                  const stock = sp.shipmentProduct.importQuantity - sp.shipmentProduct.saleQuantity;
                  return sum + (typeof stock === 'number' && stock >= 0 ? stock : 0);
                }, 0) || 0;

              console.log(`Product ${product._id}:`, {
                name: product.name,
                shipmentCount: item.shipmentProducts?.length || 0,
                totalStock,
                isDeactivated: product.isDeactivated,
                shipments: item.shipmentProducts?.map(sp => ({
                  shipmentId: sp.shipment._id,
                  importQuantity: sp.shipmentProduct.importQuantity,
                  saleQuantity: sp.shipmentProduct.saleQuantity,
                  stock: sp.shipmentProduct.importQuantity - sp.shipmentProduct.saleQuantity,
                  isDeactivated: sp.shipmentProduct.isDeactivated,
                  isDeleted: sp.shipment.isDeleted,
                })),
              }); // Debug stock calculation

              return {
                ...product,
                stock: totalStock,
              };
            })
            .filter(product => product && product._id && product.name && !product.isDeactivated);
        } else if (Array.isArray(response.data)) {
          products = response.data
            .map(product => ({
              ...product,
              stock: typeof product.stock === 'number' && product.stock >= 0 ? product.stock : 0,
            }))
            .filter(product => product && product._id && product.name && !product.isDeactivated);
        } else {
          console.warn('Invalid data structure in getProducts response');
          return { success: false, message: 'No products found or invalid data structure.' };
        }

        console.log('Processed Products:', products.map(p => ({
          _id: p._id,
          name: p.name,
          stock: p.stock,
          isDeactivated: p.isDeactivated,
        }))); // Log final products

        return { success: true, data: products };
      }

      console.warn('getProducts Failed:', response.data.message);
      return { success: false, message: response.data.message || 'Failed to fetch products.' };
    } catch (error) {
      console.error('getProducts Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
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

      console.log('getProductById Response:', JSON.stringify(response.data, null, 2)); // Debug log

      if (response.status === 200) {
        let productData = response.data;
        // Handle both single product and products array
        if (response.data.products && Array.isArray(response.data.products)) {
          productData = response.data.products.find(p => p.product._id === id);
          if (!productData) {
            console.warn(`Product ${id} not found in products array`);
            return { success: false, message: 'Product not found in response.' };
          }
        } else if (!response.data.product || !response.data.product._id) {
          console.warn('Invalid product data structure');
          return { success: false, message: 'Invalid product data structure.' };
        }

        // Sum stock across all non-deactivated, non-deleted shipments
        const totalStock = productData.shipmentProducts
          ?.filter(sp => !sp.shipmentProduct.isDeactivated && !sp.shipment.isDeleted)
          ?.reduce((sum, sp) => {
            const stock = sp.shipmentProduct.importQuantity - sp.shipmentProduct.saleQuantity;
            return sum + (typeof stock === 'number' && stock >= 0 ? stock : 0);
          }, 0) || 0;
        const isOutOfStock = totalStock === 0;
        const isExpired = productData.shipmentProducts?.some(
          sp => sp.shipmentProduct.expiryDate && new Date(sp.shipmentProduct.expiryDate) < new Date()
        );
        const isAvailable = !productData.product.isDeactivated && !isOutOfStock && !isExpired;

        console.log('Processed Product Data:', {
          productId: id,
          name: productData.product.name,
          shipmentCount: productData.shipmentProducts?.length || 0,
          totalStock,
          isDeactivated: productData.product.isDeactivated,
          isExpired,
          isAvailable,
          shipments: productData.shipmentProducts?.map(sp => ({
            shipmentId: sp.shipment._id,
            importQuantity: sp.shipmentProduct.importQuantity,
            saleQuantity: sp.shipmentProduct.saleQuantity,
            stock: sp.shipmentProduct.importQuantity - sp.shipmentProduct.saleQuantity,
            isDeactivated: sp.shipmentProduct.isDeactivated,
            isDeleted: sp.shipment.isDeleted,
            expiryDate: sp.shipmentProduct.expiryDate,
          })),
        }); // Debug stock calculation

        const updatedProductData = {
          ...productData,
          product: {
            ...productData.product,
            stock: totalStock,
          },
          isAvailable,
          availabilityStatus: isAvailable
            ? 'available'
            : isExpired
            ? 'expired'
            : isOutOfStock
            ? 'outOfStock'
            : 'deactivated',
        };

        return { success: true, data: updatedProductData };
      }
      console.warn('getProductById Failed:', response.data.message);
      return { success: false, message: response.data.message || 'Failed to fetch product.' };
    } catch (error) {
      console.error('getProductById Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
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
          'Cache-Control': 'no-cache',
        },
        params: { t: Date.now() }, // Cache-busting
        timeout: 10000,
      });

      console.log('getCategories Response:', JSON.stringify(response.data, null, 2)); // Debug log

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