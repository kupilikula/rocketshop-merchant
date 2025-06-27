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
    storePolicy: {
        handlingTimeDays: 2,
        cancellationWindowHours: 12,
        returnsAccepted: true,
        returnWindowDays: 7,
        refundProcessingTimeDays: 5, // TODO: This is wrong -- needs to be removed (not a parameter)
    },
    storeEmail: '',
    storePhone: '',
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
        setNewStorePolicy: (state, action) => {
          state.storePolicy = action.payload;
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
    setNewStorePolicy,
    resetNewStore,
} = newStoreSlice.actions;

export default newStoreSlice.reducer;