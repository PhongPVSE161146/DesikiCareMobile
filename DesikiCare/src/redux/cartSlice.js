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
    addToCart(state, action) {
      const newItem = action.payload;
      const existingItem = state.items.find(item => item.id === newItem.id);
      const quantityToAdd = newItem.quantity || 1;

      if (existingItem) {
        existingItem.quantity += quantityToAdd;
      } else {
        state.items.push({
          ...newItem,
          quantity: quantityToAdd,
        });
      }
    },
  },
});

export const {
  setCartItems,
  removeFromCart,
  updateCartItemQuantity,
  applyDiscount,
  addToCart,
} = cartSlice.actions;

export default cartSlice.reducer;