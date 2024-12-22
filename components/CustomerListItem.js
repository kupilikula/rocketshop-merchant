import { Card, Text } from "react-native-paper";
import { Pressable, View } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { StyleSheet } from "react-native";

export const CustomerListItem = ({ customer }) => {
  const router = useRouter();
  const totalSpent = customer.orders.reduce(
    (sum, order) => sum + order.orderTotal,
    0,
  );
  const mostRecentOrderDate = new Date(
    Math.max.apply(
      null,
      customer.orders.map((o) => o.orderDate),
    ),
  );

  return (
    <Pressable
      onPress={() =>
        router.push("/Main/(tabs)/Customers/Customer/" + customer.customerId)
      }
    >
      <Card style={styles.card}>
        <Text variant={"titleLarge"}>{customer.fullName}</Text>
        <Text variant={"bodyMedium"}>{customer.phone}</Text>
        <Text variant={"bodyMedium"}>{customer.customerAddress}</Text>
        <Text variant={"bodyMedium"}>{customer.email}</Text>
        <View style={{ marginTop: 10 }}>
          <Text variant={"bodyLarge"}>
            Orders: {customer.orders.length} | Total Spent: ₹{totalSpent}
          </Text>
          <Text variant={"bodyLarge"}>
            Last Order: {mostRecentOrderDate.toLocaleDateString()}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: 8,
    padding: 16,
    // marginBottom: 10,
    backgroundColor: "white",
    // borderWidth: 1,
    // borderColor: '#aaa'
  },
});
