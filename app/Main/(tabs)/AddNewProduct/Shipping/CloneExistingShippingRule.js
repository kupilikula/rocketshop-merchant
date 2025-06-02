import React, { useState, useMemo, useContext } from 'react';
import { ScrollView, View } from 'react-native';
import {
    Text,
    TextInput,
    Card,
    RadioButton,
    Button,
    useTheme,
    Badge,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { useFetchShippingRules } from '../../../../../api/hooks/useFetchShippingRules';
import { computeProductSimilarityScore } from '../../../../../utils/computeProductSimilarityScore';
import { formatShippingRuleSummary } from '../../../../../utils/formatShippingRuleSummary';
import {
    setNewShippingRule,
} from '../../../../../store/shippingRuleSlice';
import { useDispatch } from 'react-redux';

export default function CloneExistingRuleSelector() {
    const { storeId } = useSelector((state) => state.store);
    const newProductInfo = useSelector((state) => state.newProduct);
    const { data: shippingRules = [], isLoading } = useFetchShippingRules(storeId);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRuleId, setSelectedRuleId] = useState(null);
    const router = useRouter();
    const dispatch = useDispatch();
    const theme = useTheme();

    const scoredRules = useMemo(() => {
        return shippingRules.map(rule => ({
            ...rule,
            similarityScore: computeProductSimilarityScore(newProductInfo, rule)
        })).sort((a, b) => b.similarityScore - a.similarityScore);
    }, [shippingRules, newProductInfo]);

    const filteredRules = useMemo(() => {
        if (!searchQuery) return scoredRules;
        return scoredRules.filter(rule =>
            rule.ruleName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, scoredRules]);

    const handleCloneAndEdit = () => {
        const selected = shippingRules.find(r => r.shippingRuleId === selectedRuleId);
        if (!selected) return;

        // Strip out DB-only fields and inject into Redux
        const clonedRule = {
            ruleName: `${selected.ruleName} (Copy)`,
            groupingEnabled: false, // clones are always ungrouped
            is_international_shipping_enabled: selected.is_international_shipping_enabled,
            isActive: true,
            conditions: selected.conditions.map(c => ({
                ...c,
                id: undefined, // remove if present
            })),
        };

        dispatch(setNewShippingRule(clonedRule));
        router.push('/Main/(tabs)/AddNewProduct/Shipping/CreateNewShippingRule');
    };

    if (isLoading) return <Text style={{ padding: 16 }}>Loading...</Text>;

    return (
        <ScrollView style={{ flex: 1, padding: 16 }}>
            <Text variant="headlineMedium" style={{ marginBottom: 16 }}>
                Copy and Edit an Existing Shipping Rule
            </Text>

            <TextInput
                label="Search Shipping Rules"
                mode="outlined"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={{ marginBottom: 16 }}
            />

            <RadioButton.Group onValueChange={setSelectedRuleId} value={selectedRuleId}>
                {filteredRules.map(rule => (
                    <Card
                        key={rule.shippingRuleId}
                        mode={'elevated'}
                        style={{ marginBottom: 16, padding: 8, borderRadius: 0, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: selectedRuleId===rule.shippingRuleId ? theme.colors.primary : theme.colors.surface }}
                        onPress={() => setSelectedRuleId(rule.shippingRuleId)}
                    >
                        <Card.Title
                            title={rule.ruleName}
                            subtitle={formatShippingRuleSummary(rule)}
                            subtitleNumberOfLines={10}
                            right={(props) => (
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    {rule.similarityScore >= 20 && (
                                        <Badge style={{ backgroundColor: theme.colors.secondary, marginRight: 8 }}>
                                            Best Match
                                        </Badge>
                                    )}
                                    <RadioButton.Android mode={'android'} {...props} value={rule.shippingRuleId} />
                                </View>
                            )}
                        />
                    </Card>
                ))}
            </RadioButton.Group>

            <Button
                mode="contained"
                onPress={handleCloneAndEdit}
                disabled={!selectedRuleId}
                style={{ marginTop: 24 }}
            >
                Clone and Edit
            </Button>
        </ScrollView>
    );
}