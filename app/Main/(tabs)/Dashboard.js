// Refactored Dashboard Screen using `situations` instead of `banners` with chart window constraints

import React, {useEffect, useMemo, useState} from "react";
import {
    View,
    ScrollView,
    StyleSheet,
    Pressable,
    ActivityIndicator,
} from "react-native";
import {
    Card,
    Text,
    Button,
    Divider,
    Surface,
    RadioButton,
    useTheme,
    Banner,
} from "react-native-paper";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { VictoryAxis, VictoryBar, VictoryChart, VictoryTheme } from "victory-native";
import { useSelector } from "react-redux";
import { useDashboard } from "../../../api/hooks/useDashboard";
import { ProductDisplayCompactMerchant } from "../../../components/ProductDisplayCompactMerchant";
import { TopCustomerListItem } from "../../../components/TopCustomerListItem";
import ScrollableScreen from "../../../components/ScrollableScreen";
import { AutoSizeText, ResizeTextMode } from "react-native-auto-size-text";
import {usePushWithBackHref} from "../../../utils/usePushWithBackHref";

export default function Dashboard ()  {
    const router = useRouter();
    const theme = useTheme();
    const styles = makeStyles(theme);
    const store = useSelector((state) => state.store);
    const { data: dashboardData = {}, isLoading } = useDashboard(store.storeId);

    const [chartTimeWindow, setChartTimeWindow] = useState("week");
    const [salesOrOrders, setSalesOrOrders] = useState("Sales");
    const pushWithBackHref = usePushWithBackHref();


    function lastNDays(n) {
        var result = [];
        for (var i = n - 1; i >= 0; i--) {
            var d = new Date();
            d.setDate(d.getDate() - i);
            result.push(d.getDate() + "/" + (d.getMonth() + 1));
        }
        return result;
    }

    const situations = useMemo(() => dashboardData.situations || {}, [dashboardData]);
    const storeAge = useMemo(() => situations.storeAgeInDays || 0, [situations]);
    const shouldShowCharts = useMemo(() => storeAge >= 7 && situations.totalOrders > 0 && situations.hasProducts,[storeAge, situations]);
    const canShowMonthChart = useMemo(() => storeAge >= 28, [storeAge]);
    const showTopProducts = useMemo(() => dashboardData.topProducts && dashboardData.topProducts.length > 0, [dashboardData]);
    const showTopCustomers = useMemo(() => dashboardData.topCustomers && dashboardData.topCustomers.length > 0, [dashboardData]);
    // Auto-select time window based on age
    const effectiveChartTimeWindow = canShowMonthChart ? chartTimeWindow : "week";

    console.log("Dashboard Data", dashboardData);
    const quickLinks = [
        {
            label: "Open Orders",
            icon: "receipt",
            action: () => router.push({ pathname: "/Main/Orders", params: { filter: "open" } }),
            show: true,
        },
        {
            label: "Orders Today",
            icon: "calendar-today",
            action: () => router.push({ pathname: "/Main/Orders", params: { filter: "today" } }),
            show: true,
        },
        {
            label: "Low Stock Products",
            icon: "battery-20",
            action: () => router.push({ pathname: "/Main/Products", params: { filter: "lowstock" } }),
            show: situations.hasActiveProducts,
        },
        {
            label: "Add Products",
            icon: "plus-box",
            action: () => router.push("/Main/Products/Create"),
            show: !situations.hasProducts,
        },
        {
            label: "Create Offer",
            icon: "percent",
            action: () => router.push("/Main/Offers/Create"),
            show: situations.totalOrders >= 5,
        },
    ];

    const banners = useMemo(() => {
        if (!situations) return [];

        const newBanners = [];

        if (!situations.storeIsActive) {
            newBanners.push({
                icon: "alert-circle",
                color: theme.colors.errorContainer,
                message: (
                    <>This store is currently <Text style={{ fontWeight: "bold" }}>Inactive</Text>. Customers cannot browse or place orders. You can activate this store from <Text style={{ fontWeight: "bold" }}>Store Settings</Text>.</>
                )
            });
        }

        if (situations.totalProducts === 0 && situations.totalOrders === 0) {
            newBanners.push({
                icon: "store-off",
                color: theme.colors.secondaryContainer,
                message: (
                    <>Your store doesn’t have any <Text style={{ fontWeight: "bold" }}>products</Text> listed and hasn’t received any <Text style={{ fontWeight: "bold" }}>orders</Text> yet. Start by adding products and sharing your store to attract customers.</>
                )
            });
        }

        if (situations.totalProducts === 0 && situations.totalOrders > 0) {
            newBanners.push({
                icon: "cube-outline",
                color: theme.colors.secondaryContainer,
                message: (
                    <>This store has received <Text style={{ fontWeight: "bold" }}>orders</Text> in the past, but currently has no <Text style={{ fontWeight: "bold" }}>products</Text>. Add new products to keep your store up to date.</>
                )
            });
        }

        if (situations.totalProducts > 0 && situations.totalOrders === 0) {
            newBanners.push({
                icon: "cart-outline",
                color: theme.colors.tertiaryContainer,
                message: (
                    <>Your products are live, but the store hasn’t received any <Text style={{ fontWeight: "bold" }}>orders</Text> yet. Share your store link or run promotions to reach more customers.</>
                )
            });
        }

        if (situations.firstActiveProduct) {
            newBanners.push({
                icon: "star-outline",
                color: theme.colors.secondaryContainer,
                message: (
                    <>🎉 You’ve listed your <Text style={{ fontWeight: "bold" }}>first active product</Text>! Add more to grow your catalog and attract more customers.</>
                )
            });
        }

        if (situations.firstFewActiveProducts) {
            newBanners.push({
                icon: "layers-outline",
                color: theme.colors.secondaryContainer,
                message: (
                    <>You’re off to a good start with a few active products. Keep going — customers love variety!</>
                )
            });
        }

        if (situations.firstCompletedOrder) {
            newBanners.push({
                icon: "check-circle-outline",
                color: theme.colors.tertiaryContainer,
                message: (
                    <>✅ Congratulations on your <Text style={{ fontWeight: "bold" }}>first completed order</Text>! Keep the momentum going by sharing your store link.</>
                )
            });
        }

        if (situations.firstInProgressOrder) {
            newBanners.push({
                icon: "truck-delivery-outline",
                color: theme.colors.tertiaryContainer,
                message: (
                    <>🚚 You’ve got your <Text style={{ fontWeight: "bold" }}>first in-progress order</Text>. Prepare for shipping and update its status once fulfilled.</>
                )
            });
        }

        if (situations.firstFewOrders) {
            newBanners.push({
                icon: "cart-arrow-down",
                color: theme.colors.tertiaryContainer,
                message: (
                    <>📦 Great! Your store has started receiving orders. Continue delighting customers with on-time delivery and support.</>
                )
            });
        }

        if (situations.refundedOrReturnedOrders > 0) {
            newBanners.push({
                icon: "history",
                color: theme.colors.errorContainer,
                message: (
                    <>You’ve had some refunds or returns. Review your product quality and customer communication to improve future experiences.</>
                )
            });
        }

        return newBanners;
    }, [situations, theme.colors]);



    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size={100} color={theme.colors.primary} />
            </View>
        );
    }


    return (
        <ScrollableScreen backgroundColor={theme.colors.surface} innerStyle={styles.container}>
            {/* Situational Banners */}
            {banners?.map((b, i) => (
                <Banner
                    key={i}
                    visible
                    icon={b.icon}
                    style={{ backgroundColor: b.color, marginVertical: 10 }}
                >
                    {b.message}
                </Banner>
            ))}

            {/* Stats */}
            <View style={{ margin: 4 }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                    <MaterialIcons name="today" size={36} style={{ marginRight: 10 }} color={theme.colors.primary} />
                    <Text variant="titleLarge" style={{ color: theme.colors.secondary }}>Today</Text>
                </View>
                <View style={styles.statsRow}>
                    {["openOrders", "newOrdersToday", "salesToday"].map((key, index) => {
                        const label = key === "openOrders" ? "Open Orders" : key === "newOrdersToday" ? "New Orders" : "Sales";
                        const value =
                            key === "salesToday"
                                ? `₹${dashboardData?.quickStats[key]}`
                                : dashboardData?.quickStats[key]?.toString();
                        return (
                            <Card key={index} style={styles.statsCard} mode="elevated">
                                <Card.Title title={label} titleStyle={{ fontSize: 13, alignSelf: "center" }} />
                                <Card.Content style={styles.cardContent}>
                                    <AutoSizeText
                                        fontSize={32}
                                        numberOfLines={1}
                                        mode={ResizeTextMode.max_lines}
                                        style={{ justifyContent: "center", textAlign: "center" }}
                                    >
                                        {value}
                                    </AutoSizeText>
                                </Card.Content>
                            </Card>
                        );
                    })}
                </View>
            </View>

            {/* Quick Links */}
            <Divider style={{ marginVertical: 10 }} />
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                <MaterialIcons name="launch" size={36} style={{ marginRight: 10 }} color={theme.colors.primary} />
                <Text variant="titleLarge" style={{ color: theme.colors.secondary }}>Quick Links</Text>
            </View>
            <View style={{ flexWrap: "wrap", flexDirection: "row", justifyContent: "space-around" }}>
                {quickLinks.filter(link => link.show).map((link, index) => (
                    <Button
                        key={index}
                        icon={link.icon}
                        mode="contained"
                        style={{ borderRadius: 8, margin: 10 }}
                        onPress={link.action}
                    >
                        {link.label}
                    </Button>
                ))}
            </View>

            {/* Charts */}
            {shouldShowCharts && (
                <>
                    <Divider style={{ marginVertical: 10 }} />
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                        <MaterialIcons name="trending-up" size={36} style={{ marginRight: 10 }} color={theme.colors.primary} />
                        <Text variant="titleLarge" style={{ color: theme.colors.secondary }}>Recent Trend</Text>
                    </View>
                    <Card style={styles.card}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <Text variant="titleLarge">{salesOrOrders}</Text>
                            <View style={{ flexDirection: "column", alignItems: "flex-end" }}>
                                <RadioButton.Group onValueChange={setSalesOrOrders} value={salesOrOrders}>
                                    <View style={styles.radioRow}>
                                        <RadioButton.Item label="Sales" value="Sales" mode="android" color={theme.colors.primary} position="leading" style={styles.radioButton} />
                                        <RadioButton.Item label="Orders" value="Orders" mode="android" color={theme.colors.primary} position="leading" style={styles.radioButton} />
                                    </View>
                                </RadioButton.Group>
                                {canShowMonthChart && (
                                    <RadioButton.Group onValueChange={setChartTimeWindow} value={chartTimeWindow}>
                                        <View style={styles.radioRow}>
                                            <RadioButton.Item label="Week" value="week" mode="android" color={theme.colors.primary} position="leading" style={styles.radioButton} />
                                            <RadioButton.Item label="Month" value="month" mode="android" color={theme.colors.primary} position="leading" style={styles.radioButton} />
                                        </View>
                                    </RadioButton.Group>
                                )}
                            </View>
                        </View>
                        <View style={{ justifyContent: "center", flexDirection: "row" }}>
                            <VictoryChart theme={VictoryTheme.clean}>
                                <VictoryAxis />
                                {/*<VictoryAxis dependentAxis style={{ tickLabels: { display: "none" } }} />*/}
                                {effectiveChartTimeWindow === "week" && salesOrOrders === "Sales" && (
                                    <VictoryBar
                                        data={dashboardData.chartData.sales.week.map((d, i) => ({ x: lastNDays(7)[i], y: d.total, label: `₹${d.total}` }))}
                                    />
                                )}
                                {effectiveChartTimeWindow === "month" && salesOrOrders === "Sales" && (
                                    <VictoryBar
                                        data={dashboardData.chartData.sales.month.map((d) => ({ x: d.label, y: d.total, label: `₹${d.total}` }))}
                                    />
                                )}
                                {effectiveChartTimeWindow === "week" && salesOrOrders === "Orders" && (
                                    <VictoryBar
                                        data={dashboardData.chartData.orders.week.map((d, i) => ({ x: lastNDays(7)[i], y: d.count, label: d.count.toString() }))}
                                    />
                                )}
                                {effectiveChartTimeWindow === "month" && salesOrOrders === "Orders" && (
                                    <VictoryBar
                                        data={dashboardData.chartData.orders.month.map((d) => ({ x: d.label, y: d.count, label: d.count.toString() }))}
                                    />
                                )}
                            </VictoryChart>
                        </View>
                    </Card>
                </>
            )}

            {/* Top Products */}
            {showTopProducts && (
                <>
                    <Divider style={{ marginVertical: 10 }} />
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                        <MaterialIcons name="shopping-bag" size={36} style={{ marginRight: 10 }} color={theme.colors.primary} />
                        <Text variant="titleLarge" style={{ color: theme.colors.secondary }}>Top Products</Text>
                    </View>
                    {dashboardData.topProducts.map((p) => (
                        <View key={p.productId}>
                            <Pressable onPress={() => pushWithBackHref('/Main/(tabs)/Products/' + p.productId)}>
                                <ProductDisplayCompactMerchant product={p} />
                            </Pressable>
                            <Divider style={{ marginVertical: 8 }} />
                        </View>
                    ))}
                </>
            )}

            {/* Top Customers */}
            {showTopCustomers && (
                <>
                    <Divider style={{ marginVertical: 10 }} />
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                        <MaterialIcons name="hail" size={36} style={{ marginRight: 10 }} color={theme.colors.primary} />
                        <Text variant="titleLarge" style={{ color: theme.colors.secondary }}>Top Customers</Text>
                    </View>
                    {dashboardData.topCustomers.map((c) => (
                        <View key={c.customerId} style={{ padding: 2 }}>
                            <TopCustomerListItem customer={c} />
                            <Divider style={{ marginVertical: 8 }} />
                        </View>
                    ))}
                </>
            )}

        </ScrollableScreen>
    );
};

