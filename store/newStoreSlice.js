import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    storeName: '',
    storeHandle: '',
    storeDescription: '',
    storeLogoImage: null,  // { uri, contentType, fileKey }
    storeTags: [],
    firstCollectionName: '',
};

const newStoreSlice = createSlice({
    name: 'newStore',
    initialState,
    reducers: {
        setStoreName: (state, action) => {
            state.storeName = action.payload;
        },
        setStoreHandle: (state, action) => {
            state.storeHandle = action.payload;
        },
        setStoreDescription: (state, action) => {
            state.storeDescription = action.payload;
        },
        setStoreLogoImage: (state, action) => {
            state.storeLogoImage = action.payload;
        },
        addStoreTag: (state, action) => {
            if (!state.storeTags.includes(action.payload)) {
                state.storeTags.push(action.payload);
            }
        },
        removeStoreTag: (state, action) => {
            state.storeTags = state.storeTags.filter((tag) => tag !== action.payload);
        },
        setFirstCollectionName: (state, action) => {
            state.firstCollectionName = action.payload;
        },
        resetStoreCreateState: () => initialState,
    },
});

export const {
    setStoreName,
    setStoreHandle,
    setStoreDescription,
    setStoreLogoImage,
    addStoreTag,
    removeStoreTag,
    setFirstCollectionName,
    resetStoreCreateState,
} = newStoreSlice.actions;

export default newStoreSlice.reducer;