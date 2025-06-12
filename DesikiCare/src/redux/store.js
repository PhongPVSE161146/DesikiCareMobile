import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import authReducer from './authSlice';
import ordersReducer from './ordersSlice';
export default configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
    orders: ordersReducer,
  },
});