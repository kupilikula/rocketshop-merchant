import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    unreadMessages: {}, // chatId => [messages]
};

const badgesSlice = createSlice({
    name: 'badges',
    initialState,
    reducers: {
        addUnreadMessage: (state, action) => {
            const { chatId, message } = action.payload;
            if (!chatId || !message?.messageId) return;

            if (!state.unreadMessages[chatId]) {
                state.unreadMessages[chatId] = [];
            }

            const alreadyExists = state.unreadMessages[chatId].some(m => m.messageId === message.messageId);
            if (!alreadyExists) {
                state.unreadMessages[chatId].push(message);
            }
        },
        setUnreadMessages: (state, action) => {
            const unreadMessages = action.payload?.unreadMessages ?? {};
            console.log('✅ setting unreadMessages in state:', unreadMessages);
            state.unreadMessages = unreadMessages;
        },
        removeUnreadMessage: (state, action) => {
            console.log('removing unread message', action.payload);
            const { chatId, messageId } = action.payload;
            if (!chatId || !messageId || !state.unreadMessages[chatId]) return;

            state.unreadMessages[chatId] = state.unreadMessages[chatId].filter(msg => msg.messageId !== messageId);
        },

        removeUnreadMessages: (state, action) => {
            console.log('removing unread messages', action.payload);
            const { chatId, messageIds } = action.payload;
            if (!chatId || !Array.isArray(messageIds) || !state.unreadMessages[chatId]) return;

            state.unreadMessages[chatId] = state.unreadMessages[chatId].filter(
                msg => !messageIds.includes(msg.messageId)
            );
        },

        clearUnreadMessages: (state, action) => {
            const { chatId } = action.payload;
            if (!chatId) return;

            state.unreadMessages[chatId] = [];
        },
    },
});

export const {
    addUnreadMessage,
    setUnreadMessages,
    removeUnreadMessage,
    removeUnreadMessages,
    clearUnreadMessages,
} = badgesSlice.actions;

export default badgesSlice.reducer;