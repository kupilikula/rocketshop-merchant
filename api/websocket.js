import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from 'react-native';
import { refreshAccessToken } from "./refreshAccessToken"; // Assuming this is your existing function
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl;

let socketRegistry = [];

// --- Connection Management (Global Lock - simpler but can be a bottleneck for truly independent sockets) ---
let connectionInProgress = false;
let connectionPromise = null;

// --- Token Refresh Management (Singleton Pattern) ---
let isGloballyRefreshingToken = false;
let globalTokenRefreshPromise = null;

// --- Debugging helpers (conditionally available) ---
// (Kept as is from your original code)
if (Platform.OS !== 'web' || (Platform.OS === 'web' && typeof window !== 'undefined')) {
    if (global) {
        global.socketRegistry = socketRegistry;
        global.debugSockets = {
            getRegistry: () => socketRegistry,
            logSockets: () => {
                console.log('Current Socket Registry:', socketRegistry.map(entry => ({
                    type: entry.type, context: entry.context, id: entry.socket?.id, connected: entry.socket?.connected
                })));
            },
            getSocketCount: () => socketRegistry.length
        };
    }
}

const registerSocket = (socket, type, context) => {
    // Remove any existing socket for the same type and context before adding the new one
    socketRegistry = socketRegistry.filter(entry => !(entry.type === type && entry.context === context));
    socketRegistry.push({ socket, type, context });
    console.log(`Socket registered: Type=${type}, Context=${context}, ID=${socket?.id}. Registry size: ${socketRegistry.length}`);
};

const deregisterSocket = (type, context) => {
    const initialCount = socketRegistry.length;
    socketRegistry = socketRegistry.filter(entry => !(entry.type === type && entry.context === context));
    if (initialCount > socketRegistry.length) {
        console.log(`Socket deregistered: Type=${type}, Context=${context}. Registry size: ${socketRegistry.length}`);
    }
};

const createMockSocket = () => {
    console.warn("Operating in a non-client environment or no token. Using mock socket.");
    return {
        id: 'mock-socket-' + Math.random().toString(36).substr(2, 9),
        connected: false, auth: {},
        connect: () => console.warn("MockSocket: connect called"),
        disconnect: () => console.warn("MockSocket: disconnect called"),
        on: (event, handler) => console.warn(`MockSocket: 'on(${event})' called`),
        once: (event, handler) => console.warn(`MockSocket: 'once(${event})' called`),
        emit: (event, ...args) => console.warn(`MockSocket: 'emit(${event})' called with args:`, args.slice(0, -1)), // Don't log callback
        removeAllListeners: () => console.warn("MockSocket: removeAllListeners called"),
        off: (event, handler) => console.warn(`MockSocket: 'off(${event})' called`),
    };
};

// Custom Error for final authentication failure
class FinalAuthError extends Error {
    constructor(message) {
        super(message);
        this.name = "FinalAuthError";
    }
}

async function ensureTokenAndConnect(socketInstance, type, context) {
    try {
        console.log(`[ensureTokenAndConnect] For socket Type=${type}, Context=${context}, ID=${socketInstance.id}`);
        const token = await AsyncStorage.getItem("accessToken");
        if (!token) {
            console.error(`[ensureTokenAndConnect] No token found for socket ID=${socketInstance.id}. Cannot connect.`);
            throw new FinalAuthError("Authentication token not found. Please log in again.");
        }
        socketInstance.auth.accessToken = token;
        console.log(`[ensureTokenAndConnect] Token set for socket ID=${socketInstance.id}. Attempting connect...`);
        socketInstance.connect();
    } catch (error) {
        console.error(`[ensureTokenAndConnect] Error during token check or connect for socket ID=${socketInstance.id}:`, error);
        socketInstance.disconnect(); // Ensure disconnect on failure
        deregisterSocket(type, context);
        throw error; // Re-throw to be handled by the caller
    }
}


