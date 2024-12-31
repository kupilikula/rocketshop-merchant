// reducers/index.js (rootReducer)
import { combineReducers } from 'redux';
import merchantReducer from './merchantSlice';
import newProductReducer from './newProductSlice';
import storeReducer from './storeSlice';

const rootReducer = combineReducers({
    merchant: merchantReducer,
    newProduct: newProductReducer,
    store: storeReducer,
});

export default rootReducer;