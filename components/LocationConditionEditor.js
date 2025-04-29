import {Button, Card, SegmentedButtons, TextInput, useTheme} from "react-native-paper";
import React, {useState} from "react";
import {StyleSheet, View} from "react-native";
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

    // Since only one location condition now
    const [locationCondition, setLocationCondition] = useState(
        condition.when?.[0] || {
            type: 'location',
            operator: 'inside',
            locationType: LOCATION_TYPES.CITY,
            city: '',
            state: '',
            country: '',
        }
    );
    const [baseCost, setBaseCost] = useState(condition.baseCost !== undefined ? String(condition.baseCost) : '');
    const [costModifiers, setCostModifiers] = useState(condition.costModifiers || initialCostModifiers());

    const handleLocationRuleSave = () => {
        console.log('inside location editor baseCost:', baseCost);
        if (!baseCost || isNaN(Number(baseCost))) {
            alert('Please enter a valid Base Shipping Cost.');
            return;
        }

        if (locationCondition.locationType === LOCATION_TYPES.CITY && !locationCondition.city) {
            alert('Please enter a valid City name.');
            return;
        }

        if (locationCondition.locationType === LOCATION_TYPES.STATE && !locationCondition.state) {
            alert('Please enter a valid State name.');
            return;
        }

        if (locationCondition.locationType === LOCATION_TYPES.COUNTRY && !locationCondition.country) {
            alert('Please enter a valid Country name.');
            return;
        }

        if (onSave) {
            onSave({
                id: condition.id,
                when: [locationCondition],
                baseCost: Number(baseCost),
                costModifiers,
            });
        }
    };

    return (
        <Card style={styles.editorContainer}>
            <Card.Title title="Delivery Location Rule" />
            <Card.Content>

                {/* Location Type */}
                <SegmentedButtons
                    value={locationCondition.locationType}
                    onValueChange={(value) => setLocationCondition(prev => ({ ...prev, locationType: value }))}
                    buttons={[
                        { value: LOCATION_TYPES.CITY, label: 'City' },
                        { value: LOCATION_TYPES.STATE, label: 'State' },
                        { value: LOCATION_TYPES.COUNTRY, label: 'Country' },
                    ]}
                    style={{ marginVertical: 8 }}
                />

                {/* Inside / Outside Selector */}
                <SegmentedButtons
                    value={locationCondition.operator}
                    onValueChange={(value) => setLocationCondition(prev => ({ ...prev, operator: value }))}
                    buttons={[
                        { value: 'inside', label: 'Inside' },
                        { value: 'outside', label: 'Outside' },
                    ]}
                    style={{ marginBottom: 8 }}
                />

                {/* Location Input Fields */}
                {locationCondition.locationType === LOCATION_TYPES.CITY && (
                    <>
                        <TextInput
                            label="City"
                            value={locationCondition.city}
                            onChangeText={(text) => setLocationCondition(prev => ({ ...prev, city: text }))}
                            mode="outlined"
                            style={styles.input}
                        />
                        <TextInput
                            label="State"
                            value={locationCondition.state}
                            onChangeText={(text) => setLocationCondition(prev => ({ ...prev, state: text }))}
                            mode="outlined"
                            style={styles.input}
                        />
                    </>
                )}

                {locationCondition.locationType === LOCATION_TYPES.STATE && (
                    <TextInput
                        label="State"
                        value={locationCondition.state}
                        onChangeText={(text) => setLocationCondition(prev => ({ ...prev, state: text }))}
                        mode="outlined"
                        style={styles.input}
                    />
                )}

                {locationCondition.locationType === LOCATION_TYPES.COUNTRY && (
                    <TextInput
                        label="Country"
                        value={locationCondition.country}
                        onChangeText={(text) => setLocationCondition(prev => ({ ...prev, country: text }))}
                        mode="outlined"
                        style={styles.input}
                    />
                )}


                {/* Shipping Cost Modifiers */}
                <ShippingCostParameters
                    title="Shipping Cost Parameters for this Location"
                    baseCost={baseCost}
                    onBaseCostChange={setBaseCost}
                    costModifiers={costModifiers}
                    onCostModifiersChange={setCostModifiers}
                />

                {/* Save / Cancel Buttons */}
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

const makeStyles = () => StyleSheet.create({
    editorContainer: {
        marginVertical: 16,
        backgroundColor: 'white',
    },
    conditionBlock: {
        marginVertical: 12,
        padding: 8,
        backgroundColor: '#f8f8f8',
        borderRadius: 8,
    },
    conditionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    input: {
        marginVertical: 8,
        backgroundColor: 'white',
    },
    addConditionButtons: {
        marginVertical: 16,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 24,
    },
    container: { flex: 1 },
    header: { marginBottom: 8 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 0, marginBottom: 8 },
    checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    conditionCard: { marginBottom: 12, backgroundColor: 'white' },
    nestedInputs: { marginLeft: 32 },
    switchRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
});

export default LocationConditionEditor;