import {createSlice} from "@reduxjs/toolkit";
import {RESET_ALL} from "./actions/resetAll";

const initialState = {
    expoPushToken: null,
};

const pushTokenSlice = createSlice({
    name: 'push',
    initialState,
    reducers: {
        setPushToken: (state, action) => {
            state.expoPushToken = action.payload;
        },
        clearPushToken: (state) => {
            state.expoPushToken = null;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(RESET_ALL, () => initialState);
    },
});

export const { setPushToken, clearPushToken } = pushTokenSlice.actions;
export default pushTokenSlice.reducer;