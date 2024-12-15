import React, {useRef, useState} from "react";
import {
    View,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";
import {
    TextInput,
    Button,
    Text,
    IconButton, useTheme,
} from "react-native-paper";

const AddProductInfoScreen = () => {
    const [productName, setProductName] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [stock, setStock] = useState("");
    const [attributes, setAttributes] = useState([]);
    const [attributeSuggestions, setAttributeSuggestions] = useState([
        { key: "Color", values: ["Red", "Blue", "Green"] },
        { key: "Material", values: ["Cotton", "Leather", "Plastic"] },
        { key: "Size", values: ["Small", "Medium", "Large"] },
    ]);
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [filteredValueSuggestions, setFilteredValueSuggestions] = useState([]); // For value suggestions
    const [currentFocusedIndex, setCurrentFocusedIndex] = useState(null);
    const [currentFocusedValueIndex, setCurrentFocusedValueIndex] = useState(null); // Track focus for Value inputs
    const [inputWidths, setInputWidths] = useState({}); // Store widths of inputs by index

    const theme = useTheme();
    const styles = makeStyles(theme);

    const addAttribute = () => {
        setAttributes([...attributes, { key: "", value: "" }]);
    };

    const updateAttribute = (index, field, value) => {
        const updatedAttributes = [...attributes];
        updatedAttributes[index][field] = value;
        setAttributes(updatedAttributes);

        if (field === "key") {
            const suggestions = attributeSuggestions.filter((item) =>
                item.key.toLowerCase().startsWith(value.toLowerCase())
            );
            setFilteredSuggestions(suggestions);
            setCurrentFocusedIndex(index);
        }

        if (field === "value") {
            const attribute = attributes[index];
            const values = attributeSuggestions.find((item) => item.key === attribute.key)?.values || [];
            const suggestions = values.filter((val) =>
                val.toLowerCase().startsWith(value.toLowerCase())
            );
            setFilteredValueSuggestions(suggestions);
            setCurrentFocusedValueIndex(index);
        }
    };

    const removeAttribute = (index) => {
        setAttributes(attributes.filter((_, i) => i !== index));
    };

    const applySuggestion = (index, suggestion) => {
        const updatedAttributes = [...attributes];
        updatedAttributes[index].key = suggestion;
        setAttributes(updatedAttributes);
        setFilteredSuggestions([]);
        setCurrentFocusedIndex(null);
    };

    const applyValueSuggestion = (index, suggestion) => {
        const updatedAttributes = [...attributes];
        updatedAttributes[index].value = suggestion;
        setAttributes(updatedAttributes);
        setFilteredValueSuggestions([]);
        setCurrentFocusedValueIndex(null);
    };

    const handleInputLayout = (index, event) => {
        const { width } = event.nativeEvent.layout;
        setInputWidths((prev) => ({ ...prev, [index]: width }));
    };

    const renderAttributeInput = (index, attr) => {
        return (
            <View key={index} style={styles.attributeRow}>
                {/* Attribute Name Input */}
                <TextInput
                    style={styles.attributeInput}
                    mode={'outlined'}
                    label="Name"
                    value={attr.key}
                    onChangeText={(value) => updateAttribute(index, "key", value)}
                    onFocus={() => setCurrentFocusedIndex(index)} // Show suggestions only when focused
                    onBlur={() => setFilteredSuggestions([])} // Hide suggestions when blurred
                    onLayout={(event) => handleInputLayout(index, event)} // Capture width for Name input
                    dense
                />

                {/* Attribute Value Input */}
                <TextInput
                    style={styles.attributeInput}
                    mode={'outlined'}
                    label="Value"
                    value={attr.value}
                    onChangeText={(value) => updateAttribute(index, "value", value)}
                    onFocus={() => setCurrentFocusedValueIndex(index)} // Show suggestions only when focused
                    onBlur={() => setFilteredValueSuggestions([])} // Hide suggestions when blurred
                    dense
                    onLayout={(event) => handleInputLayout(`value-${index}`, event)} // Capture layout for Value input
                />

                {/* Delete Button */}
                <IconButton
                    icon="delete"
                    onPress={() => removeAttribute(index)}
                    style={styles.removeButton}
                />

                {/* Suggestions for Attribute Name */}
                {currentFocusedIndex === index && filteredSuggestions.length > 0 && (
                    <View style={[
                        styles.suggestionsContainer,
                        {
                            width: inputWidths[index] || "100%", // Match Name input width
                            left: 0, // Align below Name input
                            top: 50, // Position below the Name input
                        },
                    ]}>
                        {filteredSuggestions.map((item) => (
                            <TouchableOpacity
                                key={item.key}
                                onPress={() => applySuggestion(index, item.key)}
                                style={styles.suggestionItem}
                            >
                                <Text>{item.key}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Suggestions for Attribute Value */}
                {currentFocusedValueIndex === index && filteredValueSuggestions.length > 0 && (
                    <View style={[
                        styles.suggestionsContainer,
                        {
                            width: inputWidths[`value-${index}`] || "100%", // Match Value input width
                            left: inputWidths[index] + 4 || 0, // Position to align with Value input
                            top: 50, // Position below the Value input
                        },
                    ]}>
                        {filteredValueSuggestions.map((item, idx) => (
                            <TouchableOpacity
                                key={idx}
                                onPress={() => applyValueSuggestion(index, item)}
                                style={styles.suggestionItem}
                            >
                                <Text>{item}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>
        );
    };



    const saveProduct = async () => {
        const productData = { productName, price, description, stock, attributes };
        console.log("Product saved:", productData);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <TextInput
                    label="Product Name"
                    mode={'outlined'}
                    value={productName}
                    onChangeText={setProductName}
                    style={styles.textInput}
                    multiline={true}
                />

                <View style={styles.row}>
                    <TextInput
                        label="Price"
                        mode={'outlined'}
                        value={price}
                        onChangeText={setPrice}
                        style={[styles.halfWidthInput, { marginRight: 8 }]} // Add spacing
                        keyboardType="numeric"
                    />
                    <TextInput
                        label="Stock"
                        mode={'outlined'}
                        value={stock}
                        onChangeText={setStock}
                        style={styles.halfWidthInput}
                        keyboardType="numeric"
                    />
                </View>

                <TextInput
                    label="Description"
                    mode={'outlined'}
                    value={description}
                    onChangeText={setDescription}
                    style={[styles.textInput, styles.textArea]}
                    multiline
                    dense
                />

                <Text style={styles.header}>Attributes</Text>
                {attributes.map((attr, index) => renderAttributeInput(index, attr))}

                <View style={{display: 'flex', flexDirection:'row', justifyContent: 'center'}}>
                    <Button
                        icon="plus"
                        mode="contained"
                        style={styles.addButton}
                        onPress={addAttribute}
                    >
                        Add Attribute
                    </Button>
                </View>
                <View style={{display: 'flex', flexDirection:'row', justifyContent: 'center'}}>
                    <Button
                        mode="contained"
                        onPress={saveProduct}
                        style={styles.saveButton}
                    >
                        Save Product
                    </Button>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const makeStyles = ({colors}: Theme) =>

    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: "white",
        },
        scrollContainer: {
            padding: 16,
        },
        textInput: {
            marginBottom: 8,
        },
        textArea: {
            minHeight: 80,
        },
        header: {
            fontSize: 18,
            fontWeight: "bold",
            marginVertical: 16,
        },
        attributeRow: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
            position: "relative",
        },
        attributeInput: {
            flex: 1, // Ensure inputs share available space equally
            marginRight: 4, // Add spacing between the inputs
        },
        suggestionsContainer: {
            position: "absolute",
            top: 50, // Position below the input
            left: 0,
            zIndex: 10,
            backgroundColor: "#fff",
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 4,
            maxHeight: 150, // Limit height for scrolling
        },
        suggestionItem: {
            padding: 10,
            borderBottomWidth: 1,
            borderBottomColor: "#eee",
        },
        removeButton: {
            // borderWidth: 1,
            marginLeft: 0,
        },
        addButton: {
            marginVertical: 16,
            backgroundColor: colors.secondary
        },
        saveButton: {
            marginTop: 16,
        },
        row: {
            flexDirection: "row", // Align inputs horizontally
            marginBottom: 16,
        },
        halfWidthInput: {
            flex: 1, // Allow inputs to share the space equally
        },
    });
export default AddProductInfoScreen;