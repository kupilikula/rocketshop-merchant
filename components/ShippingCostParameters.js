import {StyleSheet, View} from "react-native";
import {Card, Checkbox, Text, TextInput, useTheme} from "react-native-paper";
import React from "react";


const ShippingCostParameters = ({ title, baseCost, onBaseCostChange, costModifiers, onCostModifiersChange }) => {
    const theme = useTheme();
    const styles = makeStyles(theme);

    return (
        <Card style={{ marginVertical: 24, padding: 16, borderRadius: 0, backgroundColor: 'white' }} mode="elevated">
            <Text variant="titleMedium">
                {title}
            </Text>
            <TextInput
                label="Base Shipping Cost (₹)"
                value={baseCost}
                onChangeText={onBaseCostChange}
                inputMode="numeric"
                mode="outlined"
                left={<TextInput.Affix text="₹" />}
                style={styles.input}
            />
            {/* Extra Per Item */}
            <View style={styles.checkboxRow}>
                <Checkbox.Android
                    status={costModifiers.extraPerItemEnabled ? 'checked' : 'unchecked'}
                    onPress={() => onCostModifiersChange({ ...costModifiers, extraPerItemEnabled: !costModifiers.extraPerItemEnabled })}
                />
                <Text variant={'bodyLarge'} numberOfLines={2}>Additional ₹ per item after N items</Text>
            </View>
            {costModifiers.extraPerItemEnabled && (
                <View style={styles.nestedInputs}>
                    <TextInput
                        label="₹ per extra item"
                        value={costModifiers.extraPerItemCost}
                        onChangeText={(text) => onCostModifiersChange({ ...costModifiers, extraPerItemCost: text })}
                        inputMode="numeric"
                        mode="outlined"
                        style={styles.input}
                    />
                    <TextInput
                        label="After how many items"
                        value={costModifiers.freeItemCount}
                        onChangeText={(text) => onCostModifiersChange({ ...costModifiers, freeItemCount: text })}
                        inputMode="numeric"
                        mode="outlined"
                        style={styles.input}
                    />
                </View>
            )}

            {/* Discount */}
            <View style={styles.checkboxRow}>
                <Checkbox.Android
                    status={costModifiers.discountEnabled ? 'checked' : 'unchecked'}
                    onPress={() => onCostModifiersChange({ ...costModifiers, discountEnabled: !costModifiers.discountEnabled })}
                />
                <Text numberOfLines={2} variant={'bodyLarge'}>Reduce Shipping Cost if Order Total exceeds ₹</Text>
            </View>
            {costModifiers.discountEnabled && (
                <View style={styles.nestedInputs}>
                    <TextInput
                        label="Reduce Shipping by (%)"
                        value={costModifiers.discountPercentage}
                        onChangeText={(text) => onCostModifiersChange({ ...costModifiers, discountPercentage: text })}
                        inputMode="numeric"
                        mode="outlined"
                        style={styles.input}
                    />
                    <TextInput
                        label="Order Total Threshold (₹)"
                        value={costModifiers.discountThreshold}
                        onChangeText={(text) => onCostModifiersChange({ ...costModifiers, discountThreshold: text })}
                        inputMode="numeric"
                        mode="outlined"
                        style={styles.input}
                    />
                </View>
            )}

            {/* Cap */}
            <View style={styles.checkboxRow}>
                <Checkbox.Android
                    status={costModifiers.capEnabled ? 'checked' : 'unchecked'}
                    onPress={() => onCostModifiersChange({ ...costModifiers, capEnabled: !costModifiers.capEnabled })}
                />
                <Text variant={'bodyLarge'} numberOfLines={2}>Cap Maximum Shipping Charge</Text>
            </View>
            {costModifiers.capEnabled && (
                <View style={styles.nestedInputs}>
                    <TextInput
                        label="Max Shipping (₹)"
                        value={costModifiers.capAmount}
                        onChangeText={(text) => onCostModifiersChange({ ...costModifiers, capAmount: text })}
                        inputMode="numeric"
                        mode="outlined"
                        style={styles.input}
                    />
                </View>
            )}
        </Card>
    );
};

const makeStyles = (theme) => StyleSheet.create({
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

export default ShippingCostParameters;