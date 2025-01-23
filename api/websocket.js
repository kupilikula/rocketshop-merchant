// websocket.js
import { io } from 'socket.io-client';
import { BASE_URL } from './client';

let socket;

export const getSocket = () => {
    if (!socket) {
        socket = io(BASE_URL, {
            transports: ['websocket'], // WebSocket only
        });
    }
    return socket;
};