const attachSocketHandlers = (socket, type, context, storeId) => {
    socket.on("connect", () => {
        console.log(`Socket connected: Type=${type}, Context=${context}, ID=${socket.id}`);
        // After successful connection, if there was a pending connectionPromise, it resolves.
        // No specific action needed here unless re-emitting join events after a successful token refresh connect.
    });

    socket.on("connect_error", async (error) => {
        console.error(`Socket connect_error: Type=${type}, Context=${context}, ID=${socket.id}, Error:`, error.message, error.data || error);
        const errorMessage = error.data?.message || error.message;
        const errorType = error.data?.type || "";

        if (errorMessage === "Unauthorized" || errorType === 'UnauthorizedError' || error.message.includes("Unauthorized")) {
            if (isGloballyRefreshingToken && globalTokenRefreshPromise) {
                console.log(`Token refresh already in progress by another socket. Waiting... Socket ID=${socket.id}`);
                try {
                    const newToken = await globalTokenRefreshPromise;
                    socket.auth.accessToken = newToken;
                    console.log(`Retrying connect for socket ID=${socket.id} with newly refreshed token.`);
                    socket.connect();
                } catch (refreshError) {
                    console.error(`Socket ID=${socket.id} failed to connect even after waiting for token refresh:`, refreshError);
                    socket.disconnect(); // Disconnect on final failure
                    deregisterSocket(type, context);
                    // If this refreshError is FinalAuthError, the app should handle global logout.
                }
                return;
            }

            console.log(`Unauthorized error for socket ID=${socket.id}. Attempting token refresh.`);
            isGloballyRefreshingToken = true;
            globalTokenRefreshPromise = refreshAccessToken() // Your existing refreshAccessToken function
                .then(async (newToken) => {
                    console.log(`Token refreshed successfully. New token obtained. Socket ID=${socket.id}`);
                    socket.auth.accessToken = newToken;
                    // Update auth for all other existing sockets too (important for shared connections)
                    for (const entry of socketRegistry) {
                        if (entry.socket && entry.socket.auth) {
                            entry.socket.auth.accessToken = newToken;
                        }
                    }
                    // Attempt to reconnect this specific socket.
                    // If it was a connection attempt (socket.connect() was called), this might trigger another 'connect' or 'connect_error'
                    // If the socket object was just created and not yet connected, .connect() is appropriate.
                    // Socket.IO usually attempts to reconnect based on its policies if auth changes,
                    // but an explicit connect can be made.
                    if (!socket.connected) {
                        console.log(`Socket ID=${socket.id} attempting to connect with new token.`);
                        socket.connect();
                    }
                    return newToken;
                })
                .catch(async (refreshError) => {
                    console.error(`Definitive token refresh failure for socket ID=${socket.id}:`, refreshError);
                    socket.disconnect();
                    deregisterSocket(type, context);
                    // Propagate a specific error indicating global logout might be needed
                    // This error will be caught by callers of getSocket/connectSocket.
                    throw new FinalAuthError("Session expired or token refresh failed. Please log in again.");
                })
                .finally(() => {
                    isGloballyRefreshingToken = false;
                    // Keep globalTokenRefreshPromise with the resolved new token for a short while
                    // so immediate subsequent calls can use it, or null it out.
                    // For simplicity, we let the next refresh cycle create a new promise.
                    // globalTokenRefreshPromise = null; // Or manage its lifetime.
                });

            try {
                await globalTokenRefreshPromise; // Current socket error handler awaits the shared refresh
            } catch (finalAuthError) {
                // This specific socket couldn't benefit from the refresh or refresh failed.
                // It's already disconnected and deregistered in the catch block of the promise.
                console.log(`Socket ID=${socket.id} could not recover after token refresh attempt.`);
            }

        } else {
            console.error(`Non-authentication connect_error for socket: Type=${type}, Context=${context}, ID=${socket.id}. Error: ${error.message}`);
            // Consider a retry mechanism with backoff for transient network errors
            // For now, we disconnect and deregister to allow a fresh attempt on next getSocket.
            socket.disconnect();
            deregisterSocket(type, context);
        }
    });

    socket.on("disconnect", (reason) => {
        console.log(`Socket disconnected: Type=${type}, Context=${context}, ID=${socket.id}, Reason: ${reason}`);
        // Deregister on "definitive" disconnect reasons.
        // For client-initiated disconnects, `disconnectSocket` handles deregistration.
        if (reason === 'io server disconnect' || reason === 'transport close' || reason === 'ping timeout') {
            deregisterSocket(type, context);
        }
    });

    // Optional: General error handler for other socket errors
    socket.on('error', (error) => {
        console.error(`General socket error: Type=${type}, Context=${context}, ID=${socket.id}:`, error);
        // Depending on the error, might need to disconnect or deregister
    });
};

