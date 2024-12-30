import { configureStore } from "@reduxjs/toolkit";
import newProductReducer from "./newProductSlice";
import merchantReducer from './merchantSlice';

export const store = configureStore({
  reducer: {
    merchant: merchantReducer,
    store: storeReducer,
    newProduct: newProductReducer,
  },
});
