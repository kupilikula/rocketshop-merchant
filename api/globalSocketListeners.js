import { addUnreadMessage } from '../store/badgesSlice';
import { connectSocket } from './websocket';

export const setupSocketListeners = async (store) => {
    const socket = await connectSocket(); // Ensure socket is connected

    // Listen for global events
    socket.on('newMessage', (message) => {
        // Update the badge count for the chat
        store.dispatch(addUnreadMessage(message));
    });
};