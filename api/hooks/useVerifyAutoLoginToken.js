import {getAxiosClient} from "../client";
import {useMutation} from "react-query";

export const useVerifyAutoLoginToken = (options) => {
    const axiosClient = getAxiosClient();
    const verify = async ({ token, targetStoreId }) => {
        const { data } = await axiosClient.post('/auth/autoLogin/verify', { token });
        // We return the original API data PLUS the targetStoreId we need in onSuccess
        return { ...data, targetStoreId };
    };
    return useMutation(verify, options);
};