import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from 'react-native'; // Import Platform
import { refreshAccessToken } from "./refreshAccessToken";
import Constants from 'expo-constants';

const CHAT_API_BASE_URL = Constants.expoConfig?.extra?.chatApiBaseUrl;

let socketRegistry = [];
let connectionInProgress = false;
let connectionPromise = null;

// --- Debugging helpers (conditionally available) ---
if (Platform.OS !== 'web' || (Platform.OS === 'web' && typeof window !== 'undefined')) {
    if (global) { // global might not exist in all strict web environments without a bundler polyfill
        global.socketRegistry = socketRegistry;
        global.debugSockets = {
            getRegistry: () => socketRegistry,
            logSockets: () => {
                console.log('Current Socket Registry:', socketRegistry.map(entry => ({
                    type: entry.type,
                    context: entry.context,
                    id: entry.socket?.id, // Add null check for socket
                    connected: entry.socket?.connected // Add null check
                })));
            },
            getSocketCount: () => socketRegistry.length
        };
    }
}
// --- End Debugging helpers ---


const registerSocket = (socket, type, context) => {
    socketRegistry = socketRegistry.filter(
        entry => !(entry.type === type && entry.context === context)
    );
    socketRegistry.push({ socket, type, context });
    console.log(`Socket registered. Registry now contains ${socketRegistry.length} sockets:`,
        socketRegistry.map(s => ({
            type: s.type,
            context: s.context,
            id: s.socket?.id,
            connected: s.socket?.connected
        }))
    );
};

const deregisterSocket = (type, context) => {
    const beforeCount = socketRegistry.length;
    socketRegistry = socketRegistry.filter(
        entry => !(entry.type === type && entry.context === context)
    );
    console.log(`Socket deregistered. Removed ${beforeCount - socketRegistry.length} sockets. Registry now contains ${socketRegistry.length} sockets`);
};

// Mock socket for server-side or when window is not defined on web
const createMockSocket = () => {
    console.warn("Operating in a non-client environment. Using mock socket.");
    return {
        id: 'mock-socket-' + Math.random().toString(36).substr(2, 9),
        connected: false,
        auth: {},
        connect: () => console.warn("MockSocket: connect called"),
        disconnect: () => console.warn("MockSocket: disconnect called"),
        on: () => console.warn("MockSocket: on called"),
        once: () => console.warn("MockSocket: once called"),
        emit: () => console.warn("MockSocket: emit called"),
        removeAllListeners: () => console.warn("MockSocket: removeAllListeners called"),
        // Add any other methods your app might try to call on a socket
    };
};


export const getSocket = async (type, context = null) => {
    // If not on a client platform, return a mock or throw an error
    if (Platform.OS === 'web' && typeof window === 'undefined') {
        return createMockSocket();
    }

    const existingSocket = socketRegistry.find(
        (entry) => entry.type === type && entry.context === context
    );

    if (existingSocket && existingSocket.socket.connected) {
        console.log(`Returning existing socket for type: ${type}, context: ${context}`, existingSocket.socket.id);
        return existingSocket.socket;
    }

    console.log(`Socket for type: ${type}, context: ${context} not initialized or disconnected. Connecting...`);
    return await connectSocket(type, context);
};

