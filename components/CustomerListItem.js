import { Card, Text } from "react-native-paper";
import { Pressable, View } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import {getCustomerPath} from "../utils/getPathUtils";

export const CustomerListItem = ({ customer }) => {
  const router = useRouter();

  return (
    <Pressable
      onPress={() =>
        router.push(getCustomerPath(customer.customerId))
      }
    >
      <Card style={styles.card}>
        <Text variant={"titleLarge"}>{customer.fullName}</Text>
        <Text variant={"bodyMedium"}>{customer.phone}</Text>
        <Text variant={"bodyMedium"}>{customer.customerAddress}</Text>
        <Text variant={"bodyMedium"}>{customer.email}</Text>
        <View style={{ marginTop: 10 }}>
          <Text variant={"bodyLarge"}>
            Orders: {customer.orderCount} | Total Spent: ₹{customer.totalSpent}
          </Text>
          <Text variant={"bodyLarge"}>
            Last Order: {new Date(customer.mostRecentOrderDate).toLocaleDateString()}
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
