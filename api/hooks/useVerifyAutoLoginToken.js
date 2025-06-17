import {getAxiosClient} from "../client";
import {useMutation} from "react-query";

export const useVerifyAutoLoginToken = (options) => {
    const axiosClient = getAxiosClient();
    return useMutation(
        (token) => axiosClient.post('/auth/autoLogin/verify', { token }),
        options
    );
};