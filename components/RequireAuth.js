import {useRouter, useSegments, usePathname, useLocalSearchParams, useFocusEffect} from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import {useCallback, useEffect} from "react";
import {openAuthModal, setRedirectAfterAuth} from "../store/authSlice";
import {Platform, View} from "react-native";
import {Text} from "react-native-paper";

const IS_WEB = Platform.OS === 'web';
export const RequireAuth = ({ children }) => {
    const isAuthenticated = useSelector((state) => state.auth.authenticationStatus === 'AUTHENTICATED');
    const dispatch = useDispatch();
    const pathname = usePathname();
    const params = useLocalSearchParams();
    const router = useRouter();
    const segments = useSegments();

    useFocusEffect(
        useCallback(() => {
            if (!isAuthenticated) {
                const serializedParams = new URLSearchParams(params).toString();
                const fullPath = serializedParams
                    ? `/${segments.join('/')}` + `?${serializedParams}`
                    : `/${segments.join('/')}`;

                dispatch(setRedirectAfterAuth(fullPath));
                if (IS_WEB) {
                    dispatch(openAuthModal());
                } else {
                    console.log('RequireAuth Redirecting to auth screen...');
                    router.push('/Authentication');
                }

            }
        }, [isAuthenticated, pathname, JSON.stringify(params)])
    );

    if (!isAuthenticated) return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text variant={'titleLarge'} style={{alignSelf: 'center'}}>Please Login To Continue</Text>
    </View>;

    return children;
};