import React, { useState, useContext, useMemo } from 'react';
import { View, ScrollView } from 'react-native';
import { TextInput, Text, Card, RadioButton, Button, useTheme, Badge } from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import { useFetchShippingRules } from '../../../../../api/hooks/useFetchShippingRules';
import { ProductWorkflowContext } from '../../../../../components/ProductWorkflowContext';
import Fuse from 'fuse.js';
import {router, useRouter} from 'expo-router';
import {computeProductSimilarityScore} from "../../../../../utils/computeProductSimilarityScore";
import {setSelectedExistingShippingRuleId} from "../../../../../store/shippingRuleSlice";
import {formatShippingRuleSummary} from "../../../../../utils/formatShippingRuleSummary";

export default function SelectExistingShippingRule() {
    const theme = useTheme();
    const dispatch = useDispatch();
    const router = useRouter();
    const { storeId } = useSelector((state) => state.store);
    const newProductInfo = useSelector((state) => state.newProduct);

    const { data: shippingRules = [], isLoading } = useFetchShippingRules(storeId, true);
    const {selectedShippingRuleId} = useSelector((state) => state.shippingRule);
    const [searchQuery, setSearchQuery] = useState('');
    const [localSelectedRuleId, setLocalSelectedRuleId] = useState(selectedShippingRuleId || null);


    const scoredAndSortedRules = useMemo(() => {
        const scored = shippingRules.map(rule => ({
            ...rule,
            similarityScore: computeProductSimilarityScore(newProductInfo, rule)
        }));

        return scored.sort((a, b) => b.similarityScore - a.similarityScore);
    }, [shippingRules, newProductInfo]);

    const fuse = new Fuse(scoredAndSortedRules, {
        keys: ['ruleName'],
        threshold: 0.3,
    });

    const filteredRules = searchQuery
        ? fuse.search(searchQuery).map(r => r.item)
        : scoredAndSortedRules;

    const handleConfirm = () => {
        if (!localSelectedRuleId) return;
        dispatch(setSelectedExistingShippingRuleId(localSelectedRuleId));
        router.push('/Main/(tabs)/AddNewProduct/Preview');
    };

    if (isLoading) return <Text style={{ padding: 16 }}>Loading...</Text>;

    return (
        <ScrollView style={{ flex: 1, padding: 16 }}>
            <TextInput
                label="Search Shipping Rules"
                mode="outlined"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={{ marginBottom: 16, backgroundColor: theme.colors.surface }}
            />

            <RadioButton.Group onValueChange={setLocalSelectedRuleId} value={localSelectedRuleId}>
                {filteredRules.map(rule => (
                    <Card
                        key={rule.shippingRuleId}
                        mode={'elevated'}
                        style={{ marginBottom: 16, padding: 8, borderRadius: 0, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: localSelectedRuleId===rule.shippingRuleId ? theme.colors.primary : theme.colors.surface }}
                        onPress={() => setLocalSelectedRuleId(rule.shippingRuleId)}
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

            <View style={{alignSelf: 'center'}}>
            <Button
                mode="contained"
                onPress={handleConfirm}
                disabled={!localSelectedRuleId}
                style={{ marginTop: 24, borderRadius: 8 }}
            >
                Confirm Selection
            </Button>
            </View>
        </ScrollView>
    );
}
