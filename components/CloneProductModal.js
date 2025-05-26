import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Modal, Portal, Text, Button, Checkbox, useTheme } from "react-native-paper";

export default function CloneProductModal({ visible, onClose, onConfirm, contentContainerStyle }) {
    const theme = useTheme();
    const [useSameMedia, setUseSameMedia] = useState(true);

    const handleConfirm = () => {
        onConfirm(useSameMedia);
        onClose();
    };

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onClose}
                contentContainerStyle={[styles.modalContainer, contentContainerStyle]}
            >
                <Text style={styles.title}>Clone Product</Text>
                <Text style={styles.description}>
                    Do you want to clone this product? You can choose to use the same media as the source product.
                </Text>
                <View style={styles.checkboxRow}>
                    <Checkbox
                        status={useSameMedia ? "checked" : "unchecked"}
                        onPress={() => setUseSameMedia(!useSameMedia)}
                        color={theme.colors.primary}
                    />
                    <Text style={styles.checkboxText}>Use Same Media as Source Product</Text>
                </View>
                <View style={styles.buttonsContainer}>
                    <Button
                        mode="outlined"
                        onPress={onClose}
                        style={styles.button}
                        textColor={theme.colors.error}
                    >
                        Cancel
                    </Button>
                    <Button mode="contained" onPress={handleConfirm} style={styles.button}>
                        Confirm
                    </Button>
                </View>
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        backgroundColor: "white",
        padding: 20,
        marginHorizontal: 20,
        borderRadius: 8,
        alignSelf: "center",
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 16,
    },
    description: {
        fontSize: 14,
        marginBottom: 16,
        color: "gray",
    },
    checkboxRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    checkboxText: {
        fontSize: 16,
        marginLeft: 8,
    },
    buttonsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 16,
    },
    button: {
        flex: 1,
        marginHorizontal: 8,
    },
});