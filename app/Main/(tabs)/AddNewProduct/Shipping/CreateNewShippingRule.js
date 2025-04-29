import React, {useEffect, useState} from 'react';
import { View, StyleSheet } from 'react-native';
import {
    Text,
    TextInput,
    Button,
    Checkbox,
    Switch,
    IconButton,
    Card,
    Portal,
    SegmentedButtons, useTheme
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { v4 as uuidv4 } from 'uuid';
import KeyboardAwareScrollableScreen from '../../../../../components/KeyboardAwareScrollableScreen';
import ShippingCostParameters from "../../../../../components/ShippingCostParameters";
import LocationConditionEditor from "../../../../../components/LocationConditionEditor";
import {useCreateShippingRule} from "../../../../../api/hooks/useCreateShippingRule";
import {useDispatch, useSelector} from "react-redux"; // ✅ Your custom wrapper
import {updateField as updateNewProductField } from '../../../../../store/newProductSlice';
import {setNewShippingRule} from "../../../../../store/shippingRuleSlice";



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


const formatLocationConditionSummary = (locationCondition) => {
    if (!locationCondition) return '';

    const prefix = locationCondition.operator === 'inside' ? 'Inside' : 'Outside';
    const location =
        locationCondition.locationType === 'city' ? `${locationCondition.city}, ${locationCondition.state}` :
            locationCondition.locationType === 'state' ? `${locationCondition.state}` :
                locationCondition.locationType === 'country' ? `${locationCondition.country}` :
                    '';

    return `${prefix} ${location}`;
};

const formatCostParametersSummary = (baseCost, modifiers) => {
    console.log('formatCostModifiersSummary', baseCost, modifiers);
    if (baseCost === undefined || baseCost === null) return '';

    let parts = [`Base ₹${baseCost}`];

    if (modifiers?.extraPerItemEnabled) {
        parts.push(`\n+ ₹${modifiers.extraPerItemCost} per extra item after ${modifiers.freeItemCount}`);
    }

    if (modifiers?.discountEnabled) {
        parts.push(`\n${modifiers.discountPercentage}% off if order > ₹${modifiers.discountThreshold}`);
    }

    if (modifiers?.capEnabled) {
        parts.push(`\nMax ₹${modifiers.capAmount}`);
    }
    console.log('parts', parts);
    return parts.join('');
};

const CreateShippingRuleScreen = ({ onSave, onCancel }) => {
    const dispatch = useDispatch();

    const newShippingRule = useSelector((state) => state.shippingRule.newShippingRule);
    const [ruleName, setRuleName] = useState('');
    const [baseCost, setBaseCost] = useState('');
    const [groupingEnabled, setGroupingEnabled] = useState(false);
    const [defaultCostModifiers, setDefaultCostModifiers] = useState(initialCostModifiers());
    const [conditions, setConditions] = useState([]);
    const [editingConditionId, setEditingConditionId] = useState(null);
    const {storeId} = useSelector((state) => state.store);

    // const {mutateAsync: createShippingRule} = useCreateShippingRule(storeId);


    const router = useRouter();
    const styles = makeStyles();

    // Hydrate form if cloned rule exists
    useEffect(() => {
        console.log('useEffect newShippingRule', newShippingRule);
        if (newShippingRule) {
            setRuleName(newShippingRule.ruleName || '');
            setGroupingEnabled(newShippingRule.groupingEnabled || false);

            const defaultCondition = newShippingRule.conditions?.find(c => c.when?.length === 0);
            const locationConditions = newShippingRule.conditions?.filter(c => c.when?.length > 0).map(c => ({...c, id: uuidv4()})) || [];

            if (defaultCondition) {
                setBaseCost(String(defaultCondition.baseCost));
                setDefaultCostModifiers(defaultCondition.costModifiers || initialCostModifiers());
            }

            setConditions(locationConditions);
        }
    }, [newShippingRule]);

    const handleShippingRuleSave = async () => {

        if (!ruleName.trim() || ruleName.trim().length === 0) {
            alert('Please enter a rule name.');
            return;
        }

        if (!baseCost || isNaN(Number(baseCost))) {
            alert('Please enter a valid default Base Shipping Cost.');
            return;
        }

        if (!defaultCostModifiers) {
            alert('Missing default shipping cost parameters.');
            return;
        }

        const shippingRulePayload = {
            ruleName: ruleName.trim(),
            groupingEnabled,
            isActive: true,
            conditions: [
                {
                    when: [], // fallback rule with no conditions
                    baseCost: Number(baseCost),
                    costModifiers: defaultCostModifiers,
                },
                ...conditions.map((cond) => ({
                    when: cond.when,
                    baseCost: Number(cond.baseCost),
                    costModifiers: cond.costModifiers,
                }))
            ]
        };

        dispatch(setNewShippingRule(shippingRulePayload));
        router.push('/Main/(tabs)/AddNewProduct/Preview');
    };

    const handleAddCondition = () => {
        const newCondition = {
            id: uuidv4(),
            when: [],
            costModifiers: initialCostModifiers(),
        };
        setConditions((prev) => [...prev, newCondition]);
        setEditingConditionId(newCondition.id);
    };

    const handleEditCondition = (id) => {
        setEditingConditionId(id);
    };

    const handleSaveCondition = (id, updatedCondition) => {
        setConditions((prev) =>
            prev.map((cond) => (cond.id === id ? updatedCondition : cond))
        );
        setEditingConditionId(null);
    };

    const handleRemoveCondition = (id) => {
        setConditions((prev) => prev.filter((cond) => cond.id !== id));
    };

    return (
        <>
            <KeyboardAwareScrollableScreen style={styles.container} contentContainerStyle={{padding: 16}}>
                <TextInput
                    label="Rule Name"
                    mode="outlined"
                    value={ruleName}
                    onChangeText={setRuleName}
                    style={styles.input}
                />

                {/* Grouping Switch */}
                <View style={styles.switchRow}>
                    <Text style={{ marginRight: 8 }}>Allow this rule to be shared across products?</Text>
                    <Switch value={groupingEnabled} onValueChange={setGroupingEnabled} />
                </View>


                {/* Default Cost Modifiers */}
                <ShippingCostParameters
                    title="Default Shipping Cost Parameters"
                    baseCost={baseCost}
                    onBaseCostChange={setBaseCost}
                    costModifiers={defaultCostModifiers}
                    onCostModifiersChange={setDefaultCostModifiers}
                />

                {/* Conditions Section */}
                <View style={styles.sectionHeader}>
                    <Text variant="titleLarge">Delivery Address Conditions</Text>
                    <IconButton
                        icon="plus-circle"
                        onPress={handleAddCondition}
                    />
                </View>

                {conditions.map((condition, index) => (condition.id!==editingConditionId &&
                    <Card key={condition.id} style={styles.conditionCard}>
                        <Card.Title
                            title={`Location Rule ${index + 1}`}
                            subtitle={
                                `${formatLocationConditionSummary(condition.when?.[0])}\n${formatCostParametersSummary(condition.baseCost, condition.costModifiers)}`
                            }
                            subtitleNumberOfLines={6}
                            right={(props) => (
                                <View style={{ flexDirection: 'row' }}>
                                    <IconButton {...props} icon="pencil" onPress={() => handleEditCondition(condition.id)} />
                                    <IconButton {...props} icon="delete" onPress={() => handleRemoveCondition(condition.id)} />
                                </View>
                            )}
                        />
                    </Card>
                ))}

                {/* Inline Condition Editor */}
                {editingConditionId && (
                    <LocationConditionEditor
                        condition={conditions.find(c => c.id === editingConditionId)}
                        onSave={(updatedCondition) => handleSaveCondition(editingConditionId, updatedCondition)}
                        onCancel={() => setEditingConditionId(null)}
                    />
                )}

                {/* Buttons */}
                <View style={styles.buttonRow}>
                    <Button mode="outlined" onPress={onCancel || (() => router.back())}>
                        Cancel
                    </Button>
                    <Button mode="contained" onPress={handleShippingRuleSave}>
                        Save Rule
                    </Button>
                </View>
            </KeyboardAwareScrollableScreen>

        </>
    );
};

// 🧩 Shipping Cost Modifiers Section


const generateFormulaString = (baseCost, modifiers) => {
    let cost = 'baseCost';

    if (modifiers.extraPerItemEnabled) {
        cost += ` + ${modifiers.extraPerItemCost} * Max(0, itemCount - ${modifiers.freeItemCount})`;
    }

    if (modifiers.discountEnabled) {
        cost = `(${cost}) * (orderTotal > ${modifiers.discountThreshold} ? ${(100 - modifiers.discountPercentage) / 100} : 1)`;
    }

    if (modifiers.capEnabled) {
        cost = `Min(${cost}, ${modifiers.capAmount})`;
    }

    return cost;
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
    conditionCard: { marginBottom: 12, backgroundColor: 'white', padding: 8, borderRadius: 0 },
    nestedInputs: { marginLeft: 32 },
    switchRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
});

export default CreateShippingRuleScreen;