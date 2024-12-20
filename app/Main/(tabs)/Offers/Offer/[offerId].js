import React, { useState } from 'react';
import {ScrollView, View, StyleSheet, TouchableOpacity, SafeAreaView} from 'react-native';
import {TextInput, Button, RadioButton, Checkbox, Chip, useTheme, Text, Surface} from 'react-native-paper';
import DatePicker from '@react-native-community/datetimepicker';
import {MaterialCommunityIcons} from "@expo/vector-icons";
import ProductPickerModal from "../../../../../components/ProductPickerModal";
import CollectionPickerModal from "../../../../../components/CollectionPickerModal";
import TagPickerModal from "../../../../../components/TagPickerModal";

const PublishOfferScreen = () => {
    const theme = useTheme();
    const styles = makeStyles(theme);

    // State variables
    const [offerType, setOfferType] = useState('');
    const [discountDetails, setDiscountDetails] = useState({});
    const [applicableTo, setApplicableTo] = useState({
        products: [],
        collections: [],
        tags: [],
    });
    const [conditions, setConditions] = useState({});
    const [validity, setValidity] = useState({ startDate: null, endDate: null });
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [productPickerVisible, setProductPickerVisible] = useState(false);
    const [collectionPickerVisible, setCollectionPickerVisible] = useState(false);
    const [tagPickerVisible, setTagPickerVisible] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [selectedCollections, setSelectedCollections] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const existingTags = ['Best Sellers', 'Featured', 'Discount', 'New Arrival', "Hand Made", "Organza"];
    const [isActive, setIsActive] = useState(true);
    const handleApplyProducts = (products) => {
        setSelectedProducts(products);
        setProductPickerVisible(false);
    };

    const handleApplyCollections= (collections) => {
        setSelectedCollections(collections);
        setCollectionPickerVisible(false);
    };
    const handleApplyTags = (tags) => {
        setSelectedTags(tags);
        setTagPickerVisible(false);
    };
    const handlePublishOffer = () => {
        // Form submission logic
        console.log({
            offerType,
            discountDetails,
            applicableTo,
            conditions,
            validity,
        });
    };

    const toggleActiveStatus = () => {
        setIsActive(!isActive);
        // Form submission logic
        // console.log({
        //     offerType,
        //     discountDetails,
        //     applicableTo,
        //     conditions,
        //     validity,
        // });
    };


    const handleToggleApplyTo = (type) => {
        setApplicableTo((prev) => ({
            ...prev,
            [type]: prev[type].length > 0 ? [] : [], // Clear selection on uncheck
        }));
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
        <Surface style={{ flex: 1, backgroundColor: 'white'}}>
        <ScrollView style={styles.container} contentContainerStyle={{
            // paddingHorizontal: 16,
            paddingBottom: 60, // Ensure bottom padding is enough to avoid overlapping
        }}>
            {/* Offer Name */}
            <TextInput
                label="Offer Name"
                mode="outlined"
                style={styles.input}
            />

            {/* Description */}
            <TextInput
                label="Description"
                mode="outlined"
                style={styles.input}
                multiline
            />

            {/* Offer Type */}
            <Text style={styles.sectionTitle}>Offer Type</Text>
            <View style={styles.radioButtonGroup}>
                {['Percentage Off', 'Fixed Amount Off', 'Buy N Get K Free', 'Free Shipping'].map((label, index) => (
                    <RadioButton.Item
                        key={index}
                        label={label}
                        value={label.toLowerCase().replace(/\s+/g, '')} // "percentageOff" etc.
                        mode="android"
                        color={theme.colors.primary}
                        position="leading"
                        style={styles.radioButtonItem}
                    />
                ))}
            </View>


            {/* Discount Details (Conditional Fields) */}
            {offerType === 'percentage' && (
                <TextInput
                    label="Percentage Off"
                    keyboardType="numeric"
                    mode="outlined"
                    style={styles.input}
                    onChangeText={(value) => setDiscountDetails({ percentage: value })}
                />
            )}
            {offerType === 'fixed' && (
                <TextInput
                    label="Fixed Amount Off"
                    keyboardType="numeric"
                    mode="outlined"
                    style={styles.input}
                    onChangeText={(value) => setDiscountDetails({ fixedAmount: value })}
                />
            )}
            {offerType === 'buyNgetK' && (
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

            {/* Applicability */}
            <Text style={styles.sectionTitle}>Apply To</Text>
            <View style={{width: '100%', padding: 10,  display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
                <View>
                <Text variant={'titleMedium'}>Products</Text>
                    {selectedProducts.length>0 && <Text variant={'bodyMedium'}>{selectedProducts.length.toString() + ' Products selected'}</Text>}
                </View>
                <View style={{display: 'flex', flexDirection: 'row'}}>
                <Button mode={'contained'} style={{borderRadius: 8}} textColor={'white'} onPress={() => setProductPickerVisible(true)} >
                    Select
                </Button>
                </View>
            </View>
            <ProductPickerModal
                visible={productPickerVisible}
                onClose={() => setProductPickerVisible(false)}
                onApply={handleApplyProducts}
            />

            <View style={{width: '100%', padding: 10,  display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
                <View>
                    <Text variant={'titleMedium'}>Collections</Text>
                    {selectedCollections.length>0 && <Text variant={'bodyMedium'}>{selectedCollections.length.toString() + ' Collections selected'}</Text>}
                </View>
                <View style={{display: 'flex', flexDirection: 'row'}}>
                    <Button mode={'contained'} style={{borderRadius: 8}} textColor={'white'} onPress={() => setCollectionPickerVisible(true)} >
                        Select
                    </Button>
                </View>
            </View>
            <CollectionPickerModal
                visible={collectionPickerVisible}
                onClose={() => setCollectionPickerVisible(false)}
                onApply={handleApplyCollections}
            />

            <View style={{width: '100%', padding: 10,  display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
                <Text variant={'titleMedium'}>Tags</Text>
                <View style={{display: 'flex', flexDirection: 'row'}}>
                    <Button mode={'contained'} style={{borderRadius: 8}} textColor={'white'} onPress={() => setTagPickerVisible(true)} >
                        Select
                    </Button>
                </View>
            </View>
            {/* Tags Picker Modal */}
            <TagPickerModal
                visible={tagPickerVisible}
                existingTags={existingTags}
                onClose={() => setTagPickerVisible(false)}
                onApply={handleApplyTags}
            />
            <View style={{display: 'flex', flexDirection: 'row', flexWrap:'wrap', margin: 10}}>
            {selectedTags.map((t) =>
                <View key={t} style={{display: 'flex', flexDirection: 'row', margin: 5}}>
                <Chip selected={true} style={{backgroundColor: theme.colors.secondary}}>{t}</Chip>
                </View>)
                    }
            </View>

            {/* Conditions */}
            <Text style={styles.sectionTitle}>Conditions</Text>
            <TextInput
                label="Minimum Purchase Amount"
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
                onChangeText={(value) => setConditions((prev) => ({ ...prev, minimumPurchaseAmount: value }))}
            />
            <TextInput
                label="Minimum Items"
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
                onChangeText={(value) => setConditions((prev) => ({ ...prev, minimumItems: value }))}
            />

            {/* Validity */}
            <Text style={styles.sectionTitle}>Validity</Text>
            <View style={styles.dateRow}>
                <TouchableOpacity onPress={() => setShowStartDatePicker(true)} style={styles.dateInput}>
                    <MaterialCommunityIcons name="calendar" size={20} color={theme.colors.primary} />
                    <Text style={styles.dateText}>
                        {validity.startDate ? validity.startDate.toLocaleDateString() : 'Start Date'}
                    </Text>
                </TouchableOpacity>
                {showStartDatePicker && (
                    <DatePicker
                        mode='date'
                        value={validity.startDate || new Date()}
                        onChange={(event, date) => {
                            setShowStartDatePicker(false);
                            if (date) setValidity((prev) => ({ ...prev, startDate: date }));
                        }}
                    />
                )}

                <TouchableOpacity onPress={() => setShowEndDatePicker(true)} style={styles.dateInput}>
                    <MaterialCommunityIcons name="calendar" size={20} color={theme.colors.primary} />
                    <Text style={styles.dateText}>
                        {validity.endDate ? validity.endDate.toLocaleDateString() : 'End Date'}
                    </Text>
                </TouchableOpacity>
                {showEndDatePicker && (
                    <DatePicker
                        mode="date"
                        value={validity.endDate || new Date()}
                        onChange={(event, date) => {
                            setShowEndDatePicker(false);
                            if (date) setValidity((prev) => ({ ...prev, endDate: date }));
                        }}
                    />
                )}
            </View>


            <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around'}}>
            <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
                <Button mode="outlined" style={{borderColor: isActive ? theme.colors.error : theme.colors.primary}} textColor={isActive ? theme.colors.error : theme.colors.primary} onPress={toggleActiveStatus} >
                    {isActive ? 'Deactivate Offer' : 'Activate Offer'}
                </Button>
            </View>

            <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
            <Button mode="contained" buttonColor={theme.colors.success} onPress={handlePublishOffer}>
                Publish Offer
            </Button>
            </View>
            </View>
        </ScrollView>
        </Surface>
        </SafeAreaView>
    );
};

const makeStyles = ({ colors }) =>
    StyleSheet.create({
        container: {
            flex: 1,
            padding: 10,
            width: '100%',
            paddingBottom: 100
            // marginBottom: 100
        },
        input: {
            marginBottom: 10,
        },
        row: {
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        inputHalf: {
            flex: 0.48,
        },
        sectionTitle: {
            fontWeight: 'bold',
            fontSize: 18,
            marginBottom: 10,
        },
        submitButton: {
            marginTop: 20,
        },
        radioButtonGroup: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
        },
        radioButtonItem: {
            // width: '48%', // Adjust as needed for responsiveness
            marginBottom: 10,
        },
        dateRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 20,
        },
        dateInput: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 10,
            borderWidth: 1,
            borderColor: colors.primary,
            borderRadius: 5,
            flex: 0.48,
        },
        dateText: {
            marginLeft: 10,
            fontSize: 16,
            color: 'black',
        },

    });

export default PublishOfferScreen;
