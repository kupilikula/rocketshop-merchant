import React, { useState, useMemo } from "react";
import { FlatList, View, StyleSheet, Pressable } from "react-native";
import {
  Text,
  TextInput,
  Chip,
  RadioButton,
  List,
  Surface,
  Checkbox,
  useTheme,
  Divider,
  Card,
} from "react-native-paper";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { useStoreProducts } from "../../../../api/hooks/useStoreProducts";
import { ProductDisplayCompactMerchant } from "../../../../components/ProductDisplayCompactMerchant";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const Products = () => {
  const {storeId} = useSelector((state) => state.store);
  const theme = useTheme();
  const router = useRouter();
  const { data: products = [], isLoading, isError } = useStoreProducts(storeId);

  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [stockRange, setStockRange] = useState({ min: "", max: "" });
  const [sortField, setSortField] = useState("price");
  const [sortOrder, setSortOrder] = useState("ascending");
  const [filterExpanded, setFilterExpanded] = useState(false);
  const [selectedCollections, setSelectedCollections] = useState(["All"]);
  const [selectedTags, setSelectedTags] = useState(["All"]);

  const styles = makeStyles(theme);

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "ascending" ? "descending" : "ascending"));
  };

  const handleCollectionToggle = (collection) => {
    if (collection === "All") {
      setSelectedCollections(["All"]);
    } else {
      setSelectedCollections((prev) => {
        const newSelections = prev.includes(collection)
            ? prev.filter((item) => item !== collection)
            : [...prev.filter((item) => item !== "All"), collection];
        return newSelections.length === 0 ? ["All"] : newSelections;
      });
    }
  };

  const handleTagToggle = (tag) => {
    if (tag === "All") {
      setSelectedTags(["All"]);
    } else {
      setSelectedTags((prev) => {
        const newSelections = prev.includes(tag)
            ? prev.filter((item) => item !== tag)
            : [...prev.filter((item) => item !== "All"), tag];
        return newSelections.length === 0 ? ["All"] : newSelections;
      });
    }
  };

  const filteredProducts = useMemo(() => {
    if (isLoading || isError) return [];

    let result = [...products];

    // Search filtering
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
          (product) =>
              product.productName.toLowerCase().includes(lowerQuery) ||
              product.description.toLowerCase().includes(lowerQuery)
      );
    }

    // Price range filtering
    if (priceRange.min || priceRange.max) {
      const min = priceRange.min
          ? parseInt(priceRange.min, 10)
          : Number.NEGATIVE_INFINITY;
      const max = priceRange.max
          ? parseInt(priceRange.max, 10)
          : Number.POSITIVE_INFINITY;
      result = result.filter(
          (product) => product.price >= min && product.price <= max
      );
    }

    // Stock range filtering
    if (stockRange.min || stockRange.max) {
      const min = stockRange.min
          ? parseInt(stockRange.min, 10)
          : Number.NEGATIVE_INFINITY;
      const max = stockRange.max
          ? parseInt(stockRange.max, 10)
          : Number.POSITIVE_INFINITY;
      result = result.filter(
          (product) => product.stock >= min && product.stock <= max
      );
    }

    // Collections filtering
    if (!selectedCollections.includes("All")) {
      result = result.filter((product) =>
          selectedCollections.some((collection) =>
              product.collections.includes(collection)
          )
      );
    }

    // Tags filtering
    if (!selectedTags.includes("All")) {
      result = result.filter((product) =>
          selectedTags.some((tag) => product.tags.includes(tag))
      );
    }

    // Sorting
    result = result.sort((a, b) => {
      const isAscending = sortOrder === "ascending";
      if (sortField === "price") {
        return isAscending ? a.price - b.price : b.price - a.price;
      } else if (sortField === "stock") {
        return isAscending ? a.stock - b.stock : b.stock - a.stock;
      }
      return 0;
    });

    return result;
  }, [
    products,
    searchQuery,
    priceRange,
    stockRange,
    selectedCollections,
    selectedTags,
    sortField,
    sortOrder,
  ]);

  const renderProductItem = ({ item }) => (
      <Pressable
          onPress={() =>
              router.push(`/Main/(tabs)/Products/Product/${item.productId}`)
          }
      >
        <ProductDisplayCompactMerchant product={item} />
      </Pressable>
  );

  const TopSection = () => (
      <View style={{ marginVertical: 10 }}>
        <View
            style={{
              marginLeft: 8,
              marginTop: 8,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
        >
          <MaterialIcons
              name="shopping-bag"
              size={44}
              color={theme.colors.primary}
          />
          <Text
              variant="displaySmall"
              style={{ marginLeft: 10, color: theme.colors.secondary }}
          >
            Products
          </Text>
        </View>
        <Text variant="bodyLarge" style={{ marginLeft: 10 }}>
          {products.filter((p) => p.isActive).length} Active Products
        </Text>
        <Text variant="bodyLarge" style={{ marginLeft: 10 }}>
          {products.filter((p) => !p.isActive).length} Inactive Products
        </Text>
      </View>
  );

  if (isLoading) {
    return (
        <Surface style={styles.surface}>
          <Text style={{ textAlign: "center", marginTop: 20 }}>Loading...</Text>
        </Surface>
    );
  }

  if (isError) {
    return (
        <Surface style={styles.surface}>
          <Text
              style={{
                textAlign: "center",
                marginTop: 20,
                color: theme.colors.error,
              }}
          >
            Failed to load products. Please try again.
          </Text>
        </Surface>
    );
  }

  return (
      <Surface style={styles.surface}>
        <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.productId}
            renderItem={renderProductItem}
            ListHeaderComponent={TopSection()}
            ListEmptyComponent={<Text>No Products Found</Text>}
            contentContainerStyle={{ padding: 10 }}
        />
      </Surface>
  );
};

const makeStyles = ({ colors }) =>
    StyleSheet.create({
      surface: {
        flex: 1,
        backgroundColor: colors.surface,
      },
    });

export default Products;