import React, {useMemo, useState} from "react";
import { View, StyleSheet, Image, ScrollView, Pressable } from "react-native";
import {
    Card,
    Text,
    Divider,
    Chip,
    Avatar,
    Surface,
    useTheme, ActivityIndicator, Button,
} from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useOrderDetails } from "../../../../api/hooks/useOrderDetails";
import {useSelector} from "react-redux";
import {formatDateTime} from "../../../../utils/date";
import {allowedOrderStatusTransitions, orderStatusColors} from "../../../../utils/dataValues";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import ScrollableScreen from "../../../../components/ScrollableScreen";
import {useUpdateOrderStatus} from "../../../../api/hooks/useUpdateOrderStatus";
import {usePushWithBackHref} from "../../../../utils/usePushWithBackHref";

const OrderDetails = () => {
    const {storeId} = useSelector((state) => state.store);
    const { orderId } = useLocalSearchParams(); // Fetch orderId from params
    const router = useRouter();
    const theme = useTheme();
    const updateOrderStatusMutation = useUpdateOrderStatus(storeId, orderId);
    const styles = makeStyles(theme);
    const [selectedUpdateStatus, setSelectedUpdateStatus] = useState(null);
    const pushWithBackHref = usePushWithBackHref();

    // React Query: Fetch order details
    const { data: order, isLoading, isError } = useOrderDetails(storeId, orderId);

    const availableNextStatuses = useMemo(() => {
        if (!order?.orderStatus) return [];
        return allowedOrderStatusTransitions[order.orderStatus] || [];
    }, [order?.orderStatus]);

    const renderStatusHistory = (statusHistory) => (
        statusHistory.length > 0 ?
    <Card style={styles.timelineContainer}>
        <Card.Title title={'Status Timeline'}></Card.Title>
        {statusHistory.map((status, index) => (
            <View key={status.orderStatusId} style={styles.timelineItem}>
                <View style={styles.timelineIcon}>
                    <MaterialIcons
                        name="circle"
                        size={12}
                        color={orderStatusColors[status.orderStatus]}
                    />
                </View>
                <View style={styles.timelineDetails}>
                    <Text variant="bodyLarge">{status.orderStatus}</Text>
                    <Text variant="bodySmall">
                        {new Date(status.created_at).toLocaleString()}
                    </Text>
                </View>
            </View>
        ))}
    </Card> : null);

    // Render individual order item
    const renderOrderItem = ({ item }) => (
        <View key={item.product.productId}>
            <Pressable
                onPress={() =>
                    pushWithBackHref("/Main/(tabs)/Products/" + item.product.productId)
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
                            Subtotal: ₹{(item.product.price * item.quantity).toFixed(2)}
                        </Text>
                    </View>
                </View>
            </Pressable>
            <Divider style={{ marginVertical: 8 }} />
        </View>
    );
    console.log('order:', order);

    if (isLoading) {
        return (<View style={styles.container}>
            <ActivityIndicator size={100} animating={true} color={theme.colors.primary}/>
        </View>);
    }

    return (
        <ScrollableScreen backgroundColor={theme.colors.surface} innerStyle={styles.container}>
                    {/* Order Summary */}
                    <Card style={styles.card}>
                        <Card.Title
                            title="Order Summary"
                            left={(props) => <Avatar.Icon {...props} icon="clipboard-list" />}
                        />
                        <Card.Content>
                            <Text variant={"bodyLarge"}>Order ID: #{order.orderId.slice(0,8).toUpperCase()}</Text>
                            <Text variant={"bodyLarge"}>
                                Order Date: {formatDateTime(new Date(order.orderDate))}
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
                                    style={{ backgroundColor: orderStatusColors[order.orderStatus] }}
                                    textStyle={{ color: 'black' }}
                                >
                                    {order.orderStatus}
                                </Chip>
                            </View>
                        </Card.Content>
                    </Card>

                    <Divider style={styles.divider} />

            <Card style={styles.card}>
                <Card.Title title="Update Order Status" />
                <Card.Content>
                    {availableNextStatuses.length === 0 ? (
                        <Text>This order is in a final state and cannot be updated.</Text>
                    ) : (
                        <View style={{ flexWrap: 'wrap', flexDirection: 'row' }}>
                            {availableNextStatuses.map((status) => (
                                <Chip
                                    key={status}
                                    style={{
                                        margin: 4,
                                        backgroundColor:
                                            selectedUpdateStatus === status
                                                ? theme.colors.primary
                                                : theme.colors.softPrimary,
                                    }}
                                    textStyle={{
                                        color: selectedUpdateStatus === status ? "white" : "black",
                                    }}
                                    onPress={() => setSelectedUpdateStatus(status)}
                                    selected={selectedUpdateStatus === status}
                                >
                                    {status}
                                </Chip>
                            ))}
                        </View>
                    )}
                    {selectedUpdateStatus && availableNextStatuses.length > 0 && (
                        <View style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        <Button
                            mode="contained"
                            onPress={() => {
                                // Call mutation here
                                updateOrderStatusMutation.mutate(selectedUpdateStatus);
                                console.log("Update order to:", selectedUpdateStatus);
                            }}
                            style={{ marginTop: 10, backgroundColor: theme.colors.secondary }}
                            loading={updateOrderStatusMutation.isLoading}
                        >
                            Update Status
                        </Button>
                        </View>
                    )}
                </Card.Content>
            </Card>
            <Divider style={styles.divider} />

                    {renderStatusHistory(order.orderStatusHistory)}
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

        </ScrollableScreen>
    );
};

const makeStyles = (theme) =>
    StyleSheet.create({
        container: {
            flex: 1,
            padding: 10,
            justifyContent: "center",
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
        timelineContainer: {
            padding: 16,
            backgroundColor: theme.colors.white
        },
        timelineHeader: {
            marginBottom: 10,
        },
        timelineItem: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 15,
        },
        timelineIcon: {
            width: 20,
            alignItems: 'center',
        },
        timelineDetails: {
            flex: 1,
        },

    });

export default OrderDetails;