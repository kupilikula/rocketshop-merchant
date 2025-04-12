// store/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    authenticationStatus: 'UNAUTHENTICATED', // 'UNAUTHENTICATED' | 'CHECKING_REGISTRATION' | 'OTP_SENT' | 'LOGGING_IN' | 'REGISTERING' | 'AUTHENTICATED'
    phone: null,
    isRegistered: null,
    pendingRequestConfig: null,
    redirectAfterAuth: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        resetAuthState: () => initialState,

        setAuthenticationStatus: (state, action) => {
            state.authenticationStatus = action.payload;
        },

        setPhone: (state, action) => {
            state.phone = action.payload;
        },

        setIsRegistered: (state, action) => {
            state.isRegistered = action.payload;
        },

        setPendingRequest: (state, action) => {
            state.pendingRequestConfig = action.payload;
        },

        clearPendingRequest: (state) => {
            state.pendingRequestConfig = null;
        },

        setRedirectAfterAuth: (state, action) => {
            state.redirectAfterAuth = action.payload;
        },

        clearRedirectAfterAuth: (state) => {
            state.redirectAfterAuth = null;
        },
    },
});

export const {
    resetAuthState,
    setAuthenticationStatus,
    setPhone,
    setIsRegistered,
    setPendingRequest,
    clearPendingRequest,
    setRedirectAfterAuth,
    clearRedirectAfterAuth,
} = authSlice.actions;

export default authSlice.reducer;