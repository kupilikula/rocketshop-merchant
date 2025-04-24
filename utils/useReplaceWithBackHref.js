// hooks/useReplaceWithBackHref.js
import { useRouter, usePathname } from 'expo-router';

export function useReplaceWithBackHref() {
    const router = useRouter();
    const currentPath = usePathname();

    return (targetPath, additionalParams = {}) => {
        router.replace({
            pathname: targetPath,
            params: {
                backHref: currentPath,
                ...additionalParams,
            },
        });
    };
}