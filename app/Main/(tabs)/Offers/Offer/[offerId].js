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
import DatePicker from "@react-native-community/datetimepicker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ProductPickerModal from "../../../../../components/ProductPickerModal";
import CollectionPickerModal from "../../../../../components/CollectionPickerModal";
import TagPickerModal from "../../../../../components/TagPickerModal";
import { useOffer } from "../../../../../hooks/useOffer";
import { useRouter, useLocalSearchParams } from "expo-router";

const PublishOfferScreen = () => {
    const theme = useTheme();
    const router = useRouter();
    const { storeId, offerId } = useLocalSearchParams();
    const { data: offer, isLoading, isError } = useOffer(storeId, offerId);

    const styles = makeStyles(theme);

    // State variables
    const [offerType, setOfferType] = useState("");
    const [offerName, setOfferName] = useState("");
    const [offerDescription, setOfferDescription] = useState("");
    const [discountDetails, setDiscountDetails] = useState({});
    const [applicableTo, setApplicableTo] = useState({});
    const [conditions, setConditions] = useState({});
    const [validity, setValidity] = useState({});
    const [offerStatus, setOfferStatus] = useState(false);

    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [productPickerVisible, setProductPickerVisible] = useState(false);
    const [collectionPickerVisible, setCollectionPickerVisible] = useState(false);
    const [tagPickerVisible, setTagPickerVisible] = useState(false);

    const [selectedProducts, setSelectedProducts] = useState([]);
    const [selectedCollections, setSelectedCollections] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);

    useEffect(() => {
        if (offer) {
            setOfferType(offer.offerType);
            setOfferName(offer.offerName);
            setOfferDescription(offer.description);
            setDiscountDetails(offer.discountDetails);
            setApplicableTo(offer.applicableTo);
            setConditions(offer.conditions);
            setValidity(offer.validityDateRange);
            setOfferStatus(offer.isActive);
            setSelectedProducts(offer.applicableTo.productIds || []);
            setSelectedCollections(offer.applicableTo.collectionIds || []);
            setSelectedTags(offer.applicableTo.tags || []);
        }
    }, [offer]);

    const handleApplyProducts = (products) => {
        setSelectedProducts(products);
        setProductPickerVisible(false);
    };

    const handleApplyCollections = (collections) => {
        setSelectedCollections(collections);
        setCollectionPickerVisible(false);
    };

    const handleApplyTags = (tags) => {
        setSelectedTags(tags);
        setTagPickerVisible(false);
    };

    const handlePublishOffer = async () => {
        // Submit logic here
        console.log({
            offerType,
            offerName,
            offerDescription,
            discountDetails,
            applicableTo: {
                productIds: selectedProducts,
                collectionIds: selectedCollections,
                tags: selectedTags,
            },
            conditions,
            validity,
            offerStatus,
        });
    };

    if (isLoading) {
        return (
            <Surface style={styles.container}>
                <Text style={{ textAlign: "center", marginTop: 20 }}>Loading offer...</Text>
            </Surface>
        );
    }

    if (isError) {
        return (
            <Surface style={styles.container}>
                <Text style={{ textAlign: "center", marginTop: 20, color: theme.colors.error }}>
                    Failed to load offer. Please try again later.
                </Text>
            </Surface>
        );
    }

    return (
        <ScrollView>
            <Surface style={styles.container}>
                {/* Offer Description */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Offer Description</Text>
                    <TextInput
                        label="Offer Name"
                        value={offerName}
                        onChangeText={setOfferName}
                        mode="outlined"
                        style={styles.input}
                    />
                    <TextInput
                        label="Description"
                        value={offerDescription}
                        onChangeText={setOfferDescription}
                        mode="outlined"
                        style={styles.input}
                        multiline
                    />
                </View>

                {/* Status */}
                <View style={styles.section}>
                    <View style={styles.statusContainer}>
                        <Text style={styles.sectionTitle}>Offer Status</Text>
                        <Switch
                            value={offerStatus}
                            onValueChange={setOfferStatus}
                            color={offerStatus ? theme.colors.success : "#aaaaaa"}
                        />
                    </View>
                </View>

                {/* Validity */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Validity</Text>
                    {/* Start Date */}
                    <TouchableOpacity onPress={() => setShowStartDatePicker(true)} style={styles.dateInput}>
                        <MaterialCommunityIcons name="calendar" size={20} color={theme.colors.primary} />
                        <Text style={styles.dateText}>
                            {validity.startDate ? new Date(validity.startDate).toLocaleDateString() : "Start Date"}
                        </Text>
                    </TouchableOpacity>
                    {showStartDatePicker && (
                        <DatePicker
                            mode="date"
                            value={validity.startDate ? new Date(validity.startDate) : new Date()}
                            onChange={(event, date) => {
                                setShowStartDatePicker(false);
                                if (date) setValidity((prev) => ({ ...prev, startDate: date }));
                            }}
                        />
                    )}
                    {/* End Date */}
                    <TouchableOpacity onPress={() => setShowEndDatePicker(true)} style={styles.dateInput}>
                        <MaterialCommunityIcons name="calendar" size={20} color={theme.colors.primary} />
                        <Text style={styles.dateText}>
                            {validity.endDate ? new Date(validity.endDate).toLocaleDateString() : "End Date"}
                        </Text>
                    </TouchableOpacity>
                    {showEndDatePicker && (
                        <DatePicker
                            mode="date"
                            value={validity.endDate ? new Date(validity.endDate) : new Date()}
                            onChange={(event, date) => {
                                setShowEndDatePicker(false);
                                if (date) setValidity((prev) => ({ ...prev, endDate: date }));
                            }}
                        />
                    )}
                </View>

                {/* Applicability */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Apply To</Text>
                    {/* Products */}
                    <Button onPress={() => setProductPickerVisible(true)}>Select Products</Button>
                    <ProductPickerModal
                        visible={productPickerVisible}
                        onClose={() => setProductPickerVisible(false)}
                        onApply={handleApplyProducts}
                    />
                    {/* Collections */}
                    <Button onPress={() => setCollectionPickerVisible(true)}>Select Collections</Button>
                    <CollectionPickerModal
                        visible={collectionPickerVisible}
                        onClose={() => setCollectionPickerVisible(false)}
                        onApply={handleApplyCollections}
                    />
                    {/* Tags */}
                    <Button onPress={() => setTagPickerVisible(true)}>Select Tags</Button>
                    <TagPickerModal
                        visible={tagPickerVisible}
                        onClose={() => setTagPickerVisible(false)}
                        onApply={handleApplyTags}
                    />
                </View>

                <Button mode="contained" onPress={handlePublishOffer}>
                    Publish Offer
                </Button>
            </Surface>
        </ScrollView>
    );
};

const makeStyles = ({ colors }) =>
    StyleSheet.create({
        container: {
            flex: 1,
            padding: 10,
            backgroundColor: colors.surface,
        },
        section: {
            marginVertical: 10,
        },
        sectionTitle: {
            fontWeight: "bold",
            fontSize: 18,
            marginBottom: 10,
        },
        input: {
            marginBottom: 10,
        },
        dateInput: {
            flexDirection: "row",
            alignItems: "center",
            padding: 10,
            borderWidth: 1,
            borderColor: colors.primary,
            borderRadius: 5,
            marginBottom: 10,
        },
        dateText: {
            marginLeft: 10,
        },
    });

export default PublishOfferScreen;