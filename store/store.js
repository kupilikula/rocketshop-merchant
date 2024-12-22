import { configureStore } from "@reduxjs/toolkit";
import newProductReducer from "./newProductSlice";

export const store = configureStore({
  reducer: {
    newProduct: newProductReducer,
  },
});
