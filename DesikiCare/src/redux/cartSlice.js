import { createSlice } from '@reduxjs/toolkit';
const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], discount: null },
  reducers: {
    setCartItems(state, action) {
      state.items = action.payload;
    },
    removeFromCart(state, action) {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    updateCartItemQuantity(state, action) {
      const { id, quantity } = action.payload;
      const item = state.items.find(item => item.id === id);
      if (item) item.quantity = quantity;
    },
    applyDiscount(state, action) {
      state.discount = action.payload;
    },
  },
});
export const { setCartItems, removeFromCart, updateCartItemQuantity, applyDiscount } = cartSlice.actions;
export default cartSlice.reducer;