import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
    Text,
    TextInput,
    Button,
    Switch,
    IconButton,
    Card,
    useTheme,
} from 'react-native-paper';
import { v4 as uuidv4 } from 'uuid';
import KeyboardAwareScrollableScreen from './KeyboardAwareScrollableScreen';
import ShippingCostParameters from './ShippingCostParameters';
import LocationConditionEditor from './LocationConditionEditor';

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
    const prefix = 'Inside';
    const location =
        locationCondition.locationType === 'city'
            ? `${locationCondition.city}, ${locationCondition.state}, ${locationCondition.country}`
            : locationCondition.locationType === 'state'
                ? `${locationCondition.state}, ${locationCondition.country}`
                : locationCondition.country;
    return `${prefix} ${location}`;
};

const formatCostParametersSummary = (baseCost, modifiers) => {
    const parts = [`Base ₹${baseCost}`];
    if (modifiers?.extraPerItemEnabled) {
        parts.push(`\n+ ₹${modifiers.extraPerItemCost} per extra item after ${modifiers.freeItemCount}`);
    }
    if (modifiers?.discountEnabled) {
        parts.push(`\n${modifiers.discountPercentage}% off if order > ₹${modifiers.discountThreshold}`);
    }
    if (modifiers?.capEnabled) {
        parts.push(`\nMax ₹${modifiers.capAmount}`);
    }
    return parts.join('');
};

