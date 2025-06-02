import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import {
    Text,
    TextInput,
    Button,
    Switch,
    IconButton,
    Card,
    useTheme, // Keep useTheme for potential inline usage if absolutely necessary
} from 'react-native-paper';
import { v4 as uuidv4 } from 'uuid';
import ShippingCostParameters from './ShippingCostParameters';
import LocationConditionEditor from './LocationConditionEditor';
import {DefaultTheme as theme} from "@react-navigation/native";

const IS_WEB = Platform.OS === 'web';

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
    if (modifiers?.extraPerItemEnabled && modifiers.extraPerItemCost && modifiers.freeItemCount) {
        parts.push(`\n+ ₹${modifiers.extraPerItemCost} per extra item after ${modifiers.freeItemCount}`);
    }
    if (modifiers?.discountEnabled && modifiers.discountPercentage && modifiers.discountThreshold) {
        parts.push(`\n${modifiers.discountPercentage}% off if order > ₹${modifiers.discountThreshold}`);
    }
    if (modifiers?.capEnabled && modifiers.capAmount) {
        parts.push(`\nMax ₹${modifiers.capAmount}`);
    }
    return parts.join('');
};

const ShippingRuleEditor = ({ initialData, onSave, onCancel, saveButtonLabel, mode: editorModeProp }) => {
    const theme = useTheme(); // useTheme is available if needed
    const styles = makeStyles(); // Using makeStyles as originally provided (without theme param)

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
                .map(c => ({ ...c, id: c.id || uuidv4() })) || [];

            if (defaultCondition) {
                setBaseCost(String(defaultCondition.baseCost));
                setDefaultCostModifiers(defaultCondition.costModifiers || initialCostModifiers());
            } else {
                setBaseCost('');
                setDefaultCostModifiers(initialCostModifiers());
            }
            setConditions(locationConditions);
        } else {
            setRuleName('');
            setGroupingEnabled(false);
            setBaseCost('');
            setDefaultCostModifiers(initialCostModifiers());
            setConditions([]);
        }
        setEditingConditionId(null);
        setUnsavedCondition(null);
    }, [initialData, editorModeProp]);

    const handleAddCondition = () => {
        // Original logic didn't explicitly prevent adding if unsaved, but good to have a single editor active.
        if (editingConditionId && unsavedCondition && editingConditionId === unsavedCondition.id) {
            alert("Please save or cancel the current new condition first.");
            return;
        }
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
        if (editingConditionId && unsavedCondition && editingConditionId === unsavedCondition.id) {
            alert("Please save or cancel the current new condition first.");
            return;
        }
        setEditingConditionId(id);
    };

    const handleSaveCondition = (id, updatedCondition) => {
        const newLocation = updatedCondition.when?.[0];
        if (newLocation && newLocation.country) {
            const isDuplicate = conditions.some((cond) => {
                if (cond.id === id) return false;
                const existing = cond.when?.[0];
                return (
                    existing &&
                    existing.locationType === newLocation.locationType &&
                    (existing.locationType !== 'city' || existing.city?.toLowerCase() === newLocation.city?.toLowerCase()) &&
                    (existing.locationType === 'country' || existing.state?.toLowerCase() === newLocation.state?.toLowerCase()) &&
                    existing.country.toLowerCase() === newLocation.country.toLowerCase()
                );
            });
            if (isDuplicate) {
                alert('A rule with the same location hierarchy already exists.');
                return;
            }
        } else if (newLocation) {
            alert('Please define a valid location for the condition.');
            return;
        }

        if (unsavedCondition?.id === id) {
            setConditions((prev) => [...prev, { ...updatedCondition, id }]);
            setUnsavedCondition(null);
        } else {
            setConditions((prev) => prev.map((cond) => (cond.id === id ? { ...updatedCondition, id } : cond)));
        }
        setEditingConditionId(null);
    };

    const handleCancelEdit = () => {
        if (unsavedCondition?.id === editingConditionId) {
            setUnsavedCondition(null);
        }
        setEditingConditionId(null);
    };

    const handleDeleteCondition = (id) => {
        setConditions(prev => prev.filter(c => c.id !== id));
        if (editingConditionId === id) {
            setEditingConditionId(null);
            if (unsavedCondition?.id === id) {
                setUnsavedCondition(null);
            }
        }
    };

    const handleSubmit = () => {
        if (!ruleName.trim()) {
            alert('Enter rule name.');
            return;
        }
        if (baseCost === '' || isNaN(Number(baseCost)) || Number(baseCost) < 0) {
            alert('Enter valid base cost.');
            return;
        }
        for (const cond of conditions) {
            if (cond.baseCost === '' || isNaN(Number(cond.baseCost)) || Number(cond.baseCost) < 0) {
                const locationSummary = cond.when.length > 0 ? formatLocationConditionSummary(cond.when[0]) : 'a location-specific rule';
                alert(`Please enter a valid, non-negative base cost for ${locationSummary}.`);
                return;
            }
            if (cond.when.length === 0 || !cond.when[0].country) {
                alert('One or more location-specific rules is missing a valid location. Please edit or remove it.');
                return;
            }
        }

        const specificityRank = { city: 3, state: 2, country: 1 };
        const sortedLocationConditions = [...conditions].sort((a, b) => {
            const locA = a.when[0];
            const locB = b.when[0];
            return (specificityRank[locB?.locationType] || 0) - (specificityRank[locA?.locationType] || 0);
        });

        onSave({
            ruleName: ruleName.trim(),
            groupingEnabled,
            isActive: true,
            conditions: [
                { when: [], baseCost: Number(baseCost), costModifiers: defaultCostModifiers },
                ...sortedLocationConditions.map(({ when, baseCost: condBaseCost, costModifiers }) => ({
                    when,
                    baseCost: Number(condBaseCost),
                    costModifiers
                }))
            ]
        });
    };

    return (
        <ScrollView
            style={[styles.container, IS_WEB && { backgroundColor: theme.colors.white }]} // Use theme for web background
            contentContainerStyle={
                IS_WEB
                    ? { padding: 24, maxWidth: 700, width: '100%', alignSelf: 'center' }
                    : { padding: 16 } // Original contentContainerStyle padding
            }
        >
            <TextInput
                label="Rule Name"
                mode="outlined"
                value={ruleName}
                onChangeText={setRuleName}
                style={styles.input}
            />
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

            {conditions.length === 0 && !editingConditionId && (
                <Text style={{ textAlign: 'center', marginVertical: 20, color: theme.colors.onSurfaceVariant }}>
                    No location-specific costs added yet. The default cost will apply to all locations including international deliveries.
                </Text>
            )}

            {[...conditions]
                .sort((a, b) => {
                    const rank = { city: 3, state: 2, country: 1 };
                    const locA = a.when[0];
                    const locB = b.when[0];
                    return (rank[locB?.locationType] || 0) - (rank[locA?.locationType] || 0);
                })
                .map((condition, index) => (
                    // Only render the Card if this condition is NOT the one being edited
                    editingConditionId !== condition.id && (
                        <Card key={condition.id} style={styles.conditionCard}>
                            <Card.Title
                                title={`Location Rule ${index + 1}`}
                                subtitle={`${formatLocationConditionSummary(condition.when[0])}\n${formatCostParametersSummary(condition.baseCost, condition.costModifiers)}`}
                                subtitleNumberOfLines={6}
                                right={(props) => (
                                    <View style={{ flexDirection: 'row' }}>
                                        <IconButton {...props} icon="pencil" onPress={() => handleEditCondition(condition.id)} />
                                        <IconButton {...props} icon="delete" onPress={() => handleDeleteCondition(condition.id)} />
                                    </View>
                                )}
                            />
                        </Card>
                    )
                ))}

            {/* Render LocationConditionEditor inline if editingConditionId is set */}
            {editingConditionId && (
                <LocationConditionEditor
                    condition={editingConditionId === unsavedCondition?.id ? unsavedCondition : conditions.find(c => c.id === editingConditionId)}
                    onSave={(updatedCondition) => handleSaveCondition(editingConditionId, updatedCondition)}
                    onCancel={handleCancelEdit}
                />
            )}

            <View style={styles.buttonRow}>
                <Button mode="outlined" onPress={onCancel} style={IS_WEB ? {marginRight: 8} : {}}>Cancel</Button>
                <Button mode="contained" onPress={handleSubmit}>{saveButtonLabel || 'Save Rule'}</Button>
            </View>
        </ScrollView>
    );
};

// Using the makeStyles function as provided in the user's original ShippingRuleEditor code
const makeStyles = () => StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    input: { marginVertical: 8, backgroundColor: 'white' },
    switchRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
    buttonRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 24 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    conditionCard: { marginBottom: 12, backgroundColor: 'white', padding: 8 },
});

export default ShippingRuleEditor;