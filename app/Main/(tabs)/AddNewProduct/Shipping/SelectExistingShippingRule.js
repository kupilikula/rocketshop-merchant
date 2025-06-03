import React, { useState, useContext, useMemo } from 'react';
import { View, ScrollView, Platform, StyleSheet } from 'react-native'; // Added Platform, StyleSheet
import {
    TextInput,
    Text,
    Card,
    RadioButton,
    Button,
    useTheme,
    Badge,
    ActivityIndicator // Added ActivityIndicator
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useFetchShippingRules } from '../../../../../api/hooks/useFetchShippingRules';
// ProductWorkflowContext was imported but not used in the provided snippet, removing for now.
// If it's needed by any hooks or logic not shown, it can be re-added.
// import { ProductWorkflowContext } from '../../../../../components/ProductWorkflowContext';
import Fuse from 'fuse.js'; // Keeping Fuse.js as it's in your provided code for this screen
import { useRouter } from 'expo-router'; // router was imported twice
import { computeProductSimilarityScore } from '../../../../../utils/computeProductSimilarityScore';
import { setNewShippingRule, setSelectedExistingShippingRuleId } from "../../../../../store/shippingRuleSlice"; // Ensure path is correct
import { formatShippingRuleSummary } from "../../../../../utils/formatShippingRuleSummary";
import {ProductWorkflowContext} from "../../../../../components/ProductWorkflowContext";

const IS_WEB = Platform.OS === 'web';

