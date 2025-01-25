// websocket.js
import { io } from 'socket.io-client';
import { BASE_URL } from './client';

let socket = null;

export const getSocket = () => {
    if (!socket) {
        socket = io(BASE_URL, {
            transports: ['websocket'], // Use WebSocket transport only
            autoConnect: false, // Prevent automatic connection on import
        });
    }
    return socket;
};

export const connectSocket = () => {
    const socketInstance = getSocket();
    if (!socketInstance.connected) {
        socketInstance.connect();
    }
    return socketInstance;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null; // Clear the socket instance
    }
};