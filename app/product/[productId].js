import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { InteractionManager } from 'react-native';

export default function ProductRedirect() {
    const { productId } = useLocalSearchParams();
    const router = useRouter();

    useEffect(() => {
        if (productId) {
            InteractionManager.runAfterInteractions(() => {
                router.replace(`/Main/(tabs)/Products/${productId}`);
            });
        }
    }, [productId]);

    return null;
}