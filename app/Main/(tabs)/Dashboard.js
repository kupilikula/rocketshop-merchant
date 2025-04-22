import React, { useState } from "react";
import {View, ScrollView, StyleSheet, Pressable, ActivityIndicator} from "react-native";
import {
    Card,
    Text,
    Button,
    Divider,
    Surface,
    RadioButton,
    useTheme, Banner,
} from "react-native-paper";
// Use any chart library of choice
import { useRouter } from "expo-router";
import { faker } from "@faker-js/faker";
import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryTheme,
} from "victory-native";
import {
  getCustomer,
  getProductForStore,
} from "../../../utils/fakeDataMethods";
import { ProductDisplayCompactMerchant } from "../../../components/ProductDisplayCompactMerchant";
import { CustomerListItem } from "../../../components/CustomerListItem";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {useSelector} from "react-redux";
import {useDashboard} from "../../../api/hooks/useDashboard";
import {TopCustomerListItem} from "../../../components/TopCustomerListItem";
import ScrollableScreen from "../../../components/ScrollableScreen";
import {AutoSizeText, ResizeTextMode} from "react-native-auto-size-text";

const Dashboard = () => {
  const router = useRouter();
  const theme = useTheme();
  const styles = makeStyles(theme);
  const store = useSelector((state) => state.store);
  const {data: dashboardData = {}, isLoading, isError} = useDashboard(store.storeId);

  console.log('dashboardData:', dashboardData);
  const routeToOpenOrders = () => {
    router.push({ pathname: "/Main/Orders", params: { filter: "open" } });
  };

  const routeToOrdersToday = () => {
    router.push({ pathname: "/Main/Orders", params: { filter: "today" } });
  };

  // const data = {
  //   orders: {
  //     day: faker.number.int({ min: 5, max: 30 }),
  //     week: faker.helpers.multiple(
  //       () => faker.number.int({ min: 8, max: 25 }),
  //       { count: 7 },
  //     ),
  //     month: faker.helpers.multiple(
  //       () => faker.number.int({ min: 50, max: 200 }),
  //       { count: 4 },
  //     ),
  //   },
  //   sales: {
  //     day: faker.number.int({ min: 1000, max: 20000 }),
  //     week: faker.helpers.multiple(
  //       () => faker.number.int({ min: 2000, max: 25000 }),
  //       { count: 7 },
  //     ),
  //     month: faker.helpers.multiple(
  //       () => faker.number.int({ min: 15000, max: 200000 }),
  //       { count: 4 },
  //     ),
  //   },
  // };

  const [chartTimeWindow, setChartTimeWindow] = useState("week");
  // const [salesChartTimeWindow, setSalesChartTimeWindow] = useState("week");
  const [salesOrOrders, setSalesOrOrders] = useState("Sales");
  function lastNDays(n) {
    var result = [];
    for (var i = n - 1; i >= 0; i--) {
      var d = new Date();
      d.setDate(d.getDate() - i);
      result.push(d.getDate() + "/" + (d.getMonth() + 1));
    }
    return result;
  }

  if (isLoading) {
      return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size={100} color={theme.colors.primary} />
      </View>
  }

  return (
        <ScrollableScreen backgroundColor={theme.colors.surface} innerStyle={styles.container}>
        {/* Useful Links */}
        {/* Summary of Open Orders */}
          {dashboardData && (
              <>
                  {/* Store Inactive */}
                  {dashboardData?.banners?.isActive === false && (
                      <Banner
                          visible
                          icon="alert-circle"
                          style={{ backgroundColor: theme.colors.errorContainer, marginVertical: 10 }}
                      >
                          This store is currently <Text style={{ fontWeight: 'bold' }}>Inactive</Text>.
                          Customers cannot browse or place orders. You can activate this store from
                          <Text style={{ fontWeight: 'bold' }}> Store Settings</Text>.
                      </Banner>
                  )}

                  {/* No Products and No Orders */}
                  {dashboardData?.banners?.noProducts && dashboardData.banners.noOrders && (
                      <Banner
                          visible
                          icon="store-off"
                          style={{ backgroundColor: theme.colors.secondaryContainer, marginVertical: 10 }}
                      >
                          Your store doesn’t have any <Text style={{ fontWeight: 'bold' }}>products</Text> listed
                          and hasn’t received any <Text style={{ fontWeight: 'bold' }}>orders</Text> yet.
                          Start by adding products and sharing your store to attract customers.
                      </Banner>
                  )}

                  {/* No Products but Orders Exist */}
                  {dashboardData?.banners?.noProducts && !dashboardData?.banners?.noOrders && (
                      <Banner
                          visible
                          icon="cube-outline"
                          style={{ backgroundColor: theme.colors.secondaryContainer, marginVertical: 10 }}
                      >
                          This store has received <Text style={{ fontWeight: 'bold' }}>orders</Text> in the past,
                          but currently has no <Text style={{ fontWeight: 'bold' }}>active products</Text>.
                          Add new products to keep your store up to date.
                      </Banner>
                  )}

                  {/* Products Exist but No Orders */}
                  {!dashboardData?.banners?.noProducts && dashboardData?.banners?.noOrders && (
                      <Banner
                          visible
                          icon="cart-outline"
                          style={{ backgroundColor: theme.colors.tertiaryContainer, marginVertical: 10 }}
                      >
                          Your products are live, but the store hasn’t received any <Text style={{ fontWeight: 'bold' }}>orders</Text> yet.
                          Share your store link or run promotions to reach more customers.
                      </Banner>
                  )}
              </>
          )}
        <View style={{ margin: 4 }}>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 10,
              justifyContent: "flex-start",
            }}
          >
            <MaterialIcons
              name={"today"}
              size={36}
              style={{ marginRight: 10 }}
              color={theme.colors.primary}
            />
            <Text
              variant={"titleLarge"}
              style={{ color: theme.colors.secondary }}
            >
              Today
            </Text>
          </View>
            <View style={styles.statsRow}>
                {[
                    {
                        label: "Open Orders",
                        value: dashboardData.quickStats.openOrders.toString(),
                    },
                    {
                        label: "New Orders",
                        value: dashboardData.quickStats.newOrdersToday.toString(),
                    },
                    {
                        label: "Sales",
                        value: "₹" + dashboardData.quickStats.salesToday.toString(),
                    },
                ].map((stat, index) => (
                    <Card key={index} style={styles.statsCard} mode="elevated">
                        {/*<Text variant="titleSmall" style={styles.statLabel}>*/}
                        {/*    {stat.label}*/}
                        {/*</Text>*/}
                        <Card.Title title={stat.label} titleStyle={{fontSize: 13, alignSelf: 'center'}}/>
                        <Card.Content style={styles.cardContent}>
                            <AutoSizeText
                                fontSize={32}
                                numberOfLines={1}
                                mode={ResizeTextMode.max_lines}
                                style={{ justifyContent: 'center', textAlign: 'center' }}
                            >
                                {stat.value}
                            </AutoSizeText>
                        </Card.Content>
                    </Card>
                ))}
            </View>
        </View>
        <Divider style={{ marginVertical: 10 }} />

        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 10,
            justifyContent: "flex-start",
          }}
        >
          <MaterialIcons
            name={"launch"}
            size={36}
            style={{ marginRight: 10 }}
            color={theme.colors.primary}
          />
          <Text
            variant={"titleLarge"}
            style={{ color: theme.colors.secondary }}
          >
            Quick Links
          </Text>
        </View>
        <View style={{ marginBottom: 10 }}>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-around",
            }}
          >
            <View style={{ display: "flex", flexDirection: "row" }}>
              <Button
                icon={"receipt"}
                mode="contained"
                style={{ borderRadius: 8, margin: 10 }}
                onPress={() => routeToOpenOrders()}
              >
                Open Orders
              </Button>
            </View>
            <View style={{ display: "flex", flexDirection: "row" }}>
              <Button
                icon={"calendar-today"}
                mode="contained"
                style={{ borderRadius: 8, margin: 10 }}
                onPress={() => routeToOrdersToday()}
              >
                Orders Today
              </Button>
            </View>
            <View style={{ display: "flex", flexDirection: "row" }}>
              <Button
                buttonColor={theme.colors.error}
                icon={"battery-20"}
                mode="contained"
                style={{ borderRadius: 8, margin: 10 }}
                onPress={() =>
                  router.push({
                    pathname: "/Main/Products",
                    params: { filter: "lowstock" },
                  })
                }
              >
                Low Stock Products
              </Button>
            </View>
          </View>
        </View>
        <Divider style={{ marginVertical: 10 }} />
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 10,
            justifyContent: "flex-start",
          }}
        >
          <MaterialIcons
            name={"trending-up"}
            size={36}
            style={{ marginRight: 10 }}
            color={theme.colors.primary}
          />
          <Text
            variant={"titleLarge"}
            style={{ color: theme.colors.secondary }}
          >
            Recent Trend
          </Text>
        </View>
        {/* Sales */}
        <Card style={styles.card}>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text variant={"titleLarge"}>{salesOrOrders}</Text>
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
              }}
            >
              <RadioButton.Group
                onValueChange={(newValue) => setSalesOrOrders(newValue)}
                value={salesOrOrders}
              >
                <View style={styles.radioRow}>
                  <RadioButton.Item
                    label="Sales"
                    value="Sales"
                    mode={'android'}
                    color={theme.colors.primary}
                    position="leading"
                    style={styles.radioButton}
                  />
                  <RadioButton.Item
                    label="Orders"
                    value="Orders"
                    mode={'android'}
                    color={theme.colors.primary}
                    position="leading"
                    style={styles.radioButton}
                  />
                </View>
              </RadioButton.Group>
              <RadioButton.Group
                onValueChange={(newValue) => setChartTimeWindow(newValue)}
                value={chartTimeWindow}
              >
                <View style={styles.radioRow}>
                  <RadioButton.Item
                    label="Week"
                    value="week"
                    mode={'android'}
                    color={theme.colors.primary}
                    position="leading"
                    style={styles.radioButton}
                  />
                  <RadioButton.Item
                    label="Month"
                    value="month"
                    mode={'android'}
                    color={theme.colors.primary}
                    position="leading"
                    style={styles.radioButton}
                  />
                </View>
              </RadioButton.Group>
            </View>
          </View>
          {/*<Card.Content>*/}
          <View
            style={{
              justifyContent: "center",
              display: "flex",
              flexDirection: "row",
            }}
          >
            <VictoryChart
              // domainPadding={{ x: 20 }}
              theme={VictoryTheme.clean}
            >
              <VictoryAxis />
              <VictoryAxis
                dependentAxis={true}
                style={{
                  axis: { display: "none" },
                  ticks: { display: "none" },
                  tickLabels: { display: "none" },
                }}
              />
              {chartTimeWindow === "week" && salesOrOrders === "Sales" && (
                <VictoryBar
                  data={dashboardData.chartData.sales.week.map(d => d.total).map((v, i) => {
                    let past7days = lastNDays(7);
                    return { x: past7days[i], y: v, label: "₹" + v };
                  })}
                />
              )}
              {chartTimeWindow === "month" && salesOrOrders === "Sales" && (
                <VictoryBar
                  data={["Week 1", "Week 2", "Week 3", "Week 4"].map(
                    (w, i) => ({
                      x: w,
                      y: dashboardData.chartData.sales.month.map(d => d.total)[i],
                      label: "₹" + dashboardData.chartData.sales.month.map(d => d.total)[i],
                    }),
                  )}
                />
              )}
              {chartTimeWindow === "week" && salesOrOrders === "Orders" && (
                <VictoryBar
                  data={dashboardData.chartData.orders.week.map(d => d.count).map((v, i) => {
                    let past7days = lastNDays(7);
                    return { x: past7days[i], y: v, label: v };
                  })}
                />
              )}
              {chartTimeWindow === "month" && salesOrOrders === "Orders" && (
                <VictoryBar
                  data={["Week 1", "Week 2", "Week 3", "Week 4"].map(
                    (w, i) => ({
                      x: w,
                      y: dashboardData.chartData.orders.month.map(d => d.count)[i],
                      label: dashboardData.chartData.orders.month.map(d => d.count)[i].toString(),
                    }),
                  )}
                />
              )}
            </VictoryChart>
          </View>
        </Card>

        <Divider style={{ marginVertical: 10 }} />
        {/* Top Products */}
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 10,
            justifyContent: "flex-start",
          }}
        >
          <MaterialIcons
            name={"shopping-bag"}
            size={36}
            style={{ marginRight: 10 }}
            color={theme.colors.primary}
          />
          <Text
            variant={"titleLarge"}
            style={{ color: theme.colors.secondary }}
          >
            Top Products
          </Text>
        </View>
        {/*<Card style={styles.card}>*/}
        {dashboardData.topProducts.map((p) => (
          <View key={p.productId}>
              <Pressable onPress={() => router.push('/Main/(tabs)/Products/Product/' + p.productId)}>
            <ProductDisplayCompactMerchant product={p} key={p.productId} />
              </Pressable>
            <Divider style={{ marginVertical: 8 }} />
          </View>
        ))}
        {/*</Card>*/}

        {/* Top Customers */}
        <Divider style={{ marginVertical: 10 }} />
        {/* Top Products */}
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 10,
            justifyContent: "flex-start",
          }}
        >
          <MaterialIcons
            name={"hail"}
            size={36}
            style={{ marginRight: 10 }}
            color={theme.colors.primary}
          />
          <Text
            variant={"titleLarge"}
            style={{ color: theme.colors.secondary }}
          >
            Top Customers
          </Text>
        </View>
        {dashboardData.topCustomers.map((c) => (
          <View key={c.customerId} style={{ padding: 2 }}>
            <TopCustomerListItem customer={c} key={c.customerId} />
            <Divider style={{ marginVertical: 8 }} />
          </View>
        ))}
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

export default Dashboard;
