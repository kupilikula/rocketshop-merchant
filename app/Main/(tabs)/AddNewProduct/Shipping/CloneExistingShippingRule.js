import React, { useState, useMemo, useContext } from 'react';
import { ScrollView, View, Platform, StyleSheet } from 'react-native';
import {
    Text,
    TextInput,
    Card,
    RadioButton,
    Button,
    useTheme,
    Badge,
    ActivityIndicator,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { useFetchShippingRules } from '../../../../../api/hooks/useFetchShippingRules';
import { computeProductSimilarityScore } from '../../../../../utils/computeProductSimilarityScore';
import { formatShippingRuleSummary } from '../../../../../utils/formatShippingRuleSummary';
import {
    setNewShippingRule,
} from '../../../../../store/shippingRuleSlice'; // Ensure path is correct

const IS_WEB = Platform.OS === 'web';

export default function CloneExistingRuleSelector() {
    const theme = useTheme();
    const styles = makeStyles(theme);
    const router = useRouter();
    const dispatch = useDispatch();

    const { storeId } = useSelector((state) => state.store);
    const newProductInfo = useSelector((state) => state.newProduct);

    const { data: shippingRules = [], isLoading } = useFetchShippingRules(storeId, true);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRuleId, setSelectedRuleId] = useState(null);

    const scoredRules = useMemo(() => {
        if (!shippingRules || shippingRules.length === 0) return [];
        return shippingRules.map(rule => ({
            ...rule,
            similarityScore: newProductInfo ? computeProductSimilarityScore(newProductInfo, rule) : 0
        })).sort((a, b) => b.similarityScore - a.similarityScore);
    }, [shippingRules, newProductInfo]);

    // Reverted to original filtering logic
    const filteredRules = useMemo(() => {
        if (!searchQuery) return scoredRules;
        return scoredRules.filter(rule =>
            rule.ruleName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, scoredRules]);

    const handleCloneAndEdit = () => {
        const selectedRuleToClone = shippingRules.find(r => r.shippingRuleId === selectedRuleId);
        if (!selectedRuleToClone) return;

        const clonedRuleForEditor = {
            ...selectedRuleToClone,
            ruleName: `${selectedRuleToClone.ruleName} (Copy)`,
            groupingEnabled: false,
            is_international_shipping_enabled: selectedRuleToClone.is_international_shipping_enabled,
            isActive: true,
            conditions: selectedRuleToClone.conditions.map(c => {
                const { id, shippingRuleId, ...conditionData } = c;
                return conditionData;
            }),
            shippingRuleId: undefined,
        };
        delete clonedRuleForEditor.id;
        delete clonedRuleForEditor.usageCount;
        delete clonedRuleForEditor.similarityScore;

        dispatch(setNewShippingRule(clonedRuleForEditor));

        const webPath = '/(web_merchant)/(protected)/add_new_product/shipping/create_new';
        const nativePath = '/Main/(tabs)/AddNewProduct/Shipping/CreateNewShippingRule';
        router.push(IS_WEB ? webPath : nativePath);
    };

    if (isLoading) {
        return (
            <View style={[styles.loaderContainer, {backgroundColor: theme.colors.background}]}>
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
                Copy and Edit an Existing Rule
            </Text>
            <Text variant="bodyMedium" style={[styles.subHeaderText, {color: theme.colors.onSurfaceVariant}]}>
                Select a rule to use as a template. It will be copied, and you can then customize it for this product. The original rule will not be affected.
            </Text>

            <TextInput
                label="Search by Rule Name" // Updated label to reflect filtering capability
                mode="outlined"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={[styles.searchInput, {backgroundColor: theme.colors.surface}]}
                left={<TextInput.Icon icon="magnify" />}
                clearButtonMode="while-editing" // More common for native, web browsers have own clear
                // For web, you might want to add a clear button manually if TextInput.Icon doesn't provide it cross-platform easily
                // right={searchQuery ? <TextInput.Icon icon="close-circle" onPress={() => setSearchQuery('')} /> : null}
            />

            {filteredRules.length === 0 && !isLoading && (
                <View style={[styles.noResultsContainer, {backgroundColor: theme.colors.surfaceVariant}]}>
                    <Text style={[styles.noResultsText, {color: theme.colors.onSurfaceVariant}]}>
                        {searchQuery ? "No shipping rules match your search." : "No shipping rules available to clone."}
                    </Text>
                </View>
            )}

            <RadioButton.Group onValueChange={setSelectedRuleId} value={selectedRuleId}>
                {filteredRules.map(rule => (
                    <Card
                        key={rule.shippingRuleId}
                        mode={'elevated'}
                        style={[
                            styles.cardStyle,
                            {
                                backgroundColor: theme.colors.surface,
                                borderColor: selectedRuleId === rule.shippingRuleId ? theme.colors.primary : (IS_WEB ? theme.colors.outlineVariant : theme.colors.surface)
                            }
                        ]}
                        onPress={() => setSelectedRuleId(rule.shippingRuleId)}
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
                                            // theme prop for Badge in RNP v5 is different, color on style might be better
                                        >
                                            Best Match
                                        </Badge>
                                    )}
                                    <RadioButton.Android
                                        {...props}
                                        value={rule.shippingRuleId}
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
                    onPress={handleCloneAndEdit}
                    disabled={!selectedRuleId}
                    style={styles.confirmButton}
                    icon="content-copy"
                    contentStyle={{paddingVertical: 5}}
                >
                    Clone and Edit Selected Rule
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
        // backgroundColor: theme.colors.background, // Applied inline
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
        // backgroundColor: theme.colors.surfaceVariant, // Applied inline
    },
    noResultsText: {
        fontSize: 16,
        textAlign: 'center',
    },
    cardStyle: {
        marginBottom: 16,
        borderRadius: IS_WEB ? 8 : 0,
        borderWidth: 1.5,
    },
    cardTitle: {
        // Styles for Card Title if needed beyond default
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
        // RNP Badge text color is usually handled by its theme or contrasts with its BG
        // color: theme.colors.onTertiaryContainer, // explicit text color for badge
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