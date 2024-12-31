import React from "react";
import { ActivityIndicator, Text, View, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSelector } from "react-redux"; // To get storeId from Redux
import { useStoreProduct } from "../../../../../api/hooks/useStoreProduct";
import ProductScreenMerchant from "../../../../../components/ProductScreenMerchant";

const ProductPage = () => {
  const { productId } = useLocalSearchParams(); // Get productId from route params
  const {storeId} = useSelector((state) => state.store); // Get storeId from Redux

  const { data: product, isLoading, isError } = useStoreProduct(storeId, productId);

  if (isLoading) {
    return (
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Loading product details...</Text>
        </View>
    );
  }

  if (isError) {
    return (
        <View style={styles.container}>
          <Text style={styles.errorText}>
            Failed to load product details. Please try again.
          </Text>
        </View>
    );
  }
  console.log('product:', product);
  return (
      <ProductScreenMerchant product={product} showProductDescription={true} />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
});

export default ProductPage;