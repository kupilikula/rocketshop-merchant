import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { InteractionManager } from 'react-native';
import {getProductPath} from "../../utils/getPathUtils";

export default function ProductRedirect() {
    const { productId } = useLocalSearchParams();
    const router = useRouter();

    useEffect(() => {
        if (productId) {
            InteractionManager.runAfterInteractions(() => {
                router.replace(getProductPath(productId));
            });
        }
    }, [productId]);

    return null;
}