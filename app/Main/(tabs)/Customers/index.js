import React, { useMemo, useState, useCallback } from "react"; // Added useCallback
import {FlatList, View, StyleSheet, Pressable, Platform, useWindowDimensions, ActivityIndicator } from "react-native"; // Added Platform, useWindowDimensions, ActivityIndicator
import {
    TextInput,
    Text,
    List,
    Chip,
    // RadioButton, // Not used in this specific JSX, but keep if original had it
    // Surface, // Replaced with View for loading/error
    Divider,
    useTheme,
    Card
} from "react-native-paper";
import Fuse from "fuse.js";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // For potential error icon
import { CustomerListItem } from "../../../../components/CustomerListItem";
import MaterialIcons from "@expo/vector-icons/MaterialIcons"; // Used in Accordion
import { useCustomers } from "../../../../api/hooks/useCustomers";
import {useSelector} from "react-redux";
import KeyboardAwareView from "../../../../components/KeyboardAwareView";

const IS_WEB = Platform.OS === 'web';

// Define SearchFilterAndSort outside the Customers component for stability
const SearchFilterAndSort = React.memo(({
                                            theme, styles, IS_WEB,
                                            filterExpanded, setFilterExpanded,
                                            selectedQuickFilters, setSelectedQuickFilters,
                                            QUICK_FILTER_ROWS, INCOMPATIBLE_FILTERS,
                                            searchQuery, setSearchQuery,
                                            filteredCustomersCount
                                        }) => {
    // This is the exact JSX from your original searchFilterAndSortComponent function
    return (
        <View style={{ marginTop: IS_WEB ? 0 : 20, marginBottom: 10}}>
            <Card style={{backgroundColor: theme.colors.surface, borderRadius: 0}} mode={'elevated'}>
                <List.Accordion
                    title={"Sort"} // Original title
                    expanded={filterExpanded}
                    onPress={() => setFilterExpanded(!filterExpanded)}
                    style={styles.accordionBar} // Original style
                    titleStyle={styles.accordionTitle} // Original style
                    contentStyle={styles.accordionContent} // Original style
                    right={() => ( // Original icon structure
                        <View style={{ height: 50, justifyContent: "center", alignItems: "center" }}>
                            <MaterialIcons
                                name={filterExpanded ? "expand-more" : "expand-less"} // Original icon logic
                                size={28}
                                color={"black"} // Original color
                            />
                        </View>
                    )}
                >
                    <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
                        {QUICK_FILTER_ROWS.map((row, rowIndex) => (
                            <View
                                key={rowIndex}
                                style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 8 }}
                            >
                                {row.map(({ key, label }) => (
                                    <Chip
                                        key={key}
                                        selected={selectedQuickFilters.includes(key)}
                                        onPress={() => { // Original onPress logic for quick filter chips
                                            let updated = [];
                                            const isSelected = selectedQuickFilters.includes(key);
                                            if (isSelected) {
                                                updated = selectedQuickFilters.filter((f) => f !== key);
                                            } else {
                                                const incompatible = INCOMPATIBLE_FILTERS[key] || [];
                                                updated = selectedQuickFilters
                                                    .filter((f) => !incompatible.includes(f))
                                                    .concat(key);
                                            }
                                            if (updated.length === 0) updated = ["most_recent"]; // Default
                                            setSelectedQuickFilters(updated);
                                        }}
                                        // Original Inline Styles for these chips
                                        style={{
                                            margin: 2,
                                            backgroundColor: theme.colors.softPrimary,
                                            borderColor: "black",
                                        }}
                                        textStyle={{
                                            color: selectedQuickFilters.includes(key)
                                                ? "black"
                                                : theme.colors.primary,
                                        }}
                                        selectedColor={theme.colors.black}
                                    >
                                        {label}
                                    </Chip>
                                ))}
                            </View>
                        ))}
                    </View>
                </List.Accordion>
            </Card>
            <TextInput
                label="Search Customers"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchBar} // Original style
                mode="outlined"
                left={<TextInput.Icon icon="magnify" />} // Added icon for better UX
            />
            <Divider style={{ marginVertical: 2 }} />
            <View style={{marginVertical: 10, paddingHorizontal: IS_WEB ? 0 : 0 /* Match original where this text had no extra padding from parent */ }}>
                <Text variant={"bodyLarge"} style={{ marginLeft: 10 }}>
                    {filteredCustomersCount.toString() +
                        " Customer" +
                        (filteredCustomersCount !== 1 ? "s" : "")}
                </Text>
            </View>
            <Divider style={{ marginVertical: 2 }} />
        </View>
    );
});


