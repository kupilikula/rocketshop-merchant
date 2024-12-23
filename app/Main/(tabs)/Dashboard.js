import React, { useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import {
  Card,
  Text,
  Button,
  Divider,
  Surface,
  RadioButton,
  useTheme,
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

const Dashboard = () => {
  const router = useRouter();
  const theme = useTheme();
  const styles = makeStyles(theme);
  const routeToOpenOrders = () => {
    router.push({ pathname: "/Main/Orders", params: { filter: "open" } });
  };

  const routeToOrdersToday = () => {
    router.push({ pathname: "/Main/Orders", params: { filter: "today" } });
  };

  const data = {
    orders: {
      day: faker.number.int({ min: 5, max: 30 }),
      week: faker.helpers.multiple(
        () => faker.number.int({ min: 8, max: 25 }),
        { count: 7 },
      ),
      month: faker.helpers.multiple(
        () => faker.number.int({ min: 50, max: 200 }),
        { count: 4 },
      ),
    },
    sales: {
      day: faker.number.int({ min: 1000, max: 20000 }),
      week: faker.helpers.multiple(
        () => faker.number.int({ min: 2000, max: 25000 }),
        { count: 7 },
      ),
      month: faker.helpers.multiple(
        () => faker.number.int({ min: 15000, max: 200000 }),
        { count: 4 },
      ),
    },
  };

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

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Surface style={styles.container}>
        {/* Useful Links */}
        {/* Summary of Open Orders */}
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
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Card style={styles.card}>
              <Text variant={"titleMedium"} style={{ alignSelf: "center" }}>
                Open Orders
              </Text>
              <Text
                variant="headlineLarge"
                style={{ alignSelf: "center", marginVertical: 8 }}
              >
                24
              </Text>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignSelf: "center",
                  marginVertical: 8,
                }}
              ></View>
            </Card>
            <Card style={styles.card}>
              <Text variant={"titleMedium"} style={{ alignSelf: "center" }}>
                New Orders
              </Text>
              <Text
                variant="headlineLarge"
                style={{ alignSelf: "center", marginVertical: 8 }}
              >
                17
              </Text>
            </Card>

            <Card style={styles.card}>
              <Text variant={"titleMedium"} style={{ alignSelf: "center" }}>
                Sales
              </Text>
              <Text
                variant="headlineLarge"
                style={{ alignSelf: "center", marginVertical: 8 }}
              >
                ₹7854
              </Text>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignSelf: "center",
                  marginVertical: 8,
                }}
              ></View>
            </Card>
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
                    color={theme.colors.primary}
                    position="leading"
                    style={styles.radioButton}
                  />
                  <RadioButton.Item
                    label="Orders"
                    value="Orders"
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
                    color={theme.colors.primary}
                    position="leading"
                    style={styles.radioButton}
                  />
                  <RadioButton.Item
                    label="Month"
                    value="month"
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
                  data={data.sales.week.map((v, i) => {
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
                      y: data.sales.month[i],
                      label: "₹" + data.sales.month[i],
                    }),
                  )}
                />
              )}
              {chartTimeWindow === "week" && salesOrOrders === "Orders" && (
                <VictoryBar
                  data={data.orders.week.map((v, i) => {
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
                      y: data.orders.month[i],
                      label: data.orders.month[i].toString(),
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
        {faker.helpers.multiple(getProductForStore, { count: 3 }).map((p) => (
          <View key={p.productId}>
            <ProductDisplayCompactMerchant product={p} key={p.productId} />
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
        {faker.helpers.multiple(getCustomer, { count: 3 }).map((c) => (
          <View key={c.customerId} style={{ padding: 2 }}>
            <CustomerListItem customer={c} key={c.customerId} />
            <Divider style={{ marginVertical: 8 }} />
          </View>
        ))}
      </Surface>
    </ScrollView>
  );
};

const makeStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 10,
      backgroundColor: theme.colors.surface,
    },
    scrollContent: {
      // paddingBottom: 20,
    },
    card: {
      flex: 0.31,
      marginBottom: 10,
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
