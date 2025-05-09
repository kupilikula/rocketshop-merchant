// src/hooks/queries/useGetRazorpayStatus.js

import { useQuery } from 'react-query';
import axiosClient from '../client'; // <<< ADJUST path to your configured axios instance

/*
 * Fetches the Razorpay connection status and account ID for a given store.
 * @param {string|null|undefined} storeId - The ID of the store.
 * @returns {Promise<{isConnected: boolean, accountId: string | null}>}
 */
const fetchRazorpayConnectionStatus = async (storeId) => {
    // If storeId is falsy (null, undefined, ''), don't attempt to fetch.
    // The `enabled` option in useQuery is the primary guard for this.
    if (!storeId) {
        console.log("fetchRazorpayConnectionStatus skipped: no storeId provided.");
        // Return a default "not connected" state or throw an error
        // Returning default state is often smoother for initial renders.
        return { isConnected: false, accountId: null };
        // Or: throw new Error("Store ID is required to fetch Razorpay status.");
    }

    try {
        console.log(`Workspaceing Razorpay status for store: ${storeId}`);
        // Call the backend endpoint you created
        const { data } = await axiosClient.get(`/stores/${storeId}/getRazorpayStatus`);
        // Expecting backend to return { isConnected: boolean, accountId?: string | null }
        console.log(`Received status for store ${storeId}:`, data);
        return data;
    } catch (error) {
        console.error(`Error fetching Razorpay connection status for store ${storeId}:`, error.response?.data || error.message);
        // Re-throw the error so React Query's isError/error states are populated
        throw error;
    }
};

/**
 * Custom React Query hook to fetch and manage the Razorpay connection status for a store.
 * Automatically refetches when the window gains focus.
 *
 * @param {string|null|undefined} storeId - The UUID of the store to check. Query is disabled if null/undefined.
 * @param {object} options - Optional additional React Query options (e.g., staleTime, cacheTime, onSuccess).
 * @returns The query result object from React Query: { data, isLoading, isError, error, refetch, status, ... }
 * 'data' will be { isConnected: boolean, accountId: string | null } | undefined
 */
export const useGetRazorpayStatus = (storeId, options = {}) => {
    return useQuery({
        // Query key: Unique identifier. Includes storeId so data is specific to the store
        // and automatically refetches if storeId changes.
        queryKey: ['razorpayConnection', storeId],

        // Query function: The async function that performs the fetch.
        queryFn: () => fetchRazorpayConnectionStatus(storeId),

        // --- React Query Options ---
        // enabled: Only run the query if storeId is truthy (exists).
        // Prevents unnecessary fetches when storeId might not be loaded yet.
        enabled: !!storeId,

        // refetchOnWindowFocus: Automatically refetch when the app regains focus.
        // This is perfect for updating the status after returning from the OAuth browser flow.
        refetchOnWindowFocus: true,

        // staleTime: How long the data is considered fresh (in milliseconds).
        // During this time, data is served from cache without refetching in background.
        // Example: Consider data fresh for 1 minute
        // staleTime: 60 * 1000,

        // cacheTime (or gcTime in v5): How long inactive query data remains in cache.
        // Defaults to 5 minutes. Can be adjusted if needed.
        // gcTime: 5 * 60 * 1000,

        // placeholderData: Optionally provide initial default data before first fetch
        placeholderData: { isConnected: false, accountId: null },

        // Spread any additional options passed to the hook (e.g., onSuccess, onError callbacks)
        ...options,
    });
};