import React, {useMemo, useState} from 'react';
import {FlatList, View, StyleSheet, TouchableOpacity} from 'react-native';
import {Card, Text, Button, TextInput, RadioButton, Chip, Appbar, useTheme, Surface, Menu} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import {useRouter} from "expo-router";
import Fuse from "fuse.js";
import {getOrder} from "../../../../utils/fakeDataMethods";
import {faker} from '@faker-js/faker';
import {DatePickerModal} from "react-native-paper-dates";
import { List } from 'react-native-paper';
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {MaterialCommunityIcons} from "@expo/vector-icons";

const initialOrders = faker.helpers.multiple(getOrder, {count: 100});

const Orders = () => {
    const [orders, setOrders] = useState(initialOrders);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState(["All"]);
    const [minTotal, setMinTotal] = useState('');
    const [maxTotal, setMaxTotal] = useState('');
    const [filterDates, setFilterDates] = useState({startDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)), endDate: new Date()});
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [sortField, setSortField] = useState('orderDate'); // Default sorting
    const [sortOrder, setSortOrder] = useState('ascending'); // Default sorting order
    const [filterExpanded, setFilterExpanded] = useState(true);
    const [sortExpanded, setSortExpanded] = useState(false);
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [sortFieldMenuVisible, setSortFieldMenuVisible] = useState(false); // Menu visibility

    const toggleSortOrder = () => {
        setSortOrder((prev) => (prev === 'ascending' ? 'descending' : 'ascending'));
    };

    const router = useRouter();

    const theme = useTheme();
    const styles = makeStyles(theme);
    const fuse = useMemo(() => {
        return new Fuse(orders, {
            keys: [
                'orderId',
                'customer.fullName',    // Search customer name
                'customer.customerAddress',
                'customer.phone',
                'customer.email',       // Search email
                'orderItems[].productName', // Search through all items in orderItems array
                'orderStatus',
                'orderTotal'
            ],
            threshold: 0.4,           // Controls fuzziness
            includeScore: false,
            ignoreLocation: true,     // Ignores match location
        });
    }, [orders]);

    // Search filter logic
    const filteredOrders = useMemo(() => {
        let result = orders;

        if (searchQuery.trim()) {
            const searchResults = fuse.search(searchQuery);
            result = searchResults.map((res) => res.item);
        }

        if (statusFilter) {
            if (!statusFilter.includes("All")) {
                result = result.filter((order) => statusFilter.includes(order.orderStatus));
            }
        }
        console.log('result.length before total filtering:', result.length);
        console.log('minTotal:', minTotal, ' ,maxTotal:', maxTotal);
        // Filter by orderTotal range
        if (minTotal || maxTotal) {
            const min = minTotal ? parseInt(minTotal, 10) : Number.NEGATIVE_INFINITY;
            const max = maxTotal ? parseInt(maxTotal, 10) : Number.POSITIVE_INFINITY;
            result = result.filter((order) => order.orderTotal >= min && order.orderTotal <= max);
        }

        if (filterDates?.startDate && filterDates?.endDate) {
            result = result.filter(
                (order) => order.orderDate >= filterDates.startDate && order.orderDate <= filterDates.endDate
            );
        }

        // Sorting
        result = [...result].sort((a, b) => {
            if (sortField === 'orderDate') {
                return sortOrder==='ascending' ? new Date(a.orderDate) - new Date(b.orderDate) :  new Date(b.orderDate) - new Date(a.orderDate);
            } else if (sortField === 'orderTotal') {
                return sortOrder==='ascending' ? a.orderTotal - b.orderTotal : b.orderTotal - a.orderTotal;
            }
            return 0;
        });

        console.log('result.length after total filtering:', result.length);

        return result;
    }, [searchQuery, statusFilter, minTotal, maxTotal, filterDates, sortField, sortOrder, fuse]);

    // Function to update order status
    const updateOrderStatus = (id, newStatus) => {
        const updatedOrders = orders.map((order) =>
            order.id === id ? { ...order, status: newStatus } : order
        );
        setOrders(updatedOrders);
    };
    const handleStartDateChange = ({ date }) => {
        setFilterDates((prev) => ({ ...prev, startDate: date }));
        setShowStartPicker(false);
    };

    const handleEndDateChange = ({ date }) => {
        setFilterDates((prev) => ({ ...prev, endDate: date }));
        setShowEndPicker(false);
    };

    const orderStatusChipColorMap = {"Submitted": theme.colors.secondary, "Payment Received": 'green', "Shipped": theme.colors.primary , "Delivered": 'magenta'}


    const renderOrderItem = ({ item }) => (
        <Card style={styles.orderCard} onPress={() => router.push('./Orders/Order/'+ item.orderId)}>

            <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                <View style={{margin: 10}}>
                    <Text variant={'bodyLarge'}>{`ID: #${item.orderId}`}</Text>
                    <Text variant={'bodyLarge'}>Date: {item.orderDate.toLocaleDateString()}</Text>
                </View>
                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', margin: 10}}>
                    <Chip mode={'outlined'} textStyle={{color: 'white'}} style={{ backgroundColor: orderStatusChipColorMap[item.orderStatus]}}>{item.orderStatus}</Chip>
                </View>
            </View>

            <View style={{marginHorizontal: 10, marginBottom: 10}}>
                <Text variant={'bodyLarge'}>{`Customer: ${item.customer.fullName}`}</Text>
                <Text variant={'bodyLarge'}>{`Items: ${item.orderItems.reduce((A,i) => A+i.quantity, 0)}`}</Text>
                <Text variant={'bodyLarge'} style={{fontWeight: 'bold'}}>Total: ₹{item.orderTotal}</Text>
            </View>

        </Card>
    );
    const formatDate = (date) => {

        let x= date.toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'});
        console.log('x:', x);
        return x
    }

    const filterAndSortComponent = () => <View style={{padding: 0, marginBottom: 10}}>
        <TextInput
            label="Search Orders"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchBar}
            mode="outlined"
        />

        {/* Sort & Filters Accordion */}
        <List.Accordion
            title={'Sort & Filter'}
            expanded={filterExpanded}
            onPress={() => setFilterExpanded(!filterExpanded)}
            style={styles.accordionBar}
            titleStyle={styles.accordionTitle}
            contentStyle={styles.accordionContent}
            // left={() => <MaterialIcons name={'tune'} size={28} color={'white'}/>}
            right={ () => <MaterialIcons name={filterExpanded ? 'expand-more' : 'expand-less'} size={28} color={'white'}/>}

        >
            <Card mode={'elevated'} style={{paddingBottom: 20, borderRadius: 0, backgroundColor: 'white', borderWidth: 1, borderColor: '#aaaaaa'}}>
            {/* Sort Field Selector */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Sort By</Text>
                <View style={styles.row}>
                    <RadioButton.Group
                        onValueChange={(value) => setSortField(value)}
                        value={sortField}
                    >
                        <View style={styles.radioRow}>
                            {/* Date Option */}
                            <View style={styles.radioItem}>
                                <RadioButton value="orderDate" color="#6200ee" />
                                <Text style={styles.radioLabel}>Date</Text>
                            </View>

                            {/* Order Total Option */}
                            <View style={styles.radioItem}>
                                <RadioButton value="orderTotal" color="#6200ee" />
                                <Text style={styles.radioLabel}>Order Total</Text>
                            </View>
                        </View>
                    </RadioButton.Group>
                    {/* Sort Order Toggler */}
                    <View style={{display: 'flex',flexDirection: 'row'}}>
                        <Chip
                            mode="outlined"
                            style={styles.chip}
                            icon={() => (
                                <MaterialCommunityIcons
                                    name={sortOrder === 'ascending' ? 'arrow-up-bold' : 'arrow-down-bold'}
                                    size={20}
                                    color="#6200ee"
                                />
                            )}
                            onPress={toggleSortOrder}
                        >
                            {sortOrder === 'ascending' ? 'Ascending' : 'Descending'}
                        </Chip>
                    </View>
                </View>
            </View>

            <View style={{marginHorizontal: 10}}>
                <Text style={styles.sectionTitle}>Order Status</Text>
                <View style={styles.chipContainer}>
                    {["All", "Submitted", "Payment Received", "Shipped", "Delivered"].map((status) => (
                        <Chip
                            key={status}
                            selected={statusFilter.includes(status)}
                            onPress={() => {
                                if (status==='All') {
                                    if (statusFilter.includes("All")) {
                                        setStatusFilter([])
                                    } else {
                                        setStatusFilter(["All"])
                                    }
                                } else if (statusFilter.includes(status)) {
                                    setStatusFilter(statusFilter.filter((s) => s !== status))
                                } else {
                                    setStatusFilter(statusFilter.concat(status))
                                }
                            }}
                            selectedColor={theme.colors.secondary}
                            style={[styles.chip, statusFilter.includes(status) && styles.chipSelected]}
                            textStyle={{color: 'black'}}
                        >
                            {status}
                        </Chip>
                    ))}
                </View>

                <Text style={styles.sectionTitle}>Order Date</Text>
                {/* Display Selected Start and End Dates */}
                {/* Row Layout for Start and End Date Cards */}
                <View style={styles.row}>
                    {/* Start Date Card */}
                    <TouchableOpacity onPress={() => setShowStartPicker(true)} style={[styles.dateContainer, {marginRight: 5}]}>
                        <MaterialCommunityIcons name="calendar-start" size={20} color="#6200ee" />
                        <View style={styles.dateContent}>
                            <Text style={styles.dateLabel}>Start Date</Text>
                            <Text style={styles.dateText}>{formatDate(filterDates.startDate)}</Text>
                        </View>
                    </TouchableOpacity>

                    {/* End Date Card */}
                    <TouchableOpacity onPress={() => setShowEndPicker(true)} style={[styles.dateContainer, {marginLeft: 5}]}>
                        <MaterialCommunityIcons name="calendar-end" size={20} color="#6200ee" />
                        <View style={styles.dateContent}>
                            <Text style={styles.dateLabel}>End Date</Text>
                            <Text style={styles.dateText}>{formatDate(filterDates.endDate)}</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Start Date Picker */}
                <DatePickerModal
                    locale="en"
                    mode="single"
                    visible={showStartPicker}
                    date={filterDates.startDate}
                    onDismiss={() => setShowStartPicker(false)}
                    onConfirm={handleStartDateChange}
                    saveLabel={'Select'}
                    presentationStyle={'pageSheet'}
                    label={'Start Date'}
                    // labelStyle={{color: 'red'}}
                />

                {/* End Date Picker */}
                <DatePickerModal
                    locale="en"
                    mode="single"
                    visible={showEndPicker}
                    date={filterDates.endDate}
                    onDismiss={() => setShowEndPicker(false)}
                    onConfirm={handleEndDateChange}
                />

                <Text style={styles.sectionTitle}>Order Total</Text>
                <View style={styles.row}>
                    <TextInput
                        label="Min Total"
                        value={minTotal}
                        onChangeText={setMinTotal}
                        style={styles.input}
                        mode={'outlined'}
                        keyboardType="numeric"
                        dense
                    />
                    <TextInput
                        label="Max Total"
                        value={maxTotal}
                        onChangeText={setMaxTotal}
                        style={styles.input}
                        mode={'outlined'}
                        keyboardType="numeric"
                        dense
                    />
                </View>

            </View>
            </Card>
        </List.Accordion>

    </View>;

    return (
        <Surface style={styles.container}>
            {/* Search Input */}

            <FlatList
                data={filteredOrders}
                keyExtractor={(item) => item.orderId}
                renderItem={renderOrderItem}
                ListHeaderComponent={filterAndSortComponent()}
                ListEmptyComponent={<Text>No Orders Found</Text>}
                contentContainerStyle={{ margin: 0, padding: 0}}
            />
        </Surface>
    );
};