export default function SelectExistingShippingRule() {
    const theme = useTheme();
    const styles = makeStyles(theme); // Create styles
    const dispatch = useDispatch();
    const router = useRouter();

    const { storeId } = useSelector((state) => state.store);
    const newProductInfo = useSelector((state) => state.newProduct);

    const { data: shippingRules = [], isLoading } = useFetchShippingRules(storeId, true); // Assuming 'true' enables query
    const initialSelectedRuleId = useSelector((state) => state.shippingRule.selectedShippingRuleId); // From Redux
    const { setShippingChanged } = useContext(ProductWorkflowContext); // Re-added as it's used in handleConfirm

    const [searchQuery, setSearchQuery] = useState('');
    const [localSelectedRuleId, setLocalSelectedRuleId] = useState(initialSelectedRuleId || null);

    // Sync localSelectedRuleId if initialSelectedRuleId from Redux changes
    React.useEffect(() => {
        setLocalSelectedRuleId(initialSelectedRuleId || null);
    }, [initialSelectedRuleId]);

    const scoredAndSortedRules = useMemo(() => {
        if (!shippingRules || shippingRules.length === 0) return [];
        const scored = shippingRules.map(rule => ({
            ...rule,
            similarityScore: newProductInfo ? computeProductSimilarityScore(newProductInfo, rule) : 0
        }));
        return scored.sort((a, b) => b.similarityScore - a.similarityScore);
    }, [shippingRules, newProductInfo]);

    // Using Fuse.js as per your provided code for this screen
    const fuse = useMemo(() => new Fuse(scoredAndSortedRules, {
        keys: ['ruleName', 'conditions.when.country', 'conditions.when.state', 'conditions.when.city'], // Enhanced keys for better search
        threshold: 0.4, // Can be adjusted
    }), [scoredAndSortedRules]);

    const filteredRules = searchQuery
        ? fuse.search(searchQuery).map(r => r.item)
        : scoredAndSortedRules;

    const handleConfirm = () => {
        if (!localSelectedRuleId) return;
        const selectedRule = shippingRules.find((r) => r.shippingRuleId === localSelectedRuleId);
        if (!selectedRule) return;

        dispatch(setSelectedExistingShippingRuleId(localSelectedRuleId));
        // When selecting an existing rule, the "draft" should be a direct copy of it.
        // The preview screen will then use this draft.
        dispatch(setNewShippingRule({ ...selectedRule })); // Dispatch the full selected rule as the new draft
        setShippingChanged(true); // Indicate shipping info has been set/changed

        const webPath = '/(web_merchant)/(protected)/add_new_product/preview'; // Navigate to Preview
        const nativePath = '/Main/(tabs)/AddNewProduct/Preview';
        router.push(IS_WEB ? webPath : nativePath);
    };

    if (isLoading) {
        return (
            <View style={[styles.loaderContainer, {backgroundColor: theme.colors.white}]}>
                <ActivityIndicator animating={true} size="large" color={theme.colors.primary}/>
                <Text style={[styles.loadingText, {color: theme.colors.onSurface}]}>Loading shipping rules...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={[styles.scrollView, IS_WEB && {backgroundColor: theme.colors.white}]}
            contentContainerStyle={[styles.contentContainer, IS_WEB && styles.webContentContainer]}
        >
            <Text variant="headlineSmall" style={[styles.headerText, {color: theme.colors.onSurface}]}>
                Select an Existing Shipping Rule
            </Text>
            <Text variant="bodyMedium" style={[styles.subHeaderText, {color: theme.colors.onSurfaceVariant}]}>
                Choose a rule from your existing shipping configurations to apply to this product.
            </Text>

            <TextInput
                label="Search by Rule Name or Location"
                mode="outlined"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={[styles.searchInput, {backgroundColor: theme.colors.surface}]}
                left={<TextInput.Icon icon="magnify" />}
                // right={searchQuery ? <TextInput.Icon icon="close-circle" onPress={() => setSearchQuery('')} /> : null}
                clearButtonMode="while-editing"
            />

            {filteredRules.length === 0 && !isLoading && (
                <View style={[styles.noResultsContainer, {backgroundColor: theme.colors.surfaceVariant}]}>
                    <Text style={[styles.noResultsText, {color: theme.colors.onSurfaceVariant}]}>
                        {searchQuery ? "No shipping rules match your search." : "No existing shipping rules found."}
                    </Text>
                </View>
            )}

            <RadioButton.Group onValueChange={setLocalSelectedRuleId} value={localSelectedRuleId}>
                {filteredRules.map(rule => (
                    <Card
                        key={rule.shippingRuleId}
                        mode={'elevated'}
                        style={[
                            styles.cardStyle,
                            {
                                backgroundColor: theme.colors.surface,
                                borderColor: localSelectedRuleId === rule.shippingRuleId ? theme.colors.primary : (IS_WEB ? theme.colors.outlineVariant : theme.colors.surface)
                            }
                        ]}
                        onPress={() => setLocalSelectedRuleId(rule.shippingRuleId)}
                    >
                        <Card.Title
                            title={rule.ruleName}
                            titleStyle={[styles.cardTitle, {color: theme.colors.onSurface}]}
                            subtitle={formatShippingRuleSummary(rule)}
                            subtitleStyle={[styles.cardSubtitle, {color: theme.colors.onSurfaceVariant}]}
                            subtitleNumberOfLines={10} // Kept as original
                            right={(props) => (
                                <View style={styles.cardRightContainer}>
                                    {rule.similarityScore >= 20 && (
                                        <Badge
                                            style={[styles.badge, {backgroundColor: theme.colors.tertiaryContainer, color: theme.colors.onTertiaryContainer}]}
                                        >
                                            Best Match
                                        </Badge>
                                    )}
                                    <RadioButton.Android
                                        {...props}
                                        value={rule.shippingRuleId} // Ensure this is a string if RadioButton.Group expects string values
                                        color={theme.colors.primary}
                                    />
                                </View>
                            )}
                        />
                    </Card>
                ))}
            </RadioButton.Group>

            <View style={styles.confirmButtonContainer}>
                <Button
                    mode="contained"
                    onPress={handleConfirm}
                    disabled={!localSelectedRuleId}
                    style={styles.confirmButton}
                    icon="check-circle-outline"
                    contentStyle={{paddingVertical: 5}}
                >
                    Confirm Selection
                </Button>
            </View>
        </ScrollView>
    );
}

const makeStyles = (theme) => StyleSheet.create({
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    loadingText: {
        marginTop: 10,
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
    },
    webContentContainer: {
        maxWidth: 700,
        width: '100%',
        alignSelf: 'center',
        paddingHorizontal: 24,
        paddingVertical: 32,
    },
    headerText: {
        marginBottom: 8,
        textAlign: IS_WEB ? 'center' : 'left',
    },
    subHeaderText: {
        marginBottom: 24,
        textAlign: IS_WEB ? 'center' : 'left',
        fontSize: 14,
        lineHeight: 20,
    },
    searchInput: {
        marginBottom: 20,
    },
    noResultsContainer: {
        alignItems: 'center',
        marginVertical: 30,
        padding: 16,
        borderRadius: 8,
    },
    noResultsText: {
        fontSize: 16,
        textAlign: 'center',
    },
    cardStyle: {
        marginBottom: 16,
        borderRadius: IS_WEB ? 8 : 0,
        borderWidth: 1.5,
        padding: 8,
    },
    cardTitle: {
        // fontWeight: 'bold',
    },
    cardSubtitle: {
        fontSize: 13,
        lineHeight: 18,
    },
    cardRightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: IS_WEB ? 8 : 0,
    },
    badge: {
        marginRight: 12,
        paddingHorizontal: 8,
    },
    confirmButtonContainer: {
        alignSelf: 'center',
        marginTop: 32,
        width: IS_WEB ? 'auto' : '90%',
        maxWidth: IS_WEB ? 350 : undefined,
    },
    confirmButton: {
        borderRadius: 8,
    }
});