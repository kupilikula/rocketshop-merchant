import React, {useEffect, useState, useCallback, useContext} from "react";
import {
    Platform, View, StyleSheet, TouchableOpacity, ScrollView, Switch
} from "react-native";
import {
    TextInput, Button, Text, IconButton, useTheme, Checkbox, Menu, Chip,
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
import GstRateDropdown from "./GstRateDropdown";

const IS_WEB = Platform.OS === "web";

const PREDEFINED_ATTRIBUTES = [
    {
        id: "color", label: "Color",
        values: ["Red", "Blue", "Green", "Black", "White", "Yellow", "Purple", "Orange", "Pink", "Brown", "Gray"],
    },
    { id: "size", label: "Size", values: ["XS", "S", "M", "L", "XL", "XXL", "Free Size"] },
    { id: "length", label: "Length", values: ["0.5m", "0.8m", "1m", "1.1m", "1.5m", "2m"] },
    {
        id: "material", label: "Material",
        values: ["Cotton", "Silk", "Wool", "Polyester", "Leather", "Denim", "Linen", "Nylon", "Organza", "Tissue"],
    },
    {
        id: "quantity_type", label: "Pack/Set",
        values: ["Single", "Pack of 2", "Pack of 3", "Set of 2", "Set of 3", "Set of 4"],
    },
    { id: "weight", label: "Weight", values: [], placeholder: "e.g., 100g, 0.5kg" },
    { id: "dimensions", label: "Dimensions", values: [], placeholder: "e.g., 10x5x2 cm" },
];
const PREDEFINED_ATTRIBUTE_KEYS = PREDEFINED_ATTRIBUTES.map(attr => ({ id: attr.id, label: attr.label }));

const ProductInfoScreen = (props) => {
    const dispatch = useDispatch();
    const {isNewProduct, productInfoFormRef} = useContext(ProductWorkflowContext);
    const {storeId} = useSelector((state) => state.store);
    const {defaultGstRate, defaultGstInclusive} = useSelector((state) => state.storeSettings);
    const productData = useSelector((state) => isNewProduct ? state.newProduct : state.editProduct);
    const navigation = useNavigation();

    const [tempCustomKeyValues, setTempCustomKeyValues] = useState({});
    const handleTempCustomKeyChange = (index, text) => {
        setTempCustomKeyValues(prev => ({ ...prev, [index]: text }));
    };

    const {data: existingCollections = [] } = useCollections(storeId);
    const [tagSuggestions] = useState(["Best Sellers", "Featured", "HandMade", "New Arrival", "Discount", "Popular"]);
    const [filteredTagSuggestions, setFilteredTagSuggestions] = useState([]);
    const [tagInput, setTagInput] = useState("");

    const isFocused = useIsFocused();
    const router = useRouter();
    const theme = useTheme();
    const styles = makeStyles(theme);

    const schema = yup.object().shape({
        productName: yup.string().required("Product Name is required."),
        price: yup.number().typeError("Price must be a valid number.").positive("Price must be greater than zero.").required("Price is required."),
        stock: yup.number().typeError("Stock must be a valid number.").min(0, "Stock cannot be negative.").required("Stock is required."),
        description: yup.string().required("Description is required."),
        collections: yup // Added validation for collections as per original
            .array()
            .min(1, "At least one collection must be selected."),
    });

    const {
        control, handleSubmit, reset, setValue, getValues, watch, formState: {errors},
    } = useForm({
        defaultValues: {
            productName: "",
            price: "",
            stock: "",
            description: "",
            collections: [],
            gstRate: defaultGstRate,
            gstInclusive: defaultGstInclusive,
            attributes: [],
            productTags: [],
            rating: null,
            numberOfRatings: 0,
            isActive: true,
        },
        shouldUnregister: false,
        resolver: yupResolver(schema),
    });

    const {
        fields: attributeFormFields, append: appendFormAttribute, remove: deleteFormAttribute, replace: replaceFormAttributes,
    } = useFieldArray({ control, name: "attributes" });

    const tags = watch("productTags", []);

    useEffect(() => {
        if (productData && (isFocused || IS_WEB)) {
            let productInfoData = _.cloneDeep(productData);
            delete productInfoData.mediaItems;
            reset(productInfoData);
        }
    }, [isFocused, productData, reset]);

    const saveStateToRedux = useCallback(() => {
        const currentState = getValues();
        if (isNewProduct) {
            dispatch(updateNewProductField({field: "all", value: currentState}));
        } else {
            dispatch(updateEditProductField({field: "all", value: currentState}));
        }
    }, [dispatch, getValues, isNewProduct, updateNewProductField, updateEditProductField]);

    const saveStateToReduxAndResetFormData = useCallback(() => {
        saveStateToRedux();
        replaceFormAttributes([]);
        reset();
    }, [saveStateToRedux, reset, replaceFormAttributes]);

    const handleBeforeRemove = useCallback((e) => {
        if (["NAVIGATE", "POP", "GO_BACK", "REPLACE"].includes(e.data.action.type)) {
            saveStateToReduxAndResetFormData();
        }
    }, [saveStateToReduxAndResetFormData]);

    useEffect(() => {
        const unsubscribe = navigation.addListener("beforeRemove", handleBeforeRemove);
        return unsubscribe;
    }, [navigation, handleBeforeRemove]);

    useEffect(() => {
        const unsubscribe = navigation.addListener("blur", saveStateToReduxAndResetFormData);
        return unsubscribe;
    }, [navigation, saveStateToReduxAndResetFormData]);

    const addAttribute = () => appendFormAttribute({key: "", value: ""});
    const removeAttribute = (index) => deleteFormAttribute(index);

    const renderAttributeInput = (index, formField) => {
        const currentAttributeKey = watch(`attributes.${index}.key`);
        const currentAttributeDefinition = PREDEFINED_ATTRIBUTES.find(attr => attr.label === currentAttributeKey);

        return (
            <View key={formField.id} style={styles.attributeRowContainer}>
                <View style={styles.attributeKeySection}>
                    <Controller
                        name={`attributes.${index}.key`}
                        control={control}
                        rules={{ required: `Attribute name is required.` }}
                        render={({ field: { onChange: rhfOnChangeKey, value: currentKeyFieldValue }, fieldState: { error } }) => {
                            const handleCustomKeySubmit = () => {
                                const customKeyToSubmit = tempCustomKeyValues[index]?.trim();
                                if (customKeyToSubmit) {
                                    rhfOnChangeKey(customKeyToSubmit);
                                    setValue(`attributes.${index}.value`, "");
                                }
                            };
                            return (
                                <>
                                    {!currentKeyFieldValue ? (
                                        <>
                                            <Text style={styles.chipSelectionPrompt}>Select or Type Attribute:</Text>
                                            <View style={styles.chipsContainer}>
                                                {PREDEFINED_ATTRIBUTE_KEYS.map((keyDef) => (
                                                    <Chip
                                                        key={keyDef.id} style={styles.chip} mode="outlined"
                                                        onPress={() => {
                                                            rhfOnChangeKey(keyDef.label);
                                                            setValue(`attributes.${index}.value`, "");
                                                            handleTempCustomKeyChange(index, "");
                                                        }}
                                                    >{keyDef.label}</Chip>
                                                ))}
                                            </View>
                                            <View style={styles.customKeyInputRow}>
                                                <TextInput
                                                    mode={'outlined'} label="Or type custom attribute"
                                                    value={tempCustomKeyValues[index] || ''}
                                                    onChangeText={(text) => handleTempCustomKeyChange(index, text)}
                                                    onSubmitEditing={handleCustomKeySubmit}
                                                    style={styles.customKeyTextInput} dense
                                                />
                                                {tempCustomKeyValues[index]?.trim() && (
                                                    <IconButton
                                                        icon="check-circle-outline" size={24}
                                                        onPress={handleCustomKeySubmit}
                                                        style={styles.customKeySubmitButton}
                                                        color={theme.colors.primary}
                                                    />
                                                )}
                                            </View>
                                        </>
                                    ) : (
                                        <View style={styles.selectedKeyContainer}>
                                            <Chip
                                                style={styles.selectedKeyChip} textStyle={styles.selectedKeyChipText}
                                                onClose={() => {
                                                    rhfOnChangeKey(""); setValue(`attributes.${index}.value`, "");
                                                    handleTempCustomKeyChange(index, "");
                                                }}
                                                selectedColor={'black'}
                                            >{currentKeyFieldValue}</Chip>
                                        </View>
                                    )}
                                    {error && <Text style={styles.errorTextSmall}>{error.message}</Text>}
                                </>
                            );
                        }}
                    />
                </View>

                {currentAttributeKey && (
                    <View style={styles.attributeValueSection}>
                        <Text style={styles.chipSelectionPrompt}>Set Value for {currentAttributeKey}:</Text>
                        {currentAttributeDefinition?.values?.length > 0 && (
                            <View style={styles.chipsContainer}>
                                {currentAttributeDefinition.values.map((val, valIdx) => (
                                    <Chip
                                        key={valIdx} style={styles.chip} mode="outlined"
                                        onPress={() => setValue(`attributes.${index}.value`, val)}
                                    >{val}</Chip>
                                ))}
                            </View>
                        )}
                        <Controller
                            name={`attributes.${index}.value`} control={control}
                            rules={{ validate: v => !currentAttributeKey || !!v || `${currentAttributeKey} value is required.`}}
                            render={({ field: { onChange, onBlur, value: val }, fieldState: { error } }) => (
                                <>
                                    <TextInput
                                        style={styles.attributeValueInput} mode="outlined"
                                        label={`Value for ${currentAttributeKey}`}
                                        placeholder={currentAttributeDefinition?.placeholder || "Enter value"}
                                        value={val || ""} onChangeText={onChange} onBlur={onBlur}
                                        error={!!error} dense
                                    />
                                    {error && <Text style={styles.errorTextSmall}>{error.message}</Text>}
                                </>
                            )}
                        />
                    </View>
                )}
                <IconButton
                    icon="delete-outline" size={24} onPress={() => removeAttribute(index)}
                    style={styles.removeAttributeButton} iconColor={theme.colors.error}
                />
            </View>
        );
    };

    const onSubmit = (data) => {
        if (isNewProduct) {
            dispatch(updateNewProductField({field: "all", value: data}));
            router.push(IS_WEB ? '/(web_merchant)/(protected)/add_new_product/shipping' : './Shipping');
        } else {
            dispatch(updateEditProductField({field: "all", value: data}));
            router.push(IS_WEB ? `/(web_merchant)/(protected)/edit_product/shipping` : "./EditShipping");
        }
    };

    useEffect(() => {
        if (productInfoFormRef) {
            productInfoFormRef.current = { submitForm: handleSubmit(onSubmit) };
        }
    }, [productInfoFormRef, handleSubmit, onSubmit]);

    const addTag = (tag) => {
        const currentTags = getValues("productTags");
        if (tag.trim() && !currentTags.includes(tag)) {
            setValue("productTags", [...currentTags, tag.trim()]);
        }
        setTagInput("");
        setFilteredTagSuggestions([]);
    };

    const removeTag = (tag) => {
        const updatedTags = tags.filter((t) => t !== tag);
        setValue("productTags", updatedTags);
    };

    const handleTagInputChange = (input) => {
        setTagInput(input);
        const filtered = tagSuggestions.filter((tag) => tag.toLowerCase().includes(input.toLowerCase()));
        setFilteredTagSuggestions(filtered);
    };

    const handleTagInputSubmit = () => {
        addTag(tagInput);
    };

    return (
        <ScrollView
            style={[styles.scrollContainer, IS_WEB && { width: '100%', alignSelf: 'center' }]}
            contentContainerStyle={[
                styles.scrollContainer,
                IS_WEB && { maxWidth: 800, marginHorizontal: 'auto', paddingBottom: 40 },
                !IS_WEB && { paddingBottom: 100 }
            ]}
            showsVerticalScrollIndicator={!IS_WEB}
        >
            <View style={styles.section}>
                <Text style={styles.header}>Details</Text>
                <Controller name="productName" control={control} render={({field: {onChange, onBlur, value}}) => (
                    <TextInput label="Product Name" mode="outlined" value={value} onBlur={onBlur} onChangeText={onChange} style={styles.textInput} multiline error={!!errors.productName} />
                )} />
                <View style={styles.row}>
                    <Controller name="price" control={control} render={({field: {onChange, onBlur, value}}) => (
                        <TextInput label="Price" mode="outlined" value={String(value)} onBlur={onBlur} onChangeText={onChange} style={styles.halfWidthInput} keyboardType={'decimal-pad'} error={!!errors.price} />
                    )} />
                    <Controller name="stock" control={control} render={({field: {onChange, onBlur, value}}) => (
                        <TextInput label="Stock" mode="outlined" value={String(value)} onBlur={onBlur} onChangeText={onChange} style={styles.halfWidthInput} keyboardType={'numeric'} error={!!errors.stock} />
                    )} />
                    <Controller name="gstRate" control={control} render={({ field: { value, onChange } }) => (
                        <GstRateDropdown value={value} onChange={onChange} />
                    )} />
                </View>
                <Controller name="description" control={control} render={({field: {onChange, onBlur, value}}) => (
                    <TextInput label="Description" mode="outlined" value={value} onBlur={onBlur} onChangeText={onChange} style={[styles.textInput, styles.textArea]} multiline error={!!errors.description} />
                )} />
            </View>

            <View style={styles.section}>
                <Text style={styles.header}>Settings</Text>
                <View style={styles.optionColumn}>
                    <View style={{ display: "flex", flexDirection: "row", alignItems: "center", marginVertical: 8, marginHorizontal: 10 }}>
                        <Controller name="isActive" control={control} render={({field: {onChange, value}}) => (
                            <Switch value={value} onValueChange={onChange} style={{marginRight: 16}} />
                        )} />
                        <Text variant={"bodyLarge"}>Active</Text>
                    </View>
                    <Controller
                        name="gstInclusive"
                        control={control}
                        render={({field: {onChange, value}}) => (
                            <Checkbox.Item
                                label="GST Inclusive"
                                position={"leading"}
                                mode={'android'}
                                labelStyle={{fontSize: 16}}
                                status={value ? "checked" : "unchecked"}
                                onPress={() => onChange(!value) }
                            />
                        )}
                    />
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.header}>Collections</Text>
                <Controller
                    name="collections"
                    control={control}
                    rules={{
                        validate: (value) => (Array.isArray(value) && value.length > 0) || "At least one collection must be selected.",
                    }}
                    render={({field: {value, onChange}, fieldState: {error}}) => (
                        <View>
                            <View style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
                                {existingCollections.map((collection, idx) => (
                                    <View key={idx} style={styles.checkboxContainer}>
                                        <Checkbox.Android
                                            status={value.includes(collection.collectionId) ? "checked" : "unchecked"}
                                            onPress={() => {
                                                const newValue = value.includes(collection.collectionId)
                                                    ? value.filter((item) => item !== collection.collectionId)
                                                    : [...value, collection.collectionId];
                                                onChange(newValue);
                                            }}
                                        />
                                        <Text>{collection.collectionName}</Text>
                                    </View>
                                ))}
                            </View>
                            {error && <Text style={styles.errorText}>{error.message}</Text>}
                        </View>
                    )}
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.header}>Attributes</Text>
                {attributeFormFields.map((field, index) => renderAttributeInput(index, field))}
                <View style={{ display: "flex", flexDirection: "row", justifyContent: "center", marginTop: IS_WEB ? 10 : 0 }}>
                    <Button icon="plus" mode="contained" style={styles.addButton} onPress={addAttribute}>Add Attribute</Button>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.header}>Tags</Text>
                <View style={styles.tagsContainer}>
                    {tags.map((tag) => ( <Chip key={tag} onClose={() => removeTag(tag)} style={styles.tagChip}>{tag}</Chip> ))}
                </View>
                <Controller name="productTags" control={control} render={() => (
                    <View style={styles.tagInputContainer}>
                        <TextInput
                            label="Add Tag" mode="outlined" value={tagInput}
                            onChangeText={handleTagInputChange} onSubmitEditing={handleTagInputSubmit}
                            right={<TextInput.Icon icon="plus" onPress={handleTagInputSubmit} />}
                            style={styles.tagInput}
                        />
                        {filteredTagSuggestions.length > 0 && (
                            <View style={styles.suggestionsContainer}>
                                {filteredTagSuggestions.map((suggestion) => (
                                    <TouchableOpacity key={suggestion} style={styles.suggestionItem} onPress={() => addTag(suggestion)}>
                                        <Text style={styles.suggestionText}>{suggestion}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                )} />
            </View>
        </ScrollView>
    );
};

// This is the makeStyles function from your provided code for the web refactor request
const makeStyles = ({colors}) => StyleSheet.create({
    scrollContainer: {
        paddingHorizontal: 8,
        backgroundColor: colors.white,
    },
    section: {
        marginVertical: 8,
    },
    textInput: {
        marginBottom: 8,
        backgroundColor: 'white'
    },
    textArea: {
        minHeight: 80,
    },
    gstInputContainer: {
        flex: 0.7, position: "relative", marginLeft: 8,
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
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    gstDropdownItem: {
        padding: 0, borderRadius: 0, borderBottomWidth: 1, borderBottomColor: "#eee", color: "black",
    },
    gstDropdownText: {
        fontSize: 26,
    },
    menuItemContainer: {
        justifyContent: "center", alignItems: "flex-start",
    },
    optionColumn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        marginVertical: 10,
        padding: 0,
    },
    header: {
        fontSize: 18, fontWeight: "bold", marginBottom: 8,
    },
    suggestionsContainer: {
        position: "absolute",
        top: 50,
        left: 0,
        right: 0,
        zIndex: 10,
        backgroundColor: "white",
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 4,
        maxHeight: 150,
    },
    suggestionItem: {
        width: "100%", margin: 0, padding: 10, borderRadius: 0, borderBottomWidth: 1, borderBottomColor: "#eee",
    },
    suggestionText: {
        fontSize: 14,
    },
    removeButton: {
        marginLeft: 0,
    },
    addButton: {
        marginVertical: 0, backgroundColor: colors.secondary,
    },
    publishButton: {
        backgroundColor: colors.success, borderRadius: 0,
    },
    row: {
        flexDirection: "row", marginBottom: 16,
    },
    halfWidthInput: {
        backgroundColor: 'white',
        flex: 1,
        marginRight: 8,
    },
    subHeader: {
        fontSize: 16, fontWeight: "bold", marginTop: 16,
    },
    checkboxContainer: { // Style for the original Collections checkboxes
        flexDirection: "row", alignItems: "center", marginVertical: 4,
    },
    generateVariantButton: {
        marginVertical: 16, backgroundColor: colors.secondary, borderRadius: 0,
    },
    markAsVariantButton: {
        marginVertical: 16,
        color: colors.primary,
        borderRadius: 0,
        borderColor: colors.primary,
    },
    variantRow: {
        flexDirection: "row", alignItems: "center", marginBottom: 8,
    },
    variantText: {
        flex: 1,
    },
    variantInput: {
        flex: 1, marginRight: 8,
    },
    tagsContainer: {
        flexDirection: "row", flexWrap: "wrap", marginBottom: 8,
    },
    tagChip: {
        marginRight: 8, marginBottom: 8,
    },
    tagInputContainer: {
        position: "relative", marginBottom: 8,
    },
    tagInput: {
        flex: 1,
        backgroundColor: "white",
    },
    errorText: {
        color: "red", fontSize: 12, marginBottom: 8,
    },
    attributeRowContainer: {
        backgroundColor: colors.softSecondary,
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        position: 'relative',
    },
    attributeKeySection: {
        marginBottom: 10,
    },
    attributeValueSection: {
        marginTop: 10,
        marginBottom: 10,
    },
    chipsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        marginBottom: 8,
    },
    chip: {
        marginRight: 8,
        marginBottom: 8,
        backgroundColor: colors.softPrimary,
    },
    chipSelectionPrompt: {
        fontSize: 14,
        color: colors.onSurfaceVariant,
        margin: 8,
        fontWeight: '600',
    },
    selectedKeyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    selectedKeyChip: {
        backgroundColor: colors.softPrimary,
    },
    selectedKeyChipText: {
        color: 'black',
        fontWeight: 'bold',
    },
    attributeValueInput: {
        backgroundColor: colors.background,
        marginTop: 8,
    },
    removeAttributeButton: {
        position: 'absolute',
        top: 0,
        right: 0,
        margin: 0,
    },
    errorTextSmall: {
        color: colors.error,
        fontSize: 12,
        marginTop: 2,
    },
    customKeyInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 8,
    },
    customKeyTextInput: {
        flex: 1,
        backgroundColor: colors.white,
    },
    customKeySubmitButton: {
        marginLeft: 8,
    },
    attributeInput: {
        flex: 1, marginRight: 4,
    },
});

export default ProductInfoScreen;