import React, {useMemo, useState} from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { Card, Text, Button, TextInput, Chip, Appbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import {useRouter} from "expo-router";
import Fuse from "fuse.js";
import {getOrder} from "../../../../utils/fakeDataMethods";
import {faker} from '@faker-js/faker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const initialOrders = faker.helpers.multiple(getOrder, {count: 100});

const Orders = () => {
    const [orders, setOrders] = useState(initialOrders);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [minTotal, setMinTotal] = useState('');
    const [maxTotal, setMaxTotal] = useState('');
    const [filterDate, setFilterDate] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [sortField, setSortField] = useState('orderDate'); // Default sorting
    const [sortOrder, setSortOrder] = useState('ascending'); // Default sorting order

    const router = useRouter();

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

        if (filterStatus) {
            result = result.filter((order) => order.orderStatus === filterStatus);
        }
        console.log('result.length before total filtering:', result.length);
        console.log('minTotal:', minTotal, ' ,maxTotal:', maxTotal);
        // Filter by orderTotal range
        if (minTotal || maxTotal) {
            const min = minTotal ? parseInt(minTotal, 10) : Number.NEGATIVE_INFINITY;
            const max = maxTotal ? parseInt(maxTotal, 10) : Number.POSITIVE_INFINITY;
            result = result.filter((order) => order.orderTotal >= min && order.orderTotal <= max);
        }

        // Filter by orderDate
        if (filterDate) {
            result = result.filter((order) => {
                return order.orderDate.toDateString() === filterDate.toDateString();
            });
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
    }, [searchQuery, filterStatus, minTotal, maxTotal, filterDate, sortField, sortOrder, fuse]);

    // Function to update order status
    const updateOrderStatus = (id, newStatus) => {
        const updatedOrders = orders.map((order) =>
            order.id === id ? { ...order, status: newStatus } : order
        );
        setOrders(updatedOrders);
    };

    const renderOrderItem = ({ item }) => (
        <Card style={styles.card} onPress={() => router.push('./Order'+ item.orderId)}>
            <Card.Title title={`Order #${item.orderId}`} subtitle={`Customer: ${item.customer.fullName}`} />
            <Card.Content>
                <Text>Status: {item.orderStatus}</Text>
                <Text>Total: {item.orderTotal}</Text>
                <Text>Date: {item.orderDate.toDateString()}</Text>
            </Card.Content>
        </Card>
    );

    return (
        <View style={styles.container}>
            {/* Search Input */}
            <TextInput
                label="Search Orders"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchBar}
                mode="outlined"
            />

            {/* Filters */}
            <View style={styles.filterSection}>
                <Text style={styles.sectionTitle}>Filters</Text>
                <View style={styles.chipContainer}>
                    {['All', 'Submitted', 'Shipped', 'Delivered'].map((status) => (
                        <Chip
                            key={status}
                            style={[styles.chip, filterStatus === status && styles.chipSelected]}
                            onPress={() => setFilterStatus(status === 'All' ? '' : status)}
                        >
                            {status}
                        </Chip>
                    ))}
                </View>
                <View style={styles.row}>
                    <TextInput label="Min Total" value={minTotal} onChangeText={setMinTotal} style={styles.totalInput} keyboardType="numeric" />
                    <TextInput label="Max Total" value={maxTotal} onChangeText={setMaxTotal} style={styles.totalInput} keyboardType="numeric" />
                </View>
                <Button mode="outlined" onPress={() => setShowDatePicker(true)}>Select Order Date</Button>
                <DateTimePickerModal
                    isVisible={showDatePicker}
                    mode="date"
                    onConfirm={(date) => {
                        setShowDatePicker(false);
                        setFilterDate(date);
                    }}
                    onCancel={() => setShowDatePicker(false)}
                />
            </View>

            {/* Sorting */}
            <View style={styles.sortSection}>
                <Text style={styles.sectionTitle}>Sort By</Text>
                <View style={styles.row}>
                    <Button mode={sortField === 'orderDate' ? 'contained' : 'outlined'} onPress={() => setSortField('orderDate')}>Date</Button>
                    <Button mode={sortField === 'orderTotal' ? 'contained' : 'outlined'} onPress={() => setSortField('orderTotal')}>Total</Button>
                    <Button mode="outlined" onPress={() => setSortOrder(sortOrder === 'ascending' ? 'descending' : 'ascending')}>
                        {sortOrder === 'ascending' ? '↑ Ascending' : '↓ Descending'}
                    </Button>
                </View>
            </View>


            <FlatList
                data={filteredOrders}
                keyExtractor={(item) => item.orderId}
                renderItem={renderOrderItem}
                ListEmptyComponent={<Text>No Orders Found</Text>}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10 },
    searchBar: { marginBottom: 10 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
    filterSection: { marginBottom: 15 },
    chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
    chip: { margin: 5 },
    chipSelected: { backgroundColor: '#6200ee', color: '#ffffff' },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    totalInput: { flex: 1, marginHorizontal: 5 },
    sortSection: { marginBottom: 10 },
    card: { marginVertical: 8 },
});
export default Orders;
