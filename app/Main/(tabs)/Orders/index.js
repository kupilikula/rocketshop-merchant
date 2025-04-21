import React, {useEffect, useMemo, useState} from "react";
import {FlatList, View, StyleSheet, TouchableOpacity, Platform, Modal} from "react-native";
import {
    Card, Text, TextInput, RadioButton, Chip, useTheme, Surface, Divider, ActivityIndicator
} from "react-native-paper";
import {useLocalSearchParams, useRouter} from "expo-router";
import Fuse from "fuse.js";
import {useSelector} from "react-redux"; // For getting storeId from Redux
import {useOrders} from "../../../../api/hooks/useOrders";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
    getCanceledOrFailedOrderStatuses,
    getFulfilledOrderStatuses,
    getInProgressOrderStatuses,
    getOnHoldOrderStatuses,
    getPendingOrderStatuses,
    getRefundedOrReturnedOrderStatuses,
    orderStatusColors,
    orderStatusList,
} from "../../../../utils/dataValues";
import {List} from "react-native-paper";
import CrossPlatformDatePicker from "../../../../components/CrossPlatformDatePicker";
import KeyboardAwareView from "../../../../components/KeyboardAwareView";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {formatDateTime, isToday, isThisWeek, isThisYear, isThisMonth, getStartOfWeek, normalizeDateRange} from "../../../../utils/date";


const statusGroupMap = {
    pending: getPendingOrderStatuses(),
    in_progress: getInProgressOrderStatuses(),
    fulfilled: getFulfilledOrderStatuses(),
    on_hold: getOnHoldOrderStatuses(),
    canceled_failed: getCanceledOrFailedOrderStatuses(),
    refunded_returned: getRefundedOrReturnedOrderStatuses(),
};


