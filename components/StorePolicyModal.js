// components/StorePolicyLink.js
// --------------------------------------------------------------
// • Renders a small “Shipping & Returns Policy” link.
// • When tapped, opens a Paper <Modal> showing the generated
//   Markdown text based on the store-specific policy parameters.
// • Relies on:
//
//   1. useStorePolicy(storeId)              – react-query hook
//   2. generatePolicyText(policyObj)        – helper you already have
//   3. react-native-paper + react-native-markdown-display
//
// Usage on your Store-Front landing page
// --------------------------------------
// <StorePolicyLink storeId={storeId} />
//

import React, { useState } from 'react';
import {ActivityIndicator, Portal, Modal, Button, useTheme} from 'react-native-paper';
import {Text, TouchableOpacity, StyleSheet, View, Platform, ScrollView} from 'react-native';
import Markdown from 'react-native-markdown-display';

import { generatePolicyText } from '../utils/storePolicyGenerator';
import {useSafeAreaInsets} from "react-native-safe-area-context";

const IS_WEB = Platform.OS === 'web';

export default function StorePolicyLink({ visible, setVisible, policy }) {

    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const styles = makeStyles(theme, insets);
    
    /* ------------ modal state ------------ */
    const openModal = () => setVisible(true);
    const closeModal = () => setVisible(false);


    /* ---------------- Content inside modal ---------------- */
    function PolicyContent({ policy, onClose, styles }) {
        return (
            <View style={styles.inner}>
                <Text style={styles.modalTitle}>Store Policy</Text>

                <Markdown>{generatePolicyText(policy)}</Markdown>

                <Button mode="contained" onPress={onClose} style={styles.closeBtn}>
                    Close
                </Button>
            </View>
        );
    }

    return (
        <>
            <Portal>
                <Modal
                    visible={visible}
                    onDismiss={closeModal}
                    contentContainerStyle={styles.modalContainer}
                >
                    {IS_WEB ? (
                        <ScrollView
                            style={styles.scroll}
                            contentContainerStyle={styles.scrollContent}
                            keyboardShouldPersistTaps="handled"
                        >
                            <PolicyContent policy={policy} onClose={closeModal} styles={styles} />
                        </ScrollView>
                    ) : (
                        <ScrollView
                            style={styles.mobileWrapper}
                            contentContainerStyle={styles.scrollContent}
                            keyboardShouldPersistTaps="handled"
                        >
                            <PolicyContent policy={policy} onClose={closeModal} styles={styles} />
                        </ScrollView>
                    )}
                </Modal>
            </Portal>
        </>
    );
}

/* ---------- styles ---------- */
const makeStyles = (theme, insets) => StyleSheet.create({
    linkWrapper: { marginTop: 12 },
    linkText: {
        fontSize: 14,
        color: theme.colors.primary,
        textDecorationLine: 'underline',
    },

    /* modal container */
    modalContainer: {
        backgroundColor: theme.colors.surface,
        borderRadius: 10,
        alignSelf: 'center',
        width: IS_WEB ? 'clamp(300px, 60%, 600px)' : '90%',
        maxHeight: IS_WEB ? '80vh' : '90%',
        padding: 0, // inner View handles padding
        marginHorizontal: 20,
        marginVertical: IS_WEB ? '10vh' : 20,
        overflow: 'hidden',
    },

    /* scroll areas */
    scroll: { flex: 1 },
    mobileWrapper: {
        flexGrow: 1,
        paddingBottom: insets.bottom || 20,
    },
    scrollContent: { flexGrow: 1 },

    /* content inside modal */
    inner: {
        padding: 20,
        flexGrow: 1,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 16,
        color: theme.colors.onSurface,
    },
    closeBtn: {
        marginTop: 24,
        alignSelf: 'center',
    },
});