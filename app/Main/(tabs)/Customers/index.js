import React, { useMemo, useState } from "react";
import {FlatList, View, StyleSheet } from "react-native";
import {
    TextInput,
    Text,
    List,
    Chip,
    RadioButton,
    Surface,
    Divider,
    useTheme,
    ActivityIndicator, Card
} from "react-native-paper";
import Fuse from "fuse.js";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CustomerListItem } from "../../../../components/CustomerListItem";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useCustomers } from "../../../../api/hooks/useCustomers";
import {useSelector} from "react-redux";
import KeyboardAwareView from "../../../../components/KeyboardAwareView"; // Custom hook for fetching customers

const Customers = () => {
    const {storeId} = useSelector((state) => state.store);
    const { data: customers = [], isLoading, isError } = useCustomers(storeId); // Use the custom hook
    const [searchQuery, setSearchQuery] = useState("");
    const [filterExpanded, setFilterExpanded] = useState(false);
    const [selectedQuickFilters, setSelectedQuickFilters] = useState(["most_recent"]);

    const theme = useTheme();
    const styles = makeStyles(theme);
    // console.log('customers:', customers);
    // console.log('customers[0].orders:', customers[0].orders);
    const fuse = useMemo(() => {
        return new Fuse(customers, {
            keys: ["fullName", "email", "phone"],
            threshold: 0.4,
            includeScore: false,
            ignoreLocation: true,
        });
    }, [customers]);

    const QUICK_FILTER_ROWS = [
        [
            { key: "most_spent", label: "Most Spent" },
            { key: "least_spent", label: "Least Spent" },
        ],
        [
            { key: "highest_order_count", label: "Highest Order Count" },
            { key: "lowest_order_count", label: "Lowest Order Count" },
        ],
        [
            { key: "most_recent", label: "Most Recently Ordered" },
            { key: "ordered_long_ago", label: "Ordered Long Ago" },
        ],
    ];

    const INCOMPATIBLE_FILTERS = {
        most_spent: ["least_spent", "highest_order_count", "lowest_order_count", "most_recent", "ordered_long_ago"],
        least_spent: ["most_spent", "highest_order_count", "lowest_order_count", "most_recent", "ordered_long_ago"],
        highest_order_count: ["most_spent", "least_spent", "lowest_order_count", "most_recent", "ordered_long_ago"],
        lowest_order_count: ["most_spent", "least_spent", "highest_order_count", "most_recent", "ordered_long_ago"],
        most_recent: ["most_spent", "least_spent", "highest_order_count", "lowest_order_count", "ordered_long_ago"],
        ordered_long_ago: ["most_spent", "least_spent", "highest_order_count", "lowest_order_count", "most_recent"],
    };

    const filteredCustomers = useMemo(() => {
        if (isLoading || isError) return [];

        let result = customers;

        // Search filtering
        if (searchQuery.trim()) {
            const searchResults = fuse.search(searchQuery);
            result = searchResults.map((res) => res.item);
        }

        // Sorting
        result = [...result].sort((a, b) => {
            const key = selectedQuickFilters[0];

            if (key === "most_spent") return b.totalSpent - a.totalSpent;
            if (key === "least_spent") return a.totalSpent - b.totalSpent;
            if (key === "highest_order_count") return b.orderCount - a.orderCount;
            if (key === "lowest_order_count") return a.orderCount - b.orderCount;
            if (key === "most_recent") return new Date(b.mostRecentOrderDate) - new Date(a.mostRecentOrderDate);
            if (key === "ordered_long_ago") return new Date(a.mostRecentOrderDate) - new Date(b.mostRecentOrderDate);

            return 0;
        });

        return result;
    }, [customers, selectedQuickFilters, fuse, isLoading, isError]);

    const renderCustomerItem = ({ item }) => {
        return <CustomerListItem customer={item} />;
    };

    console.log('custs:', filteredCustomers.map((c) => c.totalSpent));

    const searchFilterAndSortComponent = () => (
        <View style={{ marginTop: 20, marginBottom: 10}}>
            <Card style={{backgroundColor: theme.colors.surface, borderRadius: 0}} mode={'elevated'}>
                <List.Accordion
                    title={"Sort"}
                    expanded={filterExpanded}
                    onPress={() => setFilterExpanded(!filterExpanded)}
                    style={styles.accordionBar}
                    titleStyle={styles.accordionTitle}
                    contentStyle={styles.accordionContent}
                    right={() => (
                        <View style={{
                            height: 50,                  // Match the accordion height
                            justifyContent: "center",    // Center vertically
                            alignItems: "center"         // Center horizontally
                        }}>
                        <MaterialIcons
                        name={filterExpanded ? "expand-more" : "expand-less"}
                        size={28}
                        color={"black"}
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
                                        onPress={() => {
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

                                            if (updated.length === 0) updated = ["most_spent"];
                                            setSelectedQuickFilters(updated);
                                        }}
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
                    style={styles.searchBar}
                    mode="outlined"
                />
            <Divider style={{ marginVertical: 2 }} />
            <View style={{marginVertical: 10}}>
                <Text variant={"bodyLarge"} style={{ marginLeft: 10 }}>
                    {filteredCustomers.length.toString() +
                        " Customer" +
                        (filteredCustomers.length !== 1 ? "s" : "")}
                </Text>
            </View>
            <Divider style={{ marginVertical: 2 }} />
        </View>
    );

    if (isLoading) {
        return (
            <View style={{flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: theme.colors.surface}}>
                <ActivityIndicator size={100} animating={true} color={theme.colors.primary} />
            </View>
        );
    }

    if (isError) {
        return (
            <View style={{flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: theme.colors.surface}}>
                <Text>Error Loading Customers</Text>
            </View>
        );
    }

    return (
        <KeyboardAwareView backgroundColor={theme.colors.surface} containerStyle={styles.container}>
            <FlatList
                data={filteredCustomers}
                keyExtractor={(item) => item.customerId}
                renderItem={renderCustomerItem}
                ItemSeparatorComponent={() => (
                    <Divider style={{ marginVertical: 10 }} />
                )}
                ListHeaderComponent={searchFilterAndSortComponent()}
                contentContainerStyle={{ overflow: "visible", padding: 2 }}
                ListEmptyComponent={<Text>No Customers Found</Text>}
            />
        </KeyboardAwareView>
    );
};

const makeStyles = ({ colors }) =>
    StyleSheet.create({
        container: {
            flex: 1,
            paddingHorizontal: 10,
            backgroundColor: colors.surface,
        },
        searchBar: { marginVertical: 10, backgroundColor: "white" },
        accordionBar: {
            backgroundColor: colors.softPrimary,
            height: 50,
            minHeight: 50,
            justifyContent: "center",
            alignItems: "center",
            verticalAlign: "center",
            borderRadius: 0,
        },
        accordionContent: { justifyContent: "center" },
        accordionTitle: { color: "black", fontSize: 16, fontWeight: "bold" },
        sortFilterContent: {
            paddingBottom: 20,
            borderRadius: 0,
            backgroundColor: colors.white,
            borderColor: colors.grayBorder,
        },
        sectionTitle: {
            fontSize: 16,
            fontWeight: "bold",
            marginVertical: 5,
            marginLeft: 10,
        },
        row: {
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            padding: 0,
            margin: 0,
        },
        radioRow: {
            flexDirection: "row",
            flexShrink: 1,
        },
        radioItem: {
            marginHorizontal: 0,
            padding: 0,
            flexShrink: 1,
        },
        chip: {
            margin: 0,
            alignSelf: "center",
            flexShrink: 0,
        },
    });

export default Customers;