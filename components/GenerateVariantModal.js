import React, { useState, useEffect } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { Modal, Text, TextInput, Button, Checkbox, useTheme, Portal } from "react-native-paper";

export default function GenerateVariantModal({ visible, onClose, product, onGenerate, contentContainerStyle }) {
    const theme = useTheme();
    const [errorMessage, setErrorMessage] = useState("");
    const [selectedAttributes, setSelectedAttributes] = useState([]);
    const [differingValues, setDifferingValues] = useState({});
    const [useSameMedia, setUseSameMedia] = useState(true);

    useEffect(() => {
        if (product.attributes.length === 0) {
            setErrorMessage("The existing product must have at least one attribute.");
        } else {
            setErrorMessage("");
        }
    }, [product]);

    const handleToggleAttribute = (key) => {
        setSelectedAttributes((prev) =>
            prev.includes(key) ? prev.filter((attr) => attr !== key) : [...prev, key]
        );
    };

    const handleValueChange = (key, value) => {
        setDifferingValues((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const validateAndGenerate = () => {
        if (selectedAttributes.length === 0) {
            setErrorMessage("You must select at least one attribute.");
            return;
        }

        const differingAttributes = selectedAttributes.map((key) => {
            const newValue = differingValues[key] || "";
            const originalValue = product.attributes.find((attr) => attr.key === key)?.value;

            if (!newValue || newValue === originalValue) {
                setErrorMessage(
                    `The value for ${key} must be different from the original product's value.`
                );
                return null;
            }

            return { key, value: newValue };
        });

        if (differingAttributes.includes(null)) {
            return; // Stop if any validation fails
        }

        onGenerate(differingAttributes, useSameMedia);
    };

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onClose}
                contentContainerStyle={[styles.modalContainer, contentContainerStyle]}
            >
                <Text style={styles.header}>Specify Variant Attributes</Text>
                {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
                {product?.attributes.length > 0 && (
                    <FlatList
                        data={product.attributes}
                        keyExtractor={(item) => item.key}
                        renderItem={({ item }) => (
                            <View style={styles.checkboxRow}>
                                <Checkbox
                                    status={selectedAttributes.includes(item.key) ? "checked" : "unchecked"}
                                    onPress={() => handleToggleAttribute(item.key)}
                                    color={theme.colors.primary}
                                />
                                <Text style={styles.attributeText}>{item.key}</Text>
                            </View>
                        )}
                    />
                )}
                {selectedAttributes.map((key) => (
                    <View key={key} style={styles.inputRow}>
                        <Text style={styles.label}>{key + ":"}</Text>
                        <TextInput
                            mode="outlined"
                            placeholder={`Enter new value for ${key}`}
                            style={styles.input}
                            defaultValue={differingValues[key] || ""}
                            onChangeText={(value) => handleValueChange(key, value)}
                            dense
                        />
                    </View>
                ))}
                <Text style={styles.header}>Product Media</Text>
                <View style={styles.checkboxRow}>
                    <Checkbox
                        status={useSameMedia ? "checked" : "unchecked"}
                        onPress={() => setUseSameMedia(!useSameMedia)}
                        color={theme.colors.primary}
                    />
                    <Text style={styles.attributeText}>Use Same Media as Original Product</Text>
                </View>
                <View style={styles.buttonContainer}>
                    <Button mode="contained" onPress={validateAndGenerate} style={styles.button}>
                        Generate Variant
                    </Button>
                    <Button mode="text" onPress={onClose} color={theme.colors.error} style={styles.button}>
                        Cancel
                    </Button>
                </View>
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        backgroundColor: "white",
        padding: 16,
        marginHorizontal: 16,
        borderRadius: 8,
        elevation: 5,
        alignSelf: "center",
    },
    header: {
        fontSize: 18,
        marginVertical: 8,
        fontWeight: "bold",
    },
    error: {
        color: "red",
        marginBottom: 8,
    },
    checkboxRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    attributeText: {
        marginLeft: 8,
        fontSize: 16,
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 8,
    },
    label: {
        marginRight: 8,
        fontSize: 16,
    },
    input: {
        flex: 1,
        backgroundColor: "white",
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 16,
    },
    button: {
        marginHorizontal: 8,
    },
});