import React, { useMemo } from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import { Text, Divider, useTheme, Card } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useCustomerDetails } from "../../../../api/hooks/useCustomerDetails";
import {useSelector} from "react-redux";
import {formatDate} from "date-fns";
import {formatDateTime} from "../../../../utils/date";
import {CustomerOrders} from "../../../../components/CustomerOrders"; // Custom hook

const CustomerDetails = () => {
    const theme = useTheme();
    const router = useRouter();
    const {storeId} = useSelector( (state) => state.store);
    const { customerId } = useLocalSearchParams(); // Fetch the customer ID from the route params
    const { data: customer, isLoading, isError } = useCustomerDetails(storeId, customerId); // Fetch customer data
    const styles = makeStyles(theme);
    console.log('customer:', customer);

    if (isLoading) {
        return (
            <ScrollView style={styles.container}>
                <Text>Loading...</Text>
            </ScrollView>
        );
    }

    if (isError) {
        return (
            <ScrollView style={styles.container}>
                <Text>Error loading customer details.</Text>
            </ScrollView>
        );
    }

    console.log('typeof totalSpent:', typeof totalSpent);
    return (
        <ScrollView style={styles.container}>
            {/* Customer Info */}
            <Card style={styles.section}>
                <Text style={styles.sectionTitle}>Customer Information</Text>
                <Text style={styles.infoText}>Name: {customer.fullName}</Text>
                <Text style={styles.infoText}>Phone: {customer.phone}</Text>
                <Text style={styles.infoText}>Email: {customer.email}</Text>
                <Text style={styles.infoText}>Address: {customer.customerAddress}</Text>
            </Card>

            {/* Customer Statistics */}
            <Card style={styles.section}>
                <Text style={styles.sectionTitle}>Customer Statistics</Text>
                <Text style={styles.infoText}>
                    Total Orders: {customer.orderCount}
                </Text>
                <Text style={styles.infoText}>Total Spent: ₹{customer.totalSpent}</Text>
                <Text style={styles.infoText}>
                    Most Recent Order:{" "}
                    {customer.mostRecentOrderDate
                        ? formatDateTime( new Date(customer.mostRecentOrderDate))
                        : "N/A"}
                </Text>
            </Card>

            {/* Orders List */}
            <Card style={styles.section}>
                <Text style={styles.sectionTitle}>Orders</Text>
                <CustomerOrders customerId={customerId} />
            </Card>
        </ScrollView>
    );
};

const makeStyles = ({ colors }) =>
    StyleSheet.create({
        container: {
            flex: 1,
            padding: 10,
            backgroundColor: colors.surface,
        },
        section: {
            marginBottom: 20,
            padding: 10,
            backgroundColor: colors.card,
            borderRadius: 8,
            elevation: 2,
        },
        sectionTitle: {
            fontWeight: "bold",
            fontSize: 18,
            marginBottom: 10,
        },
        infoText: {
            fontSize: 16,
            marginBottom: 5,
        },
        orderCard: {
            padding: 10,
            marginVertical: 5,
            backgroundColor: colors.softPrimary,
            borderRadius: 8,
            elevation: 2,
        },
        orderId: {
            fontWeight: "bold",
            marginBottom: 5,
        },
    });

export default CustomerDetails;