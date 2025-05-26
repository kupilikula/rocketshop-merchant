import React, {useEffect, useMemo, useState} from "react";
import {
    FlatList,
    View,
    StyleSheet,
    TouchableOpacity,
    Platform,
    Modal,
    ActivityIndicator,
    useWindowDimensions
} from "react-native"; // Added Platform, ActivityIndicator
import {
    Card, Text, TextInput, RadioButton, Chip, useTheme, /*Surface,*/ Divider // Surface not used directly, View used instead
} from "react-native-paper";
import {useLocalSearchParams, useRouter} from "expo-router";
import Fuse from "fuse.js";
import {useSelector} from "react-redux";
import {useOrders} from "../../../../api/hooks/useOrders";
import MaterialIcons from "@expo/vector-icons/MaterialIcons"; // Used in Accordion
import {MaterialCommunityIcons} from "@expo/vector-icons"; // For potential error icon
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
import {useSafeAreaInsets} from "react-native-safe-area-context"; // Original import
import {
    formatDateTime,
    isToday,
    isThisWeek,
    isThisYear,
    isThisMonth,
    getStartOfWeek,
    normalizeDateRange
} from "../../../../utils/date";
import {usePushWithBackHref} from "../../../../utils/usePushWithBackHref";
import {getOrderPath} from "../../../../utils/getPathUtils";

const IS_WEB = Platform.OS === 'web';

const statusGroupMap = { /* ... Original statusGroupMap ... */
    pending: getPendingOrderStatuses(),
    in_progress: getInProgressOrderStatuses(),
    fulfilled: getFulfilledOrderStatuses(),
    on_hold: getOnHoldOrderStatuses(),
    canceled_failed: getCanceledOrFailedOrderStatuses(),
    refunded_returned: getRefundedOrReturnedOrderStatuses(),
};


