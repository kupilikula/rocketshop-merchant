// hooks/useReplaceWithBackHref.js
import { useRouter, usePathname } from 'expo-router';

export function usePushWithBackHref() {
    const router = useRouter();
    const currentPath = usePathname();

    return (targetPath, additionalParams = {}) => {
        router.push({
            pathname: targetPath,
            params: {
                backHref: currentPath,
                ...additionalParams,
            },
        });
    };
}