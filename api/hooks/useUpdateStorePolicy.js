// src/api/hooks/useUpdateStorePolicy.js
//--------------------------------------
// Updates (or creates) the policy.
// • Uses POST /stores/:storeId/policy
// • Invalidates the fetch query on success.
// • Returns { mutate, mutateAsync, isLoading, … }

import { useMutation, useQueryClient } from 'react-query';
import {getAxiosClient} from '../client'; // ← same wrapper as above

const postStorePolicy = async ({ storeId, values }) => {
    const axiosClient = getAxiosClient();
    await axiosClient.patch(`/stores/${storeId}/policy`, values);
};

export default function useUpdateStorePolicy(storeId, options = {}) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({storeId, values}) => {
            return postStorePolicy({ storeId, values })},
        onSuccess: () => {
            // refresh cached copy
            queryClient.invalidateQueries(['storePolicy', storeId]);
        },
        onError: err => {
            console.error(err);
        },
        enabled: !!storeId,
        ...options,
    });
}