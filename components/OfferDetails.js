import React, { useState, useEffect } from "react";
import {
    ScrollView,
    View,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import {
    TextInput,
    Button,
    RadioButton,
    Chip,
    useTheme,
    Text,
    Surface,
    Switch,
} from "react-native-paper";
import ProductPickerModal from "./ProductPickerModal";
import CollectionPickerModal from "./CollectionPickerModal";
import TagPickerModal from "./TagPickerModal";
import { useRouter, useLocalSearchParams } from "expo-router";
import {useSelector} from "react-redux";
import CrossPlatformDatePicker from "./CrossPlatformDatePicker";

const OfferDetailsScreen = ({offer, publishHandler, publishButtonLabel, discardHandler, discardButtonLabel}) => {
    const theme = useTheme();
    const router = useRouter();
    const {storeId} = useSelector((state) => state.store);
    const { offerId } = useLocalSearchParams();
    // const { data: offer, isLoading, isError } = useOffer(storeId, offerId);
    // const { mutate: updateOffer } = useUpdateOffer(storeId, offerId);

    const styles = makeStyles(theme);

    // State variables
    const [offerType, setOfferType] = useState("");
    const [offerName, setOfferName] = useState("");
    const [offerDisplayText, setOfferDisplayText] = useState("");
    const [offerCode, setOfferCode] = useState("");
    const [requireCode, setRequireCode] = useState(false);
    const [discountDetails, setDiscountDetails] = useState({});
    const [applicableTo, setApplicableTo] = useState({});
    const [conditions, setConditions] = useState({});
    const [validityDateRange, setValidityDateRange] = useState({validFrom: new Date(), validUntil: new Date()});
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
            console.log('line59:', offer.discountDetails);
            setOfferType(offer.offerType);
            setOfferName(offer.offerName);
            setOfferDisplayText(offer.offerDisplayText);
            setOfferCode(offer.offerCode);
            setRequireCode(offer.requireCode);
            setDiscountDetails(offer.discountDetails);
            setApplicableTo(offer.applicableTo);
            setConditions(offer.conditions || {});
            setValidityDateRange(offer.validityDateRange);
            setOfferStatus(offer.isActive);
            setStoreWide(offer.applicableTo.storeWide || false);
            setSelectedProductIds(offer.applicableTo.productIds || []);
            setSelectedCollectionIds(offer.applicableTo.collectionIds || []);
            setSelectedProductTags(offer.applicableTo.productTags || []);
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

    const handlePublishOffer = async () => {

        const errors = [];

        // ✅ Validate offer name & description
        if (!offerName.trim()) errors.push("Offer Name cannot be empty.");
        if (!offerDisplayText.trim()) errors.push("Offer Display Text cannot be empty.");

        if (requireCode && !offerCode.trim()) errors.push("Offer Code cannot be empty if code is required.");

        // ✅ Validate Validity Date Range
        const validFromDate = new Date(validityDateRange.validFrom);
        const validUntilDate = new Date(validityDateRange.validUntil);
        const currentDate = new Date();

        if (validFromDate >= validUntilDate) {
            errors.push("Valid From date must be before Valid Until date.");
        }
        if (validUntilDate <= currentDate) {
            errors.push("Valid Until date must be in the future.");
        }

        // ✅ Validate Discount Details based on Offer Type
        if (offerType === "Percentage Off" && (!discountDetails.percentage || isNaN(discountDetails.percentage))) {
            errors.push("Percentage Off value is required.");
        }
        if (offerType === "Fixed Amount Off" && (!discountDetails.fixedAmount || isNaN(discountDetails.fixedAmount))) {
            errors.push("Fixed Amount Off value is required.");
        }
        if (offerType === "Buy N Get K Free") {
            if (!discountDetails.buyN || isNaN(discountDetails.buyN)) errors.push("Buy N value is required.");
            if (!discountDetails.getK || isNaN(discountDetails.getK)) errors.push("Get K value is required.");
        }

        // ✅ Ensure at least one product, collection, or tag is selected
        if (!storeWide && selectedProductIds.length === 0 && selectedCollectionIds.length === 0 && selectedProductTags.length === 0) {
            errors.push("At least one Product, Collection, or Tag must be selected.");
        }

        // ❌ If errors exist, show alert and prevent submission
        if (errors.length > 0) {
            alert(errors.join("\n")); // Display all errors in an alert (or replace with a Snackbar for better UX)
            return;
        }

        // Submit logic here
        publishHandler({
            offerType,
            offerName,
            offerDisplayText,
            offerCode,
            requireCode,
            discountDetails,
            applicableTo: {
                storeWide: storeWide,
                productIds: selectedProductIds,
                collectionIds: selectedCollectionIds,
                productTags: selectedProductTags,
            },
            conditions,
            validityDateRange,
            isActive: offerStatus,
        }).then(() => {

        });
    };

    const handleOfferStatusToggle = () => {
        setOfferStatus(!offerStatus);
        // Form submission logic
        // console.log({
        //     offerType,
        //     discountDetails,
        //     applicableTo,
        //     conditions,
        //     validity,
        // });
    };
    console.log('offer:', offer);

    return (<ScrollView>
            <Surface style={styles.container}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Offer Description</Text>
                    {/* Offer Name */}
                    <TextInput
                        label="Offer Name"
                        value={offerName}
                        onChangeText={setOfferName}
                        mode="outlined"
                        style={styles.input}
                    />

                    {/* Display Text */}
                    <TextInput
                        label="Display Text"
                        value={offerDisplayText}
                        onChangeText={setOfferDisplayText}
                        mode="outlined"
                        style={styles.input}
                    />
                    <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                        <Text variant={"titleMedium"} style={{marginRight: 10}}>Require Offer Code</Text>
                    <Switch
                        // style={ Platform.OS==='ios' ? { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }]} : {}}
                        value={requireCode}
                        onValueChange={() => setRequireCode(!requireCode)}
                        color={requireCode ? theme.colors.success : "#aaaaaa"} // Green for Active, Red for Draft
                    />
                    </View>
                    {requireCode &&
                        <TextInput
                            label="Offer Code"
                            value={offerCode}
                            onChangeText={setOfferCode}
                            mode="outlined"
                            style={styles.input}
                        />
                    }
                </View>

                {/* Status */}
                <View style={styles.section}>
                    <View style={styles.statusContainer}>
                        <Text style={[styles.sectionTitle, { marginRight: 15 }]}>
                            Offer Status
                        </Text>
                        <View style={{ display: "flex", flexDirection: "row" }}>
                            <Switch
                                // style={ Platform.OS==='ios' ? { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }]} : {}}
                                value={offerStatus}
                                onValueChange={handleOfferStatusToggle}
                                color={offerStatus ? theme.colors.success : "#aaaaaa"} // Green for Active, Red for Draft
                            />
                            <Chip
                                textStyle={{ color: "white", textAlign: "center" }}
                                style={{
                                    marginLeft: 10,
                                    backgroundColor: offerStatus
                                        ? theme.colors.success
                                        : "#aaaaaa",
                                }}
                            >
                                {offerStatus ? "Active" : "Inactive"}
                            </Chip>
                        </View>
                    </View>
                </View>

                {/* Validity */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Validity</Text>
                    <View style={styles.dateRow}>
                        <View
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                flex: 0.48,
                            }}
                        >
                            <CrossPlatformDatePicker
                                label="Valid From"
                                initialDate={new Date(validityDateRange.validFrom)}
                                onDateChange={(newDate) => setValidityDateRange((prev) => ({ ...prev, validFrom: newDate }))}
                            />
                        </View>
                        <View
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                flex: 0.48,
                            }}
                        >
                            <CrossPlatformDatePicker
                                label="Valid Until"
                                initialDate={new Date(validityDateRange.validUntil)}
                                onDateChange={(newDate) => setValidityDateRange((prev) => ({ ...prev, validUntil: newDate }))}
                            />
                        </View>
                    </View>
                </View>

                {/* Offer Type */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Offer Type</Text>
                    <View style={styles.radioButtonGroup}>
                        <RadioButton.Group onValueChange={setOfferType} value={offerType}>
                            <View
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    flexWrap: "wrap",
                                }}
                            >
                                {[
                                    "Percentage Off",
                                    "Fixed Amount Off",
                                    "Buy N Get K Free",
                                    "Free Shipping",
                                ].map((label, index) => (
                                    <RadioButton.Item
                                        key={index}
                                        label={label}
                                        value={label} // "percentageOff" etc.
                                        mode="android"
                                        color={theme.colors.primary}
                                        position="leading"
                                        style={styles.radioButtonItem}
                                        //
                                    />
                                ))}
                            </View>
                        </RadioButton.Group>
                    </View>

                    {/* Discount Details (Conditional Fields) */}
                    {offerType === "Percentage Off" && (
                        <TextInput
                            label="Percentage Off"
                            keyboardType="numeric"
                            mode="outlined"
                            style={styles.input}
                            value={discountDetails.percentage.toString() + '%'}
                            onChangeText={(value) =>
                                setDiscountDetails({ percentage: parseFloat(value) })
                            }
                        />
                    )}
                    {offerType === "Fixed Amount Off" && (
                        <TextInput
                            label="Fixed Amount Off"
                            keyboardType="numeric"
                            mode="outlined"
                            style={styles.input}
                            value={discountDetails.fixedAmount?.toString()}
                            onChangeText={(value) =>
                                setDiscountDetails({ fixedAmount: parseFloat(value || 0) })
                            }
                        />
                    )}
                    {offerType === "Buy N Get K Free" && (
                        <View style={styles.row}>
                            <TextInput
                                label="Buy N"
                                keyboardType="numeric"
                                mode="outlined"
                                style={styles.inputHalf}
                                value={discountDetails.buyN?.toString() || ''}
                                onChangeText={(value) =>
                                    setDiscountDetails((prev) => ({ ...prev, buyN: parseInt(value || 0) }))
                                }
                            />
                            <TextInput
                                label="Get K"
                                keyboardType="numeric"
                                mode="outlined"
                                style={styles.inputHalf}
                                value={discountDetails.getK?.toString() || ''}
                                onChangeText={(value) =>
                                    setDiscountDetails((prev) => ({ ...prev, getK: parseInt(value || 0) }))
                                }
                            />
                        </View>
                    )}
                </View>

                {/* Applicability */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Apply To</Text>
                    <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', }}>
                        <Text variant={'titleMedium'} style={{marginRight: 16}}>StoreWide</Text>
                        <Switch
                            // style={ Platform.OS==='ios' ? { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }]} : {}}
                            value={storeWide}
                            onValueChange={() => setStoreWide(!requireCode)}
                            color={storeWide ? theme.colors.success : "#aaaaaa"} // Green for Active, Red for Draft
                        />
                    </View>
                    {!storeWide &&
                    <>
                    <View
                        style={{
                            width: "100%",
                            padding: 10,
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <View>
                            <Text variant={"titleMedium"}>Products</Text>
                            {selectedProductIds.length > 0 && (
                                <Text variant={"bodyMedium"}>
                                    {selectedProductIds.length.toString() + " Products selected"}
                                </Text>
                            )}
                        </View>
                        <View style={{ display: "flex", flexDirection: "row" }}>
                            <Button
                                mode={"contained"}
                                style={{ borderRadius: 8 }}
                                textColor={"white"}
                                onPress={() => setProductPickerVisible(true)}
                            >
                                Select
                            </Button>
                        </View>
                    </View>
                    <ProductPickerModal
                        visible={productPickerVisible}
                        name={offer.offerName}
                        existingSelectedProductIds = {offer.applicableTo.productIds || []}
                        onClose={() => setProductPickerVisible(false)}
                        onApply={handleApplyProducts}
                    />

                    <View
                        style={{
                            width: "100%",
                            padding: 10,
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <View>
                            <Text variant={"titleMedium"}>Collections</Text>
                            {selectedCollectionIds.length > 0 && (
                                <Text variant={"bodyMedium"}>
                                    {selectedCollectionIds.length.toString() +
                                        " Collections selected"}
                                </Text>
                            )}
                        </View>
                        <View style={{ display: "flex", flexDirection: "row" }}>
                            <Button
                                mode={"contained"}
                                style={{ borderRadius: 8 }}
                                textColor={"white"}
                                onPress={() => setCollectionPickerVisible(true)}
                            >
                                Select
                            </Button>
                        </View>
                    </View>
                    <CollectionPickerModal
                        visible={collectionPickerVisible}
                        onClose={() => setCollectionPickerVisible(false)}
                        existingSelectedCollectionIds={offer.applicableTo.collectionIds || []}
                        onApply={handleApplyCollections}
                        name={offer.offerName}
                    />

                    <View
                        style={{
                            width: "100%",
                            padding: 10,
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Text variant={"titleMedium"}>Tags</Text>
                        <View style={{ display: "flex", flexDirection: "row" }}>
                            <Button
                                mode={"contained"}
                                style={{ borderRadius: 8 }}
                                textColor={"white"}
                                onPress={() => setTagPickerVisible(true)}
                            >
                                Select
                            </Button>
                        </View>
                    </View>
                    {/* Tags Picker Modal */}
                    <TagPickerModal
                        visible={tagPickerVisible}
                        onClose={() => setTagPickerVisible(false)}
                        onApply={handleApplyTags}
                        existingSelectedTags={offer.applicableTo.productTags || []}
                        name={offer.offerName}
                    />
                    <View
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            flexWrap: "wrap",
                            margin: 10,
                        }}
                    >
                        {selectedProductTags.map((t) => (
                            <View
                                key={t}
                                style={{ display: "flex", flexDirection: "row", margin: 5 }}
                            >
                                <Chip
                                    selected={true}
                                    style={{ backgroundColor: theme.colors.secondary }}
                                >
                                    {t}
                                </Chip>
                            </View>
                        ))}
                    </View>
                    </>
                    }
                </View>

                {/* Conditions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Conditions</Text>
                    <TextInput
                        label="Minimum Purchase Amount"
                        keyboardType="numeric"
                        mode="outlined"
                        style={styles.input}
                        value={conditions.minimumPurchaseAmount?.toString()}
                        onChangeText={(value) =>
                            setConditions((prev) => ({
                                ...prev,
                                minimumPurchaseAmount: parseFloat(value || 0),
                            }))
                        }
                    />
                    <TextInput
                        label="Minimum Items"
                        keyboardType="numeric"
                        mode="outlined"
                        style={styles.input}
                        value={conditions.minimumItems?.toString()}
                        onChangeText={(value) =>
                            setConditions((prev) => ({ ...prev, minimumItems: parseInt(value || 0) }))
                        }
                    />
                </View>

                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around'}}>

                <View
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                    }}
                >
                    <Button
                        mode="contained"
                        buttonColor={theme.colors.error}
                        onPress={discardHandler}
                    >
                        {discardButtonLabel}
                    </Button>
                </View>
                <View
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                    }}
                >
                    <Button
                        mode="contained"
                        buttonColor={theme.colors.success}
                        onPress={handlePublishOffer}
                    >
                        {publishButtonLabel}
                    </Button>
                </View>
                </View>
            </Surface>
        </ScrollView>
        // </SafeAreaView>
    );
};

const makeStyles = ({ colors }) =>
    StyleSheet.create({
        container: {
            flex: 1,
            paddingHorizontal: 10,
            width: "100%",
            paddingBottom: 100,
            backgroundColor: colors.surface
            // marginBottom: 100
        },
        input: {
            marginBottom: 10,
            backgroundColor: "white",
        },
        row: {
            flexDirection: "row",
            justifyContent: "space-between",
        },
        inputHalf: {
            flex: 0.48,
            backgroundColor: "white",
        },
        section: {
            marginVertical: 10,
        },
        sectionTitle: {
            fontWeight: "bold",
            fontSize: 18,
            marginBottom: 10,
        },
        submitButton: {
            marginTop: 20,
        },
        radioButtonGroup: {
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "flex-start",
        },
        radioButtonItem: {
            // width: '48%', // Adjust as needed for responsiveness
            margin: 0,
            padding: 0,
        },
        dateRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            // marginBottom: 20,
        },
        dateInput: {
            flexDirection: "row",
            alignItems: "center",
            padding: 10,
            borderWidth: 1,
            borderColor: colors.primary,
            borderRadius: 5,
            flex: 0.48,
        },
        dateText: {
            marginLeft: 10,
            fontSize: 16,
            color: "black",
        },
        statusContainer: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            // marginVertical: 10
        },
    });

export default OfferDetailsScreen;