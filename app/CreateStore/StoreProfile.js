import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, useTheme, Menu, Divider, HelperText } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import LogoIconWithName from "../../components/LogoIconWithName"; // Adjust path as needed
import { setNewStoreField } from "../../store/newStoreSlice"; // Adjust path as needed
import { NewAddressForm } from "../../components/NewAddressForm"; // Adjust path as needed

// Import data from your file
import { business_types, categories as razorpayCategoriesData } from '../../utils/razorpayBusinessData';
import PhoneInput from "../../components/PhoneInput";
import {formatPhone} from "../../utils/identifierUtils"; // Adjust path as needed

const IS_WEB = Platform.OS === 'web';

// Helper function to format snake_case or camelCase to Title Case for display
const formatLabel = (str) => {
    if (!str) return '';
    const spaced = str.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1');
    return spaced.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

const businessTypeOptions = business_types.map(type => ({
    label: formatLabel(type),
    value: type,
}));

const categoryOptions = Object.keys(razorpayCategoriesData).map(key => ({
    label: formatLabel(key), // Or use a predefined label if available in your data structure
    value: key,
}));


export default function StoreProfile() {
    const theme = useTheme();
    const router = useRouter();
    const dispatch = useDispatch();
    const styles = makeStyles(theme);
    const newStoreState = useSelector((state) => state.newStore);

    const [legalBusinessName, setLegalBusinessName] = useState(newStoreState.legalBusinessName || '');
    const [storeEmail, setStoreEmail] = useState(newStoreState.storeEmail || '');
    const [storePhone, setStorePhone] = useState(newStoreState.storePhone || '');

    const [selectedBusinessType, setSelectedBusinessType] = useState(newStoreState.businessType || '');
    const [selectedCategory, setSelectedCategory] = useState(newStoreState.category || '');
    const [selectedSubCategory, setSelectedSubCategory] = useState(newStoreState.subcategory || '');

    const [currentSubCategoryOptions, setCurrentSubCategoryOptions] = useState([]);

    const [businessTypeMenuVisible, setBusinessTypeMenuVisible] = useState(false);
    const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
    const [subcategoryMenuVisible, setSubcategoryMenuVisible] = useState(false);

    const [registeredAddress, setRegisteredAddress] = useState(newStoreState.registeredAddress || {});
    const [addressSaved, setAddressSaved] = useState(Object.keys(newStoreState.registeredAddress || {}).length > 0);

    const [errors, setErrors] = useState({});

    // Update sub-category options when category changes
    useEffect(() => {
        if (selectedCategory && razorpayCategoriesData[selectedCategory]) {
            // Handle potential nested array issue if present in data like for 'transport'
            const subcategoriesArray = razorpayCategoriesData[selectedCategory].subcategories;
            let flatSubcategories = [];
            if (Array.isArray(subcategoriesArray)) {
                subcategoriesArray.forEach(item => {
                    if (Array.isArray(item)) { // Handles cases like [['sub1', 'sub2']]
                        flatSubcategories.push(...item);
                    } else {
                        flatSubcategories.push(item);
                    }
                });
            }

            setCurrentSubCategoryOptions(
                flatSubcategories.map(subCat => ({
                    label: formatLabel(subCat),
                    value: subCat,
                }))
            );
        } else {
            setCurrentSubCategoryOptions([]);
        }
        setSelectedSubCategory(''); // Reset sub-category when category changes
    }, [selectedCategory]);


    const validate = () => {
        const newErrors = {};
        if (!legalBusinessName.trim()) newErrors.legalBusinessName = "Legal business name is required.";
        if (!storeEmail.trim()) {
            newErrors.storeEmail = "Store email is required.";
        } else if (!/\S+@\S+\.\S+/.test(storeEmail)) {
            newErrors.storeEmail = "Email address is invalid.";
        }
        if (!storePhone.trim()) {
            newErrors.storePhone = "Store phone is required.";
        }
        if (!selectedBusinessType) newErrors.businessType = "Business type is required.";
        if (!selectedCategory) newErrors.category = "Category is required.";
        // Sub-category might be optional if the list is empty
        if (currentSubCategoryOptions.length > 0 && !selectedSubCategory) {
            newErrors.subcategory = "Sub-category is required.";
        }

        if (!addressSaved || Object.keys(registeredAddress).length === 0 || !registeredAddress.street1) {
            newErrors.registeredAddress = "Registered address is required. Please fill and save the address form.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddressSave = (addressData) => {
        setRegisteredAddress(addressData);
        setAddressSaved(true);
        setErrors(prev => ({...prev, registeredAddress: null}));
        // Alert.alert("Address Saved", "Registered address has been updated locally.");
    };

    const handleAddressDiscard = () => {
        setRegisteredAddress({});
        // Alert.alert("Address Discarded", "Address changes were not saved locally.");
    };


    const handleNext = () => {
        if (validate()) {
            dispatch(setNewStoreField({ field: 'legalBusinessName', value: legalBusinessName.trim() }));
            dispatch(setNewStoreField({ field: 'storeEmail', value: storeEmail.trim() }));
            dispatch(setNewStoreField({ field: 'storePhone', value: formatPhone(storePhone.trim()) }));
            dispatch(setNewStoreField({ field: 'businessType', value: selectedBusinessType }));
            dispatch(setNewStoreField({ field: 'category', value: selectedCategory }));
            dispatch(setNewStoreField({ field: 'subcategory', value: selectedSubCategory })); // Will be empty string if no subcategories or not selected
            dispatch(setNewStoreField({ field: 'registeredAddress', value: registeredAddress }));

            router.push(IS_WEB ? '/create_store/store_tags' : '/CreateStore/StoreTags');
        } else {
            Alert.alert("Validation Error", "Please fill all required fields correctly.");
        }
    };

    const commonWrapperStyle = { flex: 1, backgroundColor: 'white' };

    const getSelectedLabel = (value, optionsArray) => {
        const selected = optionsArray.find(opt => opt.value === value);
        return selected ? selected.label : '';
    };

    const renderDropdownAnchor = (label, selectedValueToDisplay, onPress, error) => (
        <View>
            <Button
                mode="outlined"
                onPress={onPress}
                style={[styles.dropdownAnchor, error ? { borderColor: theme.colors.error } : {}]}
                labelStyle={styles.dropdownLabel}
                contentStyle={{justifyContent: 'space-between', flexDirection: 'row-reverse'}}
                icon="menu-down"
            >
                {selectedValueToDisplay ? selectedValueToDisplay : `Select ${label}`}
            </Button>
            {error && <HelperText type="error" visible={!!error}>{error}</HelperText>}
        </View>
    );


    const screenContent = (
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <View style={{ flex: 1, justifyContent: 'center' }}>
                <LogoIconWithName style={{alignSelf: 'center', marginBottom: 24}}/>
                <Text variant="titleMedium" style={styles.sectionTitle}>Business & Contact Details</Text>

                <TextInput
                    label="Legal Business Name"
                    value={legalBusinessName}
                    onChangeText={setLegalBusinessName}
                    style={styles.input}
                    mode="outlined"
                    error={!!errors.legalBusinessName}
                />
                {errors.legalBusinessName && <HelperText type="error">{errors.legalBusinessName}</HelperText>}

                <TextInput
                    label="Business Email"
                    value={storeEmail}
                    onChangeText={setStoreEmail}
                    style={styles.input}
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={!!errors.storeEmail}
                />
                {errors.storeEmail && <HelperText type="error">{errors.storeEmail}</HelperText>}

                <PhoneInput label={"Business Phone Number"} setPhone={setStorePhone} style={styles.input} error={!!errors.storePhone}/>
                {errors.storePhone && <HelperText type="error">{errors.storePhone}</HelperText>}

                <Text variant="titleSmall" style={styles.dropdownGroupTitle}>Business Type</Text>
                <Menu
                    visible={businessTypeMenuVisible}
                    onDismiss={() => setBusinessTypeMenuVisible(false)}
                    anchor={renderDropdownAnchor("Business Type", getSelectedLabel(selectedBusinessType, businessTypeOptions), () => setBusinessTypeMenuVisible(true), errors.businessType)}
                    style={styles.menuStyle}
                >
                    {businessTypeOptions.map(option => (
                        <Menu.Item
                            key={option.value}
                            onPress={() => {
                                setSelectedBusinessType(option.value);
                                setBusinessTypeMenuVisible(false);
                            }}
                            title={option.label}
                        />
                    ))}
                </Menu>

                <Menu
                    visible={categoryMenuVisible}
                    onDismiss={() => setCategoryMenuVisible(false)}
                    anchor={renderDropdownAnchor("Category", getSelectedLabel(selectedCategory, categoryOptions), () => setCategoryMenuVisible(true), errors.category)}
                    style={styles.menuStyle}
                >
                    {categoryOptions.map(option => (
                        <Menu.Item
                            key={option.value}
                            onPress={() => {
                                setSelectedCategory(option.value);
                                setCategoryMenuVisible(false);
                            }}
                            title={option.label}
                        />
                    ))}
                </Menu>

                {selectedCategory && currentSubCategoryOptions.length > 0 && (
                    <Menu
                        visible={subcategoryMenuVisible}
                        onDismiss={() => setSubcategoryMenuVisible(false)}
                        anchor={renderDropdownAnchor("Sub-Category", getSelectedLabel(selectedSubCategory, currentSubCategoryOptions), () => setSubcategoryMenuVisible(true), errors.subcategory)}
                        style={styles.menuStyle}
                    >
                        {currentSubCategoryOptions.map(option => (
                            <Menu.Item
                                key={option.value}
                                onPress={() => {
                                    setSelectedSubCategory(option.value);
                                    setSubcategoryMenuVisible(false);
                                }}
                                title={option.label}
                            />
                        ))}
                    </Menu>
                )}
                {selectedCategory && currentSubCategoryOptions.length === 0 && (
                    <Text style={styles.noSubCategoryText}>No sub-categories for selected category.</Text>
                )}


                <Divider style={styles.divider} />
                <Text variant="titleMedium" style={styles.sectionTitle}>Registered Business Address</Text>
                {errors.registeredAddress && <HelperText type="error" style={{textAlign: 'center'}}>{errors.registeredAddress}</HelperText>}

                <View style={styles.addressFormContainer}>
                    <NewAddressForm
                        initialValues={registeredAddress}
                        onSaveHandler={handleAddressSave}
                        discard={handleAddressDiscard}
                        buttonLabel="Save Address"
                        showDefaultCheckbox={false}
                    />
                </View>


                <View style={{display: 'flex', alignSelf: 'center', justifyContent: 'center', marginTop: 32 }}>
                    <Button
                        mode="contained"
                        onPress={handleNext}
                        style={styles.button}
                    >
                        Next
                    </Button>
                </View>
            </View>
        </ScrollView>
    );

    if (Platform.OS === 'web') {
        return <View style={commonWrapperStyle}>{screenContent}</View>;
    } else {
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={commonWrapperStyle}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                {screenContent}
            </KeyboardAvoidingView>
        );
    }
}

const makeStyles = (theme) => StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        justifyContent: 'center',
        backgroundColor: 'white',
        ...(Platform.OS === 'web' && {
            width: '100%',
            maxWidth: 700,
            alignSelf: 'center',
        }),
    },
    input: {
        marginBottom: 8,
        backgroundColor: 'white',
    },
    button: {
        borderRadius: 8,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        marginTop: 20,
        marginBottom: 15,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    dropdownGroupTitle: {
        marginTop: 16,
        marginBottom: 8,
        // textAlign: 'center',
        color: theme.colors.onSurfaceVariant, // Or your preferred color
    },
    divider: {
        marginVertical: 25,
        height: 1.5,
    },
    dropdownAnchor: {
        backgroundColor: 'white',
        marginTop: 8,
        marginBottom: 12, // For consistency with TextInput + HelperText
        height: 56,
        justifyContent: 'center',
        paddingHorizontal: 14,
        borderWidth: 1,
        borderRadius: 4,
    },
    dropdownLabel: {
        // Styles for the text inside the dropdown anchor button
    },
    menuStyle: {
        // marginTop: 60, // Adjust if menu is not aligned with anchor
    },
    addressFormContainer: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: Platform.OS === 'web' ? 20 : 15,
        marginTop: 10,
        marginBottom: 20,
        backgroundColor: '#f9f9f9'
    },
    noSubCategoryText: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        color: theme.colors.onSurfaceVariant,
        fontStyle: 'italic',
        marginBottom: 8,
    }
});