const Customers = () => {
    const {storeId} = useSelector((state) => state.store);
    const { data: customers = [], isLoading, isError } = useCustomers(storeId);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterExpanded, setFilterExpanded] = useState(false);
    const [selectedQuickFilters, setSelectedQuickFilters] = useState(["most_recent"]); // Original default

    const theme = useTheme();
    const { width: windowWidth } = useWindowDimensions();
    const styles = makeStyles(theme, IS_WEB, windowWidth); // Pass theme, IS_WEB, windowWidth

    // Original console.logs
    // console.log('customers:', customers);
    // console.log('customers[0].orders:', customers[0]?.orders); // Added optional chaining

    const fuse = useMemo(() => {
        return new Fuse(customers || [], { // Ensure customers is an array
            keys: ["fullName", "email", "phone"],
            threshold: 0.4,
            includeScore: false,
            ignoreLocation: true,
        });
    }, [customers]);

    // Original QUICK_FILTER_ROWS and INCOMPATIBLE_FILTERS (useMemo for stability if defined inside component)
    const QUICK_FILTER_ROWS = useMemo(() => [ [{ key: "most_spent", label: "Most Spent" }, { key: "least_spent", label: "Least Spent" }, ], [{ key: "highest_order_count", label: "Highest Order Count" }, { key: "lowest_order_count", label: "Lowest Order Count" }, ], [{ key: "most_recent", label: "Most Recently Ordered" }, { key: "ordered_long_ago", label: "Ordered Long Ago" }, ], ], []);
    const INCOMPATIBLE_FILTERS = useMemo(() => ({ most_spent: ["least_spent", "highest_order_count", "lowest_order_count", "most_recent", "ordered_long_ago"], least_spent: ["most_spent", "highest_order_count", "lowest_order_count", "most_recent", "ordered_long_ago"], highest_order_count: ["most_spent", "least_spent", "lowest_order_count", "most_recent", "ordered_long_ago"], lowest_order_count: ["most_spent", "least_spent", "highest_order_count", "most_recent", "ordered_long_ago"], most_recent: ["most_spent", "least_spent", "highest_order_count", "lowest_order_count", "ordered_long_ago"], ordered_long_ago: ["most_spent", "least_spent", "highest_order_count", "lowest_order_count", "most_recent"], }), []);


    const filteredCustomers = useMemo(() => {
        if (isLoading || isError || !customers) return [];

        let result = [...customers]; // Create a new array for mutation

        if (searchQuery.trim()) {
            const searchResults = fuse.search(searchQuery);
            result = searchResults.map((res) => res.item);
        }

        // Sorting - original logic implies selectedQuickFilters primarily drives sorting
        if (selectedQuickFilters.length > 0) {
            const sortKey = selectedQuickFilters[0]; // Assuming the first selected filter is the primary sort key
            result.sort((a, b) => {
                if (sortKey === "most_spent") return (b.totalSpent || 0) - (a.totalSpent || 0);
                if (sortKey === "least_spent") return (a.totalSpent || 0) - (b.totalSpent || 0);
                if (sortKey === "highest_order_count") return (b.orderCount || 0) - (a.orderCount || 0);
                if (sortKey === "lowest_order_count") return (a.orderCount || 0) - (b.orderCount || 0);
                if (sortKey === "most_recent" && a.mostRecentOrderDate && b.mostRecentOrderDate) return new Date(b.mostRecentOrderDate) - new Date(a.mostRecentOrderDate);
                if (sortKey === "ordered_long_ago" && a.mostRecentOrderDate && b.mostRecentOrderDate) return new Date(a.mostRecentOrderDate) - new Date(b.mostRecentOrderDate);
                return 0;
            });
        }
        return result;
    }, [customers, selectedQuickFilters, searchQuery, fuse, isLoading, isError]);

    const renderCustomerItem = ({ item }) => {
        return <CustomerListItem customer={item} />;
    };

    console.log('custs:', filteredCustomers.map((c) => c.totalSpent)); // Original console.log

    const loadingErrorContent = (message, isErrorState = false) => (
        <View style={IS_WEB ? styles.centeredWebMessageContent : styles.mobileCenteredFullScreen}>
            {isErrorState && <MaterialCommunityIcons name="alert-circle-outline" size={48} color={theme.colors.error} style={{ marginBottom: 10 }} />}
            {!isErrorState && <ActivityIndicator size={IS_WEB ? "large" : 100} color={theme.colors.primary} style={{ marginBottom: 10 }} />}
            <Text variant={isErrorState? "titleMedium" : "bodyLarge"}>{message}</Text>
        </View>
    );

    if (isLoading) {
        const loadingView = loadingErrorContent("Loading customers...");
        return IS_WEB
            ? <View style={styles.webPageContainer_Root}><View style={styles.webMaxContentContainer_Shell}>{loadingView}</View></View>
            : loadingView; // Mobile root for loading is styles.mobileCenteredFullScreen
    }

    if (isError) {
        const errorView = loadingErrorContent("Error Loading Customers", true);
        return IS_WEB
            ? <View style={styles.webPageContainer_Root}><View style={styles.webMaxContentContainer_Shell}>{errorView}</View></View>
            : errorView; // Mobile root for error is styles.mobileCenteredFullScreen
    }

    const flatListComponent = (
        <FlatList
            data={filteredCustomers}
            keyExtractor={(item) => item.customerId}
            renderItem={renderCustomerItem}
            ItemSeparatorComponent={() => <Divider style={{ marginVertical: 10 }} />}
            ListHeaderComponent={
                <SearchFilterAndSort
                    theme={theme}
                    styles={styles}
                    IS_WEB={IS_WEB}
                    filterExpanded={filterExpanded}
                    setFilterExpanded={setFilterExpanded}
                    selectedQuickFilters={selectedQuickFilters}
                    setSelectedQuickFilters={setSelectedQuickFilters}
                    QUICK_FILTER_ROWS={QUICK_FILTER_ROWS}
                    INCOMPATIBLE_FILTERS={INCOMPATIBLE_FILTERS}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    filteredCustomersCount={filteredCustomers.length}
                />
            }
            contentContainerStyle={{
                overflow: "visible", // Original
                padding: IS_WEB ? 2 : 2 // Original mobile padding
                // For web, padding is handled by webMaxContentContainer_Shell
            }}
            ListEmptyComponent={
                <View style={styles.emptyListContainer}>
                    <Text>
                        {searchQuery || (selectedQuickFilters.length > 0 && selectedQuickFilters[0] !== 'most_recent')
                            ? "No customers match your current filters."
                            : "No Customers Found"}
                    </Text>
                </View>
            }
            keyboardShouldPersistTaps="handled" // Good for search input
        />
    );

    if (IS_WEB) {
        return (
            <View style={styles.webPageContainer_Root}>
                <View style={styles.webMaxContentContainer_Shell}>
                    {flatListComponent}
                </View>
            </View>
        );
    } else { // Mobile
        return (
            <KeyboardAwareView
                backgroundColor={theme.colors.surface} // Original KAV prop
                containerStyle={styles.container}    // Original KAV prop, using styles.container
                keyboardVerticalOffset={0}            // Original KAV prop
            >
                {flatListComponent}
            </KeyboardAwareView>
        );
    }
};

