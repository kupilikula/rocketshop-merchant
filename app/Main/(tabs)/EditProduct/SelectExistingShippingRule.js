import React, { useState, useContext, useMemo } from 'react';
import { View, ScrollView, Platform, StyleSheet } from 'react-native'; // Added Platform, StyleSheet
import { TextInput, Text, Card, RadioButton, Button, useTheme, Badge, ActivityIndicator } from 'react-native-paper'; // Added ActivityIndicator
import {useDispatch, useSelector} from 'react-redux';
import { useFetchShippingRules } from '../../../../api/hooks/useFetchShippingRules';
import { ProductWorkflowContext } from '../../../../components/ProductWorkflowContext';
import Fuse from 'fuse.js';
import { useRouter } from 'expo-router'; // router was imported twice, kept useRouter
import {computeProductSimilarityScore} from "../../../../utils/computeProductSimilarityScore";
import {formatShippingRuleSummary} from "../../../../utils/formatShippingRuleSummary";
import {updateField as updateEditProductField} from "../../../../store/editProductSlice";
import {DefaultTheme as theme} from "@react-navigation/native";

const IS_WEB = Platform.OS === 'web'; // Define IS_WEB

export default function SelectExistingShippingRule() {
    const theme = useTheme();
    const dispatch = useDispatch();
    const router = useRouter();
    const { storeId } = useSelector((state) => state.store);
    const editProductInfo = useSelector((state) => state.editProduct);

    const { data: shippingRules = [], isLoading } = useFetchShippingRules(storeId, true); // Assuming 'true' enables the query
    // const {selectedShippingRuleId} = useSelector((state) => state.shippingRule); // This seems to be from a different slice, using local state for selection
    const [searchQuery, setSearchQuery] = useState('');
    const [localSelectedRuleId, setLocalSelectedRuleId] = useState(null); // Initialize with null
    const {setShippingChanged} = useContext(ProductWorkflowContext);


    const scoredAndSortedRules = useMemo(() => {
        if (!shippingRules || shippingRules.length === 0) return [];
        const scored = shippingRules.map(rule => ({
            ...rule,
            similarityScore: computeProductSimilarityScore(editProductInfo, rule)
        }));

        return scored.sort((a, b) => b.similarityScore - a.similarityScore);
    }, [shippingRules, editProductInfo]);

    const fuse = useMemo(() => new Fuse(scoredAndSortedRules, { // Memoize Fuse instance
        keys: ['ruleName', 'conditions.when.country', 'conditions.when.state', 'conditions.when.city'], // Added more keys for better search
        threshold: 0.4, // Adjusted threshold slightly
        includeScore: false, // No need for score from Fuse here as we use similarityScore
    }), [scoredAndSortedRules]);

    const filteredRules = searchQuery
        ? fuse.search(searchQuery).map(result => result.item)
        : scoredAndSortedRules;

    const handleConfirm = () => {
        if (!localSelectedRuleId) return;
        const selectedRule = shippingRules.find((r) => r.shippingRuleId === localSelectedRuleId);
        if (!selectedRule) return; // Should not happen if localSelectedRuleId is valid

        dispatch(updateEditProductField({ field: 'shippingRuleChoice', value: 'assignExisting' }));
        dispatch(updateEditProductField({ field: 'shippingRuleDraft', value: selectedRule }));
        setShippingChanged(true); // Indicate that shipping info might have changed

        // Navigate to the preview screen (EditPreview)
        const webPath = '/(web_merchant)/(protected)/edit_product/preview'; // Adjust your web path
        const nativePath = '/Main/(tabs)/EditProduct/EditPreview';
        router.push(IS_WEB ? webPath : nativePath);
    };

    if (isLoading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator animating={true} size="large" color={theme.colors.primary}/>
                <Text style={{ marginTop: 10, color: theme.colors.onSurface }}>Loading shipping rules...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={[styles.scrollView, IS_WEB && styles.webScrollViewContainer]}
            contentContainerStyle={[styles.scrollViewContentContainer, IS_WEB && styles.webScrollViewContent]}
        >
            <TextInput
                label="Search by Rule Name or Location"
                mode="outlined"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
                left={<TextInput.Icon icon="magnify" />}
                clearButtonMode="while-editing" // For native
            />

            {filteredRules.length === 0 && !isLoading && (
                <View style={styles.noResultsContainer}>
                    <Text style={styles.noResultsText}>
                        {searchQuery ? "No shipping rules match your search." : "No shipping rules available to select."}
                    </Text>
                    {/* Optionally, add a button to create a new shipping rule if none exist */}
                </View>
            )}

            <RadioButton.Group onValueChange={setLocalSelectedRuleId} value={localSelectedRuleId}>
                {filteredRules.map(rule => (
                    <Card
                        key={rule.shippingRuleId}
                        mode={'elevated'}
                        style={[
                            styles.card,
                            { borderColor: localSelectedRuleId === rule.shippingRuleId ? theme.colors.primary : (IS_WEB ? theme.colors.outlineVariant : theme.colors.surface) }
                        ]}
                        onPress={() => setLocalSelectedRuleId(rule.shippingRuleId)}
                    >
                        <Card.Title
                            title={rule.ruleName}
                            titleStyle={styles.cardTitle}
                            titleNumberOfLines={2}
                            subtitle={formatShippingRuleSummary(rule)}
                            subtitleStyle={styles.cardSubtitle}
                            subtitleNumberOfLines={10} // Kept as per original, but consider impact on web
                            right={(props) => (
                                <View style={styles.cardRightContainer}>
                                    {rule.similarityScore >= 20 && ( // Assuming similarityScore is scaled 0-100 or similar
                                        <Badge
                                            style={styles.badge}
                                            theme={{ colors: { primary: theme.colors.tertiaryContainer } }} // Using tertiary for badge
                                        >
                                            Best Match
                                        </Badge>
                                    )}
                                    <RadioButton.Android
                                        {...props}
                                        value={rule.shippingRuleId}
                                        color={theme.colors.primary} // Explicitly set color
                                    />
                                </View>
                            )}
                        />
                    </Card>
                ))}
            </RadioButton.Group>

            <View style={styles.buttonContainer}>
                <Button
                    mode="contained"
                    onPress={handleConfirm}
                    disabled={!localSelectedRuleId}
                    style={styles.confirmButton}
                    icon="check"
                >
                    Confirm Selection
                </Button>
            </View>
        </ScrollView>
    );
}

