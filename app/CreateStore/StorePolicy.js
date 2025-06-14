// app/CreateStore/StorePolicySettings.js
// ----------------------------------------------------
// • Works on both native + web (Expo Router)
// • Persists form values in newStoreSlice
// • Pushes to StoreSummary after “Next”

import React, { useState } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';

import StorePolicyForm from '../../components/StorePolicyForm';
import LogoIconWithName from '../../components/LogoIconWithName';
import { setNewStorePolicy } from '../../store/newStoreSlice';

const IS_WEB = Platform.OS === 'web';

export default function StorePolicySettings() {
    /* ------------ hooks ------------ */
    const router = useRouter();
    const dispatch = useDispatch();

    /* ------------ pull any previously saved draft ------------ */
    const savedPolicy = useSelector(state => state.newStore.storePolicy);

    /* ------------ local fall-back defaults ------------ */
    const [defaultValues] = useState(
        savedPolicy ?? {
            handlingTimeDays: 2,
            cancellationWindowHours: 12,
            returnsAccepted: true,
            returnWindowDays: 7,
            refundProcessingTimeDays: 5,
        }
    );

    /* ------------ form submit ------------ */
    const handleSubmit = values => {
        // 1. stash in Redux so summary screen has it
        dispatch(setNewStorePolicy(values));

        // 2. advance to next step
        const nextRoute = IS_WEB
            ? '/create_store/store_summary'
            : '/CreateStore/StoreSummary';
        router.push(nextRoute);
    };

    /* ------------ layout wrapper ------------ */
    const Wrapper = IS_WEB ? View : KeyboardAvoidingView;
    const wrapperProps =
        IS_WEB || Platform.OS !== 'ios'
            ? { style: styles.wrapper }
            : { style: styles.wrapper, behavior: 'padding' };

    return (
        <Wrapper {...wrapperProps}>
            <ScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
            >
                <LogoIconWithName style={styles.logo} />

                {/* ===== policy parameters form ===== */}
                <StorePolicyForm defaultValues={defaultValues} onSubmit={handleSubmit} />
            </ScrollView>
        </Wrapper>
    );
}

/* ---------- styles ---------- */
const styles = StyleSheet.create({
    wrapper: { flex: 1, backgroundColor: '#fff' },
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#fff',
        ...(Platform.OS === 'web' && {
            width: '100%',
            maxWidth: 600,
            alignSelf: 'center',
        }),
    },
    logo: { alignSelf: 'center', marginBottom: 24 },
});