const Orders = () => {
    const router = useRouter();
    const theme = useTheme();
    const styles = makeStyles(theme);

    // Redux: Get the storeId from the global state
    const storeId = useSelector((state) => state.store.storeId);

    // React Query: Fetch orders
    const {data: orders = [], isLoading, isError} = useOrders(storeId);

    // Local State
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState([]);
    const [statusQuickFilter, setStatusQuickFilter] = useState("All");
    const [dateQuickFilter, setDateQuickFilter] = useState("This Month");
    const [minTotal, setMinTotal] = useState("");
    const [maxTotal, setMaxTotal] = useState("");
    const [filterDates, setFilterDates] = useState({
        startDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)), endDate: new Date(),
    });
    const [sortField, setSortField] = useState("orderDate");
    const [sortOrder, setSortOrder] = useState("descending");
    const [quickFilterExpanded, setQuickFilterExpanded] = useState(false);
    const [filterExpanded, setFilterExpanded] = useState(false);
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [selectedQuickFilters, setSelectedQuickFilters] = useState(["all"]);
    const {filter} = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    console.log("params:", filter);

    const QUICK_FILTER_ROWS = [[{key: "all", label: "All Orders"}, {key: "pending", label: "Pending"},            // Order Created, Payment Initiated
        {key: "in_progress", label: "In Progress"},     // Payment Received to Awaiting Shipment
        {key: "fulfilled", label: "Fulfilled"},         // Shipped, Out for Delivery, Delivered
        {key: "on_hold", label: "On Hold"},             // On Hold
        {key: "canceled_failed", label: "Canceled / Failed"}, // Canceled, Failed, Payment Failed
        {key: "refunded_returned", label: "Refunded / Returned"}, // Refund + Return statuses
    ], [{key: "today", label: "Today"}, {key: "this_week", label: "This Week"}, {
        key: "this_month",
        label: "This Month"
    }, {key: "this_year", label: "This Year"},], [{
        key: "highest_order_total",
        label: "Highest Order Total"
    }, {key: "lowest_order_total", label: "Lowest Order Total"},], [{
        key: "most_recent",
        label: "Most Recent Orders"
    }, {key: "oldest", label: "Oldest Orders"},]];

    const INCOMPATIBLE_FILTERS = {
        all: ["open", "fulfilled", "unfulfilled", "today", "this_week", "this_month", "this_year", "highest_order_total", "lowest_order_total", "most_recent", "oldest"],
        pending: ["all", "in_progress", "fulfilled", "on_hold", "canceled_failed", "refunded_returned"],
        in_progress: ["all", "pending", "fulfilled", "on_hold", "canceled_failed", "refunded_returned"],
        fulfilled: ["all", "pending", "in_progress", "on_hold", "canceled_failed", "refunded_returned"],
        on_hold: ["all", "pending", "in_progress", "fulfilled", "canceled_failed", "refunded_returned"],
        canceled_failed: ["all", "pending", "in_progress", "fulfilled", "on_hold", "refunded_returned"],
        refunded_returned: ["all", "pending", "in_progress", "fulfilled", "on_hold", "canceled_failed"],
        today: ["this_week", "this_month", "this_year", "all"],
        this_week: ["today", "this_month", "this_year", "all"],
        this_month: ["today", "this_week", "this_year", "all"],
        this_year: ["today", "this_week", "this_month", "all"],
        highest_order_total: ["lowest_order_total", "all"],
        lowest_order_total: ["highest_order_total", "all"],
        most_recent: ["oldest", "all"],
        oldest: ["most_recent", "all"],
    };


    // useEffect(() => {
    //   console.log("line50:, params:", filter);
    //   if (filter === "open") {
    //     setStatusFilter(orderStatusList.slice(0, 6));
    //   } else if (filter === "today") {
    //     setFilterDates({ startDate: new Date(), endDate: new Date() });
    //     setStatusQuickFilter("All");
    //   }
    // }, [filter]);

    const toggleSortOrder = () => {
        setSortOrder((prev) => (prev === "ascending" ? "descending" : "ascending"));
    };

    const fuse = useMemo(() => {
        return new Fuse(orders, {
            keys: ["orderId", "customer.fullName", "customer.customerAddress", "customer.phone", "customer.email", "orderItems[].productName", "orderStatus", "orderTotal",],
            threshold: 0.4,
            includeScore: false,
            ignoreLocation: true,
        });
    }, [orders]);

    const filteredOrders = useMemo(() => {
        if (isLoading || isError) return [];

        let result = [...orders];

        // Search
        if (searchQuery.trim()) {
            const searchResults = fuse.search(searchQuery);
            result = searchResults.map((res) => res.item);
        }

        // Quick Filter: Fulfillment Status
        if (!selectedQuickFilters.includes("all")) {
            if (selectedQuickFilters.includes("open")) {
                result = result.filter((order) => {
                    const idx = orderStatusList.indexOf(order.orderStatus);
                    return idx >= 0 && idx <= 5;
                });
            }
            if (selectedQuickFilters.includes("fulfilled")) {
                result = result.filter((order) => {
                    const idx = orderStatusList.indexOf(order.orderStatus);
                    return idx >= 6 && idx <= 8;
                });
            }
            if (selectedQuickFilters.includes("unfulfilled")) {
                result = result.filter((order) => {
                    const idx = orderStatusList.indexOf(order.orderStatus);
                    return idx > 8;
                });
            }

            // Quick Filter: Date Ranges
            const now = new Date();
            if (selectedQuickFilters.includes("today")) {
                const {start, end} = normalizeDateRange(now, now);
                result = result.filter((order) => {
                    const d = new Date(order.orderDate);
                    return d >= start && d <= end;
                });
            }

            if (selectedQuickFilters.includes("this_week")) {
                const startOfWeek = new Date(now);
                const day = now.getDay();
                const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
                startOfWeek.setDate(diff);
                const {start, end} = normalizeDateRange(startOfWeek, now);
                result = result.filter((order) => {
                    const d = new Date(order.orderDate);
                    return d >= start && d <= end;
                });
            }

            if (selectedQuickFilters.includes("this_month")) {
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const {start, end} = normalizeDateRange(startOfMonth, now);
                result = result.filter((order) => {
                    const d = new Date(order.orderDate);
                    return d >= start && d <= end;
                });
            }

            if (selectedQuickFilters.includes("this_year")) {
                const startOfYear = new Date(now.getFullYear(), 0, 1);
                const {start, end} = normalizeDateRange(startOfYear, now);
                result = result.filter((order) => {
                    const d = new Date(order.orderDate);
                    return d >= start && d <= end;
                });
            }
            // Quick Filter: Sort By Order Total
            if (selectedQuickFilters.includes("highest_order_total")) {
                result = result.sort((a, b) => b.orderTotal - a.orderTotal);
            }
            if (selectedQuickFilters.includes("lowest_order_total")) {
                result = result.sort((a, b) => a.orderTotal - b.orderTotal);
            }

            // Quick Filter: Sort By Order Date
            if (selectedQuickFilters.includes("most_recent")) {
                result = result.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
            }
            if (selectedQuickFilters.includes("oldest")) {
                result = result.sort((a, b) => new Date(a.orderDate) - new Date(b.orderDate));
            }
        }

        // Fallback: Manual Status Filter (if quick filters don’t override it)
        if (statusFilter.length && !statusFilter.includes("All")) {
            result = result.filter((order) => statusFilter.includes(order.orderStatus));
        }

        // Price Range
        if (minTotal || maxTotal) {
            const min = minTotal ? parseInt(minTotal, 10) : Number.NEGATIVE_INFINITY;
            const max = maxTotal ? parseInt(maxTotal, 10) : Number.POSITIVE_INFINITY;
            result = result.filter((order) => order.orderTotal >= min && order.orderTotal <= max);
        }

// Custom Date Range (inclusive)
        if (filterDates?.startDate && filterDates?.endDate) {
            const {start, end} = normalizeDateRange(filterDates.startDate, filterDates.endDate);

            result = result.filter((order) => {
                const d = new Date(order.orderDate);
                return d >= start && d <= end;
            });
        }
        // Fallback Sort (only if no quick sort filter applied)
        const noQuickSortSelected = !selectedQuickFilters.some((f) => ["highest_order_total", "lowest_order_total", "most_recent", "oldest"].includes(f));

        if (noQuickSortSelected) {
            result = result.sort((a, b) => {
                if (sortField === "orderDate") {
                    return sortOrder === "ascending" ? new Date(a.orderDate) - new Date(b.orderDate) : new Date(b.orderDate) - new Date(a.orderDate);
                } else if (sortField === "orderTotal") {
                    return sortOrder === "ascending" ? a.orderTotal - b.orderTotal : b.orderTotal - a.orderTotal;
                }
                return 0;
            });
        }

        return result;
    }, [orders, selectedQuickFilters, searchQuery, statusFilter, minTotal, maxTotal, filterDates, sortField, sortOrder, fuse, isLoading, isError,]);
    // Function to update order status
    // const updateOrderStatus = (id, newStatus) => {
    //   const updatedOrders = orders.map((order) =>
    //     order.id === id ? { ...order, status: newStatus } : order,
    //   );
    //   setOrders(updatedOrders);
    // };

    const handleStartDateChange = (date) => {
        // setShowStartPicker(false); // Close picker
        if (date) {
            setFilterDates((prev) => ({
                ...prev, startDate: date,
            }));
        }
    };
    const handleEndDateChange = (date) => {
        // setShowStartPicker(false); // Close picker
        if (date) {
            setFilterDates((prev) => ({
                ...prev, endDate: date,
            }));
        }
    };

    const renderOrderItem = ({item}) => (<Card
            style={styles.orderCard}
            onPress={() => router.push("/Main/(tabs)/Orders/Order/" + item.orderId)}
        >
            <View
                style={{
                    display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start",
                }}
            >
                <View style={{margin: 10}}>
                    <Text variant={"bodyLarge"}>{`ID: #${item.orderId.slice(0, 8).toUpperCase()}`}</Text>
                    <Text variant={"bodyLarge"}>
                        {formatDateTime(new Date(item.orderDate))}
                    </Text>
                </View>
                <View
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        margin: 10,
                    }}
                >
                    <Chip
                        textStyle={{color: "black"}}
                        style={{backgroundColor: orderStatusColors[item.orderStatus]}}
                    >
                        {item.orderStatus}
                    </Chip>
                </View>
            </View>

            <View style={{marginHorizontal: 10, marginBottom: 10}}>
                <Text
                    variant={"bodyLarge"}
                >{`Customer: ${item.customer.fullName}`}</Text>
                <Text
                    variant={"bodyLarge"}
                >{`Items: ${item.orderItems.reduce((A, i) => A + i.quantity, 0)}`}</Text>
                <Text variant={"bodyLarge"} style={{fontWeight: "bold"}}>
                    Total: ₹{item.orderTotal}
                </Text>
            </View>
        </Card>);


    useEffect(() => {
        if (selectedQuickFilters.includes("all")) {
            setStatusFilter(orderStatusList);
            return;
        }
        const selectedGroup = Object.keys(statusGroupMap).find(group => selectedQuickFilters.includes(group));

        if (selectedGroup) {
            setStatusFilter(statusGroupMap[selectedGroup]);
        }
    }, [selectedQuickFilters]);

    useEffect(() => {
        const today = new Date();
        const now = new Date();

        if (selectedQuickFilters.includes("today")) {
            setFilterDates({startDate: today, endDate: today});
        } else if (selectedQuickFilters.includes("this_week")) {
            const start = getStartOfWeek(now);
            setFilterDates({startDate: start, endDate: now});
        } else if (selectedQuickFilters.includes("this_month")) {
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            setFilterDates({startDate: start, endDate: now});
        } else if (selectedQuickFilters.includes("this_year")) {
            const start = new Date(now.getFullYear(), 0, 1);
            setFilterDates({startDate: start, endDate: now});
        }
    }, [selectedQuickFilters]);

    useEffect(() => {
        // Map quick filter keys to their status group values

        const matchedGroupKey = Object.entries(statusGroupMap).find(([key, groupStatuses]) => {
            const sortedA = [...statusFilter].sort().join(",");
            const sortedB = [...groupStatuses].sort().join(",");
            return sortedA === sortedB;
        })?.[0];

        setSelectedQuickFilters((prev) => {
            // Remove all status-related quick filters from selection
            const newFilters = prev.filter((f) => !Object.keys(statusGroupMap).includes(f));

            if (matchedGroupKey) {
                // Add back the matched group if found
                return [...newFilters, matchedGroupKey];
            }

            return newFilters;
        });
    }, [statusFilter]);

    useEffect(() => {
        const {startDate, endDate} = filterDates;

        let matchedDateKey = null;

        if (isToday(startDate, endDate)) {
            matchedDateKey = "today";
        } else if (isThisWeek(startDate, endDate)) {
            matchedDateKey = "this_week";
        } else if (isThisMonth(startDate, endDate)) {
            matchedDateKey = "this_month";
        } else if (isThisYear(startDate, endDate)) {
            matchedDateKey = "this_year";
        }

        setSelectedQuickFilters((prev) => {
            const dateFilterKeys = ["today", "this_week", "this_month", "this_year"];
            const currentDateKey = prev.find((f) => dateFilterKeys.includes(f));

            // ✅ Prevent infinite loop: only update if the matched key is different
            if (currentDateKey === matchedDateKey) {
                return prev;
            }

            const withoutDateFilters = prev.filter((f) => !dateFilterKeys.includes(f));

            if (matchedDateKey) {
                return [...withoutDateFilters, matchedDateKey];
            } else {
                return withoutDateFilters;
            }
        });
    }, [filterDates]);

    const filterAndSortComponent = () => (<View style={{marginTop: 20, marginBottom: 10}}>
            <Card style={{backgroundColor: theme.colors.surface, borderRadius: 0}} mode={'elevated'}>
              <List.Accordion
                  title={"Quick Filter & Sort"}
                  expanded={quickFilterExpanded}
                  onPress={() => setQuickFilterExpanded(!quickFilterExpanded)}
                  style={styles.accordionBar}
                  titleStyle={styles.accordionTitle}
                  contentStyle={styles.accordionContent}
                  right={() => (<MaterialIcons
                      name={quickFilterExpanded ? "expand-more" : "expand-less"}
                      size={28}
                      color={"black"}
                  />)}
              >

              <View style={{paddingHorizontal: 16, paddingTop: 16}}>
                    {QUICK_FILTER_ROWS.map((row, rowIndex) => (
                        <View key={rowIndex} style={{flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8}}>
                            {row.map(({key, label}) => (<Chip
                                    key={key}
                                    selected={selectedQuickFilters.includes(key)}
                                    onPress={() => {
                                        let updated = [];

                                        if (key === "all") {
                                            // Always override and select only "all"
                                            updated = ["all"];
                                        } else {
                                            const isSelected = selectedQuickFilters.includes(key);

                                            if (isSelected) {
                                                // Deselect the chip
                                                updated = selectedQuickFilters.filter(f => f !== key);
                                            } else {
                                                // Add the chip, remove incompatible ones and "all"
                                                const incompatible = INCOMPATIBLE_FILTERS[key] || [];
                                                updated = selectedQuickFilters
                                                    .filter(f => f !== "all" && !incompatible.includes(f))
                                                    .concat(key);
                                            }

                                            // If everything was removed, fallback to "all"
                                            if (updated.length === 0) {
                                                updated = ["all"];
                                            }
                                        }

                                        setSelectedQuickFilters(updated);
                                    }}
                                    style={{
                                        margin: 2, backgroundColor: theme.colors.softPrimary, borderColor: "black",
                                    }}
                                    textStyle={{
                                        color: selectedQuickFilters.includes(key) ? "black" : theme.colors.primary,
                                    }}
                                    selectedColor={theme.colors.black}
                                >
                                    {label}
                                </Chip>))}
                        </View>))}
                </View>
              </List.Accordion>
                <List.Accordion
                    title={"More Sort & Filter Options"}
                    expanded={filterExpanded}
                    onPress={() => setFilterExpanded(!filterExpanded)}
                    style={styles.accordionBar}
                    titleStyle={styles.accordionTitle}
                    contentStyle={styles.accordionContent}
                    right={() => (<MaterialIcons
                            name={filterExpanded ? "expand-more" : "expand-less"}
                            size={28}
                            color={"black"}
                        />)}
                >
                    <View style={styles.sortFilterContent}>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Order Date</Text>
                            {/* Display Selected Start and End Dates */}
                            {/* Row Layout for Start and End Date Cards */}
                            <View style={styles.dateRow}>
                                <View
                                    style={{
                                        display: "flex", flexDirection: "column", flex: 0.48,
                                    }}
                                >
                                    <CrossPlatformDatePicker
                                        label="Start Date"
                                        initialDate={filterDates.startDate}
                                        onDateChange={(newDate) => handleStartDateChange(newDate)}
                                    />
                                </View>
                                <View
                                    style={{
                                        display: "flex", flexDirection: "column", flex: 0.48,
                                    }}
                                >
                                    <CrossPlatformDatePicker
                                        label="End Date"
                                        initialDate={filterDates.endDate}
                                        onDateChange={(newDate) => handleEndDateChange(newDate)}
                                    />
                                </View>
                            </View>
                        </View>

                        <Divider style={{marginVertical: 2}}/>
                        <View style={{marginHorizontal: 10}}>
                            <Text style={styles.sectionTitle}>Order Total</Text>
                            <View style={styles.row}>
                                <TextInput
                                    label="Min Total"
                                    value={minTotal}
                                    onChangeText={setMinTotal}
                                    style={styles.input}
                                    mode={"outlined"}
                                    keyboardType="numeric"
                                    dense
                                />
                                <TextInput
                                    label="Max Total"
                                    value={maxTotal}
                                    onChangeText={setMaxTotal}
                                    style={styles.input}
                                    mode={"outlined"}
                                    keyboardType="numeric"
                                    dense
                                />
                            </View>
                            <Divider style={{marginVertical: 6}}/>
                            <Text style={styles.sectionTitle}>Order Status</Text>
                            <View style={styles.flexWrapRow}>
                                {orderStatusList.map((status) => (<Chip
                                        key={status}
                                        selected={statusFilter.includes(status)}
                                        onPress={() => {
                                            if (status === "All") {
                                                if (statusFilter.includes("All")) {
                                                    setStatusFilter([]);
                                                } else {
                                                    setStatusFilter(["All"]);
                                                }
                                            } else if (statusFilter.includes(status)) {
                                                setStatusFilter(statusFilter.filter((s) => s !== status),);
                                            } else {
                                                setStatusFilter(statusFilter.concat(status));
                                            }
                                        }}
                                        style={[styles.orderStatusChip, {
                                            backgroundColor: status === "All" ? "#aaa" : orderStatusColors[status],
                                        },]}
                                        textStyle={{color: theme.colors.black}}
                                        selectedColor={'black'}
                                    >
                                        {status}
                                    </Chip>))}
                            </View>
                        </View>
                    </View>
                </List.Accordion>
            </Card>
            <TextInput
                label="Search Orders"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchBar}
                mode="outlined"
            />
            <Divider style={{marginVertical: 10}}/>
            <View style={{marginVertical: 0}}>
                <Text variant={"bodyLarge"} style={{marginLeft: 10}}>
                    {filteredOrders.length.toString() + ' filtered Orders'}
                </Text>
            </View>
            <Divider style={{marginVertical: 10}}/>
        </View>);

    if (isError) {
        return (<View style={styles.container}>
                <Text variant={'bodyLarge'}>Error loading orders. Please try again.</Text>
            </View>);
    }

    if (isLoading) {
        return (<View style={styles.container}>
                <ActivityIndicator size={100} animating={true} color={theme.colors.primary}/>
        </View>)
    }

    return (<KeyboardAwareView backgroundColor={theme.colors.surface} containerStyle={styles.container}
                               keyboardVerticalOffset={0}>
            <FlatList
                data={filteredOrders}
                keyExtractor={(item) => item.orderId}
                renderItem={renderOrderItem}
                ListHeaderComponent={filterAndSortComponent()}
                ListEmptyComponent={<Text>No Orders Found</Text>}
                ItemSeparatorComponent={() => <Divider style={{marginVertical: 10}}/>}
                contentContainerStyle={{paddingHorizontal: 2}}
            />
        </KeyboardAwareView>);
};

