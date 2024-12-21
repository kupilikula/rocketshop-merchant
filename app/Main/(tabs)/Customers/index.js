import React, { useState, useMemo } from 'react';
import { FlatList, View, StyleSheet, Pressable } from 'react-native';
import {TextInput, Text, List, Chip, RadioButton, Surface, Divider, useTheme, Card} from 'react-native-paper';
import { useRouter } from 'expo-router';
import Fuse from 'fuse.js';
import { faker } from '@faker-js/faker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getCustomer } from '../../../../utils/fakeDataMethods';
import {CustomerListItem} from "../../../../components/CustomerListItem";

const initialCustomers = Array.from({ length: 100 }, getCustomer);

const Customers = () => {
    const [customers, setCustomers] = useState(initialCustomers);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState('numberOfOrders'); // Default sorting by number of orders
    const [sortOrder, setSortOrder] = useState('ascending'); // Default sorting order
    const [filterExpanded, setFilterExpanded] = useState(false);

    const router = useRouter();
    const theme = useTheme();
    const styles = makeStyles(theme);

    const fuse = useMemo(() => {
        return new Fuse(customers, {
            keys: ['fullName', 'email', 'phone'],
            threshold: 0.4,
            includeScore: false,
            ignoreLocation: true,
        });
    }, [customers]);

    const toggleSortOrder = () => {
        setSortOrder((prev) => (prev === 'ascending' ? 'descending' : 'ascending'));
    };

    const filteredCustomers = useMemo(() => {
        let result = customers;

        // Search filtering
        if (searchQuery.trim()) {
            const searchResults = fuse.search(searchQuery);
            result = searchResults.map((res) => res.item);
        }

        // Sorting
        result = [...result].sort((a, b) => {
            const isAscending = sortOrder === 'ascending';
            if (sortField === 'numberOfOrders') {
                return isAscending
                    ? a.orders.length - b.orders.length
                    : b.orders.length - a.orders.length;
            } else if (sortField === 'totalSpent') {
                const totalSpentA = a.orders.reduce((sum, order) => sum + order.orderTotal, 0);
                const totalSpentB = b.orders.reduce((sum, order) => sum + order.orderTotal, 0);
                return isAscending ? totalSpentA - totalSpentB : totalSpentB - totalSpentA;
            }
            return 0;
        });

        return result;
    }, [searchQuery, sortField, sortOrder, fuse]);

    const renderCustomerItem = ({ item }) => {

        return <CustomerListItem customer={item}/> ;
    };

    const searchFilterAndSortComponent = () => (
        <View style={{ marginBottom: 10 }}>
            <TextInput
                label="Search Customers"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchBar}
                mode="outlined"
            />
            <List.Accordion
                title="Sort & Filter"
                expanded={filterExpanded}
                onPress={() => setFilterExpanded(!filterExpanded)}
                style={styles.accordionBar}
                titleStyle={styles.accordionTitle}
                contentStyle={styles.accordionContent}
                right={() => (
                    <MaterialCommunityIcons
                        name={filterExpanded ? 'chevron-up' : 'chevron-down'}
                        size={24}
                        color="white"
                    />
                )}
            >
                <View style={styles.sortFilterContent}>
                    <Text style={styles.sectionTitle}>Sort By</Text>
                    <View style={styles.row}>
                        <RadioButton.Group onValueChange={setSortField} value={sortField}>
                            <View style={styles.radioRow}>
                                <RadioButton.Item
                                    label="Orders"
                                    value="numberOfOrders"
                                    mode="android"
                                    position="leading"
                                    color={theme.colors.primary}
                                    style={styles.radioItem}
                                    labelStyle={{fontSize: 16}}
                                />
                                <RadioButton.Item
                                    label="Total"
                                    value="totalSpent"
                                    mode="android"
                                    position="leading"
                                    color={theme.colors.primary}
                                    style={styles.radioItem}
                                    labelStyle={{fontSize: 16}}
                                />
                            </View>
                        </RadioButton.Group>
                        <Chip
                            mode="outlined"
                            style={styles.chip}
                            icon={() => (
                                <MaterialCommunityIcons
                                    name={sortOrder === 'ascending' ? 'arrow-up-bold' : 'arrow-down-bold'}
                                    size={20}
                                    color={theme.colors.primary}
                                />
                            )}
                            onPress={toggleSortOrder}
                        >
                            {sortOrder === 'ascending' ? 'Ascending' : 'Descending'}
                        </Chip>
                    </View>
                </View>


            </List.Accordion>
        </View>
    );

    return (
        <Surface style={styles.container}>
            <FlatList
                data={filteredCustomers}
                keyExtractor={(item) => item.customerId}
                renderItem={renderCustomerItem}
                ItemSeparatorComponent={() => <Divider style={{ marginVertical: 10 }} />}
                ListHeaderComponent={searchFilterAndSortComponent()}
                ListEmptyComponent={<Text>No Customers Found</Text>}
            />
        </Surface>
    );
};

const makeStyles = ({ colors }) =>
    StyleSheet.create({
        container: { flex: 1, paddingHorizontal: 10 },
        searchBar: { marginVertical: 10, backgroundColor: 'white' },
        card: {
            width: '100%',
            borderRadius: 0,
            backgroundColor: 'white',
            borderWidth: 1,
            borderColor: '#aaa',
            padding: 10
        },
        // card: {
        //     padding: 10,
        //     backgroundColor: colors.surface,
        //     elevation: 2,
        //     borderRadius: 8
        // },
        name: { fontWeight: 'bold', fontSize: 16 },
        email: { color: colors.textSecondary },
        details: { color: colors.textSecondary, fontSize: 16 },
        accordionBar: { backgroundColor: colors.primary, height:50, minHeight: 50, paddingVertical: 0,justifyContent: 'center', alignItems: 'center',verticalAlign: 'center'},
        accordionContent: {justifyContent: 'center', color: 'white',},
        accordionTitle:{ color: 'white', fontSize: 16},
        sectionTitle: { fontSize: 16, fontWeight: 'bold', marginVertical: 5, marginLeft: 10 },
        sortFilterContent: { padding: 0, backgroundColor: 'white', borderWidth: 1 },
        // chip: { marginVertical: 10 },
        row: {
            flexDirection: 'row',
            justifyContent: 'flex-start',
            flexWrap: 'wrap',
            alignItems: 'center',
            // backgroundColor: 'yellow',
            padding: 0,
            margin: 0,
            // borderWidth: 2
        },
        radioRow: {
            flexDirection: 'row',
            // alignItems: 'center',
            flexShrink: 1, // Allow shrinking
            // borderWidth: 2
        },
        radioItem: {
            marginHorizontal: 0,
            // borderWidth: 2,
            padding: 0,
            flexShrink: 1, // Ensure items don't exceed available space
        },
        chip: {
            margin: 0,
            alignSelf: 'center',
            flexShrink: 0, // Prevent shrinking too much
        },
    });

export default Customers;
