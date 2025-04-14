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
});


export default rootReducer;