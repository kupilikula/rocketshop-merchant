import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { refreshAccessToken } from "@/api/refreshAccessToken";
import { BASE_URL } from "@/config/config";

let socketRegistry = []; // Array to track all active sockets
let connectionInProgress = false;
let connectionPromise = null;
// Add debugging helpers
if (global) {
    global.socketRegistry = socketRegistry;
    global.debugSockets = {
        getRegistry: () => socketRegistry,
        logSockets: () => {
            console.log('Current Socket Registry:', socketRegistry.map(entry => ({
                type: entry.type,
                context: entry.context,
                id: entry.socket.id,
                connected: entry.socket.connected
            })));
        },
        getSocketCount: () => socketRegistry.length
    };
}

const registerSocket = (socket, type, context) => {
    // Remove any existing sockets of the same type and context
    socketRegistry = socketRegistry.filter(
        entry => !(entry.type === type && entry.context === context)
    );

    // Add the new socket
    socketRegistry.push({ socket, type, context });
    console.log(`Socket registered. Registry now contains ${socketRegistry.length} sockets:`,
        socketRegistry.map(s => ({
            type: s.type,
            context: s.context,
            id: s.socket.id,
            connected: s.socket.connected
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

export const getSocket = async (type, context = null, storeId = null) => {
    const existingSocket = socketRegistry.find(
        (entry) => entry.type === type && entry.context === context
    );

    if (existingSocket && existingSocket.socket.connected) {
        console.log(`Returning existing socket for type: ${type}, context: ${context}`, existingSocket.socket.id);
        return existingSocket.socket;
    }

    console.log(`Socket for type: ${type}, context: ${context} not initialized. Connecting...`);
    return await connectSocket(type, context, storeId);
};

export const connectSocket = async (type, context = null, storeId = null) => {
    console.log(`[${new Date().toISOString()}] Attempting to connect socket:`, {
        type,
        context,
        storeId,
        existingConnections: socketRegistry.length,
        connectionInProgress,
        existingSockets: socketRegistry.map(s => ({
            type: s.type,
            context: s.context,
            id: s.socket.id,
            connected: s.socket.connected
        }))
    });

    // First, check if we already have a valid connected socket
    const existingSocketEntry = socketRegistry.find(
        (entry) => entry.type === type &&
            entry.context === context &&
            entry.socket.connected
    );

    if (existingSocketEntry) {
        console.log(`Reusing existing connected socket: Type=${type}, Context=${context}, ID=${existingSocketEntry.socket.id}`);
        return existingSocketEntry.socket;
    }

    // If a connection is already in progress, wait for it
    if (connectionInProgress && connectionPromise) {
        console.log(`Connection already in progress for type=${type}, context=${context}. Waiting...`);
        try {
            const socket = await connectionPromise;
            return socket;
        } catch (error) {
            console.error('Error while waiting for existing connection:', error);
        }
    }

    connectionInProgress = true;
    connectionPromise = (async () => {
        try {
            // Cleanup any existing disconnected sockets
            const disconnectedSockets = socketRegistry.filter(
                entry => entry.type === type &&
                    entry.context === context &&
                    !entry.socket.connected
            );

            for (const entry of disconnectedSockets) {
                console.log(`Cleaning up disconnected socket: ${entry.socket.id}`);
                entry.socket.removeAllListeners();
                entry.socket.disconnect();
                deregisterSocket(type, context);
            }

            console.log(`Creating new socket for type: ${type}, context: ${context}...`);
            const token = await AsyncStorage.getItem("accessToken");

            if (!token) {
                throw new Error("No valid token found. Socket connection aborted.");
            }

            const newSocket = io(BASE_URL, {
                transports: ["websocket"],
                autoConnect: false,
                auth: {
                    accessToken: token,
                    storeId: storeId
                },
            });

            // Register the socket BEFORE connecting
            registerSocket(newSocket, type, context);

            // Attach handlers before connecting
            attachSocketHandlers(newSocket, type, context);

            // Connect the socket
            newSocket.connect();

            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Connection timeout'));
                }, 5000);

                newSocket.once('connect', () => {
                    clearTimeout(timeout);
                    resolve();
                });

                newSocket.once('connect_error', (error) => {
                    clearTimeout(timeout);
                    reject(error);
                });
            });

            console.log(`Socket successfully connected for type: ${type}, context: ${context}, ID: ${newSocket.id}`);
            return newSocket;

        } catch (error) {
            console.error(`Socket connection failed for type: ${type}, context: ${context}:`, error);
            deregisterSocket(type, context);
            throw error;
        } finally {
            connectionInProgress = false;
            connectionPromise = null;
        }
    })();

    return await connectionPromise;
};

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
                console.log('Refreshed new accesstoken:', newToken)
                socket.auth.accessToken = newToken;
                socket.connect();
            } catch (refreshError) {
                console.error("Failed to refresh token for socket:", refreshError);
                socket.disconnect();
            }
        }
    });

    socket.on("disconnect", (reason) => {
        console.log(`Socket disconnected: Type=${type}, Context=${context}, ID=${socket.id}, Reason=${reason}`);
    });
};

export const disconnectSocket = (type, context = null) => {
    console.log('Attempting to disconnect socket:', { type, context });

    const entries = socketRegistry.filter(
        (entry) => entry.type === type && entry.context === context
    );

    entries.forEach(entry => {
        console.log('Disconnecting socket:', entry.socket.id);
        // Remove all listeners first
        entry.socket.removeAllListeners();
        // Force disconnect
        entry.socket.disconnect(true);
    });

    deregisterSocket(type, context);

    // Reset connection state if this was the last socket
    if (socketRegistry.length === 0) {
        connectionInProgress = false;
        connectionPromise = null;
    }

    console.log('Current socket registry size:', socketRegistry.length);
    console.log('Current socket registry:', socketRegistry.map(entry =>
        `${entry.socket.id} | ${entry.type} | ${entry.context}`).join(' , '));
};

export const disconnectAllSockets = () => {
    console.log('Disconnecting all sockets...');
    socketRegistry.forEach(entry => {
        console.log(`Disconnecting socket: Type=${entry.type}, Context=${entry.context}, ID=${entry.socket.id}`);
        entry.socket.removeAllListeners();
        entry.socket.disconnect(true);
    });

    socketRegistry = [];
    connectionInProgress = false;
    connectionPromise = null;

    console.log('All sockets disconnected. Registry cleared.');
};

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

export const logActiveSockets = () => {
    console.log('Active sockets:', socketRegistry.map(entry => ({
        id: entry.socket.id,
        type: entry.type,
        context: entry.context,
        connected: entry.socket.connected,
        listeners: entry.socket.listeners
    })));
};



// Debug helpers
export const debugSockets = {
    logSockets: () => {
        console.log('Current Socket Registry:', socketRegistry.map(entry => ({
            id: entry.socket.id,
            type: entry.type,
            context: entry.context,
            connected: entry.socket.connected
        })));
    },
    getSocketCount: () => socketRegistry.length,
    getRegistry: () => socketRegistry
};