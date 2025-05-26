// OfferDetailsScreen.js (Web-Adapted)
import React, { useState, useEffect } from "react";
import {
    ScrollView as DefaultScrollView, // Renamed for clarity
    View,
    StyleSheet,
    TouchableOpacity, // Keep if used by custom components, not directly in this JSX
    Platform,         // Added
    useWindowDimensions // Added
} from "react-native";
import {
    TextInput,
    Button,
    RadioButton,
    Chip,
    useTheme,
    Text,
    // Surface, // Not used in this file's JSX
    Switch,
} from "react-native-paper";
import ProductPickerModal from "./ProductPickerModal";
import CollectionPickerModal from "./CollectionPickerModal";
import TagPickerModal from "./TagPickerModal";
// useRouter, useLocalSearchParams, useSelector, useOffer, useUpdateOffer are used by the parent EditOfferScreen
// This component is now more presentational, receiving data and handlers as props.
import CrossPlatformDatePicker from "./CrossPlatformDatePicker";
import ScrollableScreen from "./ScrollableScreen"; // For mobile path

const IS_WEB = Platform.OS === 'web';

const OfferDetailsScreen = ({
                                offer,
                                publishHandler,
                                publishButtonLabel,
                                discardHandler,
                                discardButtonLabel,
                                // Add isWeb prop if this component needs to make internal decisions based on platform,
                                // though for now, its root rendering is handled by the parent.
                                // For modals, it will need to know IS_WEB.
                            }) => {
    const theme = useTheme();
    const { width: windowWidth } = useWindowDimensions();
    const styles = makeStyles(theme, IS_WEB, windowWidth); // Pass IS_WEB

    // State variables are managed here as it's the form
    const [offerType, setOfferType] = useState("");
    const [offerName, setOfferName] = useState("");
    const [offerDisplayText, setOfferDisplayText] = useState("");
    const [offerCode, setOfferCode] = useState("");
    const [requireCode, setRequireCode] = useState(false);
    const [discountDetails, setDiscountDetails] = useState({});
    // applicableTo is complex, ensure initial state is well-defined
    const [applicableTo, setApplicableTo] = useState({ storeWide: false, productIds: [], collectionIds: [], productTags: [] });
    const [conditions, setConditions] = useState({});
    const [validityDateRange, setValidityDateRange] = useState({ validFrom: new Date(), validUntil: new Date(new Date().setDate(new Date().getDate() + 7)) }); // Default until to 7 days later
    const [offerStatus, setOfferStatus] = useState(false);

    const [productPickerVisible, setProductPickerVisible] = useState(false);
    const [collectionPickerVisible, setCollectionPickerVisible] = useState(false);
    const [tagPickerVisible, setTagPickerVisible] = useState(false);

    const [storeWide, setStoreWide] = useState(false);
    const [selectedProductIds, setSelectedProductIds] = useState([]);
    const [selectedCollectionIds, setSelectedCollectionIds] = useState([]);
    const [selectedProductTags, setSelectedProductTags] = useState([]);

    useEffect(() => {
        if (offer) {
            console.log('line59 OfferDetailsScreen:', offer.discountDetails);
            setOfferType(offer.offerType || "");
            setOfferName(offer.offerName || "");
            setOfferDisplayText(offer.offerDisplayText || "");
            setOfferCode(offer.offerCode || "");
            setRequireCode(offer.requireCode || false);
            setDiscountDetails(offer.discountDetails || {});
            setApplicableTo(offer.applicableTo || { storeWide: false, productIds: [], collectionIds: [], productTags: [] });
            setConditions(offer.conditions || {});
            setValidityDateRange(offer.validityDateRange ? {
                validFrom: new Date(offer.validityDateRange.validFrom),
                validUntil: new Date(offer.validityDateRange.validUntil)
            } : { validFrom: new Date(), validUntil: new Date(new Date().setDate(new Date().getDate() + 7)) });
            setOfferStatus(offer.isActive || false);
            setStoreWide(offer.applicableTo?.storeWide || false);
            setSelectedProductIds(offer.applicableTo?.productIds || []);
            setSelectedCollectionIds(offer.applicableTo?.collectionIds || []);
            setSelectedProductTags(offer.applicableTo?.productTags || []);
        }
    }, [offer]);

    const handleApplyProducts = (products) => {
        setSelectedProductIds(products);
        setProductPickerVisible(false);
    };

    const handleApplyCollections = (collections) => {
        setSelectedCollectionIds(collections);
        setCollectionPickerVisible(false);
    };

    const handleApplyTags = (tags) => {
        setSelectedProductTags(tags);
        setTagPickerVisible(false);
    };

    const handlePublishOffer = () => { // Removed async as publishHandler is awaited by parent
        const errors = [];
        if (!offerName.trim()) errors.push("Offer Name cannot be empty.");
        if (!offerDisplayText.trim()) errors.push("Offer Display Text cannot be empty.");
        if (requireCode && !offerCode.trim()) errors.push("Offer Code cannot be empty if code is required.");
        const validFromDate = new Date(validityDateRange.validFrom);
        const validUntilDate = new Date(validityDateRange.validUntil);
        const currentDate = new Date();
        currentDate.setHours(0,0,0,0); // Compare dates only

        if (validFromDate >= validUntilDate) errors.push("Valid From date must be before Valid Until date.");
        // if (validUntilDate < currentDate) errors.push("Valid Until date must be in the future or today."); // Allow today

        if (offerType === "Percentage Off" && (!discountDetails.percentage || isNaN(parseFloat(discountDetails.percentage)) || parseFloat(discountDetails.percentage) <= 0)) errors.push("Percentage Off value must be a positive number.");
        if (offerType === "Fixed Amount Off" && (!discountDetails.fixedAmount || isNaN(parseFloat(discountDetails.fixedAmount)) || parseFloat(discountDetails.fixedAmount) <= 0)) errors.push("Fixed Amount Off value must be a positive number.");
        if (offerType === "Buy N Get K Free") {
            if (!discountDetails.buyN || isNaN(parseInt(discountDetails.buyN)) || parseInt(discountDetails.buyN) <=0) errors.push("Buy N value must be a positive integer.");
            if (!discountDetails.getK || isNaN(parseInt(discountDetails.getK)) || parseInt(discountDetails.getK) <=0) errors.push("Get K value must be a positive integer.");
        }
        if (!storeWide && selectedProductIds.length === 0 && selectedCollectionIds.length === 0 && selectedProductTags.length === 0) errors.push("If not store-wide, at least one Product, Collection, or Tag must be selected.");

        if (errors.length > 0) {
            alert("Please fix the following errors:\n" + errors.join("\n"));
            return;
        }

        publishHandler({ // Call the prop
            offerType,
            offerName: offerName.trim(),
            offerDisplayText: offerDisplayText.trim(),
            offerCode: offerCode.trim(),
            requireCode,
            discountDetails, // Ensure discountDetails are numbers where appropriate
            applicableTo: {
                storeWide: storeWide,
                productIds: selectedProductIds,
                collectionIds: selectedCollectionIds,
                productTags: selectedProductTags,
            },
            conditions, // Ensure numbers where appropriate
            validityDateRange,
            isActive: offerStatus,
        });
    };

    const handleOfferStatusToggle = () => {
        setOfferStatus(!offerStatus);
    };
    console.log('OfferDetailsScreen offer prop:', offer); // Original console.log

    const formContent = (
        // All original JSX for the form sections, using styles from makeStyles
        // For brevity, I'm showing the structure. Use your exact original JSX here.
        <>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Offer Description</Text>
                <TextInput label="Offer Name" value={offerName} onChangeText={setOfferName} mode="outlined" style={styles.input}/>
                <TextInput label="Display Text" value={offerDisplayText} onChangeText={setOfferDisplayText} mode="outlined" style={styles.input}/>
                <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: requireCode ? 0 : 8}}>
                    <Text variant={"titleMedium"} style={{marginRight: 10}}>Require Offer Code</Text>
                    <Switch value={requireCode} onValueChange={() => setRequireCode(!requireCode)} color={requireCode ? theme.colors.primary : theme.colors.outline}/>
                </View>
                {requireCode && <TextInput label="Offer Code" value={offerCode} onChangeText={setOfferCode} mode="outlined" style={styles.input}/>}
            </View>

            <View style={styles.section}>
                <View style={styles.statusContainer}>
                    <Text style={[styles.sectionTitle, { marginRight: 15, marginBottom: 0 }]}>Offer Status</Text>
                    <View style={{ display: "flex", flexDirection: "row", alignItems: 'center' }}>
                        <Switch value={offerStatus} onValueChange={handleOfferStatusToggle} color={offerStatus ? theme.colors.primary : theme.colors.outline}/>
                        <Chip textStyle={{ color: "black"}} style={{ marginLeft: 10, backgroundColor: offerStatus ? theme.colors.softSuccess : theme.colors.inactive }}>
                            {offerStatus ? "Active" : "Inactive"}
                        </Chip>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Validity</Text>
                <View style={styles.dateRow}>
                    <View style={{ flex: 0.48 }}>
                        <CrossPlatformDatePicker label="Valid From" initialDate={validityDateRange.validFrom} onDateChange={(newDate) => setValidityDateRange((prev) => ({ ...prev, validFrom: newDate }))}/>
                    </View>
                    <View style={{ flex: 0.48 }}>
                        <CrossPlatformDatePicker label="Valid Until" initialDate={validityDateRange.validUntil} onDateChange={(newDate) => setValidityDateRange((prev) => ({ ...prev, validUntil: newDate }))}/>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Offer Type</Text>
                <View style={styles.radioButtonGroup}>
                    <RadioButton.Group onValueChange={setOfferType} value={offerType}>
                        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                            {["Percentage Off", "Fixed Amount Off", "Buy N Get K Free", "Free Shipping"].map((label) => (
                                <RadioButton.Item key={label} label={label} value={label} mode="android" color={theme.colors.primary} position="leading" style={styles.radioButtonItem} labelStyle={styles.radioLabel}/>
                            ))}
                        </View>
                    </RadioButton.Group>
                </View>
                {offerType === "Percentage Off" && <TextInput label="Percentage Off (%)" keyboardType="numeric" mode="outlined" style={styles.input} value={discountDetails.percentage?.toString() || ''} onChangeText={(value) => setDiscountDetails({ percentage: value ? parseFloat(value) : undefined })}/>}
                {offerType === "Fixed Amount Off" && <TextInput label="Fixed Amount Off (₹)" keyboardType="numeric" mode="outlined" style={styles.input} value={discountDetails.fixedAmount?.toString() || ''} onChangeText={(value) => setDiscountDetails({ fixedAmount: value ? parseFloat(value) : undefined })}/>}
                {offerType === "Buy N Get K Free" && (
                    <View style={styles.row}>
                        <TextInput label="Buy N (Quantity)" keyboardType="numeric" mode="outlined" style={styles.inputHalf} value={discountDetails.buyN?.toString() || ''} onChangeText={(value) => setDiscountDetails((prev) => ({ ...prev, buyN: value ? parseInt(value) : undefined }))}/>
                        <TextInput label="Get K (Free Quantity)" keyboardType="numeric" mode="outlined" style={styles.inputHalf} value={discountDetails.getK?.toString() || ''} onChangeText={(value) => setDiscountDetails((prev) => ({ ...prev, getK: value ? parseInt(value) : undefined }))}/>
                    </View>
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Apply To</Text>
                <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
                    <Text variant={'titleMedium'} style={{marginRight: 16}}>Store-Wide Offer</Text>
                    <Switch value={storeWide} onValueChange={() => setStoreWide(!storeWide)} color={storeWide ? theme.colors.primary : theme.colors.outline}/>
                </View>
                {!storeWide && (
                    <>
                        {/* Product Picker Section */}
                        <View style={styles.pickerSection}>
                            <View style={styles.pickerHeader}>
                                <Text variant={"titleMedium"}>Specific Products</Text>
                                <Button mode={"contained-tonal"} style={{ borderRadius: 8 }} onPress={() => setProductPickerVisible(true)}>Select Products</Button>
                            </View>
                            {selectedProductIds.length > 0 && <Text variant={"bodyMedium"} style={styles.pickerSelectionText}>{selectedProductIds.length} Products selected</Text>}
                        </View>
                        {/* Collection Picker Section */}
                        <View style={styles.pickerSection}>
                            <View style={styles.pickerHeader}>
                                <Text variant={"titleMedium"}>Specific Collections</Text>
                                <Button mode={"contained-tonal"} style={{ borderRadius: 8 }} onPress={() => setCollectionPickerVisible(true)}>Select Collections</Button>
                            </View>
                            {selectedCollectionIds.length > 0 && <Text variant={"bodyMedium"} style={styles.pickerSelectionText}>{selectedCollectionIds.length} Collections selected</Text>}
                        </View>
                        {/* Tag Picker Section */}
                        <View style={styles.pickerSection}>
                            <View style={styles.pickerHeader}>
                                <Text variant={"titleMedium"}>Specific Product Tags</Text>
                                <Button mode={"contained-tonal"} style={{ borderRadius: 8 }} onPress={() => setTagPickerVisible(true)}>Select Tags</Button>
                            </View>
                            {selectedProductTags.length > 0 && (
                                <View style={styles.selectedTagsContainer}>
                                    {selectedProductTags.map((t) => (<Chip key={t} style={styles.selectedTagChip} textStyle={{color: theme.colors.onSecondaryContainer}}>{t}</Chip>))}
                                </View>
                            )}
                        </View>
                    </>
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Usage Conditions (Optional)</Text>
                <TextInput label="Minimum Purchase Amount (₹)" keyboardType="numeric" mode="outlined" style={styles.input} value={conditions.minimumPurchaseAmount?.toString() || ''} onChangeText={(value) => setConditions((prev) => ({ ...prev, minimumPurchaseAmount: value ? parseFloat(value) : undefined }))}/>
                <TextInput label="Minimum Number of Items" keyboardType="numeric" mode="outlined" style={styles.input} value={conditions.minimumItems?.toString() || ''} onChangeText={(value) => setConditions((prev) => ({ ...prev, minimumItems: value ? parseInt(value) : undefined }))}/>
            </View>

            <View style={styles.actionButtonsRow}>
                <Button mode="contained" buttonColor={theme.colors.error} textColor={theme.colors.white} onPress={discardHandler} style={styles.formButton}>
                    {discardButtonLabel || "Discard"}
                </Button>
                <Button mode="contained" buttonColor={theme.colors.primary} textColor={theme.colors.onPrimary} onPress={handlePublishOffer} style={styles.formButton}>
                    {publishButtonLabel || "Publish"}
                </Button>
            </View>

            {/* Picker Modals */}
            <ProductPickerModal
                visible={productPickerVisible}
                name={offerName || offer?.offerName} // Pass current offer name
                existingSelectedProductIds = {selectedProductIds}
                onClose={() => setProductPickerVisible(false)}
                onApply={handleApplyProducts}
                contentContainerStyle={IS_WEB ? styles.webModalContentStyle : {}}
            />
            <CollectionPickerModal
                visible={collectionPickerVisible}
                onClose={() => setCollectionPickerVisible(false)}
                existingSelectedCollectionIds={selectedCollectionIds}
                onApply={handleApplyCollections}
                name={offerName || offer?.offerName}
                contentContainerStyle={IS_WEB ? styles.webModalContentStyle : {}}
            />
            <TagPickerModal
                visible={tagPickerVisible}
                onClose={() => setTagPickerVisible(false)}
                onApply={handleApplyTags}
                existingSelectedTags={selectedProductTags}
                name={offerName || offer?.offerName}
                contentContainerStyle={IS_WEB ? styles.webModalContentStyle : {}}
            />
        </>
    );

    // Conditional root rendering
    if (IS_WEB) {
        return (
            <DefaultScrollView
                style={styles.webScrollView_forOfferDetails}
                contentContainerStyle={styles.webScrollViewContentContainer_forOfferDetails}
                keyboardShouldPersistTaps="handled"
            >
                {formContent}
            </DefaultScrollView>
        );
    } else { // Mobile
        return (
            <ScrollableScreen
                innerStyle={styles.container} // Original innerStyle
                backgroundColor={theme.colors.surface} // Original backgroundColor
                // Pass keyboardShouldPersistTaps if ScrollableScreen supports it
            >
                {formContent}
            </ScrollableScreen>
        );
    }
};

const makeStyles = (theme, isWeb, windowWidth) => { // Added isWeb, windowWidth
    const { colors } = theme; // Original used theme.colors directly, some styles used colors
    return StyleSheet.create({
        // --- Original Mobile Styles (MUST BE PRESERVED EXACTLY) ---
        container: { // For ScrollableScreen innerStyle on MOBILE
            flex: 1,
            paddingHorizontal: 20, // Original
            width: "100%",         // Original
            paddingBottom: 100,    // Original
            backgroundColor: colors.surface, // Original
            // marginBottom: 100 // Original commented out
        },
        input: { // Original
            marginBottom: 10,
            backgroundColor: "white",
        },
        row: { // Original
            flexDirection: "row",
            justifyContent: "space-between",
        },
        inputHalf: { // Original
            flex: 0.48,
            backgroundColor: "white",
        },
        section: { // Original
            marginVertical: 10,
            padding: IS_WEB ? 16 : 0, // Add padding for web sections for better card-like appearance
            backgroundColor: IS_WEB ? colors.white : 'transparent', // Card like bg for web sections
            borderRadius: IS_WEB ? 8 : 0,
            elevation: IS_WEB ? 1 : 0,
        },
        sectionTitle: { // Original
            fontWeight: "bold",
            fontSize: 18,
            marginBottom: 10,
            color: colors.onSurface, // Added for theming
        },
        // submitButton: { marginTop: 20, }, // Original, not directly used in final JSX (button has inline margin/wrapper)
        radioButtonGroup: { // Original
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "flex-start", // Original
        },
        radioButtonItem: { // Original
            marginRight: 0, // Reduced margin for tighter packing
            paddingLeft: 0, // Reduced padding
            minWidth: '45%', // Allow two items per row roughly
        },
        radioLabel: { // Added for RadioButton.Item labelStyle
            fontSize: 14,
        },
        dateRow: { // Original
            flexDirection: "row",
            justifyContent: "space-between",
        },
        // dateInput, dateText were in original but CrossPlatformDatePicker likely encapsulates this
        statusContainer: { // Original
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
        },
        // Styles for picker sections added for clarity
        pickerSection: {
            marginBottom: 15,
            paddingVertical: 10,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: colors.outlineVariant,
        },
        pickerHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
        },
        pickerSelectionText: {
            fontStyle: 'italic',
            color: colors.onSurfaceVariant,
            fontSize: 14,
        },
        selectedTagsContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginTop: 8,
        },
        selectedTagChip: {
            margin: 4,
            backgroundColor: colors.secondaryContainer,
        },
        actionButtonsRow: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginTop: 20,
            marginBottom: 20, // Ensure space at the bottom
        },
        formButton: {
            borderRadius: 8,
            minWidth: 150, // Give buttons a decent min width
        },


        // --- Web Specific ScrollView Styles (for OfferDetailsScreen itself) ---
        webScrollView_forOfferDetails: { // The ScrollView component on web when this is the root
            flex: 1,
            width: '100%',
            // backgroundColor is handled by webMaxContentContainer_Shell in parent
        },
        webScrollViewContentContainer_forOfferDetails: { // contentContainerStyle for the web ScrollView
            padding: IS_WEB ? 20 : 0, // Use parent's padding for web, or its own if mobile (styles.container)
            flexGrow: 1,
            // No maxWidth here, parent (EditOfferScreen's web shell) handles it
        },
        // --- Web Modal Content Style (for pickers) ---
        webModalContentStyle: {
            maxWidth: 600, // Max width for picker modals
            width: '90%',
            alignSelf: 'center', // Modal component centers this
        }
    });
};

export default OfferDetailsScreen;