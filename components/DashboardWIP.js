import React, { useState } from "react";
import {
    View,
    ScrollView,
    StyleSheet,
    Pressable,
} from "react-native";
import {
    Card,
    Text,
    Button,
    Divider,
    Surface,
    useTheme,
    Banner,
    ActivityIndicator,
    RadioButton,
} from "react-native-paper";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useQuery } from "react-query";
import axiosClient from "../../../api/client";
import { ProductDisplayCompactMerchant } from "../../../components/ProductDisplayCompactMerchant";
import { CustomerListItem } from "../../../components/CustomerListItem";
import { VictoryAxis, VictoryBar, VictoryChart, VictoryTheme } from "victory-native";

const useDashboardData = (storeId) => {
    return useQuery(['merchantDashboard', storeId], async () => {
        const { data } = await axiosClient.get(`/dashboard?storeId=${storeId}`);
        return data;
    });
};

const Dashboard = () => {
    const theme = useTheme();
    const styles = makeStyles(theme);
    const router = useRouter();
    const { storeId } = useSelector((state) => state.store);
    const { data, isLoading } = useDashboardData(storeId);
    const [salesOrOrders, setSalesOrOrders] = useState("Sales");
    const [chartTimeWindow, setChartTimeWindow] = useState("week");

    if (isLoading) {
        return <ActivityIndicator animating={true} size="large" style={{ flex: 1 }} />;
    }

    const { banners, quickStats, chartData, productInventory, topProducts, topCustomers } = data;

    return (
        <ScrollView contentContainerStyle={styles.scrollContent}>
            <Surface style={styles.container}>
                <StoreStatusBanner banners={banners} />

                <QuickStatsSection
                    stats={quickStats}
                    onPressOpenOrders={() => router.push({ pathname: "/Main/Orders", params: { filter: "open" } })}
                    onPressNewOrders={() => router.push({ pathname: "/Main/Orders", params: { filter: "today" } })}
                    onPressSales={() => router.push({ pathname: "/Main/Orders", params: { filter: "today" } })}
                />

                <Divider style={{ marginVertical: 10 }} />
                <QuickLinksSection router={router} />

                <Divider style={{ marginVertical: 10 }} />
                <RecentTrendsSection
                    salesOrOrders={salesOrOrders}
                    chartTimeWindow={chartTimeWindow}
                    setSalesOrOrders={setSalesOrOrders}
                    setChartTimeWindow={setChartTimeWindow}
                    chartData={chartData}
                />

                <Divider style={{ marginVertical: 10 }} />
                <ProductInventorySection inventory={productInventory} />

                <Divider style={{ marginVertical: 10 }} />
                <Text variant="titleLarge" style={styles.sectionHeader}>Top Products</Text>
                {topProducts.map((product) => (
                    <View key={product.productId}>
                        <Pressable onPress={() => router.push(`/Main/(tabs)/Products/Product/${product.productId}`)}>
                            <ProductDisplayCompactMerchant product={product} />
                        </Pressable>
                        <Divider style={{ marginVertical: 8 }} />
                    </View>
                ))}

                <Divider style={{ marginVertical: 10 }} />
                <Text variant="titleLarge" style={styles.sectionHeader}>Top Customers</Text>
                {topCustomers.map((customer) => (
                    <View key={customer.customerId}>
                        <CustomerListItem customer={customer} />
                        <Divider style={{ marginVertical: 8 }} />
                    </View>
                ))}
            </Surface>
        </ScrollView>
    );
};

const StoreStatusBanner = ({ banners }) => {
    const theme = useTheme();
    return (
        <View style={{ marginVertical: 10 }}>
            {banners.isInactive && (
                <Banner visible icon="alert-circle" style={{ backgroundColor: theme.colors.errorContainer, marginBottom: 10 }}>
                    This store is currently <Text style={{ fontWeight: 'bold' }}>Inactive</Text>. Activate in Store Settings.
                </Banner>
            )}
            {banners.hasNoProducts && (
                <Banner visible icon="package-variant" style={{ backgroundColor: theme.colors.secondaryContainer, marginBottom: 10 }}>
                    Your store doesn’t have any products yet. Add products to start receiving orders.
                </Banner>
            )}
            {banners.hasNoOrders && !banners.hasNoProducts && (
                <Banner visible icon="shopping" style={{ backgroundColor: theme.colors.primaryContainer }}>
                    You’ve added products but haven’t received any orders yet. Share your store with customers.
                </Banner>
            )}
        </View>
    );
};

