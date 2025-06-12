import { createSlice } from '@reduxjs/toolkit';

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    history: [],
  },
  reducers: {
    // Add reducers as needed
  },
});

export default ordersSlice.reducer;