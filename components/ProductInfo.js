import React, {useEffect, useState, useRef, useCallback, forwardRef, useImperativeHandle, useContext} from "react";
import {
    View, StyleSheet, TouchableOpacity, ScrollView, Switch,
} from "react-native";
import {
    TextInput, Button, Text, IconButton, useTheme, Checkbox, Menu, Chip, Surface,
} from "react-native-paper";
import {useSelector, useDispatch} from "react-redux";
import {useIsFocused} from "@react-navigation/native";
import _ from "lodash";
import {updateField as updateNewProductField} from "../store/newProductSlice";
import {updateField as updateEditProductField} from "../store/editProductSlice";
import {useNavigation, useRouter} from "expo-router";
import * as yup from "yup";
import {Controller, useFieldArray, useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {useCollections} from "../api/hooks/useCollections";
import {ProductWorkflowContext} from "./ProductWorkflowContext";

const ProductInfoScreen = (props) => {
    const dispatch = useDispatch();
    const {isNewProduct, productInfoFormRef} = useContext(ProductWorkflowContext);
    const {storeId} = useSelector((state) => state.store);
    const productData = useSelector((state) => isNewProduct ? state.newProduct : state.editProduct);
    const navigation = useNavigation();

    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [filteredValueSuggestions, setFilteredValueSuggestions] = useState([]);
    const [currentFocusedIndex, setCurrentFocusedIndex] = useState(null);
    const [currentFocusedValueIndex, setCurrentFocusedValueIndex] = useState(null);
    const [inputWidths, setInputWidths] = useState({});
    // const [attributeSuggestions, setAttributeSuggestions] = useState([
    //   { key: "Color", values: ["Red", "Blue", "Green"] },
    //   { key: "Material", values: ["Cotton", "Leather", "Plastic"] },
    //   { key: "Size", values: ["Small", "Medium", "Large"] },
    // ]);

    const {data: existingCollections = [], isLoading, isError} = useCollections(storeId);
    const [tagSuggestions, setTagSuggestions] = useState(["Best Sellers", "Featured", "HandMade", "New Arrival", "Discount", "Popular",]); // Existing tags
    const [filteredTagSuggestions, setFilteredTagSuggestions] = useState([]);
    const [tagInput, setTagInput] = useState(""); // Tag input

    // const [variants, setVariants] = useState([]); // Generated variants
    const [variantSelectedAttributes, setVariantSelectedAttributes] = useState([],); // Selected attributes for variant generation
    const [gstRate, setGstRate] = useState(18); // Default GST Rate
    const [gstMenuVisible, setGstMenuVisible] = useState(false); // For Dropdown visibility

    const gstRates = [0, 5, 12, 18, 28]; // GST Rates
    const isFocused = useIsFocused();
    const gstInputContainerRef = useRef(null); // Reference to the GST TextInput
    const [gstDropdownPosition, setGstDropdownPosition] = useState({
        x: 0, y: 0, width: 0,
    });

    const router = useRouter();

    const theme = useTheme();
    const styles = makeStyles(theme);


    // Validation schema using Yup
    const schema = yup.object().shape({
        productName: yup.string().required("Product Name is required."),
        price: yup
            .number()
            .typeError("Price must be a valid number.")
            .positive("Price must be greater than zero.")
            .required("Price is required."),
        stock: yup
            .number()
            .typeError("Stock must be a valid number.")
            .min(0, "Stock cannot be negative.")
            .required("Stock is required."),
        description: yup.string().required("Description is required."),
        collections: yup
            .array()
            .min(1, "At least one collection must be selected."),
    });

    // react-hook-form setup
    const {
        control, handleSubmit, reset, setValue, getValues, watch, formState: {errors},
    } = useForm({
        defaultValues: {
            productName: "",
            price: "",
            stock: "",
            description: "",
            collections: [],
            gstRate: 18,
            gstInclusive: true,
            attributes: [],
            productTags: [],
            rating: null,
            numberOfRatings: 0,
            enableRatings: true,
            enableReviews: false,
            enableStockTracking: true,
            isActive: true,
        }, shouldUnregister: false, resolver: yupResolver(schema),
    });

    const {
        fields: attributeFormFields, append: appendFormAttribute, // update: updateFormAttribute,
        remove: deleteFormAttribute, replace: replaceFormAttributes,
    } = useFieldArray({
        control, name: "attributes", // Ties this to "attributes" in form state
    });

    const tags = watch("productTags", []); // Watch the tags array

    // Restore state from Redux when the screen gains focus for the first time
    // Handle screen focus and restoration of state
    useEffect(() => {
        if (productData && isFocused) {
            // Restore state from Redux when screen regains focus
            console.log("restoring product info from redux, productData:", productData,);
            let productInfoData = _.cloneDeep(productData);
            delete productInfoData.mediaItems
            console.log('productInfoData:', productInfoData);
            reset(productInfoData);
            // if (
            //   !_.isEqual(
            //     attributeFormFields.map((a) => ({ key: a.key, value: a.value })),
            //     productData.attributes,
            //   )
            // ) {
            //   replaceFormAttributes([...productData.attributes]);
            // }
        }
    }, [isFocused]);

    const saveStateToRedux = useCallback(() => {
        const currentState = getValues(); // Get the latest form values
        console.log("saveStateToRedux:,currentState:", currentState);
        if (isNewProduct) {
            dispatch(updateNewProductField({field: "all", value: currentState}));
        } else {
            dispatch(updateEditProductField({field: "all", value: currentState}));
        }

    }, [dispatch, updateNewProductField, updateEditProductField, isNewProduct]);

    const saveStateToReduxAndResetFormData = useCallback(() => {
        const resetFormData = () => {
            console.log("resetting form data");
            reset();
            replaceFormAttributes([]);
            console.log("form state after reset:", getValues());
        };

        saveStateToRedux();
        resetFormData();
    }, [saveStateToRedux]);

    const handleBeforeRemove = useCallback((e) => {
        // Prevent saving state when unmounting
        console.log("e:", e.data.action.type);
        if (e.data.action.type === "NAVIGATE" || e.data.action.type === "POP" || e.data.action.type === "GO_BACK" || e.data.action.type === "REPLACE") {
            console.log("Navigation detected, saving state");
            saveStateToReduxAndResetFormData();
        } else {
            console.log("Unmount detected, skipping save");
        }
    }, [saveStateToReduxAndResetFormData],);

    // Add `beforeRemove` listener for back navigation
    useEffect(() => {
        const unsubscribe = navigation.addListener("beforeRemove", handleBeforeRemove,);
        return unsubscribe; // Cleanup listener
    }, [navigation, dispatch, handleBeforeRemove]);

    // // Add `state` listener for other navigation transitions
    useEffect(() => {
        const unsubscribe = navigation.addListener("blur", saveStateToReduxAndResetFormData,);
        return unsubscribe; // Cleanup listener
    }, [navigation, dispatch, saveStateToReduxAndResetFormData]);

    // Handle selection of collections
    const addAttribute = () => {
        appendFormAttribute({key: "", value: ""});
    };

    // const updateAttributeSuggestions = (index, field, value) => {
    //   const currentAttribute = attributeFormFields[index] || null;
    //
    //   // Handle suggestions for key and value fields
    //   if (field === "key") {
    //     const suggestions = attributeSuggestions.filter((item) =>
    //       item.key.toLowerCase().startsWith(value.toLowerCase()),
    //     );
    //     setFilteredSuggestions(suggestions);
    //     setCurrentFocusedIndex(index);
    //   }
    //   console.log("238");
    //   if (field === "value") {
    //     // const currentAttribute = currentAttributes[index];
    //     const values =
    //       attributeSuggestions.find((item) => item.key === currentAttribute?.key)
    //         ?.values || [];
    //     const suggestions = values.filter((val) =>
    //       val.toLowerCase().startsWith(value.toLowerCase()),
    //     );
    //     setFilteredValueSuggestions(suggestions);
    //     setCurrentFocusedValueIndex(index);
    //   }
    // };

    const removeAttribute = (index) => {
        deleteFormAttribute(index);
    };

    const applySuggestion = (index, suggestion) => {
        // updateAttribute(index, {attributeFields[index]['value'], key: suggestion})
        setFilteredSuggestions([]);
        setCurrentFocusedIndex(null);
    };
    //
    const applyValueSuggestion = (index, suggestion) => {
        // updateAttribute(index, {attributeFields[index]['key'], value: suggestion})
        setFilteredValueSuggestions([]);
        setCurrentFocusedValueIndex(null);
    };

    const handleInputLayout = (index, event) => {
        const {width} = event.nativeEvent.layout;
        setInputWidths((prev) => ({...prev, [index]: width}));
    };

    const handleInputBlur = () => {
        setFilteredSuggestions([]);
        setCurrentFocusedIndex(null);
    };

    const renderAttributeInput = (index, attr) => {
        return (<View key={attributeFormFields[index]?.id} style={styles.attributeRow}>
                {/* Attribute Name */}
                <Controller
                    name={`attributes.${index}.key`}
                    control={control}
                    rules={{
                        required: `Attribute Name is required for row ${index + 1}.`,
                    }}
                    render={({field: {value, onChange}, fieldState: {error}}) => (<TextInput
                            style={styles.attributeInput}
                            mode="outlined"
                            label="Name"
                            value={value}
                            onChangeText={(value) => {
                                onChange(value);
                                // updateAttributeSuggestions(index, "key", value); // Optional for suggestions
                            }}
                            onFocus={() => setCurrentFocusedIndex(index)}
                            onBlur={handleInputBlur}
                            onLayout={(event) => handleInputLayout(index, event)}
                            dense
                            error={!!error}
                        />)}
                />

                {/* Attribute Value */}
                <Controller
                    name={`attributes.${index}.value`}
                    control={control}
                    rules={{
                        required: `Attribute Value is required for row ${index + 1}.`,
                    }}
                    render={({field: {value, onChange}, fieldState: {error}}) => (<TextInput
                            style={styles.attributeInput}
                            mode="outlined"
                            label="Value"
                            value={value}
                            onChangeText={(value) => {
                                onChange(value);
                                // updateAttributeSuggestions(index, "value", value); // Optional for suggestions
                            }}
                            onFocus={() => setCurrentFocusedValueIndex(index)}
                            onBlur={handleInputBlur}
                            onLayout={(event) => handleInputLayout(`value-${index}`, event)}
                            dense
                            error={!!error}
                        />)}
                />

                {/* Remove Button */}
                <IconButton
                    icon="delete"
                    onPress={() => removeAttribute(index)} // Remove the row using useFieldArray
                    style={styles.removeButton}
                />

                {/* Suggestions for Attribute Name */}
                {currentFocusedIndex === index && filteredSuggestions.length > 0 && (<View
                        style={[styles.suggestionsContainer, {
                            width: inputWidths[index] || "100%", // Match Name input width
                            left: 0, // Align below Name input
                            top: 50, // Position below the Name input
                        },]}
                    >
                        {filteredSuggestions.map((item) => (<TouchableOpacity
                                key={item.key}
                                onPress={() => {
                                    applySuggestion(index, item.key);
                                }}
                                style={styles.suggestionItem}
                            >
                                <Text>{item.key}</Text>
                            </TouchableOpacity>))}
                    </View>)}

                {/*/!* Suggestions for Attribute Value *!/*/}
                {currentFocusedValueIndex === index && filteredValueSuggestions.length > 0 && (<View
                        style={[styles.suggestionsContainer, {
                            width: inputWidths[`value-${index}`] || "100%", left: inputWidths[index] + 4 || 0, top: 50,
                        },]}
                    >
                        {filteredValueSuggestions.map((item, idx) => (<TouchableOpacity
                                key={idx}
                                onPress={() => {
                                    applyValueSuggestion(index, item);
                                }}
                                style={styles.suggestionItem}
                            >
                                <Text>{item}</Text>
                            </TouchableOpacity>))}
                    </View>)}
            </View>);
    };

    const onSubmit = (data) => {
        if (isNewProduct) {
            dispatch(updateNewProductField({field: "all", value: data}));
            router.push("./Preview");
        } else {
            dispatch(updateEditProductField({field: "all", value: data}));
            router.push("./EditPreview");
        }


    };

    useEffect(() => {
        // Attach the `handleSubmit` method to the ref passed in initialParams
        if (productInfoFormRef) {
            productInfoFormRef.current = {
                submitForm: () => {
                    console.log('line418 submitForm');
                    handleSubmit(onSubmit)();
                },
            };
        }
    }, [productInfoFormRef, handleSubmit]);

    const markAsVariant = () => {
    };
    const generateVariant = () => {
    };

    const toggleVariantAttributeSelection = (attributeKey) => {
        if (variantSelectedAttributes.includes(attributeKey)) {
            setVariantSelectedAttributes(variantSelectedAttributes.filter((attr) => attr !== attributeKey),);
        } else {
            setVariantSelectedAttributes([...variantSelectedAttributes, attributeKey,]);
        }
    };
    const openGstMenu = () => {
        gstInputContainerRef.current.measureInWindow((x, y, width, height) => {
            setGstDropdownPosition({x, y: y + 2 * height, width});
            setGstMenuVisible(true);
        });
    };

    // Add a tag
    const addTag = (tag) => {
        const currentTags = getValues("productTags");
        if (tag.trim() && !currentTags.includes(tag)) {
            setValue("productTags", [...currentTags, tag.trim()]); // Update form state with new tag
        }
        setTagInput(""); // Reset input
        setFilteredTagSuggestions([]); // Clear suggestions
    };

    // Remove a tag
    const removeTag = (tag) => {
        const updatedTags = tags.filter((t) => t !== tag);
        setValue("productTags", updatedTags); // Update form state
    };

    // Handle input changes for filtering suggestions
    const handleTagInputChange = (input) => {
        setTagInput(input);
        const filtered = tagSuggestions.filter((tag) => tag.toLowerCase().includes(input.toLowerCase()),);
        setFilteredTagSuggestions(filtered);
    };

    // Handle tag submission (Enter key or "+" icon press)
    const handleTagInputSubmit = () => {
        addTag(tagInput);
    };

    console.log("451, productData:", productData);
    console.log("452, getValues(prodcutName):", getValues("productName"));

    return (<ScrollView contentContainerStyle={styles.scrollContainer}>
            <Surface style={styles.container}>
                <View style={styles.section}>
                    <Text style={styles.header}>Details</Text>
                    {/* Product Name */}
                    <Controller
                        name="productName"
                        control={control}
                        render={({field: {onChange, onBlur, value}}) => (<TextInput
                                label="Product Name"
                                mode="outlined"
                                value={value}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                style={styles.textInput}
                                multiline
                                error={!!errors.productName}
                            />)}
                    />

                    <View style={styles.row}>
                        <Controller
                            name="price"
                            control={control}
                            render={({field: {onChange, onBlur, value}}) => (<TextInput
                                    label="Price"
                                    mode="outlined"
                                    value={value.toString()}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    style={[styles.halfWidthInput, {marginRight: 8}]}
                                    keyboardType="numeric"
                                    error={!!errors.price}
                                />)}
                        />
                        <Controller
                            name="stock"
                            control={control}
                            render={({field: {onChange, onBlur, value}}) => {
                                console.log('stock value:', value);
                                return (<TextInput
                                label="Stock"
                                mode="outlined"
                                value={value.toString()}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                style={[styles.halfWidthInput, {marginRight: 8}]}
                                keyboardType="numeric"
                                error={!!errors.price}
                            />)}}
                        />
                        <View ref={gstInputContainerRef} style={styles.gstInputContainer}>
                            <TextInput
                                label="GST (%)"
                                mode="outlined"
                                value={gstRate.toString() + "%"}
                                editable={false} // Make it read-only
                                style={styles.gstInput}
                                right={<TextInput.Icon icon="chevron-down" onPress={openGstMenu}/>}
                            />
                        </View>
                        {/* GST Rate Dropdown */}

                        <Controller
                            name="gstRate"
                            control={control}
                            render={({field: {onChange, onBlur, value}}) => (

                                <Menu
                                    visible={gstMenuVisible}
                                    onDismiss={() => setGstMenuVisible(false)}
                                    anchor={{x: gstDropdownPosition.x, y: gstDropdownPosition.y}}
                                    style={{width: gstDropdownPosition.width}} // Match width of the TextInput
                                >
                                    {gstRates.map((rate) => (<Button
                                            key={rate}
                                            mode="text"
                                            onPress={() => {
                                                onChange(rate);
                                                setGstRate(rate);
                                                setGstMenuVisible(false);
                                            }}
                                            contentStyle={{
                                                justifyContent: "flex-start", width: gstDropdownPosition.width, // Match dropdown width
                                            }}
                                            labelStyle={{color: "black", fontSize: 16}}
                                            style={styles.gstDropdownItem}
                                        >
                                            {rate.toString() + "%"}
                                        </Button>))}
                                </Menu>)}
                        />
                    </View>

                    <Controller
                        name="description"
                        control={control}
                        render={({field: {onChange, onBlur, value}}) => (<TextInput
                                label="Description"
                                mode="outlined"
                                value={value}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                style={[styles.textInput, styles.textArea]}
                                multiline
                                error={!!errors.description}
                            />)}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.header}>Settings</Text>
                    <View style={styles.optionColumn}>
                        <View
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                marginVertical: 8,
                                marginHorizontal: 10,
                            }}
                        >
                            <Controller
                                name="isActive"
                                control={control}
                                render={({field: {onChange, onBlur, value}}) => (<Switch
                                    value={value}
                                    onValueChange={onChange}
                                    style={{marginRight: 16}}
                                />)}
                            />
                            <Text variant={"bodyLarge"}>Active</Text>
                        </View>
                        <View
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                marginVertical: 8,
                                marginHorizontal: 10,
                            }}
                        >
                            <Controller
                                name="enableRatings"
                                control={control}
                                render={({field: {onChange, onBlur, value}}) => (

                                    <Switch
                                        value={value}
                                        onValueChange={onChange}
                                        style={{marginRight: 16}}
                                    />)}
                            />
                            <Text variant={"bodyLarge"}>Enable Ratings</Text>
                        </View>
                        <View
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                marginVertical: 8,
                                marginHorizontal: 10,
                            }}
                        >
                            <Controller
                                name="enableReviews"
                                control={control}
                                render={({field: {onChange, onBlur, value}}) => (

                                    <Switch
                                        value={value}
                                        onValueChange={onChange}
                                        style={{marginRight: 16}}
                                    />)}
                            />
                            <Text variant={"bodyLarge"}>Enable Reviews</Text>
                        </View>
                        <View
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                marginVertical: 8,
                                marginHorizontal: 10,
                            }}
                        >
                            <Controller
                                name="enableStockTracking"
                                control={control}
                                render={({field: {onChange, onBlur, value}}) => (<Switch
                                    value={value}
                                    onValueChange={onChange}
                                    style={{marginRight: 16}}
                                />)}
                            />
                            <Text variant={"bodyLarge"}>Enable Stock Tracking</Text>
                        </View>
                        <Controller
                            name="gstInclusive"
                            control={control}
                            render={({field: {onChange, onBlur, value}}) => (

                                <Checkbox.Item
                                    label="GST Inclusive"
                                    position={"leading"}
                                    mode={'android'}
                                    labelStyle={{fontSize: 16}}
                                    status={value ? "checked" : "unchecked"}
                                    onPress={(e) => {
                                        // console.log('v:', e.target.value);
                                        onChange(!value);
                                    }}
                                />)}
                        />
                    </View>
                </View>

                {/* Collections Section */}
                <View style={styles.section}>
                    <Text style={styles.header}>Collections</Text>
                    <Controller
                        name="collections"
                        control={control}
                        rules={{
                            validate: (value) => value.length > 0 || "At least one collection must be selected.",
                        }}
                        render={({field: {value, onChange}, fieldState: {error}}) => (<View>
                                <View
                                    style={{
                                        display: "flex", flexDirection: "row", flexWrap: "wrap",
                                    }}
                                >
                                    {existingCollections.map((collection, idx) => {
                                        // console.log('c:', collection, ',value:', value);
                                        return (
                                        <View key={idx} style={styles.checkboxContainer}>
                                            <Checkbox.Android
                                                status={value.includes(collection.collectionId) ? "checked" : "unchecked"}
                                                onPress={() => {
                                                    if (value.includes(collection.collectionId)) {
                                                        onChange(value.filter((item) => item !== collection.collectionId),);
                                                    } else {
                                                        onChange([...value, collection.collectionId]);
                                                    }
                                                }}
                                            />
                                            <Text>{collection.collectionName}</Text>
                                        </View>)}

                                    )}
                                </View>
                                {error && <Text style={styles.errorText}>{error.message}</Text>}
                            </View>)}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.header}>Attributes</Text>
                    {attributeFormFields && attributeFormFields?.map((field, index) => (
                        <View key={field.id}>{renderAttributeInput(index, field)}</View>))}

                    <View
                        style={{
                            display: "flex", flexDirection: "row", justifyContent: "center",
                        }}
                    >
                        <Button
                            icon="plus"
                            mode="contained"
                            style={styles.addButton}
                            onPress={addAttribute}
                        >
                            Add Attribute
                        </Button>
                    </View>
                </View>

                {/* Tags Section */}
                <View style={styles.section}>
                    <Text style={styles.header}>Tags</Text>
                    <View style={styles.tagsContainer}>
                        {/* Display Selected Tags */}
                        {tags.map((tag) => (<Chip
                                key={tag}
                                onClose={() => removeTag(tag)}
                                style={styles.tagChip}
                            >
                                {tag}
                            </Chip>))}
                    </View>

                    {/* Tag Input */}
                    <Controller
                        name="productTags"
                        control={control}
                        render={() => (<View style={styles.tagInputContainer}>
                                <TextInput
                                    label="Add Tag"
                                    mode="outlined"
                                    value={tagInput}
                                    onChangeText={handleTagInputChange}
                                    onSubmitEditing={handleTagInputSubmit} // Enter key press
                                    right={<TextInput.Icon
                                        icon="plus"
                                        onPress={handleTagInputSubmit} // "+" icon press
                                    />}
                                    style={styles.tagInput}
                                />

                                {/* Tag Suggestions */}
                                {filteredTagSuggestions.length > 0 && (<View style={styles.suggestionsContainer}>
                                        {filteredTagSuggestions.map((suggestion) => (<TouchableOpacity
                                                key={suggestion}
                                                style={styles.suggestionItem}
                                                onPress={() => addTag(suggestion)}
                                            >
                                                <Text style={styles.suggestionText}>{suggestion}</Text>
                                            </TouchableOpacity>))}
                                    </View>)}
                            </View>)}
                    />
                </View>

                {/* Attribute Selection */}
                <View style={styles.section}>
                    <Text style={styles.header}>Manage Variants</Text>
                    <Text variant={"bodyMedium"}>Variant Attributes</Text>
                    <View
                        style={{display: "flex", flexDirection: "row", flexWrap: "wrap"}}
                    >
                        {attributeFormFields?.map((attribute, idx) => attribute.key.trim() !== "" && (
                            <View key={idx} style={styles.checkboxContainer}>
                                <Checkbox
                                    status={variantSelectedAttributes.includes(attribute.key) ? "checked" : "unchecked"}
                                    onPress={() => toggleVariantAttributeSelection(attribute.key)}
                                />
                                <Text>{attribute.key}</Text>
                            </View>),)}
                    </View>

                    <View
                        style={{
                            display: "flex", flexDirection: "row", justifyContent: "space-between",
                        }}
                    >
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
                            onPress={generateVariant}
                            style={styles.generateVariantButton}
                        >
                            Generate Variant
                        </Button>
                    </View>
                </View>
            </Surface>
        </ScrollView>);
};

