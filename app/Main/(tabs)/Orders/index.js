import React, { useEffect, useMemo, useState } from "react";
import { FlatList, View, StyleSheet, TouchableOpacity } from "react-native";
import {
  Card,
  Text,
  TextInput,
  RadioButton,
  Chip,
  useTheme,
  Surface,
  Divider,
} from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import Fuse from "fuse.js";
import { useSelector } from "react-redux"; // For getting storeId from Redux
import { useMerchantOrders } from "../../../../api/hooks/useMerchantOrders";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  orderStatusColors,
  orderStatusList,
} from "../../../../utils/dataValues";

const Orders = () => {
  const router = useRouter();
  const theme = useTheme();
  const styles = makeStyles(theme);

  // Redux: Get the storeId from the global state
  const storeId = useSelector((state) => state.store.storeId);

  // React Query: Fetch orders
  const { data: orders = [], isLoading, isError } = useMerchantOrders(storeId);

  // Local State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState([]);
  const [statusQuickFilter, setStatusQuickFilter] = useState("All");
  const [dateQuickFilter, setDateQuickFilter] = useState("This Month");
  const [minTotal, setMinTotal] = useState("");
  const [maxTotal, setMaxTotal] = useState("");
  const [filterDates, setFilterDates] = useState({
    startDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
    endDate: new Date(),
  });
  const [sortField, setSortField] = useState("orderDate");
  const [sortOrder, setSortOrder] = useState("descending");
  const [filterExpanded, setFilterExpanded] = useState(false);

  const fuse = useMemo(() => {
    return new Fuse(orders, {
      keys: [
        "orderId",
        "customer.fullName",
        "customer.customerAddress",
        "customer.phone",
        "customer.email",
        "orderItems[].productName",
        "orderStatus",
        "orderTotal",
      ],
      threshold: 0.4,
      includeScore: false,
      ignoreLocation: true,
    });
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (isLoading || isError) return [];

    let result = orders;

    if (searchQuery.trim()) {
      const searchResults = fuse.search(searchQuery);
      result = searchResults.map((res) => res.item);
    }

    if (statusFilter.length && !statusFilter.includes("All")) {
      result = result.filter((order) => statusFilter.includes(order.orderStatus));
    }

    if (minTotal || maxTotal) {
      const min = minTotal ? parseInt(minTotal, 10) : Number.NEGATIVE_INFINITY;
      const max = maxTotal ? parseInt(maxTotal, 10) : Number.POSITIVE_INFINITY;
      result = result.filter(
          (order) => order.orderTotal >= min && order.orderTotal <= max
      );
    }

    if (filterDates?.startDate && filterDates?.endDate) {
      result = result.filter(
          (order) =>
              new Date(order.orderDate) >= filterDates.startDate &&
              new Date(order.orderDate) <= filterDates.endDate
      );
    }

    result = [...result].sort((a, b) => {
      if (sortField === "orderDate") {
        return sortOrder === "ascending"
            ? new Date(a.orderDate) - new Date(b.orderDate)
            : new Date(b.orderDate) - new Date(a.orderDate);
      } else if (sortField === "orderTotal") {
        return sortOrder === "ascending"
            ? a.orderTotal - b.orderTotal
            : b.orderTotal - a.orderTotal;
      }
      return 0;
    });

    return result;
  }, [
    orders,
    searchQuery,
    statusFilter,
    minTotal,
    maxTotal,
    filterDates,
    sortField,
    sortOrder,
    fuse,
    isLoading,
    isError,
  ]);

  const renderOrderItem = ({ item }) => (
      <Card
          style={styles.orderCard}
          onPress={() => router.push(`/Main/(tabs)/Orders/Order/${item.orderId}`)}
      >
        <View style={styles.orderHeader}>
          <View>
            <Text variant={"bodyLarge"}>{`ID: #${item.orderId}`}</Text>
            <Text variant={"bodyLarge"}>
              Date: {new Date(item.orderDate).toLocaleDateString()}
            </Text>
          </View>
          <Chip
              mode={"outlined"}
              textStyle={{ color: "black" }}
              style={{ backgroundColor: orderStatusColors[item.orderStatus] }}
          >
            {item.orderStatus}
          </Chip>
        </View>
        <View>
          <Text variant={"bodyLarge"}>{`Customer: ${item.customer.fullName}`}</Text>
          <Text variant={"bodyLarge"}>{`Items: ${item.orderItems.reduce(
              (sum, i) => sum + i.quantity,
              0
          )}`}</Text>
          <Text variant={"bodyLarge"} style={{ fontWeight: "bold" }}>
            Total: ₹{item.orderTotal}
          </Text>
        </View>
      </Card>
  );

  if (isLoading) {
    return (
        <Surface style={styles.container}>
          <Text>Loading orders...</Text>
        </Surface>
    );
  }

  if (isError) {
    return (
        <Surface style={styles.container}>
          <Text>Error loading orders. Please try again.</Text>
        </Surface>
    );
  }

  return (
      <Surface style={styles.container}>
        <FlatList
            data={filteredOrders}
            keyExtractor={(item) => item.orderId}
            renderItem={renderOrderItem}
            ListHeaderComponent={() => <Text style={styles.sectionTitle}>Orders</Text>}
            ListEmptyComponent={<Text>No Orders Found</Text>}
            ItemSeparatorComponent={() => <Divider style={{ marginVertical: 10 }} />}
        />
      </Surface>
  );
};

const makeStyles = ({ colors }) =>
    StyleSheet.create({
      container: {
        flex: 1,
        paddingHorizontal: 10,
        backgroundColor: colors.surface,
      },
      orderCard: {
        borderRadius: 8,
        marginVertical: 5,
        backgroundColor: colors.card,
        padding: 10,
      },
      orderHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
      },
      sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginVertical: 10,
      },
    });

export default Orders;