// Basic StyleSheet for structure and web adaptations
const styles = StyleSheet.create({
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    scrollView: {
        flex: 1,
        backgroundColor: 'white',
        // backgroundColor: theme.colors.surface, // Apply in component if theme needed
    },
    webScrollViewContainer: { // For the ScrollView itself on web
        // e.g. if you need specific border or something for the scrollable area
    },
    scrollViewContentContainer: { // For the content within ScrollView
        padding: 16,
    },
    webScrollViewContent: { // Web specific overrides for content container
        maxWidth: 700,
        width: '100%',
        alignSelf: 'center', // Center the content block on web
        paddingVertical: 24, // More vertical padding on web
    },
    searchInput: {
        marginBottom: 16,
        // backgroundColor: theme.colors.surface, // Apply in component if theme needed
    },
    noResultsContainer: {
        alignItems: 'center',
        marginVertical: 30,
    },
    noResultsText: {
        fontSize: 16,
        // color: theme.colors.onSurfaceVariant, // Apply in component if theme needed
    },
    card: {
        backgroundColor: 'white',
        marginBottom: 16,
        paddingVertical: 8, // Original padding was 8 on all sides, this targets vertical.
        paddingHorizontal: 8, // Horizontal padding
        borderRadius: IS_WEB ? 8 : 0, // More rounded on web, original was 0
        // backgroundColor: theme.colors.surface, // Apply in component
        borderWidth: 1.5, // Slightly thicker border for selection indication
    },
    cardTitle: {
        fontWeight: 'bold', // Make title stand out
    },
    cardSubtitle: {
        fontSize: 13, // Slightly smaller subtitle
        lineHeight: 18,
    },
    cardRightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: IS_WEB ? 8 : 0, // Ensure radio button isn't too close to edge on web
    },
    badge: {
        // backgroundColor: theme.colors.secondary, // Apply in component using theme prop for Badge
        color: 'white', // Ensure text is visible on badge, RNP Badge handles this
        marginRight: 12, // More space between badge and radio
        paddingHorizontal: 8,
        // borderRadius: 4, // RNP Badge default is pill-shaped
        // borderRadius: 0, // As per original
    },
    buttonContainer: {
        alignSelf: 'center', // Center the button
        marginTop: 24,
        marginBottom: IS_WEB ? 24 : 8, // More bottom margin on web
    },
    confirmButton: {
        borderRadius: 8,
        paddingHorizontal: 16, // Make button a bit wider
    }
});