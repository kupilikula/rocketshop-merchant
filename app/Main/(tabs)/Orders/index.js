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
import { getOrder } from "../../../../utils/fakeDataMethods";
import { faker } from "@faker-js/faker";
// import {DatePickerModal} from "react-native-paper-dates";
import DatePicker from "@react-native-community/datetimepicker";

import { List } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  orderStatusColors,
  orderStatusList,
} from "../../../../utils/dataValues";

const initialOrders = faker.helpers.multiple(getOrder, { count: 100 });

const Orders = () => {
  const [orders, setOrders] = useState(initialOrders);
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
  const [sortField, setSortField] = useState("orderDate"); // Default sorting
  const [sortOrder, setSortOrder] = useState("descending"); // Default sorting order
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

  const router = useRouter();

  const theme = useTheme();
  const styles = makeStyles(theme);
  const fuse = useMemo(() => {
    return new Fuse(orders, {
      keys: [
        "orderId",
        "customer.fullName", // Search customer name
        "customer.customerAddress",
        "customer.phone",
        "customer.email", // Search email
        "orderItems[].productName", // Search through all items in orderItems array
        "orderStatus",
        "orderTotal",
      ],
      threshold: 0.4, // Controls fuzziness
      includeScore: false,
      ignoreLocation: true, // Ignores match location
    });
  }, [orders]);

  // Search filter logic
  const filteredOrders = useMemo(() => {
    let result = orders;

    if (searchQuery.trim()) {
      const searchResults = fuse.search(searchQuery);
      result = searchResults.map((res) => res.item);
    }

    if (statusFilter) {
      if (!statusFilter.includes("All")) {
        result = result.filter((order) =>
          statusFilter.includes(order.orderStatus),
        );
      }
    }
    console.log("result.length before total filtering:", result.length);
    console.log("minTotal:", minTotal, " ,maxTotal:", maxTotal);
    // Filter by orderTotal range
    if (minTotal || maxTotal) {
      const min = minTotal ? parseInt(minTotal, 10) : Number.NEGATIVE_INFINITY;
      const max = maxTotal ? parseInt(maxTotal, 10) : Number.POSITIVE_INFINITY;
      result = result.filter(
        (order) => order.orderTotal >= min && order.orderTotal <= max,
      );
    }

    if (filterDates?.startDate && filterDates?.endDate) {
      result = result.filter(
        (order) =>
          order.orderDate >= filterDates.startDate &&
          order.orderDate <= filterDates.endDate,
      );
    }

    // Sorting
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

    console.log("result.length after total filtering:", result.length);

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
  ]);

  // Function to update order status
  // const updateOrderStatus = (id, newStatus) => {
  //   const updatedOrders = orders.map((order) =>
  //     order.id === id ? { ...order, status: newStatus } : order,
  //   );
  //   setOrders(updatedOrders);
  // };

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
          <Text variant={"bodyLarge"}>{`ID: #${item.orderId}`}</Text>
          <Text variant={"bodyLarge"}>
            Date: {item.orderDate.toLocaleDateString()}
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
                      icon={() => (
                        <MaterialCommunityIcons
                          name={
                            sortOrder === "ascending"
                              ? "arrow-up-bold"
                              : "arrow-down-bold"
                          }
                          size={20}
                          color={theme.colors.primary}
                        />
                      )}
                      onPress={toggleSortOrder}
                    >
                      {sortOrder === "ascending" ? "Ascending" : "Descending"}
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
                    <Text variant={"bodySmall"}>Start Date</Text>
                    <TouchableOpacity
                      onPress={() => setShowStartPicker(true)}
                      style={styles.dateInput}
                    >
                      <MaterialCommunityIcons
                        name="calendar"
                        size={20}
                        color={theme.colors.primary}
                      />
                      <Text style={styles.dateText}>
                        {filterDates.startDate
                          ? filterDates.startDate.toLocaleDateString()
                          : "Start Date"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {showStartPicker && (
                    <DatePicker
                      style={{ backgroundColor: theme.colors.primary }}
                      accentColor={theme.colors.primary}
                      mode="date"
                      value={filterDates.startDate || new Date()}
                      onChange={(event, date) => {
                        setShowStartPicker(false);
                        if (date)
                          setFilterDates((prev) => ({
                            ...prev,
                            startDate: date,
                          }));
                      }}
                    />
                  )}
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      flex: 0.48,
                    }}
                  >
                    <Text variant={"bodySmall"}>Stop Date</Text>
                    <TouchableOpacity
                      onPress={() => setShowEndPicker(true)}
                      style={styles.dateInput}
                    >
                      <MaterialCommunityIcons
                        name="calendar"
                        size={20}
                        color={theme.colors.primary}
                      />
                      <Text style={styles.dateText}>
                        {filterDates.endDate
                          ? filterDates.endDate.toLocaleDateString()
                          : "End Date"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {showEndPicker && (
                    <DatePicker
                      mode="date"
                      value={filterDates.endDate || new Date()}
                      onChange={(event, date) => {
                        setShowEndPicker(false);
                        if (date)
                          setFilterDates((prev) => ({
                            ...prev,
                            endDate: date,
                          }));
                      }}
                    />
                  )}
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

  return (
    <Surface style={styles.container}>
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.orderId}
        renderItem={renderOrderItem}
        ListHeaderComponent={filterAndSortComponent()}
        ListEmptyComponent={<Text>No Orders Found</Text>}
        contentContainerStyle={{ overflow: "visible", padding: 2 }}
        ItemSeparatorComponent={<Divider style={{ marginVertical: 10 }} />}
      />
    </Surface>
  );
};

// const styles = StyleSheet.create({
//     container: { flex: 1, padding: 10 },
//     searchBar: { marginBottom: 10 },
//     sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
//     filterSection: { marginBottom: 15 },
//     chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
//     chip: { margin: 5 },
//     chipSelected: { backgroundColor: '#6200ee', color: '#ffffff' },
//     row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
//     totalInput: { flex: 1, marginHorizontal: 5 },
//     sortSection: { marginBottom: 10 },
//     card: { marginVertical: 8 },
// });
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
      justifyContent: "space-between",
      marginVertical: 0,
      alignItems: "center",
    },
    input: { flex: 1, marginHorizontal: 5, backgroundColor: colors.white },
    card: { marginVertical: 8 },
    orderCard: {
      borderRadius: 8,
      marginVertical: 5,
      backgroundColor: colors.card,
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
  });
export default Orders;
