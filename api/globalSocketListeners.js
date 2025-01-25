// socketListeners.js
import {addUnreadMessage} from '@/store/badgesSlice';
import { getSocket } from './websocket';

export const setupSocketListeners = (store) => {
    const socket = getSocket();

    // Listen for new messages
    socket.on('newMessage', (message) => {
        console.log('newMessage: ', message);
        // Update the badge count for the chat
        store.dispatch(addUnreadMessage(message));
    });
};