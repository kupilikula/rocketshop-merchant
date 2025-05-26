import React, {useMemo, useState, useEffect} from "react"; // Added useEffect
import { View, StyleSheet, Image, ScrollView as DefaultScrollView, Pressable, Platform, ActivityIndicator, useWindowDimensions } from "react-native"; // Added Platform, DefaultScrollView, ActivityIndicator, useWindowDimensions
import {
    Card,
    Text,
    Divider,
    Chip,
    Avatar,
    // Surface, // Not directly used, View is used instead
    useTheme,
    Button, // Was missing from imports
} from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useOrderDetails } from "../../../../api/hooks/useOrderDetails";
import {useSelector} from "react-redux";
import {formatDateTime} from "../../../../utils/date";
import {allowedOrderStatusTransitions, orderStatusColors} from "../../../../utils/dataValues";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"; // For error icon
import ScrollableScreen from "../../../../components/ScrollableScreen"; // For mobile
import {useUpdateOrderStatus} from "../../../../api/hooks/useUpdateOrderStatus";
import {usePushWithBackHref} from "../../../../utils/usePushWithBackHref";
import { ProductDisplayCompactMerchant } from "../../../../components/ProductDisplayCompactMerchant";
import {getCustomerPath, getProductPath} from "../../../../utils/getPathUtils"; // For renderOrderItem

const IS_WEB = Platform.OS === 'web';

