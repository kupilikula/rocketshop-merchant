import {Button, Card, Divider, SegmentedButtons, TextInput, useTheme} from "react-native-paper";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import ShippingCostParameters from "./ShippingCostParameters";

const LocationConditionEditor = ({ condition, onSave, onCancel }) => {
    const theme = useTheme();
    const styles = makeStyles(theme);

    const LOCATION_TYPES = {
        CITY: 'city',
        STATE: 'state',
        COUNTRY: 'country',
    };

    const initialCostModifiers = () => ({
        extraPerItemEnabled: false,
        extraPerItemCost: '',
        freeItemCount: '',
        discountEnabled: false,
        discountPercentage: '',
        discountThreshold: '',
        capEnabled: false,
        capAmount: '',
    });

    const [locationCondition, setLocationCondition] = useState(
        condition?.when?.[0] || {
            type: 'location',
            operator: 'inside', // fixed to 'inside'
            locationType: LOCATION_TYPES.CITY,
            city: '',
            state: '',
            country: '',
        }
    );

    const [baseCost, setBaseCost] = useState(
        condition?.baseCost !== undefined ? String(condition?.baseCost) : ''
    );

    const [costModifiers, setCostModifiers] = useState(
        condition?.costModifiers || initialCostModifiers()
    );

    const handleLocationRuleSave = () => {
        if (!baseCost || isNaN(Number(baseCost))) {
            alert('Please enter a valid Base Shipping Cost.');
            return;
        }

        if (locationCondition.locationType === LOCATION_TYPES.CITY && (!locationCondition.city || !locationCondition.state || !locationCondition.country)) {
            alert('Please enter a valid City, State and Country.');
            return;
        }

        if (locationCondition.locationType === LOCATION_TYPES.STATE && (!locationCondition.state || !locationCondition.country)) {
            alert('Please enter a valid State and Country name.');
            return;
        }

        if (locationCondition.locationType === LOCATION_TYPES.COUNTRY && !locationCondition.country) {
            alert('Please enter a valid Country name.');
            return;
        }

        if (onSave) {
            onSave({
                id: condition.id,
                when: [{ ...locationCondition, operator: 'inside' }], // always 'inside'
                baseCost: Number(baseCost),
                costModifiers,
            });
        }
    };

    return (
        <Card style={styles.editorContainer}>
            <Card.Title title="Delivery Location" />
            <Card.Content>

                {/* Location Type Selector */}
                <SegmentedButtons
                    value={locationCondition.locationType}
                    onValueChange={(value) =>
                        setLocationCondition(prev => ({
                            ...prev,
                            locationType: value,
                            operator: 'inside' // enforce
                        }))
                    }
                    buttons={[
                        { value: LOCATION_TYPES.CITY, label: 'City', style: { borderRadius: 8} },
                        { value: LOCATION_TYPES.STATE, label: 'State', style: { borderRadius: 0}  },
                        { value: LOCATION_TYPES.COUNTRY, label: 'Country', style: { borderRadius: 8}  },
                    ]}
                    style={{ marginVertical: 8 , borderRadius: 8}}
                />

                {/* Location Input Fields */}
                {locationCondition.locationType === LOCATION_TYPES.CITY && (
                    <>
                        <TextInput
                            label="City"
                            value={locationCondition.city}
                            onChangeText={(text) =>
                                setLocationCondition(prev => ({ ...prev, city: text }))
                            }
                            mode="outlined"
                            style={styles.input}
                        />
                        <TextInput
                            label="State"
                            value={locationCondition.state}
                            onChangeText={(text) =>
                                setLocationCondition(prev => ({ ...prev, state: text }))
                            }
                            mode="outlined"
                            style={styles.input}
                        />
                        <TextInput
                            label="Country (or 'International')"
                            value={locationCondition.country}
                            onChangeText={(text) =>
                                setLocationCondition(prev => ({ ...prev, country: text }))
                            }
                            mode="outlined"
                            style={styles.input}
                        />
                    </>
                )}

                {locationCondition.locationType === LOCATION_TYPES.STATE && (
                    <>
                    <TextInput
                        label="State"
                        value={locationCondition.state}
                        onChangeText={(text) =>
                            setLocationCondition(prev => ({ ...prev, state: text }))
                        }
                        mode="outlined"
                        style={styles.input}
                    />
                        <TextInput
                            label="Country"
                            value={locationCondition.country}
                            onChangeText={(text) =>
                                setLocationCondition(prev => ({ ...prev, country: text }))
                            }
                            mode="outlined"
                            style={styles.input}
                        />
                    </>

                )}

                {locationCondition.locationType === LOCATION_TYPES.COUNTRY && (
                    <TextInput
                        label="Country"
                        value={locationCondition.country}
                        onChangeText={(text) =>
                            setLocationCondition(prev => ({ ...prev, country: text }))
                        }
                        mode="outlined"
                        style={styles.input}
                    />
                )}

                <Divider style={{ marginVertical: 8 }}/>
                <ShippingCostParameters
                    title="Shipping Cost Parameters for this Location"
                    baseCost={baseCost}
                    onBaseCostChange={setBaseCost}
                    costModifiers={costModifiers}
                    onCostModifiersChange={setCostModifiers}
                />

                <View style={styles.buttonRow}>
                    <Button mode="outlined" onPress={onCancel}>
                        Cancel
                    </Button>
                    <Button mode="contained" onPress={handleLocationRuleSave}>
                        Save Location Rule
                    </Button>
                </View>
            </Card.Content>
        </Card>
    );
};

const makeStyles = (theme) =>
    StyleSheet.create({
        editorContainer: {
            marginVertical: 16,
            backgroundColor: 'white',
            borderRadius: 0,
        },
        input: {
            marginVertical: 8,
            backgroundColor: 'white',
        },
        buttonRow: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginVertical: 24,
        },
    });

export default LocationConditionEditor;