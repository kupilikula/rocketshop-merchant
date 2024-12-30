import { configureStore } from "@reduxjs/toolkit";
import newProductReducer from "./newProductSlice";
import merchantReducer from './merchantSlice';
import storeReducer from './storeSlice';
export const store = configureStore({
  reducer: {
    merchant: merchantReducer,
    store: storeReducer,
    newProduct: newProductReducer,
  },
});
