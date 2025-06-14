import { createSlice } from "@reduxjs/toolkit";
import {RESET_ALL} from "./actions/resetAll";

const initialState = {
  storeId: null,
    storeName: null,
    storeLogoImage: null,
    storeDescription: null,
    storeHandle: null,
    storeTags: null,
    storePolicy: {},
    merchantRole: null,
    canReceiveMessages: null,
    isActive: null,
    isPlatformOwned: null,
};

const storeSlice = createSlice({
  name: "store",
  initialState,
  reducers: {
      setStore: (state, action) => {
          return {...state, ...action.payload};
      },
      clearStore: (state, action) => {
          return {...initialState};
      },
  },
    extraReducers: (builder) => {
        builder.addCase(RESET_ALL, () => initialState);
    },
});

export const {
    setStore,
    clearStore
} = storeSlice.actions;

export default storeSlice.reducer;
