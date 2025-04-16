import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    unreadMessages: {},
};

const badgesSlice = createSlice({
    name: 'badges',
    initialState,
    reducers: {
        addUnreadMessage: (state, action) => {
            state.unreadMessages[action.payload.chatId] = [...(state.unreadMessages[action.payload.chatId] ?? []), action.payload];
        },
        removeUnreadMessage: (state, action) => {
            const {chatId, messageId} = action.payload;
            state.unreadMessages[chatId] = [...(state.unreadMessages[chatId] ?? []).filter((m) => m.messageId!==messageId)];
        },
        removeUnreadMessages: (state, action) => {
            const {chatId, messageIds} = action.payload;
            state.unreadMessages[chatId] = [...(state.unreadMessages[chatId] ?? []).filter((m) => !messageIds.includes(m.messageId))];
        },
        clearUnreadMessages: (state, action) => {
            const { chatId } = action.payload;
            state.unreadMessages[chatId] = [];
        }
    }});

export const { addUnreadMessage, removeUnreadMessage, removeUnreadMessages, clearUnreadMessages } = badgesSlice.actions;
export default badgesSlice.reducer;