export const getSocket = async (type, context = null, storeId = null) => {
    if (Platform.OS === 'web' && typeof window === 'undefined') {
        return createMockSocket();
    }

    const existingEntry = socketRegistry.find(entry => entry.type === type && entry.context === context);
    if (existingEntry && existingEntry.socket.connected) {
        console.log(`[getSocket] Returning existing connected socket: Type=${type}, Context=${context}, ID=${existingEntry.socket.id}`);
        return existingEntry.socket;
    }

    if (existingEntry && !existingEntry.socket.connected && existingEntry.socket.auth?.accessToken) {
        // If socket exists but is disconnected, and has auth info, try to reconnect it.
        console.log(`[getSocket] Existing disconnected socket found for Type=${type}, Context=${context}. Attempting reconnect...`);
        try {
            // Attach handlers again in case they were cleared or this is a new getSocket call
            // Or, ensure handlers are attached once and persist. For simplicity, re-attach for this path.
            attachSocketHandlers(existingEntry.socket, type, context, storeId);
            existingEntry.socket.connect(); // Socket.IO will use existing auth if still valid.
            // connect_error handler will manage token refresh if needed.
            // Wait for connection or error for this specific reconnect attempt.
            // This can be a simplified version of the main connection promise logic.
            await new Promise((resolve, reject) => {
                const timeoutId = setTimeout(() => {
                    reject(new Error('Reconnect timeout'));
                }, 5000); // Shorter timeout for reconnect

                existingEntry.socket.once('connect', () => { clearTimeout(timeoutId); resolve(existingEntry.socket); });
                existingEntry.socket.once('connect_error', (err) => { clearTimeout(timeoutId); reject(err); });
            });
            return existingEntry.socket;

        } catch (reconnectError) {
            console.error(`[getSocket] Reconnect attempt failed for Type=${type}, Context=${context}. Error: ${reconnectError.message}. Proceeding to full connect.`);
            // Fall through to full connectSocket logic if reconnect fails.
            // The existing socket might be stale or problematic. Deregister it.
            disconnectSocket(type, context); // Clean up the problematic one
        }
    }


    console.log(`[getSocket] No suitable existing socket. Calling connectSocket for Type=${type}, Context=${context}`);
    return connectSocket(type, context, storeId); // This will handle the global lock
};

