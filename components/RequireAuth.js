// RequireAuth.js

import { useRouter, useSegments, usePathname, useLocalSearchParams } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { setRedirectAfterAuth } from "../store/authSlice";
import { AnimatedUnauthenticatedState } from "./AnimatedUnauthenticatedState";
import {ActivityIndicator, useTheme} from "react-native-paper";

export const RequireAuth = ({ children }) => {
    const isAuthenticated = useSelector((state) => state.auth.authenticationStatus==='AUTHENTICATED');
    const dispatch = useDispatch();
    const pathname = usePathname();
    const params = useLocalSearchParams();
    const router = useRouter();
    const theme = useTheme();
    const segments = useSegments(); // <-- returns ['Main', '(tabs)', 'Orders']

    useFocusEffect(
        useCallback(() => {
            if (!isAuthenticated) {
                const serializedParams = new URLSearchParams(params).toString();
                const fullPath = serializedParams
                    ? `/${segments.join('/')}` + `?${serializedParams}`
                    : `/${segments.join('/')}`;

                dispatch(setRedirectAfterAuth(fullPath));

                router.push('/Authentication');
            }
        }, [isAuthenticated, pathname, JSON.stringify(params)])
    );

    if (!isAuthenticated) {
        return <ActivityIndicator animating={true} size={"large"} color={theme.colors.primary}/>;
    }

    return children;
};