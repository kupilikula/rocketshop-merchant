import useStorePolicy from '../../../../api/hooks/useGetStorePolicy';
import useUpdateStorePolicy from '../../../../api/hooks/useUpdateStorePolicy';
import StorePolicyForm from '@/components/StorePolicyForm';
import {ActivityIndicator} from "react-native-paper";
import {useLocalSearchParams} from "expo-router";
import {useSelector} from "react-redux";

export default function StorePolicySettings() {
    const { storeId } = useSelector((state) => state.store);
    const { data: policy, isLoading } = useStorePolicy(storeId);
    const { mutateAsync: savePolicy, isLoading: saving } = useUpdateStorePolicy(storeId);

    const onSubmit = async values => {
        await savePolicy({storeId, values});
    };

    if (isLoading) return <ActivityIndicator />;

    return (
        <StorePolicyForm
            defaultValues={policy}
            onSubmit={onSubmit}
            submitting={saving}
        />
    );
}