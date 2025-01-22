import React, { useEffect, useMemo, useState } from "react";
import {FlatList, View, StyleSheet, TouchableOpacity, Platform, Modal} from "react-native";
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
import { List } from "react-native-paper";
import CrossPlatformDatePicker from "../../../../components/CrossPlatformDatePicker";

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
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const { filter } = useLocalSearchParams();
  console.log("params:", filter);
  useEffect(() => {
    console.log("line50:, params:", filter);
    if (filter === "open") {
      setStatusFilter(orderStatusList.slice(0, 6));
    } else if (filter === "today") {
      setFilterDates({ startDate: new Date(), endDate: new Date() });
      setStatusQuickFilter("All");
    }
  }, [filter]);

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "ascending" ? "descending" : "ascending"));
  };

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

  // Function to update order status
  // const updateOrderStatus = (id, newStatus) => {
  //   const updatedOrders = orders.map((order) =>
  //     order.id === id ? { ...order, status: newStatus } : order,
  //   );
  //   setOrders(updatedOrders);
  // };

  const handleStartDateChange = (date) => {
    // setShowStartPicker(false); // Close picker
    if (date) {
      setFilterDates((prev) => ({
        ...prev,
        startDate: date,
      }));
    }
  };
  const handleEndDateChange = (date) => {
    // setShowStartPicker(false); // Close picker
    if (date) {
      setFilterDates((prev) => ({
        ...prev,
        endDate: date,
      }));
    }
  };

  const renderOrderItem = ({ item }) => (
    <Card
      style={styles.orderCard}
      onPress={() => router.push("/Main/(tabs)/Orders/Order/" + item.orderId)}
    >
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <View style={{ margin: 10 }}>
          <Text variant={"bodyLarge"}>{`ID: #${item.orderId.slice(0,8)}`}</Text>
          <Text variant={"bodyLarge"}>
            Date: {new Date(item.orderDate).toLocaleDateString()}
          </Text>
        </View>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            margin: 10,
          }}
        >
          <Chip
            mode={"outlined"}
            textStyle={{ color: "black" }}
            style={{ backgroundColor: orderStatusColors[item.orderStatus] }}
          >
            {item.orderStatus}
          </Chip>
        </View>
      </View>

      <View style={{ marginHorizontal: 10, marginBottom: 10 }}>
        <Text
          variant={"bodyLarge"}
        >{`Customer: ${item.customer.fullName}`}</Text>
        <Text
          variant={"bodyLarge"}
        >{`Items: ${item.orderItems.reduce((A, i) => A + i.quantity, 0)}`}</Text>
        <Text variant={"bodyLarge"} style={{ fontWeight: "bold" }}>
          Total: ₹{item.orderTotal}
        </Text>
      </View>
    </Card>
  );

  useEffect(() => {
    if (statusQuickFilter !== "") {
      if (statusQuickFilter === "All") {
        setStatusFilter(orderStatusList);
      } else if (statusQuickFilter === "Open") {
        setStatusFilter(orderStatusList.slice(0, 6));
      } else if (statusQuickFilter === "Fulfilled") {
        setStatusFilter(orderStatusList.slice(6, 9));
      } else if (statusQuickFilter === "Unfulfilled") {
        setStatusFilter(orderStatusList.slice(9));
      }
    }
  }, [statusQuickFilter]);

  useEffect(() => {
    console.log("line189, dateQuickFilter", dateQuickFilter);
    if (dateQuickFilter === "Today") {
      setFilterDates({ startDate: new Date(), endDate: new Date() });
    } else if (dateQuickFilter === "This Week") {
      console.log("line 193");
      let end = new Date();
      let today = new Date();
      // Calculate the difference between the date's day of the month and its day of the week
      var diff = end.getDate() - end.getDay() + (end.getDay() === 0 ? -6 : 1);

      let start = new Date(today.setDate(diff));
      console.log("start:", start, ", end:", end);
      setFilterDates({ startDate: start, endDate: end });
    } else if (dateQuickFilter === "This Month") {
      let end = new Date();
      let today = new Date();
      let start = new Date(today.getFullYear(), today.getMonth(), 1);
      // Calculate the difference between the date's day of the month and its day of the week
      setFilterDates({ startDate: start, endDate: end });
    } else if (dateQuickFilter === "This Year") {
      let end = new Date();
      let today = new Date();
      let start = new Date(today.getFullYear(), 0, 1);
      // Calculate the difference between the date's day of the month and its day of the week
      setFilterDates({ startDate: start, endDate: end });
    }
  }, [dateQuickFilter]);

  const filterAndSortComponent = () => (
    <>
      <View style={{ marginVertical: 10 }}>
        <View
          style={{
            marginLeft: 8,
            marginTop: 8,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <MaterialIcons
            name={"receipt-long"}
            size={44}
            color={theme.colors.primary}
            style={{}}
          />
          <Text
            variant={"displaySmall"}
            style={{ marginLeft: 10, color: theme.colors.secondary }}
          >
            Orders
          </Text>
        </View>
        <Text variant={"bodyLarge"} style={{ marginLeft: 10 }}>
          {nOpen.toString() + " Open Order" + (nOpen !== 1 ? "s" : "")}
        </Text>
        <Text variant={"bodyLarge"} style={{ marginLeft: 10 }}>
          {nFulfilled.toString() +
            " Fulfilled Order" +
            (nFulfilled !== 1 ? "s" : "")}
        </Text>
        <Text variant={"bodyLarge"} style={{ marginLeft: 10 }}>
          {nUnfulfilled.toString() +
            " Unfulfilled Order" +
            (nUnfulfilled !== 1 ? "s" : "")}
        </Text>
      </View>

      <View style={{ padding: 0, marginBottom: 10 }}>
        <TextInput
          label="Search Orders"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBar}
          mode="outlined"
        />

        {/* Sort & Filters Accordion */}
        <View
          style={{
            backgroundColor: theme.colors.surface,
            overflow: "hidden",
            borderRadius: 8,
          }}
        >
          <List.Accordion
            title={"Sort & Filter"}
            expanded={filterExpanded}
            onPress={() => setFilterExpanded(!filterExpanded)}
            style={styles.accordionBar}
            titleStyle={styles.accordionTitle}
            contentStyle={styles.accordionContent}
            right={() => (
              <MaterialIcons
                name={filterExpanded ? "expand-more" : "expand-less"}
                size={28}
                color={"white"}
              />
            )}
          >
            <Card mode={"elevated"} style={styles.sortFilterContent}>
              {/* Sort Field Selector */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Sort By</Text>
                <View style={styles.row}>
                  <RadioButton.Group
                    onValueChange={(value) => setSortField(value)}
                    value={sortField}
                  >
                    <View style={styles.radioRow}>
                      {/* Date Option */}
                      <View style={styles.radioItem}>
                        <RadioButton.Android
                          value="orderDate"
                          color={theme.colors.primary}
                        />
                        <Text style={styles.radioLabel}>Date</Text>
                      </View>

                      {/* Order Total Option */}
                      <View style={styles.radioItem}>
                        <RadioButton.Android
                          value="orderTotal"
                          color={theme.colors.primary}
                        />
                        <Text style={styles.radioLabel}>Order Total</Text>
                      </View>
                    </View>
                  </RadioButton.Group>
                  {/* Sort Order Toggler */}
                  <View style={{ display: "flex", flexDirection: "row" }}>
                    <Chip
                      mode="outlined"
                      style={styles.sortOrderChip}
                      onPress={toggleSortOrder}
                    >
                    <MaterialCommunityIcons
                        name={
                          sortOrder === "ascending"
                              ? "arrow-up-bold"
                              : "arrow-down-bold"
                        }
                        size={20}
                        color={theme.colors.primary}
                    />
                    </Chip>
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Order Date</Text>
                {/* Display Selected Start and End Dates */}
                {/* Row Layout for Start and End Date Cards */}
                <View style={styles.flexWrapRow}>
                  {["Today", "This Week", "This Month", "This Year"].map(
                    (f) => {
                      return (
                        <Chip
                          key={f}
                          selected={dateQuickFilter === f}
                          onPress={() => {
                            if (dateQuickFilter === f) {
                              setDateQuickFilter("");
                            } else {
                              setDateQuickFilter(f);
                            }
                          }}
                          style={{
                            margin: 2,
                            backgroundColor: theme.colors.softPrimary,
                            borderColor: "black",
                          }}
                          textStyle={{
                            color:
                              dateQuickFilter === f
                                ? "black"
                                : theme.colors.primary,
                          }}
                          selectedColor={theme.colors.black}
                        >
                          {f}
                        </Chip>
                      );
                    },
                  )}
                </View>
                <Divider style={{ marginVertical: 2 }} />
                <View style={styles.dateRow}>
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      flex: 0.48,
                    }}
                  >
                    <CrossPlatformDatePicker
                        label="Start Date"
                        initialDate={filterDates.endDate}
                        onDateChange={(newDate) => handleStartDateChange(newDate)}
                    />
                  </View>
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      flex: 0.48,
                    }}
                  >
                    <CrossPlatformDatePicker
                        label="End Date"
                        initialDate={filterDates.endDate}
                        onDateChange={(newDate) => handleEndDateChange(newDate)}
                    />
                </View>
              </View>
              </View>

              <View style={{ marginHorizontal: 10 }}>
                <Text style={styles.sectionTitle}>Order Status</Text>
                <View style={styles.flexWrapRow}>
                  {["All", "Open", "Fulfilled", "Unfulfilled"].map((f) => {
                    return (
                      <Chip
                        key={f}
                        selected={statusQuickFilter === f}
                        onPress={() => {
                          if (statusQuickFilter === f) {
                            setStatusQuickFilter("");
                          } else {
                            setStatusQuickFilter(f);
                          }
                        }}
                        style={{
                          margin: 2,
                          backgroundColor: theme.colors.softPrimary,
                          borderColor: "black",
                        }}
                        textStyle={{
                          color:
                            statusQuickFilter === f
                              ? "black"
                              : theme.colors.primary,
                        }}
                        selectedColor={theme.colors.black}
                      >
                        {f}
                      </Chip>
                    );
                  })}
                </View>
                <Divider style={{ marginVertical: 2 }} />
                <View style={styles.flexWrapRow}>
                  {orderStatusList.map((status) => (
                    <Chip
                      key={status}
                      selected={statusFilter.includes(status)}
                      onPress={() => {
                        if (status === "All") {
                          if (statusFilter.includes("All")) {
                            setStatusFilter([]);
                          } else {
                            setStatusFilter(["All"]);
                          }
                        } else if (statusFilter.includes(status)) {
                          setStatusFilter(
                            statusFilter.filter((s) => s !== status),
                          );
                        } else {
                          setStatusFilter(statusFilter.concat(status));
                        }
                      }}
                      style={[
                        styles.orderStatusChip,
                        {
                          backgroundColor:
                            status === "All"
                              ? "#aaa"
                              : orderStatusColors[status],
                        },
                      ]}
                      // textStyle={{color: status==='All' ? theme.colors.white : theme.colors.black}}
                      // selectedColor={'white'}
                    >
                      {status}
                    </Chip>
                  ))}
                </View>

                <Text style={styles.sectionTitle}>Order Total</Text>
                <View style={styles.row}>
                  <TextInput
                    label="Min Total"
                    value={minTotal}
                    onChangeText={setMinTotal}
                    style={styles.input}
                    mode={"outlined"}
                    keyboardType="numeric"
                    dense
                  />
                  <TextInput
                    label="Max Total"
                    value={maxTotal}
                    onChangeText={setMaxTotal}
                    style={styles.input}
                    mode={"outlined"}
                    keyboardType="numeric"
                    dense
                  />
                </View>
              </View>
            </Card>
          </List.Accordion>
        </View>
      </View>
      <Divider style={{ marginVertical: 10 }} />
    </>
  );
  let nOpen = orders
    .map((o) => orderStatusList.indexOf(o.orderStatus))
    .filter((i) => i < 6).length;
  let nFulfilled = orders
    .map((o) => orderStatusList.indexOf(o.orderStatus))
    .filter((i) => i >= 6 && i <= 8).length;
  let nUnfulfilled = orders
    .map((o) => orderStatusList.indexOf(o.orderStatus))
    .filter((i) => i > 8).length;

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
            ListHeaderComponent={filterAndSortComponent()}
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
      margin: 0,
      backgroundColor: colors.surface,
    },
    searchBar: { marginVertical: 10, backgroundColor: "white" },
    sectionTitle: { marginVertical: 8, fontSize: 16, fontWeight: "bold" },
    flexWrapRow: { flexDirection: "row", flexWrap: "wrap", marginVertical: 10 },
    row: {
      flexDirection: "row",
      justifyContent: "flex-start",
      marginVertical: 0,
      alignItems: "center",
    },
    input: { flex: 1, marginHorizontal: 5, backgroundColor: colors.white },
    card: { marginVertical: 8 },
    orderCard: {
      borderRadius: 8,
      marginVertical: 5,
      backgroundColor: colors.card,
      padding: 8
    },
    accordionBar: {
      backgroundColor: colors.primary,
      height: 50,
      minHeight: 50,
      paddingVertical: 0,
      justifyContent: "center",
      alignItems: "center",
      verticalAlign: "center",
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
    },
    accordionContent: { justifyContent: "center" },
    accordionTitle: { color: "white", fontSize: 16 },
    sortFilterContent: {
      paddingBottom: 20,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.grayBorder,
    },
    sortOrderChip: {
      margin: 0,
      backgroundColor: colors.white,
      color: colors.black,
    },
    orderStatusChip: { margin: 5 },
    // orderStatusChipSelected: {backgroundColor: colors.secondary, color: colors.white},
    checkboxItemCompact: {
      flex: 1,
      marginHorizontal: 2,
      paddingVertical: 0,
      paddingHorizontal: 5,
    },
    dateContainer: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 10,
      padding: 12,
      marginBottom: 10,
      elevation: 2, // Adds shadow for Android
      shadowColor: "#000", // Shadow for iOS
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    dateRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    dateInput: {
      flexDirection: "row",
      alignItems: "center",
      padding: 10,
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 5,
    },
    dateText: {
      marginLeft: 10,
      fontSize: 16,
      color: "black",
    },

    // dateContent: {
    //     marginLeft: 10,
    //     flex: 1,
    // },
    // dateLabel: {
    //     fontSize: 14,
    //     color: '#666',
    // },
    // dateText: {
    //     fontSize: 16,
    //     fontWeight: 'bold',
    //     color: '#333',
    // },
    section: {
      marginHorizontal: 10,
    },
    radioRow: {
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center",
    },
    radioItem: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 16, // Space between radio options
    },
    radioLabel: {
      fontSize: 16,
      color: "black",
      marginLeft: 4, // Space between radio button and text
    },
    toggleButton: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start", // Adjust width to content
      backgroundColor: "white",
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
    },
    toggleText: {
      fontSize: 14,
      color: "#333",
      marginLeft: 8, // Space between the icon and the text
      fontWeight: "500",
    },
    dateInput: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      padding: 8,
    },
    dateText: {
      marginLeft: 8,
      fontSize: 16,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'flex-end', // Align at the bottom
      backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent background
    },
    pickerContainer: {
      backgroundColor: '#fff',
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      padding: 16,
    },
    doneButton: {
      marginTop: 16,
      backgroundColor: '#007AFF',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 5,
      alignSelf: 'center',
    },
    doneText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
  });
export default Orders;