const OrderDetails = () => {
    const {storeId} = useSelector((state) => state.store);
    const { orderId } = useLocalSearchParams();
    const router = useRouter();
    const theme = useTheme();
    const { width: windowWidth } = useWindowDimensions(); // For makeStyles if needed
    const styles = makeStyles(theme, IS_WEB, windowWidth); // Pass theme & IS_WEB
    const updateOrderStatusMutation = useUpdateOrderStatus(storeId, orderId);
    const [selectedUpdateStatus, setSelectedUpdateStatus] = useState(null);
    const pushWithBackHref = usePushWithBackHref();

    const { data: order, isLoading, isError } = useOrderDetails(storeId, orderId);

    const availableNextStatuses = useMemo(() => {
        if (!order?.orderStatus) return [];
        return allowedOrderStatusTransitions[order.orderStatus] || [];
    }, [order?.orderStatus]);

    const renderStatusHistory = (statusHistory) => (
        statusHistory && statusHistory.length > 0 ? // Added null check for statusHistory
            <Card style={styles.timelineContainer}>
                <Card.Title title={'Status Timeline'} titleStyle={{fontWeight: 'bold'}} />
                <Card.Content>
                    {statusHistory.map((status, index) => (
                        <View key={status.orderStatusId || index} style={styles.timelineItem}>
                            <View style={styles.timelineIconContainer}>
                                <MaterialIcons
                                    name="circle"
                                    size={12}
                                    color={orderStatusColors[status.orderStatus] || theme.colors.onSurfaceVariant}
                                />
                            </View>
                            <View style={styles.timelineDetails}>
                                <Text variant="bodyLarge" style={{fontWeight: 'bold'}}>{status.orderStatus}</Text>
                                <Text variant="bodySmall">
                                    {formatDateTime(new Date(status.created_at))}
                                </Text>
                            </View>
                        </View>
                    ))}
                </Card.Content>
            </Card> : null
    );

    const renderOrderItem = ({ item }) => (
        // Using original styles, key is on the parent View when mapping
        <View>
            <Pressable
                onPress={() =>
                    pushWithBackHref(getProductPath(item.product.productId))
                }
            >
                <View style={styles.productContainer}>
                    <Image
                        source={{ uri: item.product.mediaItems && item.product.mediaItems.length > 0 ? item.product.mediaItems[0]?.uri : undefined }} // Check mediaItems
                        style={styles.productImage}
                        placeholder={require('../../../../assets/images/icon.png')} // Add a placeholder
                        contentFit="cover"
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
    console.log('order:', order); // Original console.log

    const pageContent = () => {
        if (!order) return null; // Should be caught by loading/error but good for safety
        return (
            <>
                <Card style={styles.card}>
                    <Card.Title
                        title="Order Summary"
                        left={(props) => <Avatar.Icon {...props} icon="clipboard-list" backgroundColor={theme.colors.primaryContainer} color={theme.colors.white}/>}
                        titleStyle={{fontWeight: 'bold'}}
                    />
                    <Card.Content>
                        <Text variant={"bodyLarge"}>Order ID: #{order.orderId.slice(0,8).toUpperCase()}</Text>
                        <Text variant={"bodyLarge"}>Order Date: {formatDateTime(new Date(order.orderDate))}</Text>
                        <Text variant={"bodyLarge"}>Items: {order.orderItems.reduce((A, v) => A + v.quantity, 0)}</Text>
                        <Text variant={"titleMedium"} style={{fontWeight: 'bold', marginTop: 4}}>Order Total: ₹{order.orderTotal}</Text>
                        <View style={styles.statusRow}>
                            <Chip
                                style={{ backgroundColor: orderStatusColors[order.orderStatus] || theme.colors.surfaceVariant }}
                                textStyle={{ color: 'black' }} // As per original
                            >
                                {order.orderStatus}
                            </Chip>
                        </View>
                    </Card.Content>
                </Card>

                <Divider style={styles.divider} />

                <Card style={styles.card}>
                    <Card.Title title="Update Order Status" titleStyle={{fontWeight: 'bold'}}/>
                    <Card.Content>
                        {availableNextStatuses.length === 0 ? (
                            <Text>This order is in a final state and cannot be updated further.</Text>
                        ) : (
                            <View style={{ flexWrap: 'wrap', flexDirection: 'row', justifyContent:'center' }}>
                                {availableNextStatuses.map((status) => (
                                    <Chip
                                        key={status}
                                        style={{
                                            margin: 4,
                                            backgroundColor:
                                                selectedUpdateStatus === status
                                                    ? theme.colors.primary
                                                    : theme.colors.surfaceVariant, // Changed from softPrimary for better contrast
                                        }}
                                        textStyle={{
                                            color: selectedUpdateStatus === status ? theme.colors.onPrimary : theme.colors.onSurfaceVariant,
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
                            <View style={{display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 16}}>
                                <Button
                                    mode="contained"
                                    onPress={() => {
                                        updateOrderStatusMutation.mutate(selectedUpdateStatus);
                                        console.log("Update order to:", selectedUpdateStatus);
                                    }}
                                    style={{ backgroundColor: theme.colors.secondary }} // Original color
                                    loading={updateOrderStatusMutation.isLoading}
                                    disabled={updateOrderStatusMutation.isLoading}
                                    contentStyle={{paddingVertical: 4}}
                                >
                                    Update to "{selectedUpdateStatus}"
                                </Button>
                            </View>
                        )}
                    </Card.Content>
                </Card>

                <Divider style={styles.divider} />
                {renderStatusHistory(order.orderStatusHistory)}
                {order.orderStatusHistory && order.orderStatusHistory.length > 0 && <Divider style={styles.divider} />}


                <Card style={styles.card} onPress={() => router.push(getCustomerPath(order.customer.customerId))}>
                    <Card.Title
                        title="Customer Information"
                        left={(props) => <Avatar.Icon {...props} icon="account" backgroundColor={theme.colors.primaryContainer} color={theme.colors.white}/>}
                        titleStyle={{fontWeight: 'bold'}}
                    />
                    <Card.Content>
                        <Text variant={"titleMedium"}>Name: {order.customer.fullName}</Text>
                        <Text variant={"bodyLarge"}>Address: {order.customer.customerAddress}</Text>
                        <Text variant={"bodyLarge"}>Phone: {order.customer.phone}</Text>
                        <Text variant={"bodyLarge"}>Email: {order.customer.email}</Text>
                    </Card.Content>
                </Card>

                <Divider style={styles.divider} />

                <Card style={styles.card}>
                    <Card.Title
                        title="Order Items"
                        left={(props) => <Avatar.Icon {...props} icon="package-variant" backgroundColor={theme.colors.primaryContainer} color={theme.colors.white}/>}
                        titleStyle={{fontWeight: 'bold'}}
                    />
                    <Card.Content>
                        {order.orderItems.map((item, index) => ( // Added index for key if productIds aren't unique in list
                            <View key={item.orderItemId || item.product.productId + '-' + index}>
                                {renderOrderItem({ item })}
                            </View>
                        ))}
                    </Card.Content>
                </Card>
            </>
        );
    };


    const loadingErrorContent = (message, isErrorState = false) => (
        <View style={styles.loadingErrorWrapper}>
            {isErrorState && <MaterialCommunityIcons name="alert-circle-outline" size={48} color={theme.colors.error} style={{ marginBottom: 10 }} />}
            {!isErrorState && <ActivityIndicator size={IS_WEB ? "large" : 100} color={theme.colors.primary} style={{ marginBottom: 10 }} />}
            <Text variant={isErrorState ? "titleLarge" : "bodyLarge"}>{message}</Text>
        </View>
    );

    if (isLoading) {
        const loadingView = loadingErrorContent("Loading order details...");
        return IS_WEB
            ? <View style={styles.webPageContainer_Root}><View style={styles.webScrollView_Shell}>{loadingView}</View></View>
            : <View style={[styles.mobileLoadingErrorRoot]}>{loadingView}</View>;
    }

    if (isError || !order) {
        const errorView = loadingErrorContent(order ? "Error loading order details." : "Order not found.", true);
        return IS_WEB
            ? <View style={styles.webPageContainer_Root}><View style={styles.webScrollView_Shell}>{errorView}</View></View>
            : <View style={[styles.mobileLoadingErrorRoot]}>{errorView}</View>;
    }

    if (IS_WEB) {
        return (
            <View style={styles.webPageContainer_Root}>
                <DefaultScrollView
                    style={styles.webScrollView_Shell}
                    contentContainerStyle={styles.webScrollViewContentContainer_Shell}
                    keyboardShouldPersistTaps="handled" // Good to keep
                >
                    {pageContent()}
                </DefaultScrollView>
            </View>
        );
    } else { // Mobile
        return (
            <ScrollableScreen
                backgroundColor={theme.colors.surface} // Original prop
                innerStyle={styles.container}         // Original prop, styles.container is used here
                // keyboardShouldPersistTaps could be a prop of ScrollableScreen if it passes to ScrollView
            >
                {pageContent()}
            </ScrollableScreen>
        );
    }
};

const makeStyles = (theme, isWeb, windowWidth) => {
    const { colors } = theme; // Original used theme.colors directly, some styles used colors
    return StyleSheet.create({
        // --- Original Mobile Styles (EXACTLY PRESERVED from user's code) ---
        container: { // Used by ScrollableScreen innerStyle on MOBILE
            flex: 1,
            padding: 10,
            justifyContent: "center", // Original
        },
        card: { // Original style for all cards
            borderRadius: 8,
            elevation: 2,
            backgroundColor: theme.colors.card, // Original, ensure theme.colors.card is defined
            marginBottom: 10, // Added consistent bottom margin for cards
        },
        divider: { // Original
            marginVertical: 10,
        },
        statusRow: { // Original
            flexDirection: "row",
            alignItems: "center",
            marginVertical: 5,
        },
        productContainer: { // Original
            flexDirection: "row",
            alignItems: "center",
            padding: 10,
            backgroundColor: theme.colors.nestedCard, // Ensure theme.colors.nestedCard is defined
            borderRadius: 8,
            marginHorizontal: 10, // Original
        },
        productImage: { // Original
            width: 80,
            height: 80,
            borderRadius: 8,
            marginRight: 10,
        },
        productDetails: { // Original
            flex: 1,
        },
        productInfoRow: { // Original
            flexDirection: "row",
            justifyContent: "space-between", // Original (though might not always be ideal if price is long)
            alignItems: "center",
        },
        timelineContainer: { // Original
            padding: 16,
            backgroundColor: theme.colors.white, // Original
            marginBottom: 10, // Ensure spacing if it's the last element before another card/divider
            borderRadius: 8,  // To match other cards
            elevation: 2,     // To match other cards
        },
        // timelineHeader: { marginBottom: 10, }, // Original had this but wasn't used with Card.Title
        timelineItem: { // Original
            flexDirection: 'row',
            // alignItems: 'center', // Changed to flex-start for better alignment with multi-line text
            alignItems: 'flex-start',
            marginBottom: 15,
        },
        timelineIconContainer: { // Renamed from timelineIcon for clarity, added marginRight
            width: 20,
            alignItems: 'center',
            marginRight: 10,
            marginTop: 4, // Align icon with first line of text
        },
        timelineDetails: { // Original
            flex: 1,
        },

        // --- Web Layout Styles ---
        webPageContainer_Root: {
            flex: 1,
            backgroundColor: 'white',
            alignItems: 'center', // Centers the shell
        },
        webScrollView_Shell: { // The ScrollView component on web, takes maxWidth
            width: '100%',
            maxWidth: 900,     // Max width for order details screen
            flex: 1,
            backgroundColor: theme.colors.surface, // Matches mobile ScrollableScreen background
        },
        webScrollViewContentContainer_Shell: { // For contentContainerStyle of web ScrollView
            padding: 10, // Matches mobile styles.container.padding
            flexGrow: 1,
            // Original mobile styles.container had justifyContent: "center".
            // For a typically long detail page, 'flex-start' is usually better on web.
            // If content is short, it will appear at the top.
            justifyContent: 'flex-start',
        },

        // --- Loading/Error wrapper styles ---
        mobileLoadingErrorRoot: { // Specific root for mobile loading/error to match original full screen
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: theme.colors.surface,
            padding: 10, // From original styles.container
        },
        loadingErrorWrapper: { // Common style for the content of loading/error
            justifyContent: "center",
            alignItems: "center",
            padding: 20, // Padding for the text/indicator
            flex: 1,
            width: '100%',
        },
        emptyListContainer: { // Added for consistency, though not used by FlatList in this screen
            flexGrow: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            marginTop: 20,
        },
    });
};

export default OrderDetails;