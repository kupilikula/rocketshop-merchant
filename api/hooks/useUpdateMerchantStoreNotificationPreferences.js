// hooks/useUpdateMerchantNotificationPreferences.js

import { useMutation, useQueryClient } from 'react-query';
import { getAxiosClient } from '../client';

export function useUpdateMerchantStoreNotificationPreferences(storeId, merchantId) {
    const queryClient = useQueryClient();
    const axiosClient = getAxiosClient();
    return useMutation(
        async (preferences) => {
            const response = await axiosClient.patch(`/stores/${storeId}/updateNotificationPreferences`, preferences);
            return response.data;
        },
        {
            onSuccess: (_data, variables) => {
                // Optional: invalidate query for this specific storeId
                queryClient.invalidateQueries(['merchantStoreNotificationPreferences', storeId, merchantId]);
            },
            onError: (error) => {
                console.error('Failed to update merchant notification preferences:', error);
            }
        }
    );
}