const ShippingRuleEditor = ({ initialData, onSave, onCancel, saveButtonLabel }) => {
    console.log('saveButtonLabel:', saveButtonLabel);
    const theme = useTheme();
    const styles = makeStyles(theme);

    const [ruleName, setRuleName] = useState('');
    const [baseCost, setBaseCost] = useState('');
    const [groupingEnabled, setGroupingEnabled] = useState(false);
    const [defaultCostModifiers, setDefaultCostModifiers] = useState(initialCostModifiers());
    const [conditions, setConditions] = useState([]);
    const [editingConditionId, setEditingConditionId] = useState(null);
    const [unsavedCondition, setUnsavedCondition] = useState(null);

    useEffect(() => {
        if (initialData) {
            setRuleName(initialData.ruleName || '');
            setGroupingEnabled(initialData.groupingEnabled || false);
            const defaultCondition = initialData.conditions?.find(c => c.when.length === 0);
            const locationConditions = initialData.conditions?.filter(c => c.when.length > 0)
                .map(c => ({ ...c, id: uuidv4() })) || [];

            if (defaultCondition) {
                setBaseCost(String(defaultCondition.baseCost));
                setDefaultCostModifiers(defaultCondition.costModifiers || initialCostModifiers());
            }
            setConditions(locationConditions);
        }
    }, [initialData]);

    const handleAddCondition = () => {
        const newCondition = {
            id: uuidv4(),
            when: [],
            costModifiers: initialCostModifiers(),
            baseCost: '',
        };
        setUnsavedCondition(newCondition);
        setEditingConditionId(newCondition.id);
    };

    const handleEditCondition = (id) => {
        setEditingConditionId(id);
    };

    const handleSaveCondition = (id, updatedCondition) => {
        const newLocation = updatedCondition.when?.[0];
        const isDuplicate = conditions.some((cond) => {
            if (cond.id === id) return false;
            const existing = cond.when?.[0];
            return (
                existing?.locationType === newLocation?.locationType &&
                existing?.city?.toLowerCase() === newLocation?.city?.toLowerCase() &&
                existing?.state?.toLowerCase() === newLocation?.state?.toLowerCase() &&
                existing?.country?.toLowerCase() === newLocation?.country?.toLowerCase()
            );
        });
        if (isDuplicate) {
            alert('A rule with the same location already exists.');
            return;
        }

        if (unsavedCondition?.id === id) {
            setConditions((prev) => [...prev, updatedCondition]);
            setUnsavedCondition(null);
        } else {
            setConditions((prev) => prev.map((cond) => cond.id === id ? updatedCondition : cond));
        }
        setEditingConditionId(null);
    };

    const handleCancelEdit = () => {
        if (unsavedCondition?.id === editingConditionId) {
            setUnsavedCondition(null);
        }
        setEditingConditionId(null);
    };

    const handleSubmit = () => {
        if (!ruleName.trim()) return alert('Enter rule name.');
        if (!baseCost || isNaN(Number(baseCost))) return alert('Enter valid base cost.');

        const specificityRank = { city: 3, state: 2, country: 1 };
        const sortedConditions = [...conditions].sort((a, b) =>
            (specificityRank[b.when[0].locationType] || 0) -
            (specificityRank[a.when[0].locationType] || 0)
        );

        onSave({
            ruleName: ruleName.trim(),
            groupingEnabled,
            isActive: true,
            conditions: [
                { when: [], baseCost: Number(baseCost), costModifiers: defaultCostModifiers },
                ...sortedConditions.map(({ when, baseCost, costModifiers }) => ({
                    when, baseCost: Number(baseCost), costModifiers
                }))
            ]
        });
    };

    return (
        <KeyboardAwareScrollableScreen style={styles.container} contentContainerStyle={{ padding: 16 }}>
            <TextInput label="Rule Name" mode="outlined" value={ruleName} onChangeText={setRuleName} style={styles.input} />
            <View style={styles.switchRow}>
                <Text style={{ marginRight: 8 }}>Allow rule sharing?</Text>
                <Switch value={groupingEnabled} onValueChange={setGroupingEnabled} />
            </View>

            <ShippingCostParameters
                title="Default Cost"
                baseCost={baseCost}
                onBaseCostChange={setBaseCost}
                costModifiers={defaultCostModifiers}
                onCostModifiersChange={setDefaultCostModifiers}
            />

            <View style={styles.sectionHeader}>
                <Text variant="titleMedium">Location-Specific Costs</Text>
                <IconButton icon="plus-circle" onPress={handleAddCondition} />
            </View>

            {[...conditions]
                .sort((a, b) => {
                    const rank = { city: 3, state: 2, country: 1 };
                    return (rank[b.when[0]?.locationType] || 0) - (rank[a.when[0]?.locationType] || 0);
                })
                .map((condition, index) => (
                    editingConditionId !== condition.id && (
                        <Card key={condition.id} style={styles.conditionCard}>
                            <Card.Title
                                title={`Location Rule ${index + 1}`}
                                subtitle={`${formatLocationConditionSummary(condition.when[0])}\n${formatCostParametersSummary(condition.baseCost, condition.costModifiers)}`}
                                subtitleNumberOfLines={6}
                                right={(props) => (
                                    <View style={{ flexDirection: 'row' }}>
                                        <IconButton {...props} icon="pencil" onPress={() => handleEditCondition(condition.id)} />
                                        <IconButton {...props} icon="delete" onPress={() => setConditions(prev => prev.filter(c => c.id !== condition.id))} />
                                    </View>
                                )}
                            />
                        </Card>
                    )
                ))}

            {editingConditionId && (
                <LocationConditionEditor
                    condition={editingConditionId === unsavedCondition?.id ? unsavedCondition : conditions.find(c => c.id === editingConditionId)}
                    onSave={(updated) => handleSaveCondition(editingConditionId, updated)}
                    onCancel={handleCancelEdit}
                />
            )}

            <View style={styles.buttonRow}>
                <Button mode="outlined" onPress={onCancel}>Cancel</Button>
                <Button mode="contained" onPress={handleSubmit}>{saveButtonLabel || 'Save Rule'}</Button>
            </View>
        </KeyboardAwareScrollableScreen>
    );
};

const makeStyles = () => StyleSheet.create({
    container: { flex: 1 },
    input: { marginVertical: 8, backgroundColor: 'white' },
    switchRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
    buttonRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 24 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    conditionCard: { marginBottom: 12, backgroundColor: 'white', padding: 8 },
});

export default ShippingRuleEditor;