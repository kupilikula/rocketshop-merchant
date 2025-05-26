import React, { useMemo } from "react";
import {
    ScrollView as DefaultScrollView, // Renamed to avoid conflict if a custom ScrollView was intended
    View,
    StyleSheet,
    ActivityIndicator,
    Platform, // Added Platform
    useWindowDimensions // Added useWindowDimensions
} from "react-native";
import { Text, Divider, useTheme, Card } from "react-native-paper"; // Image was imported but not used directly in this file
import { useRouter, useLocalSearchParams } from "expo-router";
import { useCustomerDetails } from "../../../../api/hooks/useCustomerDetails";
import {useSelector} from "react-redux";
// import {formatDate} from "date-fns"; // formatDate from date-fns was imported but not used
import {formatDateTime} from "../../../../utils/date"; // formatDateTime is used
import {CustomerOrders} from "../../../../components/CustomerOrders";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"; // For error icon

const IS_WEB = Platform.OS === 'web';

const CustomerDetails = () => {
    const theme = useTheme();
    const router = useRouter(); // Retained as in original
    const {storeId} = useSelector( (state) => state.store);
    const { customerId } = useLocalSearchParams();
    const { data: customer, isLoading, isError } = useCustomerDetails(storeId, customerId);
    const { width: windowWidth } = useWindowDimensions(); // For makeStyles if needed
    const styles = makeStyles(theme, IS_WEB, windowWidth); // Pass theme & IS_WEB

    console.log('customer:', customer); // Original console.log

    // pageContent can be defined as a function or directly inlined
    const pageContent = useMemo(() => {
        if (!customer) return null; // Should be caught by isError/isLoading or post-load check
        return (
            <>
                {/* Customer Info */}
                <Card style={styles.section}>
                    <Text style={styles.sectionTitle}>Customer Information</Text>
                    <Text style={styles.infoText}>Name: {customer.fullName}</Text>
                    <Text style={styles.infoText}>Phone: {customer.phone || "N/A"}</Text>
                    <Text style={styles.infoText}>Email: {customer.email || "N/A"}</Text>
                    <Text style={styles.infoText}>Address: {customer.customerAddress || "N/A"}</Text>
                </Card>

                {/* Customer Statistics */}
                <Card style={styles.section}>
                    <Text style={styles.sectionTitle}>Customer Statistics</Text>
                    <Text style={styles.infoText}>
                        Total Orders: {customer.orderCount || 0}
                    </Text>
                    <Text style={styles.infoText}>Total Spent: ₹{customer.totalSpent || 0}</Text>
                    <Text style={styles.infoText}>
                        Most Recent Order:{" "}
                        {customer.mostRecentOrderDate
                            ? formatDateTime(new Date(customer.mostRecentOrderDate))
                            : "N/A"}
                    </Text>
                </Card>

                {/* Orders List */}
                <Card style={styles.section}>
                    <Text style={styles.sectionTitle}>Orders</Text>
                    <CustomerOrders customerId={customerId} />
                </Card>
            </>
        );
    }, [customer, styles, customerId, theme]); // Dependencies for useMemo

    // Loading state
    if (isLoading) {
        const loadingIndicator = <ActivityIndicator size="large" animating={true} color={theme.colors.primary} style={{ marginTop: 30 }}/>;
        if (IS_WEB) {
            return (
                <View style={styles.webPageContainer_Root}>
                    <DefaultScrollView style={styles.webScrollView_Shell} contentContainerStyle={styles.webScrollViewContentContainer_Shell_CenteredFlex}>
                        {loadingIndicator}
                    </DefaultScrollView>
                </View>
            );
        }
        // Mobile loading: ActivityIndicator at the top of a ScrollView styled by styles.container
        return (
            <DefaultScrollView style={styles.container}>
                {loadingIndicator}
            </DefaultScrollView>
        );
    }

    // Error state (including if customer is null after loading)
    if (isError || !customer) {
        const errorMessage = customer ? "Error loading customer details." : "Customer not found.";
        const errorContent = (
            <View style={styles.messageContentWrapper}>
                <MaterialCommunityIcons name="alert-circle-outline" size={48} color={theme.colors.error} style={{marginBottom:10}} />
                <Text variant="titleMedium">{errorMessage}</Text>
            </View>
        );
        if (IS_WEB) {
            return (
                <View style={styles.webPageContainer_Root}>
                    <DefaultScrollView style={styles.webScrollView_Shell} contentContainerStyle={styles.webScrollViewContentContainer_Shell_CenteredFlex}>
                        {errorContent}
                    </DefaultScrollView>
                </View>
            );
        }
        // Mobile error: Text at the top of a ScrollView styled by styles.container
        return (
            <DefaultScrollView style={styles.container}>
                {errorContent}
            </DefaultScrollView>
        );
    }

    // Main content rendering
    if (IS_WEB) {
        return (
            <View style={styles.webPageContainer_Root}>
                <DefaultScrollView
                    style={styles.webScrollView_Shell}
                    contentContainerStyle={styles.webScrollViewContentContainer_Shell}
                >
                    {pageContent}
                </DefaultScrollView>
            </View>
        );
    } else { // Mobile
        return (
            // Original mobile root was ScrollView directly, styled by styles.container
            <DefaultScrollView style={styles.container}>
                {pageContent}
            </DefaultScrollView>
        );
    }
};

