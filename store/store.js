import { configureStore } from "@reduxjs/toolkit";
import persistedReducer from "@/store/rootReducer";
import {persistStore} from "redux-persist";

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false, // Important for redux-persist to work
      }),
});

const persistor = persistStore(store);

export { store, persistor };

if (__DEV__) {
  global.store = store;
}

