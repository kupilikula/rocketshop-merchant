import {createSlice} from "@reduxjs/toolkit";

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
});

export const { setPushToken, clearPushToken } = pushTokenSlice.actions;
export default pushTokenSlice.reducer;