const Orders = () => {
    const router = useRouter(); // Original, kept even if not directly used in final JSX
    const theme = useTheme();
    const {width: windowWidth} = useWindowDimensions(); // For makeStyles if needed for responsive web
    const styles = makeStyles(theme, IS_WEB, windowWidth); // Pass theme & IS_WEB

    const storeId = useSelector((state) => state.store.storeId);
    const {data: orders = [], isLoading, isError} = useOrders(storeId);

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState([]);
    const [minTotal, setMinTotal] = useState("");
    const [maxTotal, setMaxTotal] = useState("");
    const [filterDates, setFilterDates] = useState({
        startDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)), endDate: new Date(),
    });
    const [sortField, setSortField] = useState("orderDate");
    const [sortOrder, setSortOrder] = useState("descending");
    const [quickFilterExpanded, setQuickFilterExpanded] = useState(false);
    const [filterExpanded, setFilterExpanded] = useState(false);
    const [selectedQuickFilters, setSelectedQuickFilters] = useState(["all"]);
    const {filter: initialRouteFilter} = useLocalSearchParams(); // Renamed to avoid conflict
    const pushWithBackHref = usePushWithBackHref(); // Original

    console.log("params:", initialRouteFilter); // Original console.log

    // --- ALL ORIGINAL CONSTANTS AND FUNCTIONS (QUICK_FILTER_ROWS, INCOMPATIBLE_FILTERS, fuse, filteredOrders logic, date handlers etc.) ---
    // These are assumed to be exactly as in your provided mobile code. For brevity, not repeating all of them.
    // Ensure they are defined within this component's scope or correctly imported.
    const QUICK_FILTER_ROWS = [[{key: "all", label: "All Orders"}, {
        key: "pending",
        label: "Pending"
    }, {key: "in_progress", label: "In Progress"}, {key: "fulfilled", label: "Fulfilled"}, {
        key: "on_hold",
        label: "On Hold"
    }, {key: "canceled_failed", label: "Canceled / Failed"}, {
        key: "refunded_returned",
        label: "Refunded / Returned"
    },], [{key: "today", label: "Today"}, {key: "this_week", label: "This Week"}, {
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
    const fuse = useMemo(() => new Fuse(orders, {
        keys: ["orderId", "customer.fullName", "customer.customerAddress", "customer.phone", "customer.email", "orderItems[].productName", "orderStatus", "orderTotal",],
        threshold: 0.4,
        includeScore: false,
        ignoreLocation: true,
    }), [orders]);
    const filteredOrders = useMemo(() => {
        if (isLoading || isError) return [];
        let result = [...orders];
        if (searchQuery.trim()) {
            const searchResults = fuse.search(searchQuery);
            result = searchResults.map((res) => res.item);
        }
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
            const now = new Date();
            if (selectedQuickFilters.includes("today")) {
                const {start, end} = normalizeDateRange(now, now);
                result = result.filter((order) => {
                    const d = new Date(order.orderDate);
                    return d >= start && d <= end;
                });
            }
            if (selectedQuickFilters.includes("this_week")) {
                const startOfWeek = getStartOfWeek(now);
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
            if (selectedQuickFilters.includes("highest_order_total")) {
                result = result.sort((a, b) => b.orderTotal - a.orderTotal);
            }
            if (selectedQuickFilters.includes("lowest_order_total")) {
                result = result.sort((a, b) => a.orderTotal - b.orderTotal);
            }
            if (selectedQuickFilters.includes("most_recent")) {
                result = result.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
            }
            if (selectedQuickFilters.includes("oldest")) {
                result = result.sort((a, b) => new Date(a.orderDate) - new Date(b.orderDate));
            }
        }
        if (statusFilter.length && !statusFilter.includes("All")) {
            result = result.filter((order) => statusFilter.includes(order.orderStatus));
        }
        if (minTotal || maxTotal) {
            const min = minTotal ? parseInt(minTotal, 10) : Number.NEGATIVE_INFINITY;
            const max = maxTotal ? parseInt(maxTotal, 10) : Number.POSITIVE_INFINITY;
            result = result.filter((order) => order.orderTotal >= min && order.orderTotal <= max);
        }
        if (filterDates?.startDate && filterDates?.endDate) {
            const {start, end} = normalizeDateRange(filterDates.startDate, filterDates.endDate);
            result = result.filter((order) => {
                const d = new Date(order.orderDate);
                return d >= start && d <= end;
            });
        }
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
    const handleStartDateChange = (date) => {
        if (date) setFilterDates((prev) => ({...prev, startDate: date}));
    };
    const handleEndDateChange = (date) => {
        if (date) setFilterDates((prev) => ({...prev, endDate: date}));
    };
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
        const matchedGroupKey = Object.entries(statusGroupMap).find(([key, groupStatuses]) => {
            const sortedA = [...statusFilter].sort().join(",");
            const sortedB = [...groupStatuses].sort().join(",");
            return sortedA === sortedB;
        })?.[0];
        setSelectedQuickFilters((prev) => {
            const newFilters = prev.filter((f) => !Object.keys(statusGroupMap).includes(f));
            if (matchedGroupKey) {
                return [...newFilters, matchedGroupKey];
            }
            return newFilters;
        });
    }, [statusFilter]);
    useEffect(() => {
        const {startDate, endDate} = filterDates;
        let matchedDateKey = null;
        if (isToday(startDate, endDate)) matchedDateKey = "today"; else if (isThisWeek(startDate, endDate)) matchedDateKey = "this_week"; else if (isThisMonth(startDate, endDate)) matchedDateKey = "this_month"; else if (isThisYear(startDate, endDate)) matchedDateKey = "this_year";
        setSelectedQuickFilters((prev) => {
            const dateFilterKeys = ["today", "this_week", "this_month", "this_year"];
            const currentDateKey = prev.find((f) => dateFilterKeys.includes(f));
            if (currentDateKey === matchedDateKey) return prev;
            const withoutDateFilters = prev.filter((f) => !dateFilterKeys.includes(f));
            if (matchedDateKey) return [...withoutDateFilters, matchedDateKey]; else return withoutDateFilters;
        });
    }, [filterDates]);
    // --- END ORIGINAL CONSTANTS AND FUNCTIONS ---


    const renderOrderItem = ({item}) => (// Using original inline styles for the Card and its children
        <Card
            style={{
                borderRadius: 0,
                marginVertical: 5,
                backgroundColor: theme.colors.card,
                padding: 8
            }}
            onPress={() => router.push(getOrderPath(item.orderId))}
        >
            <View style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start"
            }}>
                <View style={{margin: 10}}>
                    <Text variant={"bodyLarge"}>{`ID: #${item.orderId.slice(0, 8).toUpperCase()}`}</Text>
                    <Text variant={"bodyLarge"}>{formatDateTime(new Date(item.orderDate))}</Text>
                </View>
                <View style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    margin: 10
                }}>
                    <Chip textStyle={{color: "black"}}
                          style={{backgroundColor: orderStatusColors[item.orderStatus] || theme.colors.surfaceVariant}}>
                        {item.orderStatus}
                    </Chip>
                </View>
            </View>
            <View style={{marginHorizontal: 10, marginBottom: 10}}>
                <Text variant={"bodyLarge"}>{`Customer: ${item.customer.fullName}`}</Text>
                <Text variant={"bodyLarge"}>{`Items: ${item.orderItems.reduce((A, i) => A + i.quantity, 0)}`}</Text>
                <Text variant={"bodyLarge"} style={{fontWeight: "bold"}}>Total: ₹{item.orderTotal}</Text>
            </View>
        </Card>);

    const filterAndSortComponent = () => (
        <View style={{marginTop: IS_WEB ? 0 : 20, marginBottom: 10}}>
            <Card style={{backgroundColor: theme.colors.surface, borderRadius: 0}} mode={'elevated'}>
                <List.Accordion
                    title={"Quick Filter & Sort"}
                    expanded={quickFilterExpanded}
                    onPress={() => setQuickFilterExpanded(!quickFilterExpanded)}
                    style={styles.accordionBar}
                    titleStyle={styles.accordionTitle}
                    // contentStyle={styles.accordionContent} // Original had this, ensure styles.accordionContent is defined as original
                    right={() => (<MaterialIcons name={quickFilterExpanded ? "expand-less" : "expand-more"} size={28}
                                                 color={"black"}/>)} // Original icons (MaterialIcons, expand_less/more)
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
                                                updated = ["all"];
                                            } else {
                                                const isSelected = selectedQuickFilters.includes(key);
                                                if (isSelected) {
                                                    updated = selectedQuickFilters.filter(f => f !== key);
                                                } else {
                                                    const incompatible = INCOMPATIBLE_FILTERS[key] || [];
                                                    updated = selectedQuickFilters.filter(f => f !== "all" && !incompatible.includes(f)).concat(key);
                                                }
                                                if (updated.length === 0) {
                                                    updated = ["all"];
                                                }
                                            }
                                            setSelectedQuickFilters(updated);
                                        }}
                                        style={{
                                            margin: 2,
                                            backgroundColor: theme.colors.softPrimary,
                                            borderColor: "black"
                                        }} // Original inline style
                                        textStyle={{color: selectedQuickFilters.includes(key) ? "black" : theme.colors.primary}} // Original inline textStyle
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
                    // contentStyle={styles.accordionContent} // Original
                    right={() => (<MaterialIcons name={filterExpanded ? "expand-less" : "expand-more"} size={28}
                                                 color={"black"}/>)} // Original icons
                >
                    <View style={styles.sortFilterContent}> {/* Original style */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Order Date</Text>
                            <View style={styles.dateRow}> {/* Original style */}
                                <View style={{display: "flex", flexDirection: "column", flex: 0.48}}>
                                    <CrossPlatformDatePicker label="Start Date" initialDate={filterDates.startDate}
                                                             onDateChange={handleStartDateChange}/>
                                </View>
                                <View style={{display: "flex", flexDirection: "column", flex: 0.48}}>
                                    <CrossPlatformDatePicker label="End Date" initialDate={filterDates.endDate}
                                                             onDateChange={handleEndDateChange}/>
                                </View>
                            </View>
                        </View>
                        <Divider style={{marginVertical: 2}}/>
                        <View style={{marginHorizontal: 10}}>
                            <Text style={styles.sectionTitle}>Order Total</Text>
                            <View style={styles.row}>
                                <TextInput label="Min Total" value={minTotal} onChangeText={setMinTotal}
                                           style={styles.input} mode={"outlined"} keyboardType="numeric" dense/>
                                <TextInput label="Max Total" value={maxTotal} onChangeText={setMaxTotal}
                                           style={styles.input} mode={"outlined"} keyboardType="numeric" dense/>
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
                                                setStatusFilter(statusFilter.filter((s) => s !== status));
                                            } else {
                                                setStatusFilter(statusFilter.concat(status).filter(s => s !== "All"));
                                            }
                                        }}
                                        style={[styles.orderStatusChip, {backgroundColor: status === "All" ? "#aaa" : orderStatusColors[status] || theme.colors.surfaceVariant}]} // Original inline style logic
                                        textStyle={{color: theme.colors.black}} // Original prop
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
                label="Search Orders (ID, Customer, Product, Status...)"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchBar} // Original style
                mode="outlined"
                left={<TextInput.Icon icon="magnify"/>}
            />
            <Divider style={{marginVertical: 10}}/>
            <View style={{marginVertical: 0, paddingHorizontal: IS_WEB ? 0 : 10}}>
                <Text variant={"bodyLarge"}>
                    {filteredOrders.length.toString() + (filteredOrders.length === 1 ? ' Filtered Order' : ' Filtered Orders')}
                </Text>
            </View>
            <Divider style={{marginVertical: 10}}/>
        </View>);

    const loadingErrorContent = (message, isErrorState = false) => (
        <View style={styles.centeredContentInternal}>
            {isErrorState && <MaterialCommunityIcons name="alert-circle-outline" size={48} color={theme.colors.error}
                                                     style={{marginBottom: 10}}/>}
            {!isErrorState && <ActivityIndicator size={IS_WEB ? "large" : 100} color={theme.colors.primary}
                                                 style={{marginBottom: 10}}/>}
            <Text variant={isErrorState ? "titleLarge" : "bodyLarge"}>{message}</Text>
        </View>);

    if (isLoading) {
        const loadingView = loadingErrorContent("Loading orders...");
        return IS_WEB ? <View style={styles.webPageContainer_Root}><View
                style={styles.webMaxContentContainer_Shell}>{loadingView}</View></View> :
            <View style={styles.container}>{loadingView}</View>; // Mobile uses original styles.container for loading
    }

    if (isError) {
        const errorView = loadingErrorContent("Error loading orders. Please try again.", true);
        return IS_WEB ? <View style={styles.webPageContainer_Root}><View
                style={styles.webMaxContentContainer_Shell}>{errorView}</View></View> :
            <View style={styles.container}>{errorView}</View>; // Mobile uses original styles.container for error
    }


    const flatListComponent = (<FlatList
            data={filteredOrders}
            keyExtractor={(item) => item.orderId}
            renderItem={renderOrderItem}
            ListHeaderComponent={filterAndSortComponent()} // Use function call as per original
            ListEmptyComponent={<View style={styles.emptyListContainer}>
                <Text>
                    {searchQuery || statusFilter.length > 0 || selectedQuickFilters.length > 1 || !selectedQuickFilters.includes("all") || minTotal || maxTotal /* Add other active filters */ ? "No orders match your current filters." : "No Orders Found"}
                </Text>
            </View>}
            ItemSeparatorComponent={() => <Divider style={{marginVertical: 10}}/>} // Original separator
            contentContainerStyle={{paddingHorizontal: IS_WEB ? 2 : 2}} // Original mobile padding of 2
            keyboardShouldPersistTaps="handled"
        />);

    if (IS_WEB) {
        return (<View style={styles.webPageContainer_Root}>
                <View style={styles.webMaxContentContainer_Shell}>
                    {flatListComponent}
                </View>
            </View>);
    } else { // Mobile
        return (<KeyboardAwareView
                backgroundColor={theme.colors.surface} // Original KAV prop
                containerStyle={styles.container}    // Original KAV prop, styles.container is used here
                keyboardVerticalOffset={0}            // Original KAV prop
            >
                {flatListComponent}
            </KeyboardAwareView>);
    }
};

