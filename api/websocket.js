import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { refreshAccessToken } from "@/api/refreshAccessToken";
import { BASE_URL } from "@/config/config";

let socketRegistry = [];
let connectionInProgress = false;
let connectionPromise = null;

export const getSocket = async (type, context = null, storeId = null) => {
    const existingSocket = socketRegistry.find(
        (entry) => entry.type === type &&
            entry.context === context &&
            entry.socket.connected
    );

    if (existingSocket) {
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
            const socket = await connectionPromise;
            return socket;
        } catch (error) {
            console.error('Error while waiting for existing connection:', error);
        }
    }

    connectionInProgress = true;
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

            registerSocket(newSocket, type, context);
            attachSocketHandlers(newSocket, type, context);
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

const registerSocket = (socket, type, context) => {
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
    const initialLength = socketRegistry.length;
    socketRegistry = socketRegistry.filter(
        (entry) => !(entry.type === type && entry.context === context)
    );
    const removedCount = initialLength - socketRegistry.length;
    console.log(`Socket deregistered. Removed ${removedCount} sockets. Registry now contains ${socketRegistry.length} sockets`);
};

export const disconnectSocket = (type, context = null) => {
    console.log('Attempting to disconnect socket:', { type, context });

    const entries = socketRegistry.filter(
        (entry) => entry.type === type && entry.context === context
    );

    entries.forEach(entry => {
        console.log('Disconnecting socket:', entry.socket.id);
        entry.socket.removeAllListeners();
        entry.socket.disconnect(true);
    });

    deregisterSocket(type, context);

    if (socketRegistry.length === 0) {
        connectionInProgress = false;
        connectionPromise = null;
    }

    console.log('Current socket registry size:', socketRegistry.length);
    console.log('Current socket registry:', socketRegistry.map(entry =>
        `${entry.socket.id} (${entry.type}, ${entry.context})`).join(' | '));
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

export const logActiveSockets = () => {
    console.log('Active sockets:', socketRegistry.map(entry => ({
        id: entry.socket.id,
        type: entry.type,
        context: entry.context,
        connected: entry.socket.connected,
        listeners: entry.socket.listeners
    })));
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
                console.log('Refreshed new accessToken:', newToken);
                // Socket will automatically reconnect with new token
            } catch (refreshError) {
                console.error("Failed to refresh token:", refreshError);
            }
        }
    });

    socket.on("disconnect", (reason) => {
        console.log(`Socket disconnected: Type=${type}, Context=${context}, ID=${socket.id}, Reason=${reason}`);
    });
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