const makeStyles = (theme, isWeb, windowWidth) => { // Added isWeb, windowWidth
    const { colors } = theme; // Original destructuring
    return StyleSheet.create({
        // --- Original Mobile Styles (MUST BE PRESERVED EXACTLY) ---
        container: { // Used for KAV's containerStyle on mobile & mobile full screen loading/error
            flex: 1,
            paddingHorizontal: 10,
            backgroundColor: colors.surface,
            // overflow: "visible", // This was on KAV's containerStyle in original
        },
        searchBar: {
            marginVertical: 10,
            backgroundColor: "white" // Original
        },
        accordionBar: { // Original
            backgroundColor: colors.softPrimary,
            height: 50,
            minHeight: 50,
            justifyContent: "center",
            alignItems: "center",
            // verticalAlign: "center", // Not valid, removed
            borderRadius: 0,
        },
        accordionContent: { // Original
            justifyContent: "center",
            backgroundColor: colors.white, // Added to match sortFilterContent expectation
        },
        accordionTitle: { // Original
            color: "black",
            fontSize: 16,
            fontWeight: "bold"
        },
        sortFilterContent: { // Original
            paddingBottom: 20,
            borderRadius: 0,
            backgroundColor: colors.white,
            borderColor: colors.grayBorder, // This was in original, ensure colors.grayBorder is defined
        },
        sectionTitle: { // Original
            fontSize: 16,
            fontWeight: "bold",
            marginVertical: 5,
            marginLeft: 10,
        },
        row: { // Original
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            padding: 0,
            margin: 0,
        },
        radioRow: { // Original
            flexDirection: "row",
            flexShrink: 1, // Original
        },
        radioItem: { // Original (Not directly used by Paper RadioButton.Item style prop, but for layout)
            marginHorizontal: 0,
            padding: 0,
            flexShrink: 1,
        },
        chip: { // Original (Generic chip style, specific chips might have inline overrides)
            margin: 0,
            alignSelf: "center",
            flexShrink: 0,
        },
        // Added styles from your previous Products.js that were missing in this file's original makeStyles
        // Ensure these match if they were indeed from the original Customers.js context
        input: { flex: 1, marginHorizontal: 5, backgroundColor: colors.white },
        flexWrapRow: { flexDirection: "row", flexWrap: "wrap", marginVertical: 10 },
        flexWrapRowCompact: { flexDirection: "row", flexWrap: "wrap", marginVertical: 5 },
        sortOrderChip: { margin: 0, padding: 0, backgroundColor: colors.white, },
        tagChip: { margin: 5, backgroundColor: colors.softSecondary, }, // This was for product tags, check if used for customers
        tagChipSelected: { backgroundColor: colors.secondary, },
        checkboxItemCompact: { flex: 1, marginHorizontal: 2, paddingVertical: 0, paddingHorizontal: 5, },
        radioLabel: { fontSize: 14, padding: 0, margin: 0 }, // For RadioButton.Item labelStyle
        checkboxLabel: {fontSize: 14}, // For Checkbox.Item labelStyle


        // --- New Web Layout Container Styles ---
        webPageContainer_Root: {
            flex: 1,
            backgroundColor: 'white',
            alignItems: 'center',
        },
        webMaxContentContainer_Shell: {
            width: '100%',
            maxWidth: 900, // Max width for the customers list and filters
            flex: 1,
            backgroundColor: colors.surface, // Match mobile KAV background
            paddingHorizontal: isWeb ? 10 : 0, // Match mobile KAV containerStyle padding
            paddingVertical: isWeb ? 20 : 0,   // Add some vertical padding for web shell
        },

        // --- Common Centered Styles (for loading/error) ---
        mobileCenteredFullScreen: { // For mobile loading/error states
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.surface, // Original background for these states
            padding: 20,
        },
        centeredWebMessageContent: { // For web loading/error content within the shell
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            padding: 20,
        },
        emptyListContainer: {
            flexGrow: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 50,
            paddingHorizontal: 20,
        }
    });
};

export default Customers;