const makeStyles = (theme, isWeb, windowWidth) => { // Added isWeb, windowWidth
    const {colors} = theme; // Destructure for use as 'colors' as in original makeStyles
    return StyleSheet.create({
        // --- Original Mobile Styles (MUST BE PRESERVED EXACTLY) ---
        container: { // This is the style for KAV's containerStyle (internal ScrollView) & mobile loading/error root
            flex: 1,
            paddingHorizontal: 10,
            overflow: "visible",
            backgroundColor: colors.surface,
            justifyContent: "center", // Original
            // alignItems: "center", // Original did not have this for the KAV containerStyle
        },
        searchBar: {marginVertical: 10, backgroundColor: "white"}, // Original
        sectionTitle: {marginVertical: 8, fontSize: 16, fontWeight: "bold"}, // Original
        flexWrapRow: {flexDirection: "row", flexWrap: "wrap", marginVertical: 10}, // Original
        row: {flexDirection: "row", justifyContent: "flex-start", marginVertical: 0, alignItems: "center"}, // Original
        input: {flex: 1, marginHorizontal: 5, backgroundColor: colors.white}, // Original
        // card: {marginVertical: 8}, // This was for a generic card, orderCard is more specific
        orderCard: {
            borderRadius: 0,
            marginVertical: 5,
            backgroundColor: colors.card /* Original used colors.card */,
            padding: 8
        }, // Original
        accordionBar: {
            backgroundColor: colors.softPrimary,
            height: 50,
            minHeight: 50,
            paddingVertical: 0,
            justifyContent: "center",
            alignItems: "center", /*verticalAlign: "center",*/
            borderRadius: 0,
        }, // Original, removed verticalAlign
        accordionContent: {
            justifyContent: "center",
            backgroundColor: colors.white /* Added to match sortFilterContent */
        }, // Original only had justifyContent
        accordionTitle: {color: "black", fontSize: 16, fontWeight: "bold"}, // Original
        sortFilterContent: {paddingBottom: 20, borderRadius: 0, backgroundColor: colors.white}, // Original
        sortOrderChip: {margin: 0, backgroundColor: colors.white /*, color: colors.black - handled by textStyle */}, // Original
        orderStatusChip: {margin: 5}, // Original
        // checkboxItemCompact, dateContainer, dateRow, dateInput, dateText, section, radioRow, radioItem, radioLabel, toggleButton, toggleText, modalContainer, pickerContainer, doneButton, doneText
        // Keep ALL other original styles from the user's provided makeStyles, e.g.:
        dateRow: {flexDirection: "row", justifyContent: "space-between", marginBottom: 20,},
        section: {marginHorizontal: 10,}, // Original
        radioRow: {flexDirection: "row", justifyContent: "flex-start", alignItems: "center",}, // Original


        // --- New Web Layout Container Styles ---
        webPageContainer_Root: {
            flex: 1,
            backgroundColor: 'white',
            alignItems: 'center',
        },
        webMaxContentContainer_Shell: {
            width: '100%', maxWidth: 900, // Max width for the orders list and filters
            flex: 1, backgroundColor: colors.surface, // Match mobile KAV background
            // Padding for the shell content is applied by the FlatList contentContainerStyle or Header component internally
        },

        // --- Centered Content (for loading/error text within platform-specific containers) ---
        // For mobile, styles.container is used for full screen loading/error.
        // For web, this style is for the content *inside* the webMaxContentContainer_Shell.
        centeredContentInternal: {
            flex: 1, // Important for it to actually center in its parent which also needs flex:1 or fixed height
            alignItems: 'center', justifyContent: 'center', width: '100%', // Takes width of its parent (e.g. webMaxContentContainer_Shell)
            padding: 20,
        },
        emptyListContainer: {
            flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 50, // More vertical padding for empty state
            paddingHorizontal: 20,
        }
    });
};

export default Orders;