const makeStyles = (theme) =>
  StyleSheet.create({
    container: {
      // flex: 1,
      padding: 10,
      backgroundColor: theme.colors.surface,
    },
    scrollContent: {
      // paddingBottom: 20,
    },
      statsRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: 8, // if you're on RN 0.71+; else use marginRight on all but last card
          marginVertical: 8,
      },

      statsCard: {
          flex: 1,
          aspectRatio: 1, // Ensures square layout
          padding: 0,
          borderRadius: 12,
          maxWidth: 120,
          maxHeight: 120,
          backgroundColor: 'white',
      },

      cardContent: {
          // flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          // backgroundColor: 'red'
      },

      statLabel: {
          color: 'black',
          backgroundColor: 'green',
          width: '100%',
          // marginBottom: 6,
      },

      statValue: {
        color: 'black',
          fontWeight: 'bold',
      },
    card: {
      // marginBottom: 10,
      padding: 10,
      backgroundColor: "white",
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginVertical: 10,
    },
    chart: {
      marginVertical: 8,
      borderRadius: 8,
    },
    radioRow: {
      flexDirection: "row", // Arrange items in a row
      justifyContent: "flex-start",
      alignItems: "center",
    },
    radioButton: {
      // flex: 1, // Each button occupies equal space
      width: 120,
      marginVertical: 0,
      padding: 0,
    },
  });

