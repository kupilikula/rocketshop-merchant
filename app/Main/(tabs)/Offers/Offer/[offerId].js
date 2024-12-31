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
import { useOffer } from "../../../../../api/hooks/useOffer";
import { useRouter, useLocalSearchParams } from "expo-router";
import {useSelector} from "react-redux";

const PublishOfferScreen = () => {
    const theme = useTheme();
    const router = useRouter();
    const {storeId} = useSelector((state) => state.store);
    const { offerId } = useLocalSearchParams();
    const { data: offer, isLoading, isError } = useOffer(storeId, offerId);

    const styles = makeStyles(theme);

    // State variables
    const [offerType, setOfferType] = useState("");
    const [offerName, setOfferName] = useState("");
    const [offerDescription, setOfferDescription] = useState("");
    const [discountDetails, setDiscountDetails] = useState({});
    const [applicableTo, setApplicableTo] = useState({});
    const [conditions, setConditions] = useState({});
    const [validityDateRange, setValidityDateRange] = useState({});
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
            setOfferDescription(offer.offerDescription);
            setDiscountDetails(offer.discountDetails);
            setApplicableTo(offer.applicableTo);
            setConditions(offer.conditions);
            setValidityDateRange(offer.validityDateRange);
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
            validityDateRange,
            offerStatus,
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
    // <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>

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

            {/* Description */}
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
              <TouchableOpacity
                onPress={() => setShowStartDatePicker(true)}
                style={styles.dateInput}
              >
                <MaterialCommunityIcons
                  name="calendar"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text style={styles.dateText}>
                  {new Date(validityDateRange.validFrom).toLocaleDateString() || "Start Date"}
                </Text>
              </TouchableOpacity>
              {showStartDatePicker && (
                <DatePicker
                  mode="date"
                  value={new Date(validityDateRange.validFrom) || new Date()}
                  onChange={(event, date) => {
                    setShowStartDatePicker(false);
                    if (date)
                      setValidityDateRange((prev) => ({ ...prev, validFrom: date }));
                  }}
                />
              )}

              <TouchableOpacity
                onPress={() => setShowEndDatePicker(true)}
                style={styles.dateInput}
              >
                <MaterialCommunityIcons
                  name="calendar"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text style={styles.dateText}>
                  {new Date(validityDateRange.validUntil).toLocaleDateString()
                    || "End Date"}
                </Text>
              </TouchableOpacity>
              {showEndDatePicker && (
                <DatePicker
                  mode="date"
                  value={new Date(validityDateRange.validUntil) || new Date()}
                  onChange={(event, date) => {
                    setShowEndDatePicker(false);
                    if (date)
                      setValidityDateRange((prev) => ({ ...prev, validUntil: date }));
                  }}
                />
              )}
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
                onChangeText={(value) =>
                  setDiscountDetails({ percentage: value })
                }
              />
            )}
            {offerType === "Fixed Amount Off" && (
              <TextInput
                label="Fixed Amount Off"
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
                onChangeText={(value) =>
                  setDiscountDetails({ fixedAmount: value })
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
                  onChangeText={(value) =>
                    setDiscountDetails((prev) => ({ ...prev, buyN: value }))
                  }
                />
                <TextInput
                  label="Get K"
                  keyboardType="numeric"
                  mode="outlined"
                  style={styles.inputHalf}
                  onChangeText={(value) =>
                    setDiscountDetails((prev) => ({ ...prev, getK: value }))
                  }
                />
              </View>
            )}
          </View>

          {/* Applicability */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Apply To</Text>
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
                {selectedProducts.length > 0 && (
                  <Text variant={"bodyMedium"}>
                    {selectedProducts.length.toString() + " Products selected"}
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
                {selectedCollections.length > 0 && (
                  <Text variant={"bodyMedium"}>
                    {selectedCollections.length.toString() +
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
              onApply={handleApplyCollections}
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
              existingTags={['ABCD', 'EFGDF','wewer']}
              onClose={() => setTagPickerVisible(false)}
              onApply={handleApplyTags}
            />
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                margin: 10,
              }}
            >
              {selectedTags.map((t) => (
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
          </View>

          {/* Conditions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Conditions</Text>
            <TextInput
              label="Minimum Purchase Amount"
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              onChangeText={(value) =>
                setConditions((prev) => ({
                  ...prev,
                  minimumPurchaseAmount: value,
                }))
              }
            />
            <TextInput
              label="Minimum Items"
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              onChangeText={(value) =>
                setConditions((prev) => ({ ...prev, minimumItems: value }))
              }
            />
          </View>

          {/*<View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around'}}>*/}

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
              Publish Offer
            </Button>
          </View>
          {/*</View>*/}
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

export default PublishOfferScreen;