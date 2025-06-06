import { createSlice } from '@reduxjs/toolkit';
import {RESET_ALL} from "./actions/resetAll";

const initialState = {
    storeName: '',
    storeHandle: '',
    storeDescription: '',
    storeLogoImage: null,  // { uri, contentType, fileKey }
    storeTags: [],
    firstCollectionName: '',
    storeSettings: {
        defaultGstRate: null,
        defaultGstInclusive: null,
    },
    legalBusinessName: '',
    storeEmail: '',
    storePhone: '',
    businessType: '',
    category: '',
    subcategory: '',
    registeredAddress: {},
    isPlatformOwned: false,
};

const newStoreSlice = createSlice({
    name: 'newStore',
    initialState,
    reducers: {
        setNewStoreField: (state, action) => {
          state[action.payload.field] = action.payload.value;
        },
        setNewStoreName: (state, action) => {
            state.storeName = action.payload;
        },
        setIsPlatformOwned: (state, action) => {
            state.isPlatformOwned = action.payload;
        },
        setNewStoreHandle: (state, action) => {
            state.storeHandle = action.payload;
        },
        setNewStoreDescription: (state, action) => {
            state.storeDescription = action.payload;
        },
        setNewStoreLogoImage: (state, action) => {
            state.storeLogoImage = action.payload;
        },
        addNewStoreTag: (state, action) => {
            if (!state.storeTags.includes(action.payload)) {
                state.storeTags.push(action.payload);
            }
        },
        removeNewStoreTag: (state, action) => {
            state.storeTags = state.storeTags.filter((tag) => tag !== action.payload);
        },
        setNewStoreFirstCollectionName: (state, action) => {
            state.firstCollectionName = action.payload;
        },
        setNewStoreSettings: (state, action) => {
            state.storeSettings = action.payload;
        },
        resetNewStore: () => initialState,

    },
    extraReducers: (builder) => {
        builder.addCase(RESET_ALL, () => initialState);
    },
});

export const {
    setNewStoreField,
    setNewStoreName,
    setIsPlatformOwned,
    setNewStoreHandle,
    setNewStoreDescription,
    setNewStoreLogoImage,
    addNewStoreTag,
    removeNewStoreTag,
    setNewStoreFirstCollectionName,
    setNewStoreSettings,
    resetNewStore,
} = newStoreSlice.actions;

export default newStoreSlice.reducer;