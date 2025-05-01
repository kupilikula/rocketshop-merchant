// CreateNewShippingRule.js
import React from 'react';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { setNewShippingRule } from '../../../../../store/shippingRuleSlice';
import ShippingRuleEditor from '../../../../../components/ShippingRuleEditor';

export default function CreateNewShippingRule() {
    const dispatch = useDispatch();
    const router = useRouter();

    const handleSave = (rule) => {
        dispatch(setNewShippingRule(rule));
        router.push('/Main/(tabs)/AddNewProduct/Preview');
    };

    return (
        <ShippingRuleEditor
            initialData={null} // no prefill for new rule
            onSave={handleSave}
            onCancel={() => router.back()}
        />
    );
}