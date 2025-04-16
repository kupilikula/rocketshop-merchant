import React, { useMemo } from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import { Text, Divider, useTheme, Card } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useCustomerDetails } from "../../../../../api/hooks/useCustomerDetails";
import {useSelector} from "react-redux"; // Custom hook

const CustomerDetails = () => {
    const theme = useTheme();
    const router = useRouter();
    const {storeId} = useSelector( (state) => state.store);
    const { customerId } = useLocalSearchParams(); // Fetch the customer ID from the route params
    const { data: customer, isLoading, isError } = useCustomerDetails(storeId, customerId); // Fetch customer data
    const styles = makeStyles(theme);
    console.log('customer:', customer);
    const totalSpent = useMemo(() => {
        return customer?.orders.reduce((sum, order) => sum + order.orderTotal, 0);
    }, [customer]);

    const mostRecentOrderDate = useMemo(() => {
        if (!customer?.orders.length) return null;
        return new Date(
            Math.max(
                ...customer.orders.map((order) => new Date(order.orderDate).getTime())
            )
        );
    }, [customer]);

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
                    Total Orders: {customer.orders.length}
                </Text>
                <Text style={styles.infoText}>Total Spent: ₹{totalSpent}</Text>
                <Text style={styles.infoText}>
                    Most Recent Order:{" "}
                    {mostRecentOrderDate
                        ? mostRecentOrderDate.toLocaleDateString()
                        : "N/A"}
                </Text>
            </Card>

            {/* Orders List */}
            <Card style={styles.section}>
                <Text style={styles.sectionTitle}>Orders</Text>
                <View>
                    {customer.orders.map((order, index) => (
                        <View key={order.orderId}>
                            <Card
                                style={styles.orderCard}
                                onPress={() =>
                                    router.push("/Main/(tabs)/Orders/Order/" + order.orderId)
                                }
                            >
                                <Text style={styles.orderId}>Order ID: {order.orderId}</Text>
                                <Text>
                                    Date: {new Date(order.orderDate).toLocaleDateString()}
                                </Text>
                                <Text>Status: {order.orderStatus}</Text>
                                <Text>Total: ₹{order.orderTotal}</Text>
                            </Card>
                            {index < customer.orders.length - 1 && <Divider />}
                        </View>
                    ))}
                </View>
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
            backgroundColor: colors.nestedCard,
            borderRadius: 8,
            elevation: 2,
        },
        orderId: {
            fontWeight: "bold",
            marginBottom: 5,
        },
    });

export default CustomerDetails;