export const connectSocket = async (type, context = null, storeId = null) => {
    if (Platform.OS === 'web' && typeof window === 'undefined') {
        return createMockSocket();
    }

    // Global connection lock
    if (connectionInProgress) {
        console.log(`[connectSocket] Connection already in progress globally. Awaiting existing promise for Type=${type}, Context=${context}.`);
        try {
            return await connectionPromise;
        } catch (error) {
            console.error(`[connectSocket] Waited for existing connection, but it failed for Type=${type}, Context=${context}. Error: ${error.message}. This call will re-throw.`);
            // The promise itself should handle resetting connectionInProgress if it's the one that set it.
            // If it fails, the next call to connectSocket might try again if connectionInProgress is false.
            throw error;
        }
    }

    console.log(`[connectSocket] Initiating new connection sequence for Type=${type}, Context=${context}.`);
    connectionInProgress = true;
    // Create the promise, assign it globally, then await it locally.
    // The IIFE's finally block is responsible for resetting connectionInProgress.
    connectionPromise = (async () => {
        let newSocket;
        try {
            console.log(`[connectSocket-IIFE] Creating new socket instance for Type=${type}, Context=${context}`);
            const token = await AsyncStorage.getItem("accessToken");
            if (!token && (type !== 'guest' && context !== 'guest')) { // Allow guest sockets if you have any
                console.warn(`[connectSocket-IIFE] No token for Type=${type}, Context=${context}. Aborting connection.`);
                throw new FinalAuthError("Authentication token not found. Please log in again.");
            }

            newSocket = io(API_BASE_URL, {
                transports: ["websocket"],
                autoConnect: false, // Critical: connect manually after attaching handlers
                auth: {
                    accessToken: token, // Token can be null for guest sockets if backend allows
                    storeId: storeId
                },
                // Consider adding reconnection options if needed
                // reconnectionAttempts: 3,
                // reconnectionDelay: 1000,
            });

            registerSocket(newSocket, type, context); // Register before attaching handlers or connecting
            attachSocketHandlers(newSocket, type, context, storeId);

            console.log(`[connectSocket-IIFE] Manually connecting socket Type=${type}, Context=${context}, ID=${newSocket.id}`);
            newSocket.connect();

            // Wait for connection or error from this specific instance
            await new Promise((resolve, reject) => {
                const timeoutDuration = 15000; // 15 seconds timeout
                const timeoutId = setTimeout(() => {
                    console.error(`[connectSocket-IIFE] Connection attempt timed out after ${timeoutDuration/1000}s for ID=${newSocket.id}`);
                    newSocket.disconnect(); // Important: disconnect on timeout
                    // No deregister here, connect_error or disconnect handler should do it.
                    reject(new Error(`Socket connection timeout for Type=${type}, Context=${context}`));
                }, timeoutDuration);

                newSocket.once('connect', () => {
                    clearTimeout(timeoutId);
                    console.log(`[connectSocket-IIFE] Socket connected successfully: ID=${newSocket.id}`);
                    resolve(newSocket);
                });

                newSocket.once('connect_error', (error) => {
                    clearTimeout(timeoutId);
                    console.error(`[connectSocket-IIFE] connect_error during connection promise for ID=${newSocket.id}:`, error.message);
                    // Handlers in attachSocketHandlers will manage token refresh. If that also fails, this promise rejects.
                    // The connect_error handler in attachSocketHandlers might disconnect and deregister.
                    reject(error); // Propagate the error
                });

                newSocket.once('disconnect', (reason) => { // Handle disconnect during initial attempt
                    clearTimeout(timeoutId);
                    console.error(`[connectSocket-IIFE] Socket disconnected during initial connection attempt for ID=${newSocket.id}, Reason: ${reason}`);
                    // Handlers in attachSocketHandlers will deregister if appropriate.
                    reject(new Error(`Socket disconnected during connection: ${reason}`));
                });
            });
            return newSocket;
        } catch (error) {
            console.error(`[connectSocket-IIFE] Error in connection IIFE for Type=${type}, Context=${context}:`, error);
            // If newSocket instance was created but failed, ensure it's cleaned up if not already handled
            if (newSocket && !newSocket.connected) {
                newSocket.disconnect();
                deregisterSocket(type, context);
            }
            throw error; // Re-throw for the outer promise
        } finally {
            console.log(`[connectSocket-IIFE] Releasing global connection lock set by Type=${type}, Context=${context}.`);
            connectionInProgress = false;
            // Nulling connectionPromise here means if multiple were waiting, only one gets the result,
            // others might re-initiate. This simple global lock is tricky.
            // Ideally, connectionPromise holds the outcome for all waiters.
            // Let's not null it here; let it hold the resolved/rejected promise from this attempt.
            // The next call to connectSocket will re-evaluate connectionInProgress.
        }
    })();

    try {
        return await connectionPromise;
    } catch (e) {
        // If the promise assigned to global connectionPromise failed, subsequent callers
        // that await it will also get this error. The `connectionInProgress` flag being false
        // will allow the *next* call to `connectSocket` to try a fresh attempt.
        console.error(`[connectSocket] Main await failed for Type=${type}, Context=${context}: ${e.message}`);
        throw e;
    }
};

