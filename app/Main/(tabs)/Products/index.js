import React, { useState, useMemo } from "react";
import {FlatList, View, StyleSheet, Pressable, ActivityIndicator} from "react-native";
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
import {MaterialCommunityIcons} from "@expo/vector-icons";

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
  const [selectedCollectionIds, setSelectedCollectionIds] = useState(["All"]);
  const [selectedTags, setSelectedTags] = useState(["All"]);

  const styles = makeStyles(theme);

    // Extract unique collections
    const uniqueCollections = Array.from(
        products
            .flatMap((product) => product.collections) // Flatten all collections from products
            .reduce((acc, collection) => {
                // Use a Map to track unique collections by collectionId
                if (!acc.has(collection.collectionId)) {
                    acc.set(collection.collectionId, collection);
                }
                return acc;
            }, new Map())
            .values() // Extract the unique collections from the Map
    );
// Extract unique productTags
    const uniqueProductTags = Array.from(
        new Set(
            products.flatMap((product) => product.productTags) // Flatten all tags from products
        )
    );
    console.log('pl:', products.length);
    console.log('prods.colls:', products.map((p) => p.collections.length));
  // console.log('tags:', productTags);
  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "ascending" ? "descending" : "ascending"));
  };

  const handleCollectionToggle = (collection) => {
    if (collection.collectionId === "All") {
      setSelectedCollectionIds(["All"]);
    } else {
      setSelectedCollectionIds((prev) => {
        const newSelections = prev.includes(collection.collectionId)
            ? prev.filter((item) => item !== collection.collectionId)
            : [...prev.filter((item) => item !== "All"), collection.collectionId];
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
    if (!selectedCollectionIds.includes("All")) {
      result = result.filter((product) =>
          selectedCollectionIds.some((col) =>
              product.collections.map((c) => c.collectionId).includes(col)
          )
      );
    }

    // Tags filtering
    if (!selectedTags.includes("All")) {
      result = result.filter((product) =>
          selectedTags.some((tag) => product.productTags.includes(tag))
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
    selectedCollectionIds,
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
        <>
            <View style={{ marginVertical: 10 }}>
                <Text variant={"bodyLarge"} style={{ marginLeft: 10 }}>
                    {nActive.toString() + " Active Product" + (nActive > 1 ? "s" : "")}
                </Text>
                <Text variant={"bodyLarge"} style={{ marginLeft: 10 }}>
                    {nInactive.toString() +
                        " Inactive Product" +
                        (nInactive > 1 ? "s" : "")}
                </Text>
            </View>

            <View style={{ marginBottom: 10, backgroundColor: theme.colors.surface }}>
                <TextInput
                    label="Search Products"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={styles.searchBar}
                    mode="outlined"
                />
                <View
                    style={{
                        backgroundColor: theme.colors.surface,
                        overflow: "hidden",
                        borderRadius: 8,
                    }}
                >
                    <List.Accordion
                        title="Sort & Filter"
                        expanded={filterExpanded}
                        onPress={() => setFilterExpanded(!filterExpanded)}
                        style={styles.accordionBar}
                        titleStyle={styles.accordionTitle}
                        contentStyle={styles.accordionContent}
                        right={() => (
                            <MaterialCommunityIcons
                                name={filterExpanded ? "chevron-up" : "chevron-down"}
                                size={24}
                                color="white"
                            />
                        )}
                    >
                        <Card style={styles.sortFilterContent}>
                            <View style={styles.section}>
                                {/* Sort Options */}
                                <Text style={styles.sectionTitle}>Sort By</Text>
                                <View style={styles.row}>
                                    <RadioButton.Group
                                        onValueChange={setSortField}
                                        value={sortField}
                                    >
                                        <View style={styles.radioRow}>
                                            <RadioButton.Item
                                                mode="android"
                                                position={"leading"}
                                                color={theme.colors.primary}
                                                label="Price"
                                                value="price"
                                                labelStyle={{fontSize: 14, padding: 0, margin: 0}}
                                            />
                                            <RadioButton.Item
                                                mode="android"
                                                position={"leading"}
                                                color={theme.colors.primary}
                                                label="Stock"
                                                value="stock"
                                                labelStyle={{fontSize: 14, padding: 0, margin: 0}}
                                            />
                                        </View>
                                    </RadioButton.Group>
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
                                {/* Price Range */}
                                <Text style={styles.sectionTitle}>Price Range</Text>
                                <View style={styles.row}>
                                    <TextInput
                                        label="Min Price"
                                        value={priceRange.min}
                                        onChangeText={(value) =>
                                            setPriceRange((prev) => ({ ...prev, min: value }))
                                        }
                                        style={styles.input}
                                        mode="outlined"
                                        keyboardType="numeric"
                                        dense
                                    />
                                    <TextInput
                                        label="Max Price"
                                        value={priceRange.max}
                                        onChangeText={(value) =>
                                            setPriceRange((prev) => ({ ...prev, max: value }))
                                        }
                                        style={styles.input}
                                        mode="outlined"
                                        keyboardType="numeric"
                                        dense
                                    />
                                </View>
                            </View>

                            <View style={styles.section}>
                                {/* Stock Range */}
                                <Text style={styles.sectionTitle}>Stock Range</Text>
                                <View style={styles.row}>
                                    <TextInput
                                        label="Min Stock"
                                        value={stockRange.min}
                                        onChangeText={(value) =>
                                            setStockRange((prev) => ({ ...prev, min: value }))
                                        }
                                        style={styles.input}
                                        mode="outlined"
                                        keyboardType="numeric"
                                        dense
                                    />
                                    <TextInput
                                        label="Max Stock"
                                        value={stockRange.max}
                                        onChangeText={(value) =>
                                            setStockRange((prev) => ({ ...prev, max: value }))
                                        }
                                        style={styles.input}
                                        mode="outlined"
                                        keyboardType="numeric"
                                        dense
                                    />
                                </View>
                            </View>

                            <View style={styles.section}>
                                {/* Collections Filter */}
                                <Text style={styles.sectionTitle}>Collections</Text>
                                <View style={styles.flexWrapRowCompact}>
                                    {[{collectionId: 'All', collectionName: 'All'} , ...uniqueCollections].map((c, index) => (
                                        // <Text key={index}>{cName}</Text>))}
                                        <Checkbox.Item
                                            mode={"android"}
                                            key={c.collectionId}
                                            label={c.collectionName}
                                            status={
                                                selectedCollectionIds.includes(c.collectionId)
                                                    ? "checked"
                                                    : "unchecked"
                                            }
                                            onPress={() => handleCollectionToggle(c)}
                                            style={styles.checkboxItemCompact}
                                            color={theme.colors.primary}
                                            uncheckedColor={theme.colors.primary}
                                            position={"leading"}
                                        />))}
                                </View>
                            </View>

                            <View style={styles.section}>
                                {/* Tags Filter */}
                                <Text style={styles.sectionTitle}>Tags</Text>
                                <View style={styles.flexWrapRow}>
                                    {["All", ...uniqueProductTags.slice(0,10)].map((tag) => (
                                        <Chip
                                            key={tag}
                                            selected={selectedTags.includes(tag)}
                                            onPress={() => handleTagToggle(tag)}
                                            style={[
                                                styles.tagChip,
                                                selectedTags.includes(tag) && styles.tagChipSelected,
                                            ]}
                                            textStyle={{
                                                color: selectedTags.includes(tag)
                                                    ? theme.colors.white
                                                    : theme.colors.black,
                                            }}
                                            selectedColor={"white"}
                                        >
                                            {tag}
                                        </Chip>
                                    ))}
                                </View>
                            </View>
                        </Card>
                    </List.Accordion>
                </View>
            </View>
            <Divider style={{ marginVertical: 10 }} />
        </>
    );

    let nActive = products.filter((c) => c.isActive).length;
    let nInactive = products.filter((c) => !c.isActive).length;

    if (isLoading) {
    return (
        <Surface style={styles.surface}>
            <View style={{height: '100%', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
            <ActivityIndicator size={100} animating={true} color={theme.colors.primary}/>
            </View>
          {/*<Text style={{ textAlign: "center", marginTop: 20 }}>Loading...</Text>*/}
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
            ItemSeparatorComponent={() => (
                <Divider style={{ marginVertical: 10 }} />
            )}
            contentContainerStyle={{ padding: 10 }}
        />
      </Surface>
  );
};

const makeStyles = ({ colors }) =>
  StyleSheet.create({
    surface: {
      flex: 1,
      paddingHorizontal: 10,
      overflow: "visible",
      backgroundColor: colors.surface,
    },
    searchBar: { marginVertical: 10, backgroundColor: colors.white },
    section: { marginHorizontal: 10, marginVertical: 5 },
    sectionTitle: { fontSize: 16, fontWeight: "bold" },
    radioRow: { flexDirection: "row", justifyContent: "flex-start", margin: 0, padding: 0 },
    input: { flex: 1, marginHorizontal: 5, backgroundColor: colors.white },
    row: {
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center",
    },
    flexWrapRow: { flexDirection: "row", flexWrap: "wrap", marginVertical: 10 },
    flexWrapRowCompact: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginVertical: 5,
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
        padding: 0,
      backgroundColor: colors.white,
      color: colors.black,
    },
    tagChip: {
      margin: 5,
      backgroundColor: colors.softSecondary,
      color: colors.black,
    },
    tagChipSelected: { backgroundColor: colors.secondary, color: colors.white },
    checkboxItemCompact: {
      flex: 1,
      marginHorizontal: 2,
      paddingVertical: 0,
      paddingHorizontal: 5,
    },
  });

export default Products;