const QuickStatsSection = ({ stats, onPressOpenOrders, onPressNewOrders, onPressSales }) => {
    const theme = useTheme();
    const styles = makeStyles(theme);
    return (
        <View style={{ marginVertical: 16 }}>
            <View style={styles.sectionHeaderRow}>
                <MaterialIcons name="today" size={28} style={{ marginRight: 8 }} color={theme.colors.primary} />
                <Text variant="titleLarge" style={{ color: theme.colors.secondary }}>Today</Text>
            </View>
            <View style={styles.cardRow}>
                <Pressable onPress={onPressOpenOrders} style={{ flex: 1 }}>
                    <Card style={styles.statsCard}><Text variant="titleMedium" style={styles.cardTitle}>Open Orders</Text><Text variant="headlineLarge" style={styles.cardValue}>{stats.openOrders}</Text></Card>
                </Pressable>
                <Pressable onPress={onPressNewOrders} style={{ flex: 1 }}>
                    <Card style={styles.statsCard}><Text variant="titleMedium" style={styles.cardTitle}>New Orders</Text><Text variant="headlineLarge" style={styles.cardValue}>{stats.newOrders}</Text></Card>
                </Pressable>
                <Pressable onPress={onPressSales} style={{ flex: 1 }}>
                    <Card style={styles.statsCard}><Text variant="titleMedium" style={styles.cardTitle}>Sales</Text><Text variant="headlineLarge" style={styles.cardValue}>₹{stats.salesToday}</Text></Card>
                </Pressable>
            </View>
        </View>
    );
};

const QuickLinksSection = ({ router }) => {
    return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' }}>
            <Button icon="receipt" mode="contained" style={{ margin: 8 }} onPress={() => router.push("/Main/Orders")}>Orders</Button>
            <Button icon="plus-box" mode="contained" style={{ margin: 8 }} onPress={() => router.push("/Main/AddNewProduct")}>Add Product</Button>
            <Button icon="view-grid" mode="contained" style={{ margin: 8 }} onPress={() => router.push("/Main/Collections")}>Collections</Button>
        </View>
    );
};

const RecentTrendsSection = ({ salesOrOrders, chartTimeWindow, setSalesOrOrders, setChartTimeWindow, chartData }) => {
    const theme = useTheme();
    const styles = makeStyles(theme);
    const data = chartData[salesOrOrders.toLowerCase()][chartTimeWindow];
    return (
        <Card style={styles.statsCard}>
            <View style={styles.sectionHeaderRow}>
                <MaterialIcons name="trending-up" size={28} style={{ marginRight: 8 }} color={theme.colors.primary} />
                <Text variant="titleLarge">{salesOrOrders} Trend</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <RadioButton.Group onValueChange={setSalesOrOrders} value={salesOrOrders}>
                    <View style={styles.radioRow}>
                        <RadioButton.Item label="Sales" value="Sales" position="leading" style={styles.radioButton} />
                        <RadioButton.Item label="Orders" value="Orders" position="leading" style={styles.radioButton} />
                    </View>
                </RadioButton.Group>
                <RadioButton.Group onValueChange={setChartTimeWindow} value={chartTimeWindow}>
                    <View style={styles.radioRow}>
                        <RadioButton.Item label="Week" value="week" position="leading" style={styles.radioButton} />
                        <RadioButton.Item label="Month" value="month" position="leading" style={styles.radioButton} />
                    </View>
                </RadioButton.Group>
            </View>
            <VictoryChart theme={VictoryTheme.clean}><VictoryAxis /><VictoryBar data={data.map(({ label, value }) => ({ x: label, y: value }))} /></VictoryChart>
        </Card>
    );
};

const ProductInventorySection = ({ inventory }) => {
    const theme = useTheme();
    const styles = makeStyles(theme);
    return (
        <Card style={styles.statsCard}>
            <Text variant="titleLarge" style={styles.cardTitle}>Inventory Summary</Text>
            <Text>Total Products: {inventory.total}</Text>
            <Text>Active: {inventory.active}</Text>
            <Text>Inactive: {inventory.inactive}</Text>
        </Card>
    );
};

const makeStyles = (theme) => StyleSheet.create({
    container: { flex: 1, padding: 10, backgroundColor: theme.colors.surface },
    scrollContent: {},
    sectionHeader: { fontSize: 20, fontWeight: 'bold', marginVertical: 8, marginHorizontal: 4 },
    sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingHorizontal: 4 },
    cardRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
    statsCard: { padding: 10, marginHorizontal: 4, backgroundColor: 'white' },
    cardTitle: { alignSelf: 'center', marginBottom: 8 },
    cardValue: { alignSelf: 'center', marginVertical: 4 },
    radioRow: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' },
    radioButton: { width: 120, marginVertical: 0, padding: 0 },
});

export default Dashboard;