const makeStyles = (theme, isWeb, windowWidth) => { // Added isWeb, windowWidth
    const { colors } = theme; // Original destructuring
    return StyleSheet.create({
        // --- Original Mobile Styles (MUST BE PRESERVED EXACTLY) ---
        container: { // For the root ScrollView on MOBILE, and mobile loading/error ScrollView
            flex: 1,
            padding: 10,
            backgroundColor: colors.surface,
            // Original did not have justifyContent or alignItems here. Content flows from top.
        },
        section: { // Original style for Cards
            marginBottom: 20,
            padding: 10,
            backgroundColor: colors.card, // Ensure colors.card is defined in your theme
            borderRadius: 8,
            elevation: 2,
        },
        sectionTitle: { // Original style
            fontWeight: "bold",
            fontSize: 18,
            marginBottom: 10,
            color: colors.onSurface, // Ensure good contrast
        },
        infoText: { // Original style
            fontSize: 16,
            marginBottom: 5,
            color: colors.onSurfaceVariant, // Ensure good contrast
        },
        // orderCard and orderId were defined in original makeStyles but are likely used within CustomerOrders component
        orderCard: {
            padding: 10,
            marginVertical: 5,
            backgroundColor: colors.softPrimary, // Ensure colors.softPrimary is defined
            borderRadius: 8,
            elevation: 2,
        },
        orderId: {
            fontWeight: "bold",
            marginBottom: 5,
        },

        // --- New Web Layout Container Styles ---
        webPageContainer_Root: {
            flex: 1,
            backgroundColor: 'white',
            alignItems: 'center', // Centers the shell
        },
        webScrollView_Shell: { // The ScrollView component itself on web
            width: '100%',
            maxWidth: 768,      // Max width for customer details content
            flex: 1,
            backgroundColor: colors.surface, // Matches mobile styles.container background
        },
        webScrollViewContentContainer_Shell: { // contentContainerStyle for the web ScrollView (main content)
            padding: 10,        // Matches mobile styles.container.padding
            flexGrow: 1,        // Allows content to scroll
            // justifyContent: 'flex-start', // Default, content starts at top
        },
        webScrollViewContentContainer_Shell_CenteredFlex: { // For web loading/error, to center content
            padding: 10,
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        messageContentWrapper: { // Wrapper for text/indicator in loading/error states
            alignItems: 'center',
            paddingTop: 30, // Give some space from top if not fully centered by flex
            paddingHorizontal: 10,
        }
    });
};

export default CustomerDetails;