const makeStyles = ({colors}) => StyleSheet.create({
    container: {
        flex: 1, backgroundColor: colors.surface, padding: 16,
    }, scrollContainer: {
        // flex: 1,
        // backgroundColor: 'green',
        // marginTop: 60,
        // paddingTop: 80,
        // padding: 16,
    }, section: {
        marginVertical: 8,
    }, // stickyActionContainer: {
    //     backgroundColor: 'silver',
    //     borderBottomWidth: 1,
    //     padding: 16,
    //     top: 0,
    //     position: 'absolute'
    // },
    textInput: {
        marginBottom: 8,
    }, textArea: {
        minHeight: 80,
    }, gstInputContainer: {
        flex: 0.7, position: "relative", marginLeft: 8,
    }, gstInput: {
        flex: 1,
    }, gstDropdownContainer: {
        position: "absolute",
        zIndex: 10,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 4,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    }, gstDropdownItem: {
        padding: 0, borderRadius: 0, borderBottomWidth: 1, borderBottomColor: "#eee", color: "black",
    }, gstDropdownText: {
        fontSize: 26,
    }, menuItemContainer: {
        justifyContent: "center", alignItems: "flex-start",
    }, optionColumn: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        flexWrap: "wrap",
        marginVertical: 10, // marginBottom: 10,
        // backgroundColor: 'white',
        padding: 0,
    }, header: {
        fontSize: 18, fontWeight: "bold", marginBottom: 8,
    }, attributeRow: {
        flexDirection: "row", alignItems: "center", marginBottom: 16,
    }, attributeInput: {
        flex: 1, marginRight: 4,
    }, suggestionsContainer: {
        position: "absolute",
        top: 50,
        left: 0,
        zIndex: 10,
        backgroundColor: "white",
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 4,
        maxHeight: 150,
    }, suggestionItem: {
        width: "100%", margin: 0, padding: 10, borderRadius: 0, borderBottomWidth: 1, borderBottomColor: "#eee",
    }, removeButton: {
        marginLeft: 0,
    }, addButton: {
        marginVertical: 0, backgroundColor: colors.secondary,
    }, saveButton: {
        backgroundColor: "white", borderRadius: 0, borderWidth: 2,
    }, publishButton: {
        backgroundColor: colors.success, borderRadius: 0,
    }, row: {
        flexDirection: "row", marginBottom: 16,
    }, halfWidthInput: {
        flex: 1,
    }, subHeader: {
        fontSize: 16, fontWeight: "bold", marginTop: 16,
    }, checkboxContainer: {
        flexDirection: "row", alignItems: "center", marginVertical: 4,
    }, generateVariantButton: {
        marginVertical: 16, backgroundColor: colors.secondary, borderRadius: 0,
    }, markAsVariantButton: {
        marginVertical: 16,
        color: colors.primary,
        borderRadius: 0,
        borderColor: colors.primary, // backgroundColor: colors.tertiary,
    }, variantRow: {
        flexDirection: "row", alignItems: "center", marginBottom: 8,
    }, variantText: {
        flex: 1,
    }, variantInput: {
        flex: 1, marginRight: 8,
    }, tagsContainer: {
        flexDirection: "row", flexWrap: "wrap", marginBottom: 8,
    }, tagChip: {
        marginRight: 8, marginBottom: 8,
    }, tagInputContainer: {
        position: "relative", marginBottom: 8,
    }, tagInput: {
        flex: 1,
    }, errorText: {
        color: "red", fontSize: 12, marginBottom: 8,
    },
});

export default ProductInfoScreen;
