import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { refreshAccessToken } from "@/api/refreshAccessToken";
import { BASE_URL } from "@/config/config";

let socketRegistry = [];

/**
 * Get or connect a socket based on type and context.
 * @param {string} type - The socket type (e.g., 'global', 'chat').
 * @param {string|null} context - The context for the socket (e.g., chatId for chat sockets).
 * @param {string|null} storeId - The store ID for merchant connections.
 * @returns {object} - The socket instance.
 */

export const getSocket = async (type, context = null, storeId = null) => {
    const existingSocket = socketRegistry.find(
        (entry) => entry.type === type && entry.context === context
    );

    if (existingSocket) {
        console.log(`Returning existing socket for type: ${type}, context: ${context}`, existingSocket.socket.id);
        return existingSocket.socket;
    }

    console.log(`Socket for type: ${type}, context: ${context} not initialized. Connecting...`);
    return await connectSocket(type, context, storeId);
};

/**
 * Connect a socket and add it to the registry.
 * @param {string} type - The socket type (e.g., 'global', 'chat').
 * @param {string|null} context - The context for the socket (e.g., chatId for chat sockets).
 * @param {string|null} storeId - The store ID for merchant connections.
 * @returns {object} - The connected socket instance.
 */

export const connectSocket = async (type, context = null, storeId = null) => {
    // Check if a socket of this type and context already exists
    const existingSocketEntry = socketRegistry.find(
        (entry) => entry.type === type && entry.context === context
    );

    if (existingSocketEntry) {
        const { socket } = existingSocketEntry;

        if (socket.connected) {
            console.log(`Reusing existing connected socket: Type=${type}, Context=${context}, ID=${socket.id}`);
            return socket;
        } else {
            console.warn(`Existing socket found but not connected: Type=${type}, Context=${context}, ID=${socket.id}. Reconnecting...`);

            // Attempt to reconnect the socket
            socket.connect();
            return socket;
        }
    }

    console.log(`Connecting new socket for type: ${type}, context: ${context}...`);
    const token = await AsyncStorage.getItem("accessToken");

    if (!token) {
        console.error("No valid token found. Socket connection aborted.");
        return null;
    }

    // Create a new socket instance
    const newSocket = io(BASE_URL, {
        transports: ["websocket"],
        autoConnect: false, // Prevent automatic connection
        auth: {
            accessToken: token,
            storeId: storeId
        }, // Attach the token
    });

    attachSocketHandlers(newSocket, type, context);

    // Connect the socket
    newSocket.connect();

    // Add to registry
    socketRegistry.push({ socket: newSocket, type, context });

    console.log(`Socket connected for type: ${type}, context: ${context}, ID: ${newSocket.id}`);
    return newSocket;
};

/**
 * Attach handlers to a socket instance.
 * @param {object} socket - The socket instance.
 * @param {string} type - The socket type (e.g., 'global', 'chat').
 * @param {string|null} context - The context for the socket (e.g., chatId for chat sockets).
 */
const attachSocketHandlers = (socket, type, context) => {
    socket.on("connect", () => {
        console.log(`Socket connected: Type=${type}, Context=${context}, ID=${socket.id}`);
    });

    socket.on("connect_error", async (error) => {
        console.log(`Connect error for Type=${type}, Context=${context}:`, error.message);
        if (error.message === "Unauthorized") {
            try {
                console.log("Refreshing token for socket...");
                const newToken = await refreshAccessToken();
                console.log('refreshed new accesstoken:', newToken)
                // Save the new token and reconnect the socket
                await AsyncStorage.setItem("accessToken", newToken);
                socket.auth.accessToken = newToken;
                socket.connect();
            } catch (refreshError) {
                console.error("Failed to refresh token for socket:", refreshError);
                socket.disconnect();
            }
        }
    });

    socket.on("disconnect", () => {
        console.log(`Socket disconnected: Type=${type}, Context=${context}, ID=${socket.id}`);
    });
};

/**
 * Disconnect a socket and remove it from the registry.
 * @param {string} type - The socket type (e.g., 'global', 'chat').
 * @param {string|null} context - The context for the socket (e.g., chatId for chat sockets).
 */
export const disconnectSocket = (type, context = null) => {
    console.log('Attempting to disconnect socket:', { type, context });

    // Find all matching entries (there might be duplicates)
    const entries = socketRegistry.filter(
        (entry) => entry.type === type && entry.context === context
    );

    entries.forEach(entry => {
        console.log('Disconnecting socket:', entry.socket.id);
        entry.socket.removeAllListeners();  // Remove all listeners
        entry.socket.disconnect();
    });

    // Remove all matching entries from registry
    socketRegistry = socketRegistry.filter(
        (entry) => !(entry.type === type && entry.context === context)
    );

    console.log('Current socket registry size:', socketRegistry.length);
};

/**
 * Reconnect all sockets in the registry with the updated token.
 */
export const reconnectAllSockets = async () => {
    console.log("Reconnecting all sockets with updated token...");
    const token = await AsyncStorage.getItem("accessToken");

    if (!token) {
        console.error("No valid token found for reconnecting sockets.");
        return;
    }

    for (const entry of socketRegistry) {
        const { socket, type, context } = entry;
        console.log(`Reconnecting socket: Type=${type}, Context=${context}, ID=${socket.id}`);
        socket.auth.accessToken = token;
        socket.connect();
    }
};

/**
 * Debug active sockets in the registry.
 */
export const logActiveSockets = () => {
    console.log("Active sockets:");
    socketRegistry.forEach(({ socket, type, context }) => {
        console.log(`Type: ${type}, Context: ${context}, ID: ${socket.id}, Connected: ${socket.connected}`);
    });
};

/**
 * Disconnect all active sockets and clear the socket registry.
 */
export const disconnectAllSockets = () => {
    console.log("Disconnecting all active sockets...");
    socketRegistry.forEach(({ socket, type, context }) => {
        if (socket) {
            console.log(`Disconnecting socket for type: ${type}, context: ${context}, socket ID: ${socket.id}`);
            socket.disconnect(); // Disconnect the socket
        }
    });
    socketRegistry.length = 0; // Clear the registry
    console.log("All sockets have been disconnected and registry cleared.");
};