import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "@/store/rootReducer";
export const store = configureStore({
  reducer: rootReducer,
});

if (__DEV__) {
  global.store = store;
}