const makeStyles = ({colors}) => StyleSheet.create({
    container: {
        flex: 1, paddingHorizontal: 10, overflow: "visible", backgroundColor: colors.surface, justifyContent: "center",
    },
    searchBar: {marginVertical: 10, backgroundColor: "white"},
    sectionTitle: {marginVertical: 8, fontSize: 16, fontWeight: "bold"},
    flexWrapRow: {flexDirection: "row", flexWrap: "wrap", marginVertical: 10},
    row: {
        flexDirection: "row", justifyContent: "flex-start", marginVertical: 0, alignItems: "center",
    },
    input: {flex: 1, marginHorizontal: 5, backgroundColor: colors.white},
    card: {marginVertical: 8},
    orderCard: {
        borderRadius: 0, marginVertical: 5, backgroundColor: colors.card, padding: 8
    },
    accordionBar: {
        backgroundColor: colors.softPrimary,
        height: 50,
        minHeight: 50,
        paddingVertical: 0,
        justifyContent: "center",
        alignItems: "center",
        verticalAlign: "center",
        borderRadius: 0,
    },
    accordionContent: {justifyContent: "center"},
    accordionTitle: {color: "black", fontSize: 16, fontWeight: "bold"},
    sortFilterContent: {
        paddingBottom: 20, borderRadius: 0, backgroundColor: colors.white,
    },
    sortOrderChip: {
        margin: 0, backgroundColor: colors.white, color: colors.black,
    },
    orderStatusChip: {margin: 5}, // orderStatusChipSelected: {backgroundColor: colors.secondary, color: colors.white},
    checkboxItemCompact: {
        flex: 1, marginHorizontal: 2, paddingVertical: 0, paddingHorizontal: 5,
    },
    dateContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.surface,
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
        elevation: 2, // Adds shadow for Android
        shadowColor: "#000", // Shadow for iOS
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    dateRow: {
        flexDirection: "row", justifyContent: "space-between", marginBottom: 20,
    },
    dateInput: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: 5,
    },
    dateText: {
        marginLeft: 10, fontSize: 16, color: "black",
    },

    // dateContent: {
    //     marginLeft: 10,
    //     flex: 1,
    // },
    // dateLabel: {
    //     fontSize: 14,
    //     color: '#666',
    // },
    // dateText: {
    //     fontSize: 16,
    //     fontWeight: 'bold',
    //     color: '#333',
    // },
    section: {
        marginHorizontal: 10,
    },
    radioRow: {
        flexDirection: "row", justifyContent: "flex-start", alignItems: "center",
    },
    radioItem: {
        flexDirection: "row", alignItems: "center", marginRight: 16, // Space between radio options
    },
    radioLabel: {
        fontSize: 16, color: "black", marginLeft: 4, // Space between radio button and text
    },
    toggleButton: {
        flexDirection: "row", alignItems: "center", alignSelf: "flex-start", // Adjust width to content
        backgroundColor: "white", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8,
    },
    toggleText: {
        fontSize: 14, color: "#333", marginLeft: 8, // Space between the icon and the text
        fontWeight: "500",
    }, // dateInput: {
    //   flexDirection: 'row',
    //   alignItems: 'center',
    //   borderWidth: 1,
    //   borderColor: '#ccc',
    //   borderRadius: 8,
    //   padding: 8,
    // },
    modalContainer: {
        flex: 1, justifyContent: 'flex-end', // Align at the bottom
        backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent background
    },
    pickerContainer: {
        backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16,
    },
    doneButton: {
        marginTop: 16,
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
        alignSelf: 'center',
    },
    doneText: {
        color: '#fff', fontWeight: 'bold', fontSize: 16,
    },
});
export default Orders;