export const connectSocket = async (type, context = null) => {
    // If not on a client platform, return a mock or throw an error
    if (Platform.OS === 'web' && typeof window === 'undefined') {
        console.warn(`[connectSocket] Not a client environment. Returning mock socket for type: ${type}, context: ${context}`);
        return createMockSocket();
    }

    console.log(`[${new Date().toISOString()}] Attempting to connect socket:`, {
        type,
        context,
        existingConnections: socketRegistry.length,
        connectionInProgress,
    });

    const existingSocketEntry = socketRegistry.find(
        (entry) => entry.type === type &&
            entry.context === context &&
            entry.socket.connected
    );

    if (existingSocketEntry) {
        console.log(`Reusing existing connected socket: Type=${type}, Context=${context}, ID=${existingSocketEntry.socket.id}`);
        return existingSocketEntry.socket;
    }

    if (connectionInProgress && connectionPromise) {
        console.log(`Connection already in progress for type=${type}, context=${context}. Waiting...`);
        try {
            return await connectionPromise; // Return the resolved socket from the ongoing promise
        } catch (error) {
            console.error('Error while waiting for existing connection:', error);
            // Fall through to attempt a new connection if the shared promise failed,
            // or rethrow if the design implies only one attempt.
            // For simplicity here, we'll let it try to create a new one if the shared one failed.
            // Resetting these might be needed if the shared promise itself handles cleanup.
            connectionInProgress = false;
            connectionPromise = null;
        }
    }

    connectionInProgress = true;
    // Assign the promise to connectionPromise so other calls can await it
    connectionPromise = (async () => {
        try {
            const disconnectedSockets = socketRegistry.filter(
                entry => entry.type === type &&
                    entry.context === context &&
                    !entry.socket.connected
            );

            for (const entry of disconnectedSockets) {
                console.log(`Cleaning up disconnected socket: ${entry.socket.id}`);
                entry.socket.removeAllListeners();
                entry.socket.disconnect();
                // deregisterSocket(type, context); // Deregister happens after new socket is registered or on failure
            }

            console.log(`Creating new socket for type: ${type}, context: ${context}...`);
            let token = null;
            // AsyncStorage access is client-side only
            if ((Platform.OS === 'web' && typeof window !== 'undefined') || Platform.OS !== 'web') {
                token = await AsyncStorage.getItem("accessToken");
            }

            if (!token) {
                // No console.error here, as this might be an expected state for guest users
                console.log("No valid token found. Socket connection aborted for non-authenticated features.");
                throw new Error("No valid token found. Socket connection aborted.");
            }

            const newSocket = io(CHAT_API_BASE_URL, {
                transports: ["websocket"],
                autoConnect: false,
                auth: { accessToken: token },
            });

            registerSocket(newSocket, type, context); // Register immediately
            attachSocketHandlers(newSocket, type, context);
            newSocket.connect();

            // Wait for connection or error
            await new Promise((resolve, reject) => {
                const timeoutId = setTimeout(() => {
                    console.error(`Socket connection timeout for type: ${type}, context: ${context}`);
                    newSocket.disconnect(); // Ensure cleanup on timeout
                    reject(new Error('Connection timeout'));
                }, 10000); // Increased timeout

                newSocket.once('connect', () => {
                    clearTimeout(timeoutId);
                    console.log(`Socket successfully connected for type: ${type}, context: ${context}, ID: ${newSocket.id}`);
                    resolve(newSocket);
                });

                newSocket.once('connect_error', (error) => {
                    clearTimeout(timeoutId);
                    console.error(`Socket connect_error for type: ${type}, context: ${context}:`, error);
                    deregisterSocket(type, context); // Clean up from registry on connect_error
                    reject(error);
                });
            });
            return newSocket; // Return the connected socket

        } catch (error) {
            console.error(`Socket connection failed for type: ${type}, context: ${context}:`, error.message);
            deregisterSocket(type, context); // Ensure deregistration on any failure in this block
            throw error; // Re-throw to be caught by the caller of connectionPromise
        } finally {
            // Only reset if this specific promise instance was the one managing connectionInProgress
            if (connectionPromise === thisPromise) { // 'thisPromise' would be the current promise instance
                connectionInProgress = false;
                connectionPromise = null;
            }
        }
    })();
    // A bit of a workaround to ensure the finally block resets the correct promise's state
    const thisPromise = connectionPromise;


    try {
        return await connectionPromise;
    } catch (error) {
        // If the shared promise failed, ensure the global state is reset if this call was the one that initiated it.
        // This logic is tricky with shared promises. A more robust solution might involve a more complex state machine
        // or ensuring that the promise itself cleans up the global state correctly in its finally block.
        // For now, if connectionPromise is still thisPromise, it means this path might need to reset.
        if (connectionPromise === thisPromise) {
            connectionInProgress = false;
            connectionPromise = null;
        }
        throw error; // rethrow the error for the original caller of connectSocket
    }
};


const attachSocketHandlers = (socket, type, context) => {
    socket.on("connect", () => {
        console.log(`Socket connected: Type=${type}, Context=${context}, ID=${socket.id}`);
    });

    socket.on("connect_error", async (error) => {
        console.log(`Connect error for Type=${type}, Context=${context}:`, error.message);
        // Check if error object and data property exist
        const errorMessage = error.data?.message || error.message;
        if (errorMessage === "Unauthorized" || (error.data && error.data.type === 'UnauthorizedError')) {
            // Ensure refreshAccessToken is only called client-side
            if ((Platform.OS === 'web' && typeof window !== 'undefined') || Platform.OS !== 'web') {
                try {
                    console.log("Refreshing token for socket...");
                    const newToken = await refreshAccessToken(); // refreshAccessToken now handles its own AsyncStorage
                    console.log('Refreshed new access token for socket:', newToken);
                    socket.auth.accessToken = newToken;
                    socket.connect(); // Attempt to reconnect with the new token
                } catch (refreshError) {
                    console.error("Failed to refresh token for socket:", refreshError);
                    socket.disconnect(); // Disconnect if token refresh fails
                    deregisterSocket(type, context); // Also remove from registry
                }
            } else {
                console.warn("Cannot refresh token for socket in non-client environment.");
                socket.disconnect();
                deregisterSocket(type, context);
            }
        } else {
            // For other connection errors, you might want to deregister or implement retry logic
            console.error(`Non-auth connect_error for socket Type=${type}, Context=${context}:`, error);
            // socket.disconnect(); // Optionally disconnect
            // deregisterSocket(type, context); // Optionally deregister
        }
    });

    socket.on("disconnect", (reason) => {
        console.log(`Socket disconnected: Type=${type}, Context=${context}, ID=${socket.id}, Reason=${reason}`);
        // Optionally deregister on disconnect, depending on whether you want to auto-reconnect on next getSocket call
        // If reason is 'io server disconnect' or 'transport close', it's likely a permanent disconnect for this instance.
        if (reason === 'io server disconnect' || reason === 'transport close' || reason === 'ping timeout') {
            deregisterSocket(type, context);
        }
    });

    // Add other global handlers if necessary
};

