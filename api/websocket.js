import { io } from 'socket.io-client';
import { BASE_URL } from './client';
import AsyncStorage from '@react-native-async-storage/async-storage';

let socket = null;

export const getSocket = async () => {
    // Return the socket if it's already initialized
    if (socket) return socket;

    // Fetch the token from AsyncStorage
    const token = await AsyncStorage.getItem("accessToken");

    // Initialize the socket
    socket = io(BASE_URL, {
        transports: ['websocket'], // Use WebSocket transport only
        autoConnect: false, // Prevent auto connection on import
        auth: { accessToken: token },
    });

    return socket;
};

export const connectSocket = async () => {
    const socketInstance = await getSocket(); // Ensure socket is initialized
    if (!socketInstance.connected) {
        socketInstance.connect(); // Connect the socket
    }
    return socketInstance;
};

export const disconnectSocket = async () => {
    if (socket) {
        socket.disconnect(); // Disconnect the socket
        socket = null; // Clear the socket reference
    }
};