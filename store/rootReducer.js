// reducers/index.js (rootReducer)
import { combineReducers } from 'redux';
import merchantReducer from './merchantSlice';
import newProductReducer from './newProductSlice';
import editProductReducer from './editProductSlice';
import storeReducer from './storeSlice';

const rootReducer = combineReducers({
    merchant: merchantReducer,
    newProduct: newProductReducer,
    editProduct: editProductReducer,
    store: storeReducer,
});

export default rootReducer;