export const disconnectSocket = (type, context = null) => {
    // ... (original disconnectSocket, ensure it calls deregisterSocket) ...
    if (Platform.OS === 'web' && typeof window === 'undefined') { return; }
    const entriesToDisconnect = socketRegistry.filter(entry => entry.type === type && entry.context === context);
    entriesToDisconnect.forEach(entry => {
        if (entry.socket) {
            console.log(`[disconnectSocket] Disconnecting Type=${entry.type}, Context=${entry.context}, ID=${entry.socket.id}`);
            entry.socket.removeAllListeners(); // Clean up listeners
            entry.socket.disconnect(); // Use disconnect without true for graceful
        }
    });
    deregisterSocket(type, context); // This will remove them from the registry
    // If this was the last socket using a shared connection promise, reset flags
    // This is hard to manage with a single global connectionPromise if it's not per type/context.
    // For now, if registry is empty, reset.
    if (socketRegistry.length === 0) {
        connectionInProgress = false;
        connectionPromise = null;
    }
};

export const disconnectAllSockets = () => {
    // ... (original disconnectAllSockets) ...
    if (Platform.OS === 'web' && typeof window === 'undefined') { return; }
    socketRegistry.forEach(entry => {
        if (entry.socket) {
            console.log(`[disconnectAllSockets] Disconnecting ID=${entry.socket.id}`);
            entry.socket.removeAllListeners();
            entry.socket.disconnect();
        }
    });
    socketRegistry = [];
    connectionInProgress = false;
    connectionPromise = null;
    isGloballyRefreshingToken = false; // Also reset token refresh state
    globalTokenRefreshPromise = null;
    console.log('All sockets disconnected and global states reset.');
};

export const reconnectAllSockets = async () => {
    if (Platform.OS === 'web' && typeof window === 'undefined') { return; }
    console.log("[reconnectAllSockets] Attempting to reconnect all registered sockets with fresh token...");
    let token;
    try {
        token = await AsyncStorage.getItem("accessToken");
    } catch (e) {
        console.error("[reconnectAllSockets] Failed to get token from AsyncStorage:", e);
        return; // Cannot proceed
    }

    if (!token) {
        console.warn("[reconnectAllSockets] No token found. Disconnecting all sockets instead.");
        disconnectAllSockets();
        return;
    }

    // Create a copy of the registry to iterate over, as connectSocket might modify it
    const currentSocketsToReconnect = [...socketRegistry];
    // First, disconnect all existing to ensure clean state and re-application of new token via auth
    currentSocketsToReconnect.forEach(entry => {
        if (entry.socket) {
            console.log(`[reconnectAllSockets] Preemptively disconnecting ID=${entry.socket.id} for re-authentication.`);
            entry.socket.removeAllListeners(); // Remove old listeners
            entry.socket.disconnect();
        }
    });
    // Clear the registry before attempting to reconnect with connectSocket which will re-register
    socketRegistry = [];
    connectionInProgress = false; // Reset global lock
    connectionPromise = null;

    for (const entry of currentSocketsToReconnect) {
        console.log(`[reconnectAllSockets] Re-establishing connection for Type=${entry.type}, Context=${entry.context}`);
        try {
            // connectSocket will fetch the latest token and handle new connection
            // No need to set socket.auth.token here, connectSocket does it.
            await connectSocket(entry.type, entry.context, entry.socket.auth?.storeId || entry.storeId); // Pass original storeId if available
        } catch (error) {
            console.error(`[reconnectAllSockets] Failed to reconnect Type=${entry.type}, Context=${entry.context}:`, error);
        }
    }
    console.log("[reconnectAllSockets] Reconnection process initiated for applicable sockets.");
};


// Debug helpers (ensure they are also client-side if they access socket properties directly)
export const logActiveSockets = () => { /* ... original ... */
    if (Platform.OS === 'web' && typeof window === 'undefined') { console.warn("[logActiveSockets] Not a client environment."); return; }
    console.log('Active sockets:', socketRegistry.map(entry => ({ id: entry.socket?.id, type: entry.type, context: entry.context, connected: entry.socket?.connected, })));
};
export const debugSockets = { /* ... original ... */
    logSockets: () => { if (Platform.OS === 'web' && typeof window === 'undefined') { console.warn("[debugSockets.logSockets] Not a client environment."); return; } console.log('Current Socket Registry:', socketRegistry.map(entry => ({ id: entry.socket?.id, type: entry.type, context: entry.context, connected: entry.socket?.connected }))); },
    getSocketCount: () => socketRegistry.length,
    getRegistry: () => socketRegistry
};