// const styles = StyleSheet.create({
//     container: { flex: 1, padding: 10 },
//     searchBar: { marginBottom: 10 },
//     sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
//     filterSection: { marginBottom: 15 },
//     chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
//     chip: { margin: 5 },
//     chipSelected: { backgroundColor: '#6200ee', color: '#ffffff' },
//     row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
//     totalInput: { flex: 1, marginHorizontal: 5 },
//     sortSection: { marginBottom: 10 },
//     card: { marginVertical: 8 },
// });
const makeStyles = ({colors}) => StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 10, margin: 0, },
    searchBar: { marginVertical: 10 },
    sectionTitle: { marginVertical: 8, fontSize: 16, fontWeight: 'bold' },
    chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
    chip: { margin: 5 },
    chipSelected: { backgroundColor: colors.primary },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 0, alignItems: 'center'},
    input: { flex: 1, marginHorizontal: 5, backgroundColor: colors.surface },
    card: { marginVertical: 8 },
    orderCard: { borderRadius: 0, backgroundColor: 'white', marginVertical: 5, borderWidth: 1, borderColor: '#aaaaaa'},
    accordionBar: { backgroundColor: colors.primary, height:50, minHeight: 50, paddingVertical: 0,justifyContent: 'center', alignItems: 'center',verticalAlign: 'center'},
    accordionContent: {justifyContent: 'center', color: 'white',},
    accordionTitle:{ color: 'white', fontSize: 16},
    dateContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
        elevation: 2, // Adds shadow for Android
        shadowColor: '#000', // Shadow for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    dateContent: {
        marginLeft: 10,
        flex: 1,
    },
    dateLabel: {
        fontSize: 14,
        color: '#666',
    },
    dateText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    section: {
        marginHorizontal: 10,
    },
    radioRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    radioItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16, // Space between radio options
    },
    radioLabel: {
        fontSize: 16,
        color: 'black',
        marginLeft: 4, // Space between radio button and text
    },
    toggleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start', // Adjust width to content
        backgroundColor: 'white',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    toggleText: {
        fontSize: 14,
        color: '#333',
        marginLeft: 8, // Space between the icon and the text
        fontWeight: '500',
    },
});
export default Orders;
