import React from 'react';
import {View, StyleSheet, FlatList, Image, ScrollView} from 'react-native';
import {Card, Text, Divider, Chip, Avatar, List, Surface} from 'react-native-paper';
import {getOrder} from "../../../../../utils/fakeDataMethods";
import {useRouter} from "expo-router";

const OrderDetails = (props) => {

    const order = getOrder();

    const router = useRouter();

    console.log('order:', JSON.stringify(order, null, 2));
    // Status color mapping
    const statusColors = {
        Submitted: '#f5a623',
        'Payment Received': '#3f51b5',
        Shipped: '#4caf50',
        Delivered: '#009688',
    };

    // Render individual order item
    const renderOrderItem = ({ item }) => (
        <View style={styles.productContainer} key={item.product.productId}>
            <Image source={{ uri: item.product.mediaItems[0]?.uri }} style={styles.productImage} />
            <View style={styles.productDetails}>
                <Text variant={'titleMedium'}>{item.product.productName}</Text>
                <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start'}}>
                    <Text variant={'bodyLarge'} style={{marginRight: 15}}>Price: ₹{item.product.price}</Text>
                    <Text variant={'bodyLarge'} >Quantity: {item.quantity}</Text>
                </View>
                <Text variant={'titleMedium'}>
                    Subtotal: ₹{item.product.price * item.quantity}
                </Text>
            </View>
        </View>
    );

    return (
        <Surface style={{flex: 1}}>
            <ScrollView>
        <View style={styles.container}>
            {/* Order Summary */}
            <Card style={styles.card}>
                <Card.Title title="Order Summary" left={(props) => <Avatar.Icon {...props} icon="clipboard-list" />} />
                <Card.Content>
                    <Text variant={'bodyLarge'}>Order ID: {order.orderId}</Text>
                    <Text variant={'bodyLarge'}>Order Date: {new Date(order.orderDate).toLocaleDateString()}</Text>
                    <Text variant={'bodyLarge'}>Number of Items: {order.orderItems.reduce((A,v) => A+v.quantity,0)}</Text>
                    <Text variant={'titleMedium'}>Order Total: ₹{order.orderTotal}</Text>
                    <View style={styles.statusRow}>
                        <Chip style={{ backgroundColor: statusColors[order.orderStatus] }} textStyle={{ color: '#fff' }}>
                            {order.orderStatus}
                        </Chip>
                    </View>

                </Card.Content>
            </Card>

            <Divider style={styles.divider} />

            {/* Customer Information */}
            <Card style={styles.card} onPress={ () => router.push('/Main/(tabs)/Customers/Customer/' + order.customer.customerId)}>
                <Card.Title title="Customer Information" left={(props) => <Avatar.Icon {...props} icon="account" />} />
                <Card.Content>
                    <Text variant={'titleMedium'}>Name: {order.customer.fullName}</Text>
                    <Text variant={'bodyLarge'}>Address: {order.customer.customerAddress}</Text>
                    <Text variant={'bodyLarge'}>Phone: {order.customer.phone}</Text>
                    <Text variant={'bodyLarge'}>Email: {order.customer.email}</Text>
                </Card.Content>
            </Card>

            <Divider style={styles.divider} />

            {/* Order Items */}
            <Card style={styles.card}>
                <Card.Title title="Order Items" left={(props) => <Avatar.Icon {...props} icon="package-variant" />} />
                {order.orderItems.map((item) => {
                        return <View key={item.product.productId}>{renderOrderItem({item})}</View>
                })}
            </Card>
        </View>
            </ScrollView>
        </Surface>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        // backgroundColor: '#f9f9f9',
    },
    card: {
        marginBottom: 10,
        borderRadius: 8,
        elevation: 2,
        backgroundColor: 'white'
    },
    divider: {
        marginVertical: 10,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
    },
    orderTotal: {
        fontWeight: 'bold',
        marginTop: 8,
        fontSize: 16,
    },
    productContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    productImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 10,
    },
    productDetails: {
        flex: 1,
    },
    productName: {
        fontWeight: 'bold',
        marginBottom: 4,
    },
    productSubtotal: {
        marginTop: 4,
        fontWeight: 'bold',
    },
    itemDivider: {
        marginHorizontal: 10,
    },
});

export default OrderDetails;
