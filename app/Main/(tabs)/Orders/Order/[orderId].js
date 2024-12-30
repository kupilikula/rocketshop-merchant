import React from "react";
import { View, StyleSheet, Image, ScrollView, Pressable } from "react-native";
import {
    Card,
    Text,
    Divider,
    Chip,
    Avatar,
    Surface,
    useTheme,
} from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useOrderDetails } from "../../../../../hooks/useOrderDetails";

const OrderDetails = () => {
    const { orderId } = useLocalSearchParams(); // Fetch orderId from params
    const router = useRouter();
    const theme = useTheme();
    const styles = makeStyles(theme);

    // React Query: Fetch order details
    const { data: order, isLoading, isError } = useOrderDetails(orderId);

    if (isLoading) {
        return (
            <Surface style={styles.container}>
                <Text>Loading order details...</Text>
            </Surface>
        );
    }

    if (isError) {
        return (
            <Surface style={styles.container}>
                <Text>Error fetching order details. Please try again.</Text>
            </Surface>
        );
    }

    // Status color mapping
    const statusColors = {
        Submitted: "#f5a623",
        "Payment Received": "#3f51b5",
        Shipped: "#4caf50",
        Delivered: "#009688",
    };

    // Render individual order item
    const renderOrderItem = ({ item }) => (
        <>
            <Pressable
                key={item.product.productId}
                onPress={() =>
                    router.push("/Main/(tabs)/Products/Product/" + item.product.productId)
                }
            >
                <View style={styles.productContainer}>
                    <Image
                        source={{ uri: item.product.mediaItems[0]?.uri }}
                        style={styles.productImage}
                    />
                    <View style={styles.productDetails}>
                        <Text variant={"titleMedium"}>{item.product.productName}</Text>
                        <View style={styles.productInfoRow}>
                            <Text variant={"bodyLarge"} style={{ marginRight: 15 }}>
                                Price: ₹{item.product.price}
                            </Text>
                            <Text variant={"bodyLarge"}>Quantity: {item.quantity}</Text>
                        </View>
                        <Text variant={"titleMedium"}>
                            Subtotal: ₹{item.product.price * item.quantity}
                        </Text>
                    </View>
                </View>
            </Pressable>
            <Divider style={{ marginVertical: 8 }} />
        </>
    );

    return (
        <Surface style={{ flex: 1, backgroundColor: theme.colors.surface }}>
            <ScrollView>
                <View style={styles.container}>
                    {/* Order Summary */}
                    <Card style={styles.card}>
                        <Card.Title
                            title="Order Summary"
                            left={(props) => <Avatar.Icon {...props} icon="clipboard-list" />}
                        />
                        <Card.Content>
                            <Text variant={"bodyLarge"}>Order ID: {order.orderId}</Text>
                            <Text variant={"bodyLarge"}>
                                Order Date: {new Date(order.orderDate).toLocaleDateString()}
                            </Text>
                            <Text variant={"bodyLarge"}>
                                Number of Items:{" "}
                                {order.orderItems.reduce((A, v) => A + v.quantity, 0)}
                            </Text>
                            <Text variant={"titleMedium"}>
                                Order Total: ₹{order.orderTotal}
                            </Text>
                            <View style={styles.statusRow}>
                                <Chip
                                    style={{ backgroundColor: statusColors[order.orderStatus] }}
                                    textStyle={{ color: "#fff" }}
                                >
                                    {order.orderStatus}
                                </Chip>
                            </View>
                        </Card.Content>
                    </Card>

                    <Divider style={styles.divider} />

                    {/* Customer Information */}
                    <Card
                        style={styles.card}
                        onPress={() =>
                            router.push(
                                "/Main/(tabs)/Customers/Customer/" + order.customer.customerId
                            )
                        }
                    >
                        <Card.Title
                            title="Customer Information"
                            left={(props) => <Avatar.Icon {...props} icon="account" />}
                        />
                        <Card.Content>
                            <Text variant={"titleMedium"}>
                                Name: {order.customer.fullName}
                            </Text>
                            <Text variant={"bodyLarge"}>
                                Address: {order.customer.customerAddress}
                            </Text>
                            <Text variant={"bodyLarge"}>Phone: {order.customer.phone}</Text>
                            <Text variant={"bodyLarge"}>Email: {order.customer.email}</Text>
                        </Card.Content>
                    </Card>

                    <Divider style={styles.divider} />

                    {/* Order Items */}
                    <Card style={styles.card}>
                        <Card.Title
                            title="Order Items"
                            left={(props) => (
                                <Avatar.Icon {...props} icon="package-variant" />
                            )}
                        />
                        {order.orderItems.map((item) => {
                            return (
                                <View key={item.product.productId}>
                                    {renderOrderItem({ item })}
                                </View>
                            );
                        })}
                    </Card>
                </View>
            </ScrollView>
        </Surface>
    );
};

const makeStyles = (theme) =>
    StyleSheet.create({
        container: {
            flex: 1,
            padding: 10,
        },
        card: {
            borderRadius: 8,
            elevation: 2,
            backgroundColor: theme.colors.card,
        },
        divider: {
            marginVertical: 10,
        },
        statusRow: {
            flexDirection: "row",
            alignItems: "center",
            marginVertical: 5,
        },
        productContainer: {
            flexDirection: "row",
            alignItems: "center",
            padding: 10,
            backgroundColor: theme.colors.nestedCard,
            borderRadius: 8,
            marginHorizontal: 10,
        },
        productImage: {
            width: 80,
            height: 80,
            borderRadius: 8,
            marginRight: 10,
        },
        productDetails: {
            flex: 1,
        },
        productInfoRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
        },
    });

export default OrderDetails;