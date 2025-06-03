import React, {useState, useEffect, useContext} from 'react'; // Added useEffect, useContext if needed by context/hooks below
import {Platform, ScrollView, View, StyleSheet} from "react-native"; // Added StyleSheet
import {Button, Card, RadioButton, Text, useTheme} from "react-native-paper";
// useState was already imported
import {useRouter} from "expo-router"; // router was imported twice, kept useRouter
import {useDispatch, useSelector} from "react-redux";
import {setShippingRuleChoice} from "../../../../../store/shippingRuleSlice"; // Ensure path is correct
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
// Removed ProductWorkflowContext import as it's not used in the provided snippet
// Removed useMemo import as it's not used

const IS_WEB = Platform.OS === "web";

export default function Shipping () {
    const router = useRouter();
    const dispatch = useDispatch();
    const theme = useTheme();
    const styles = makeStyles(theme); // Create styles using theme

    // Assuming shippingRuleChoice from Redux is the source of truth for initial state
    const initialShippingRuleChoice = useSelector((state) => state.shippingRule.shippingRuleChoice);
    const [localShippingRuleChoice, setLocalShippingRuleChoice] = useState(initialShippingRuleChoice || '');

    // If shippingRuleChoice from Redux changes (e.g. navigating back and it was updated), sync local state
    useEffect(() => {
        setLocalShippingRuleChoice(initialShippingRuleChoice || '');
    }, [initialShippingRuleChoice]);


    const handleShippingRuleChoiceConfirm = () => {
        if (!localShippingRuleChoice) return;
        // No need to setLocalShippingRuleChoice(localShippingRuleChoice) again here, it's already set by onPress
        dispatch(setShippingRuleChoice(localShippingRuleChoice));

        if (localShippingRuleChoice === 'useExisting') {
            router.push(IS_WEB ? '/(web_merchant)/(protected)/add_new_product/shipping/select_existing' : '/Main/(tabs)/AddNewProduct/Shipping/SelectExistingShippingRule');
        }
        else if (localShippingRuleChoice === 'cloneExisting') {
            router.push(IS_WEB ? '/(web_merchant)/(protected)/add_new_product/shipping/clone_existing' : '/Main/(tabs)/AddNewProduct/Shipping/CloneExistingShippingRule');
        }
        else if (localShippingRuleChoice === 'createNew') {
            router.push(IS_WEB ? '/(web_merchant)/(protected)/add_new_product/shipping/create_new' : '/Main/(tabs)/AddNewProduct/Shipping/CreateNewShippingRule');
        }
        else if (localShippingRuleChoice === 'noShipping') {
            router.push(IS_WEB ? '/(web_merchant)/(protected)/add_new_product/preview' : '/Main/(tabs)/AddNewProduct/Preview');
        }
    }

    const renderCardOption = (value, title, subtitle, iconName) => (
        <Card
            mode={'elevated'}
            style={[
                styles.cardStyle,
                {
                    backgroundColor: theme.colors.surface, // Original was 'white'
                    borderColor: localShippingRuleChoice === value ? theme.colors.primary : (IS_WEB ? theme.colors.outlineVariant : theme.colors.surface) // Subtle border for web
                }
            ]}
            onPress={() => setLocalShippingRuleChoice(value)}
        >
            <Card.Title
                title={title}
                titleStyle={styles.cardTitle} // Added for consistency
                subtitle={subtitle}
                subtitleStyle={styles.cardSubtitle} // Added for consistency
                subtitleNumberOfLines={2} // Ensure subtitle doesn't take too much space
                left={(props) => <MaterialIcons {...props} name={iconName} size={32} color={theme.colors.primary} />} // Themed icon color
                right={(props) => (
                    <RadioButton.Android
                        {...props}
                        value={value}
                        status={localShippingRuleChoice === value ? 'checked' : 'unchecked'}
                        color={theme.colors.primary} // Themed radio button
                    />
                )}
            />
        </Card>
    );

    return (
        <ScrollView
            style={[styles.scrollView, IS_WEB && {backgroundColor: 'white'}]} // Web gets overall background
            contentContainerStyle={[styles.contentContainer, IS_WEB && styles.webContentContainer]}
        >
            <Text variant="headlineSmall" style={styles.headerText}>Configure Shipping</Text>
            <Text variant="bodyMedium" style={styles.subHeaderText}>How would you like to set up shipping for this new product?</Text>

            {renderCardOption('useExisting', 'Use an Existing Shipping Rule', 'Assign a previously created or shared shipping rule.', 'check-box')}
            {renderCardOption('cloneExisting', 'Copy and Edit an Existing Rule', 'Duplicate and customize an existing rule.', 'content-copy')}
            {renderCardOption('createNew', 'Create a New Shipping Rule', 'Define a brand new shipping rule specifically for this product or for sharing.', 'add')}
            {renderCardOption('noShipping', 'No Shipping Required', 'This product does not require shipping (e.g., digital good, local pickup only).', 'block')}

            <View style={styles.confirmButtonContainer}>
                <Button
                    mode="contained"
                    style={styles.confirmButton}
                    disabled={!localShippingRuleChoice}
                    onPress={handleShippingRuleChoiceConfirm}
                    icon="arrow-right-circle-outline"
                    contentStyle={{paddingVertical: 5}} // Make button slightly taller
                >
                    Continue
                </Button>
            </View>
        </ScrollView>
    );
}

const makeStyles = (theme) => StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    contentContainer: { // For mobile
        padding: 16,
    },
    webContentContainer: { // For web
        maxWidth: 700,
        width: '100%',
        alignSelf: 'center',
        paddingHorizontal: 24, // More horizontal padding for web
        paddingVertical: 32,   // More vertical padding for web
    },
    headerText: {
        marginBottom: 8,
        textAlign: IS_WEB ? 'center' : 'left',
        color: theme.colors.onSurface,
    },
    subHeaderText: {
        marginBottom: 24,
        textAlign: IS_WEB ? 'center' : 'left',
        color: theme.colors.onSurfaceVariant,
    },
    cardStyle: {
        marginBottom: 16,
        borderRadius: IS_WEB ? 8 : 0, // Slightly rounded corners for web cards
        borderWidth: 1.5, // Consistent border width
    },
    cardTitle: {
        // fontSize: 16, // Default should be fine, or adjust as needed
        // fontWeight: 'bold',
    },
    cardSubtitle: {
        // fontSize: 14,
        // color: theme.colors.onSurfaceVariant,
    },
    confirmButtonContainer: {
        alignSelf: 'center', // Centers button in both mobile and web (within its container)
        marginTop: 24,
        width: IS_WEB ? 'auto' : '80%', // Auto width for web, 80% for mobile
        maxWidth: IS_WEB ? 300 : undefined,
    },
    confirmButton: {
        borderRadius: 8, // Consistent with other buttons
        // width: '100%', // Button takes width of its container
    }
});