import React, { useState, useEffect } from 'react';
import { FlatList, View, StyleSheet } from "react-native";
import { useCustomerOrders } from "../api/hooks/useCustomerOrders";
import { useSelector } from "react-redux";
import { Button, Card, Divider, Text, useTheme } from "react-native-paper";
import { formatDateTime } from "../utils/date";
import { useRouter } from "expo-router";

export const CustomerOrders = ({ customerId }) => {
    const router = useRouter();
    const theme = useTheme();
    const styles = makeStyles(theme);
    const { storeId } = useSelector((state) => state.store);

    // const [page, setPage] = useState(1);
    // const limit = 2;

    const {
        data,
        isLoading,
        isFetchingNextPage,
        fetchNextPage,
        hasNextPage,
        isError,
        refetch,
    } = useCustomerOrders({ storeId, customerId, limit: 5 });

    const allOrders = data?.pages.flatMap((page) => page.orders) ?? [];


    // Append new orders to the list
    // Reset on customer change

    const renderOrder = (order) => (
        <View key={order.orderId}>
            <Card
                style={styles.orderCard}
                onPress={() =>
                    router.push("/Main/(tabs)/Orders/Order/" + order.orderId)
                }
            >
                <Text style={styles.orderId}>
                    Order ID: #{order.orderId.slice(0, 8).toUpperCase()}
                </Text>
                <Text>Date: {formatDateTime(new Date(order.orderDate))}</Text>
                <Text>Status: {order.orderStatus}</Text>
                <Text>Total: ₹{order.orderTotal}</Text>
            </Card>
        </View>
    );

    if (isError) {
        return (
            <View style={styles.centered}>
                <Text>Error loading orders.</Text>
                <Button mode="contained" onPress={refetch}>
                    Retry
                </Button>
            </View>
        );
    }

    return (
        <View style={styles.container}>
                {allOrders.map((order) => renderOrder(order))}
            {hasNextPage && (
                <Button
                    onPress={fetchNextPage}
                    loading={isFetchingNextPage}
                    disabled={isFetchingNextPage}
                    style={{ marginVertical: 10 }}
                >
                    Load More
                </Button>
            )}

            {!hasNextPage && allOrders.length > 0 && (
                <Text style={{ textAlign: "center", padding: 10 }}>No more orders.</Text>
            )}

            {!isLoading && allOrders.length === 0 && (
                <Text style={{ padding: 20 }}>No orders found.</Text>
            )}
        </View>
    );
};

const makeStyles = ({ colors }) =>
    StyleSheet.create({
        container: {
            padding: 8,
            backgroundColor: colors.surface,
            flex: 1,
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
        centered: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
        },
    });