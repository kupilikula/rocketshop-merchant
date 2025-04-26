// hooks/useUpdateMerchantNotificationPreferences.js

import { useMutation, useQueryClient } from 'react-query';
import axiosClient from '../client';

export function useUpdateMerchantStoreNotificationPreferences(storeId, merchantId) {
    const queryClient = useQueryClient();

    return useMutation(
        async ({ preferences }) => {
            const response = await axiosClient.patch(`/stores/${storeId}/updateNotificationPreferences`, {
                storeId,
                ...preferences
            });
            return response.data;
        },
        {
            onSuccess: (_data, variables) => {
                // Optional: invalidate query for this specific storeId
                queryClient.invalidateQueries(['merchantNotificationPreferences', storeId, merchantId]);
            },
            onError: (error) => {
                console.error('Failed to update merchant notification preferences:', error);
            }
        }
    );
}