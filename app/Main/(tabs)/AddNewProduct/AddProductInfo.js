import React, {useEffect, useState, useRef, useCallback} from "react";
import {
    View,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView, Keyboard, TouchableWithoutFeedback, Pressable, Alert,
} from "react-native";
import {
    TextInput,
    Button,
    Text,
    IconButton,
    useTheme, Checkbox, Dialog, Portal, Menu, Chip, Card,
} from "react-native-paper";
import { useSelector, useDispatch } from "react-redux";
import { useIsFocused } from "@react-navigation/native";
import _ from "lodash";
import { updateField } from "../../../../store/newProductSlice";
import {useNavigation, useRouter} from "expo-router";

const AddProductInfoScreen = () => {
    const dispatch = useDispatch();
    const productData = useSelector((state) => state.newProduct);
    const navigation = useNavigation();

    const [productName, setProductName] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [stock, setStock] = useState("");
    const [attributes, setAttributes] = useState([]);
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [filteredValueSuggestions, setFilteredValueSuggestions] = useState([]);
    const [currentFocusedIndex, setCurrentFocusedIndex] = useState(null);
    const [currentFocusedValueIndex, setCurrentFocusedValueIndex] = useState(null);
    const [inputWidths, setInputWidths] = useState({});
    const [attributeSuggestions, setAttributeSuggestions] = useState([
        { key: "Color", values: ["Red", "Blue", "Green"] },
        { key: "Material", values: ["Cotton", "Leather", "Plastic"] },
        { key: "Size", values: ["Small", "Medium", "Large"] },
    ]);
    const [attributesData, setAttributesData] = useState([
        { key: "Color", values: ["Red", "Blue", "Green"] },
        { key: "Size", values: ["S", "M", "L"] },
    ]); // Example attributes
    const [existingCollections, setExistingCollections] = useState(["Electronics", "Clothing", "Home Appliances", "Best Sellers"]); // Existing collections
    const [selectedCollections, setSelectedCollections] = useState([]); // Selected collections
    // const [newCollectionName, setNewCollectionName] = useState(""); // Name for new collection
    const [isDialogVisible, setIsDialogVisible] = useState(false); // Dialog visibility
    const [tags, setTags] = useState([]); // Selected tags
    const [tagSuggestions, setTagSuggestions] = useState([
        "Electronics",
        "Clothing",
        "New Arrival",
        "Discount",
        "Popular",
    ]); // Existing tags
    const [filteredTagSuggestions, setFilteredTagSuggestions] = useState([]);
    const [tagInput, setTagInput] = useState(""); // Tag input

    const [variants, setVariants] = useState([]); // Generated variants
    const [variantSelectedAttributes, setVariantSelectedAttributes] = useState([]); // Selected attributes for variant generation
    const [gstRate, setGstRate] = useState(18); // Default GST Rate
    const [gstMenuVisible, setGstMenuVisible] = useState(false); // For Dropdown visibility
    const [errorMessages, setErrorMessages] = useState({}); // Error messages for validation

    const gstRates = [0, 5, 12, 18, 28]; // GST Rates

    // const newCollectionRef = useRef(null); // Uncontrolled TextInput reference
    const isFocused = useIsFocused();
    const isRestored = useRef(false);
    const stateRef = useRef({
        productName: "",
        price: "",
        description: "",
        stock: "",
        attributes: [],
        selectedCollections: [],
        tags: [],
        gstRate: 18
    });
    const gstInputContainerRef = useRef(null); // Reference to the GST TextInput
    const [gstDropdownPosition, setGstDropdownPosition] = useState({
        x: 0,
        y: 0,
        width: 0,
    });

    const isSelectingSuggestion = useRef(false); // Tracks if a suggestion is being clicked
    const router = useRouter();

    const theme = useTheme();
    const styles = makeStyles(theme);


    useEffect(() => {
        console.log('update state ref effect');
        stateRef.current = {
            productName,
            price,
            description,
            stock,
            gstRate,
            selectedCollections,
            attributes,
            tags

        };
    }, [productName, price, description, stock, attributes]);


    // Restore state from Redux when the screen gains focus for the first time
    useEffect(() => {

        console.log('restore data from store to local effect, isF:', isFocused, ', isR:', isRestored.current);
        if (isFocused && !isRestored.current) {
            console.log('restoring from store: ', productData);
            setProductName(productData.productName);
            setPrice(productData.price);
            setDescription(productData.description);
            setStock(productData.stock);
            setAttributes(productData.attributes);

            isRestored.current = true; // Mark as restored
        }
    }, [isFocused]);

    const saveStateToRedux = () => {
        const currentState = stateRef.current;

        if (!_.isEqual(currentState, productData)) {
            console.log('saving state to redux, currentState:', currentState);
            dispatch(updateField({ field: "all", value: currentState }));
        }

        isRestored.current = false; // Reset for next navigation
    };

    // Add `beforeRemove` listener for back navigation
    useEffect(() => {
        console.log('adding beforeRemove listener')
        const unsubscribe = navigation.addListener("beforeRemove", saveStateToRedux);
        return unsubscribe; // Cleanup listener
    }, [navigation, productData, dispatch]);

    // Add `state` listener for other navigation transitions
    useEffect(() => {
        console.log('adding state listener')
        const unsubscribe = navigation.addListener("state", saveStateToRedux);
        return unsubscribe; // Cleanup listener
    }, [navigation, productData, dispatch]);

    // Handle selection of collections
    const toggleCollectionSelection = (collection) => {
        if (selectedCollections.includes(collection)) {
            setSelectedCollections(
                selectedCollections.filter((item) => item !== collection)
            );
        } else {
            setSelectedCollections([...selectedCollections, collection]);
        }
    };

    const validateForm = useCallback((formState) => {
        const errors = {};
        const {
            productName,
            price,
            stock,
            gstRate,
            description,
            selectedCollections,
            attributes,
        } = formState;
        console.log('productName:', productName);
        // Validate Product Name
        if (!productName.trim()) {
            errors.productName = "Product Name is required.";
        }
        console.log('line164')
        // Validate Price
        if (!price.trim() || isNaN(price) || parseFloat(price) <= 0) {
            errors.price = "Price must be a valid positive number.";
        }

        // Validate Stock
        console.log('stock:', stock);
        if (!stock.trim() || isNaN(stock) || parseInt(stock, 10) < 0) {
            console.log('inside stock')
            errors.stock = "Stock must be a valid non-negative number.";
        }
        console.log('line174')
        // Validate GST
        if (!gstRates.includes(gstRate)) {
            errors.gstRate = "GST rate is required.";
        }
        console.log('line179', description);
        // Validate Description
        if (!description.trim()) {
            console.log('line190, description')
            errors.description = "Description is required.";
        }
        console.log('line184, col:', existingCollections);
        console.log('selectedCol:', selectedCollections);
        // Validate Collections
        if (selectedCollections.length === 0) {
            console.log('inside selC error');
            errors.collections = "At least one collection must be selected.";
        }
        console.log('e.c:', errors.collections);
        // Validate Attributes
        attributes.forEach((attr, index) => {
            if (!attr.key.trim()) {
                errors[`attributeName-${index}`] = `Attribute Name is required for row ${index + 1}.`;
            }
            if (!attr.value.trim()) {
                errors[`attributeValue-${index}`] = `Attribute Value is required for row ${index + 1}.`;
            }
        });
        console.log('errors:', errors);
        setErrorMessages(errors);

        // Return true if no errors
        return errors;
    }, [productName, price, stock, description, attributes, selectedCollections, tags]);


    const addAttribute = () => {
        setAttributes([...attributes, { key: "", value: "" }]);
    };

    const updateAttribute = (index, field, value) => {
        // Create a new copy of the attribute object at the specified index
        const updatedAttribute = { ...attributes[index], [field]: value };

        // Create a new array with the updated attribute
        const updatedAttributes = [
            ...attributes.slice(0, index),
            updatedAttribute,
            ...attributes.slice(index + 1),
        ];
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
            const values =
                attributeSuggestions.find(
                    (item) => item.key === attribute.key
                )?.values || [];
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

    const handleInputBlur = () => {
            setFilteredSuggestions([]);
            setCurrentFocusedIndex(null);
    };

    const renderAttributeInput = (index, attr) => (
        <View key={index} style={styles.attributeRow}>
            <TextInput
                style={styles.attributeInput}
                mode="outlined"
                label="Name"
                value={attr.key}
                onChangeText={(value) => updateAttribute(index, "key", value)}
                onFocus={() => {
                    console.log('onFocus name');
                    setCurrentFocusedIndex(index);
                }
            }
                onBlur={handleInputBlur} // Delay clearing suggestions
                onLayout={(event) => handleInputLayout(index, event)}
                dense
                error={!!errorMessages[`attributeName-${index}`]}
            />

            <TextInput
                style={styles.attributeInput}
                mode="outlined"
                label="Value"
                value={attr.value}
                onChangeText={(value) => updateAttribute(index, "value", value)}
                onFocus={() => {
                    console.log('onFocus value');
                    setCurrentFocusedValueIndex(index)
                }}
                onBlur={() => setTimeout(() => setFilteredValueSuggestions([]), 100)}
                dense
                onLayout={(event) => handleInputLayout(`value-${index}`, event)}
                error={!!errorMessages[`attributeValue-${index}`]}

            />

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
                                onPressIn={() => applySuggestion(index, item.key)}
                                style={styles.suggestionItem}
                            >
                                <Text variant={'bodyLarge'}>{item.key}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

            {currentFocusedValueIndex === index &&
                filteredValueSuggestions.length > 0 && (
                    <View
                        style={[
                            styles.suggestionsContainer,
                            {
                                width: inputWidths[`value-${index}`] || "100%",
                                left: inputWidths[index] + 4 || 0,
                                top: 50,
                            },
                        ]}
                    >
                        {filteredValueSuggestions.map((item, idx) => (
                            <TouchableOpacity
                                key={idx}
                                onPress={() => {
                                    applyValueSuggestion(index, item);
                                    setTimeout(() => Keyboard.dismiss(), 50);
                                }
                                }
                                style={styles.suggestionItem}
                            >
                                <Text>{item}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
        </View>
    );

    const saveAndNavigateToPreview = async () => {
        console.log('save');
        const currentState = stateRef.current; // Access the latest state directly
        console.log('cS:', currentState);
        const errors = validateForm(currentState); // Pass the current state to validation
        console.log('line395, errors:', errors);
        if (Object.keys(errors).length === 0) {
            console.log("Validation passed. Saving product and navigating...");
            setErrorMessages({}); // Clear error messages
            router.push("/Main/(tabs)/AddNewProduct/Preview");
        } else {
            console.log("Validation failed. Errors:", errors);
            setErrorMessages(errors); // Update the error messages
            // Alert.alert("Validation Error", "Please fix the highlighted errors.");
        }
    };

    useEffect(() => {
        navigation.setOptions({ headerRight: () => <Button contentStyle={{flexDirection: 'row-reverse'}} icon={'arrow-right'} mode={'contained'} style={{borderRadius: 0, backgroundColor: theme.colors.success}} onPressIn={saveAndNavigateToPreview}>
                Preview
            </Button>});
    },[navigation])

    const publishProduct = async () => {
        const productData = { productName, price, description, stock, attributes };
        console.log("Product Published:", productData);
    };

    const markAsVariant = () => {

    }
    // Generate all combinations of variants
    const generateVariants = () => {
        if (variantSelectedAttributes.length === 0) {
            alert("Please select at least one attribute.");
            return;
        }
        console.log('vSA:', variantSelectedAttributes);
        const attributeValues = variantSelectedAttributes.map((attr) =>
            attributesData.find((a) => a.key === attr)?.values || []
        );
        console.log('aV:', attributeValues);
        // Generate combinations
        const combinations = cartesianProduct(attributeValues).map((combo) => ({
            options: combo,
            price: "",
            stock: "",
        }));
        console.log('variants:', combinations);
        setVariants(combinations);
    };

    // Cartesian product utility
    const cartesianProduct = (arrays) => {
        return arrays.reduce(
            (acc, curr) =>
                acc.flatMap((a) => curr.map((b) => [...a, b])),
            [[]]
        );
    };

    const updateVariant = (index, field, value) => {
        const updatedVariants = [...variants];
        updatedVariants[index][field] = value;
        setVariants(updatedVariants);
    };

    const toggleAttributeSelection = (attributeKey) => {
        if (variantSelectedAttributes.includes(attributeKey)) {
            setVariantSelectedAttributes(
                variantSelectedAttributes.filter((attr) => attr !== attributeKey)
            );
        } else {
            setVariantSelectedAttributes([...variantSelectedAttributes, attributeKey]);
        }
    };
    const openGstMenu = () => {
        console.log('line375, open');
        gstInputContainerRef.current.measureInWindow((x, y, width, height) => {
            setGstDropdownPosition({ x, y: y + 2*height, width });
            setGstMenuVisible(true);
            console.log('opened')
        });
    };

    // Add a tag
    const addTag = (tag) => {
        if (!tags.includes(tag)) {
            setTags([...tags, tag]);
        }
        setTagInput("");
        setFilteredTagSuggestions([]);
    };

    // Remove a tag
    const removeTag = (tag) => {
        setTags(tags.filter((t) => t !== tag));
    };

    // Handle tag input changes
    const handleTagInputChange = (input) => {
        setTagInput(input);

        // Filter suggestions based on input
        const filtered = tagSuggestions.filter((tag) =>
            tag.toLowerCase().includes(input.toLowerCase())
        );
        setFilteredTagSuggestions(filtered);
    };

    // Handle adding a tag when pressing enter
    const handleTagInputSubmit = () => {
        if (tagInput.trim()) {
            addTag(tagInput.trim());
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/*<Card mode={'elevated'} style={{width: '100%', backgroundColor: 'white', margin: 0,}}>*/}
                <Text style={styles.header}>Details</Text>
                <TextInput
                    label="Product Name"
                    mode="outlined"
                    value={productName}
                    onChangeText={setProductName}
                    style={styles.textInput}
                    multiline
                    error={!!errorMessages.productName}
                />
                <View style={styles.row}>
                    <TextInput
                        label="Price"
                        mode="outlined"
                        value={price}
                        onChangeText={setPrice}
                        style={[styles.halfWidthInput, { marginRight: 8 }]}
                        error={!!errorMessages.price}
                        keyboardType="numeric"
                    />
                    <TextInput
                        label="Stock"
                        mode="outlined"
                        value={stock}
                        onChangeText={setStock}
                        style={styles.halfWidthInput}
                        error={!!errorMessages.stock}
                        keyboardType="numeric"
                    />
                    <View ref={gstInputContainerRef} style={styles.gstInputContainer}>
                        <TextInput
                            label="GST (%)"
                            mode="outlined"
                            value={gstRate.toString() + '%'}
                            editable={false} // Make it read-only
                            style={styles.gstInput}
                            right={
                                <TextInput.Icon
                                    icon="chevron-down"
                                    onPress={openGstMenu}
                                />
                            }
                        />
                    </View>
                    {/* GST Dropdown */}
                        {/* GST Rate Dropdown */}
                        <Menu
                            visible={gstMenuVisible}
                            onDismiss={() =>setGstMenuVisible(false)}
                            anchor={{ x: gstDropdownPosition.x, y: gstDropdownPosition.y }}
                            style={{ width: gstDropdownPosition.width }} // Match width of the TextInput
                        >
                            {gstRates.map((rate) => (
                                <Button
                                    key={rate}
                                    mode="text"
                                    onPress={() => {
                                        setGstRate(rate);
                                        setGstMenuVisible(false);
                                    }}
                                    contentStyle={{
                                        justifyContent: "flex-start",
                                        width: gstDropdownPosition.width, // Match dropdown width
                                    }}
                                    labelStyle={{color: 'black', fontSize: 16}}
                                    style={styles.gstDropdownItem}
                                >
                                    {rate.toString() + '%'}
                                </Button>
                            ))}
                        </Menu>
                </View>

                <TextInput
                    label="Description"
                    mode="outlined"
                    value={description}
                    onChangeText={setDescription}
                    style={[styles.textInput, styles.textArea]}
                    multiline
                    dense
                    error={!!errorMessages.description}
                />

                {/*</Card>*/}

                {/* Collections Section */}
                <Text style={styles.header}>Collections</Text>
                <View style={{display: 'flex', flexWrap: 'wrap', flexDirection: 'row'}}>
                    {existingCollections.map((collection, idx) => (
                        <View key={idx} style={styles.checkboxContainer}>
                            <Checkbox
                                status={
                                    selectedCollections.includes(collection)
                                        ? "checked"
                                        : "unchecked"
                                }
                                onPress={() => toggleCollectionSelection(collection)}
                            />
                            <Text>{collection}</Text>
                        </View>
                    ))}
                    {/*<Button*/}
                    {/*    mode="text"*/}
                    {/*    onPress={() => setIsDialogVisible(true)}*/}
                    {/*    style={styles.addNewButton}*/}
                    {/*>*/}
                    {/*    Add New Collection*/}
                    {/*</Button>*/}
                </View>
                {errorMessages.collections && (
                    <Text  style={styles.errorText}>{errorMessages.collections}</Text>
                )}

                <Text style={styles.header}>Attributes</Text>
                {attributes.map((attr, index) => renderAttributeInput(index, attr))}

                <View style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
                    <Button
                        icon="plus"
                        mode="contained"
                        style={styles.addButton}
                        onPress={addAttribute}
                    >
                        Add Attribute
                    </Button>
                </View>

                {/* Tags Section */}
                <Text style={styles.header}>Tags</Text>
                <View style={styles.tagsContainer}>
                    {/* Display Selected Tags */}
                    {tags.map((tag) => (
                        <Chip
                            key={tag}
                            onClose={() => removeTag(tag)}
                            style={styles.tagChip}
                        >
                            {tag}
                        </Chip>
                    ))}
                </View>

                {/* Tag Input */}
                <View style={styles.tagInputContainer}>
                    <TextInput
                        label="Add Tag"
                        mode="outlined"
                        value={tagInput}
                        onChangeText={handleTagInputChange}
                        onSubmitEditing={handleTagInputSubmit} // Handle enter key
                        right={
                            <TextInput.Icon
                                icon="plus"
                                onPress={handleTagInputSubmit} // Handle button press
                            />
                        }
                        style={styles.tagInput}
                    />

                    {/* Tag Suggestions */}
                    {filteredTagSuggestions.length > 0 && (
                        <View style={styles.suggestionsContainer}>
                            {filteredTagSuggestions.map((suggestion) => (
                                <TouchableOpacity
                                    key={suggestion}
                                    style={styles.suggestionItem}
                                    onPress={() => addTag(suggestion)}
                                >
                                    <Text style={styles.suggestionText}>
                                        {suggestion}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {/* Attribute Selection */}
                <Text style={styles.header}>Manage Variants</Text>
                <Text variant={'bodyMedium'}>Variant Attributes</Text>
                <View style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap'}}>
                    {attributes.map((attribute, idx) => (
                        attribute.key.trim()!=='' &&
                        <View key={idx} style={styles.checkboxContainer}>
                            <Checkbox
                                status={
                                    variantSelectedAttributes.includes(attribute.key)
                                        ? "checked"
                                        : "unchecked"
                                }
                                onPress={() =>
                                    toggleAttributeSelection(attribute.key)
                                }
                            />
                            <Text>{attribute.key}</Text>
                        </View>
                    ))}
                </View>

                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                    <Button
                        mode="outlined"
                        onPress={markAsVariant}
                        style={styles.markAsVariantButton}
                    >
                        Mark As Variant
                    </Button>
                <Button
                    icon="plus"
                    mode="contained"
                    onPress={generateVariants}
                    style={styles.generateVariantButton}
                >
                    Generate Variant
                </Button>
                </View>

                {/* Variant List */}
                {variants.length > 0 && (
                    <View>
                        <Text style={styles.subHeader}>Generated Variants</Text>
                        {variants.map((variant, idx) => (
                            <View key={idx} style={styles.variantRow}>
                                <Text style={styles.variantText}>
                                    {variant.options.join(", ")}
                                </Text>
                                <TextInput
                                    label="Price"
                                    mode="outlined"
                                    value={variant.price}
                                    onChangeText={(value) =>
                                        updateVariant(idx, "price", value)
                                    }
                                    style={styles.variantInput}
                                    keyboardType="numeric"
                                />
                                <TextInput
                                    label="Stock"
                                    mode="outlined"
                                    value={variant.stock}
                                    onChangeText={(value) =>
                                        updateVariant(idx, "stock", value)
                                    }
                                    style={styles.variantInput}
                                    keyboardType="numeric"
                                />
                                <IconButton
                                    icon="delete"
                                    onPress={() =>
                                        setVariants(
                                            variants.filter((_, i) => i !== idx)
                                        )
                                    }
                                />
                            </View>
                        ))}
                    </View>
                )}

                {/* Dialog for Adding New Collection */}
                {/*<Portal>*/}
                {/*    <Dialog*/}
                {/*        visible={isDialogVisible}*/}
                {/*        onDismiss={() => setIsDialogVisible(false)}*/}
                {/*    >*/}
                {/*        <Dialog.Title>Add New Collection</Dialog.Title>*/}
                {/*        <Dialog.Content>*/}
                {/*            <TextInput*/}
                {/*                label="Collection Name"*/}
                {/*                mode="outlined"*/}
                {/*                style={styles.textInput}*/}
                {/*                onChangeText={(text) => {*/}
                {/*                    console.log('text:', text);*/}
                {/*                    console.log('ref:', newCollectionRef.current);*/}
                {/*                    (newCollectionRef.current = text)*/}
                {/*                }*/}
                {/*            } // Store value in ref*/}
                {/*            />*/}
                {/*        </Dialog.Content>*/}
                {/*        <Dialog.Actions>*/}
                {/*            <Button onPress={() => setIsDialogVisible(false)}>*/}
                {/*                Cancel*/}
                {/*            </Button>*/}
                {/*            <Button onPress={addNewCollection}>Add</Button>*/}
                {/*        </Dialog.Actions>*/}
                {/*    </Dialog>*/}
                {/*</Portal>*/}
            </ScrollView>
            {/*<View style={[styles.stickyActionContainer, {display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, width: '100%'}]}>*/}
            {/*    <View style={{display: 'flex', flexDirection:'row', justifyContent: 'center'}}>*/}
            {/*        <Button*/}
            {/*            mode="contained"*/}
            {/*            onPress={publishProduct}*/}
            {/*            style={styles.publishButton}*/}
            {/*        >*/}
            {/*            Preview Product*/}
            {/*        </Button>*/}
            {/*    </View>*/}
            {/*    <View style={{display: 'flex', flexDirection:'row', justifyContent: 'center'}}>*/}
            {/*        <Button*/}
            {/*            mode="outlined"*/}
            {/*            onPress={saveChanges}*/}
            {/*            style={styles.saveButton}*/}
            {/*        >*/}
            {/*            Save As Draft*/}
            {/*        </Button>*/}
            {/*    </View>*/}

            {/*</View>*/}

        </KeyboardAvoidingView>
    );
};

const makeStyles = ({ colors }) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: "white",
        },
        scrollContainer: {
            // marginTop: 60,
            // paddingTop: 80,
            padding: 16,
        },
        // stickyActionContainer: {
        //     backgroundColor: 'silver',
        //     borderBottomWidth: 1,
        //     padding: 16,
        //     top: 0,
        //     position: 'absolute'
        // },
        textInput: {
            marginBottom: 8,
        },
        textArea: {
            minHeight: 80,
        },
        gstInputContainer: {
            flex: 0.7,
            position: "relative",
            marginLeft: 8
        },
        gstInput: {
            flex: 1,
        },
        gstDropdownContainer: {
            position: "absolute",
            zIndex: 10,
            backgroundColor: "#fff",
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 4,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 5,
        },
        gstDropdownItem: {
            padding: 0,
            borderRadius: 0,
            borderBottomWidth: 1,
            borderBottomColor: "#eee",
            color: 'black'
        },
        gstDropdownText: {
            fontSize: 26,
        },
        menuItemContainer: {
            justifyContent: "center",
            alignItems: "flex-start",
        },
        header: {
            fontSize: 18,
            fontWeight: "bold",
            marginVertical: 8,
        },
        attributeRow: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
        },
        attributeInput: {
            flex: 1,
            marginRight: 4,
        },
        suggestionsContainer: {
            position: "absolute",
            top: 50,
            left: 0,
            zIndex: 10,
            backgroundColor: "white",
            borderColor: "#ccc",
            borderWidth: 1,
            borderRadius: 4,
            maxHeight: 150,
        },
        suggestionItem: {
            width: '100%',
            margin: 0,
            padding: 10,
            borderRadius: 0,
            borderBottomWidth: 1,
            borderBottomColor: "#eee",
        },
        removeButton: {
            marginLeft: 0,
        },
        addButton: {
            marginVertical: 0,
            backgroundColor: colors.secondary,
        },
        saveButton: {
            backgroundColor: 'white',
            borderRadius: 0,
            borderWidth: 2,
        },
        publishButton: {
            backgroundColor: colors.success,
            borderRadius: 0
        },
        row: {
            flexDirection: "row",
            marginBottom: 16,
        },
        halfWidthInput: {
            flex: 1,
        },
        subHeader: {
            fontSize: 16,
            fontWeight: "bold",
            marginTop: 16,
        },
        checkboxContainer: {
            flexDirection: "row",
            alignItems: "center",
            marginVertical: 4,
        },
        generateVariantButton: {
            marginVertical: 16,
            backgroundColor: colors.secondary,
            borderRadius: 0,
        },
        markAsVariantButton: {
            marginVertical: 16,
            color: colors.primary,
            borderRadius: 0,
            borderColor: colors.primary
            // backgroundColor: colors.tertiary,
        },
        variantRow: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
        },
        variantText: {
            flex: 1,
        },
        variantInput: {
            flex: 1,
            marginRight: 8,
        },
        tagsContainer: {
            flexDirection: "row",
            flexWrap: "wrap",
            marginBottom: 8,
        },
        tagChip: {
            marginRight: 8,
            marginBottom: 8,
        },
        tagInputContainer: {
            position: "relative",
            marginBottom: 8,
        },
        tagInput: {
            flex: 1,
        },
        errorText: {
            color: "red",
            fontSize: 12,
            marginBottom: 8,
        },
    });

export default AddProductInfoScreen;
