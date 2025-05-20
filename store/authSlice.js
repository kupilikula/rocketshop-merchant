// store/authSlice.js
import { createSlice } from '@reduxjs/toolkit';
import {RESET_ALL} from "./actions/resetAll";

const initialState = {
    authenticationStatus: 'UNAUTHENTICATED', // 'UNAUTHENTICATED' | 'CHECKING_REGISTRATION' | 'OTP_SENT' | 'LOGGING_IN' | 'REGISTERING' | 'AUTHENTICATED'
    phone: null,
    isRegistered: null,
    pendingRequestConfig: null,
    redirectAfterAuth: null,
    isAuthModalVisible: false,
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
        // --- New reducers for the authentication modal ---
        openAuthModal: (state, action) => {
            state.isAuthModalVisible = true;
        },
        closeAuthModal: (state) => {
            state.isAuthModalVisible = false;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(RESET_ALL, () => initialState);
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
    openAuthModal,
    closeAuthModal,
} = authSlice.actions;

export default authSlice.reducer;