export const disconnectSocket = (type, context = null) => {
    if (Platform.OS === 'web' && typeof window === 'undefined') {
        console.warn(`[disconnectSocket] Not a client environment. Skipping for type: ${type}, context: ${context}`);
        return;
    }
    console.log('Attempting to disconnect socket:', { type, context });

    const entriesToDisconnect = socketRegistry.filter(
        (entry) => entry.type === type && entry.context === context
    );

    entriesToDisconnect.forEach(entry => {
        if (entry.socket) {
            console.log('Disconnecting socket:', entry.socket.id);
            entry.socket.removeAllListeners();
            entry.socket.disconnect(true); // true for forceful disconnect
        }
    });

    deregisterSocket(type, context); // Remove from registry

    if (socketRegistry.length === 0) {
        connectionInProgress = false;
        connectionPromise = null;
    }
    console.log('Socket disconnect complete. Registry size:', socketRegistry.length);
};

export const disconnectAllSockets = () => {
    if (Platform.OS === 'web' && typeof window === 'undefined') {
        console.warn("[disconnectAllSockets] Not a client environment. Skipping.");
        return;
    }
    console.log('Disconnecting all sockets...');
    socketRegistry.forEach(entry => {
        if (entry.socket) {
            console.log(`Disconnecting socket: Type=${entry.type}, Context=${entry.context}, ID=${entry.socket.id}`);
            entry.socket.removeAllListeners();
            entry.socket.disconnect(true);
        }
    });
    socketRegistry = [];
    connectionInProgress = false;
    connectionPromise = null;
    console.log('All sockets disconnected. Registry cleared.');
};

export const reconnectAllSockets = async () => {
    if (Platform.OS === 'web' && typeof window === 'undefined') {
        console.warn("[reconnectAllSockets] Not a client environment. Skipping.");
        return;
    }
    console.log("Reconnecting all sockets with updated token...");
    let token = null;
    try {
        token = await AsyncStorage.getItem("accessToken");
    } catch (e) {
        console.error("AsyncStorage error during reconnectAllSockets:", e);
        return; // Cannot proceed without token
    }


    if (!token) {
        console.error("No valid token found for reconnecting sockets.");
        // Optionally disconnect all sockets if no token, as they can't be valid
        disconnectAllSockets();
        return;
    }

    for (const entry of [...socketRegistry]) { // Iterate over a copy in case of modification
        const { socket, type, context } = entry;
        if (socket) {
            console.log(`Reconnecting socket: Type=${type}, Context=${context}, ID=${socket.id}`);
            socket.auth.accessToken = token;
            // If socket is already connected, it might not re-auth.
            // It's often better to disconnect and let it reconnect cleanly if auth needs to be updated.
            // However, socket.io's `auth` property is dynamic, so just setting it and calling connect()
            // should work for pending or future connections. If already connected, it might require a disconnect.
            if (socket.connected) {
                console.log(`Socket ${socket.id} already connected. Forcing disconnect to re-auth.`);
                socket.disconnect(); // Disconnect first
                socket.connect();     // Then connect to use new auth
            } else {
                socket.connect();
            }
        }
    }
};

// Debug helpers (ensure they are also client-side if they access socket properties directly)
export const logActiveSockets = () => {
    if (Platform.OS === 'web' && typeof window === 'undefined') {
        console.warn("[logActiveSockets] Not a client environment.");
        return;
    }
    console.log('Active sockets:', socketRegistry.map(entry => ({
        id: entry.socket?.id,
        type: entry.type,
        context: entry.context,
        connected: entry.socket?.connected,
        // listeners: entry.socket?.listeners // This might be too verbose or internal
    })));
};

export const debugSockets = {
    logSockets: () => {
        if (Platform.OS === 'web' && typeof window === 'undefined') {
            console.warn("[debugSockets.logSockets] Not a client environment.");
            return;
        }
        console.log('Current Socket Registry:', socketRegistry.map(entry => ({
            id: entry.socket?.id,
            type: entry.type,
            context: entry.context,
            connected: entry.socket?.connected
        })));
    },
    getSocketCount: () => socketRegistry.length,
    getRegistry: () => socketRegistry
};
