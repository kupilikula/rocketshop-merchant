// reducers/index.js (rootReducer)
import { combineReducers } from 'redux';
import merchantReducer from './merchantSlice';
import newProductReducer from './newProductSlice';
import editProductReducer from './editProductSlice';
import storeReducer from './storeSlice';
import allStoresReducer from './allStoresSlice';
import badgesReducer from './badgesSlice';
import authReducer from './authSlice';
import newStoreReducer from './newStoreSlice';
import storeSettingsReducer from './storeSettingsSlice';
import { persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import pushTokenReducer from "./pushTokenSlice";
import shippingRuleReducer from "./shippingRuleSlice";
import razorpayReducer from "./razorpaySlice";

const rootReducer = combineReducers({
    merchant: merchantReducer,
    newProduct: newProductReducer,
    editProduct: editProductReducer,
    store: storeReducer,
    storeSettings: storeSettingsReducer,
    allStores: allStoresReducer,
    newStore: newStoreReducer,
    badges: badgesReducer,
    auth: authReducer,
    pushToken: pushTokenReducer,
    shippingRule: shippingRuleReducer,
    razorpay: razorpayReducer,
});

const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);



export default persistedReducer;