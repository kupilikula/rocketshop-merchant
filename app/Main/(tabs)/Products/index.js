import React, { useState, useMemo } from "react";
import {FlatList, View, StyleSheet, Pressable} from "react-native";
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
    ActivityIndicator
} from "react-native-paper";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { useStoreProducts } from "../../../../api/hooks/useStoreProducts";
import { ProductDisplayCompactMerchant } from "../../../../components/ProductDisplayCompactMerchant";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import KeyboardAwareView from "../../../../components/KeyboardAwareView";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {usePushWithBackHref} from "../../../../utils/usePushWithBackHref";

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
    const [quickFilterExpanded, setQuickFilterExpanded] = useState(false);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState(["All"]);
  const [selectedTags, setSelectedTags] = useState(["All"]);
    const [selectedQuickFilters, setSelectedQuickFilters] = useState(["all"]);

    const pushWithBackHref = usePushWithBackHref();
    const insets = useSafeAreaInsets();
  const styles = makeStyles(theme);

    // const QUICK_FILTERS = [
    //     { key: "all", label: "All" },
    //     { key: "active", label: "Active" },
    //     { key: "inactive", label: "Inactive" },
    //     { key: "low_stock", label: "Low Stock" },
    //     { key: "out_of_stock", label: "Out of Stock" },
    //     { key: "top_selling", label: "Top Selling" },
    //     { key: "least_selling", label: "Least Selling" },
    //     { key: "recently_added", label: "Recently Added" },
    //     { key: "added_long_ago", label: "Added Long Ago" }, // ✅ NEW
    // ];
    //
    // const INCOMPATIBLE_FILTERS = {
    //     active: ["inactive"],
    //     inactive: ["active"],
    //     top_selling: ["least_selling"],
    //     least_selling: ["top_selling"],
    //     recently_added: ["added_long_ago"],
    //     added_long_ago: ["recently_added"],
    //     all: QUICK_FILTERS.map(f => f.key).filter(k => k !== "all"),
    // };

    const QUICK_FILTER_ROWS = [
        [
            { key: "all", label: "All" },
            { key: "active", label: "Active" },
            { key: "inactive", label: "Inactive" },
        ],
        [
            { key: "low_stock", label: "Low Stock" },
            { key: "out_of_stock", label: "Out of Stock" },
        ],
        [
            { key: "recently_added", label: "Recently Added" },
            { key: "added_long_ago", label: "Added Long Ago" },
        ],
        [
            { key: "high_price", label: "High Price" },
            { key: "low_price", label: "Low Price" },
        ],
        [
            { key: "top_selling_day", label: "Top Selling (Day)" },
            { key: "top_selling_week", label: "Top Selling (Week)" },
            { key: "top_selling_month", label: "Top Selling (Month)" },
            { key: "top_selling_year", label: "Top Selling (Year)" },
            { key: "least_selling_day", label: "Least Selling (Day)" },
            { key: "least_selling_week", label: "Least Selling (Week)" },
            { key: "least_selling_month", label: "Least Selling (Month)" },
            { key: "least_selling_year", label: "Least Selling (Year)" },
        ],
    ];

    const INCOMPATIBLE_FILTERS = {
        active: ["inactive"],
        inactive: ["active"],

        high_price: ["low_price"],
        low_price: ["high_price"],

        recently_added: ["added_long_ago"],
        added_long_ago: ["recently_added"],

        top_selling_day: ["least_selling_day"],
        least_selling_day: ["top_selling_day"],

        top_selling_week: ["least_selling_week"],
        least_selling_week: ["top_selling_week"],

        top_selling_month: ["least_selling_month"],
        least_selling_month: ["top_selling_month"],

        top_selling_year: ["least_selling_year"],
        least_selling_year: ["top_selling_year"],

        all: QUICK_FILTER_ROWS.flat().map(f => f.key).filter(k => k !== "all"),
    };

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

    const applyQuickFilters = (inputProducts, filters) => {
        if (filters.includes("all")) return inputProducts;

        let result = [...inputProducts];

        if (filters.includes("active")) {
            result = result.filter(p => p.isActive);
        }
        if (filters.includes("inactive")) {
            result = result.filter(p => !p.isActive);
        }
        if (filters.includes("low_stock")) {
            result = result.filter(p => p.stock > 0 && p.stock <= 5);
        }
        if (filters.includes("out_of_stock")) {
            result = result.filter(p => p.stock === 0);
        }
        if (filters.includes("recently_added")) {
            result = result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
        if (filters.includes("added_long_ago")) {
            result = result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        }
        if (filters.includes("high_price")) {
            result = result.sort((a, b) => b.price - a.price);
        }
        if (filters.includes("low_price")) {
            result = result.sort((a, b) => a.price - b.price);
        }

// For each time range
        const timeRanges = ["day", "week", "month", "year"];
        for (const range of timeRanges) {
            if (filters.includes(`top_selling_${range}`)) {
                result = result
                    .filter(p => p.salesStats && p.salesStats[range])
                    .sort((a, b) => b.salesStats[range].revenue - a.salesStats[range].revenue)
                    .slice(0, 10);
            }
            if (filters.includes(`least_selling_${range}`)) {
                result = result
                    .filter(p => p.salesStats && p.salesStats[range])
                    .sort((a, b) => a.salesStats[range].revenue - b.salesStats[range].revenue)
                    .slice(0, 10);
            }
        }

        return result;
    };

  const filteredProducts = useMemo(() => {
    if (isLoading || isError) return [];

    let result = [...products];
    console.log('result[0]', result[0]);
    //Apply Quick Filter
   result = applyQuickFilters(result, selectedQuickFilters);

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
      selectedQuickFilters,
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
          onPress={() => pushWithBackHref(`/Main/(tabs)/Products/${item.productId}`)}
      >
        <ProductDisplayCompactMerchant product={item} />
      </Pressable>
  );

    const TopSection = () => (
        <View style={{marginTop: 20, marginBottom: 10}}>
            <Card style={{ backgroundColor: theme.colors.surface, borderRadius: 0}} mode={'elevated'}>

                <List.Accordion
                    title="Quick Filter & Sort"
                    expanded={quickFilterExpanded}
                    onPress={() => setQuickFilterExpanded(!quickFilterExpanded)}
                    style={styles.accordionBar}
                    titleStyle={styles.accordionTitle}
                    contentStyle={styles.accordionContent}
                    right={() => (
                        <MaterialCommunityIcons
                            name={quickFilterExpanded ? "chevron-up" : "chevron-down"}
                            size={24}
                            color="black"
                        />
                    )}
                >
                <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
                    {QUICK_FILTER_ROWS.map((row, rowIndex) => (
                        <View key={rowIndex} style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
                            {row.map(({ key, label }) => (
                                <Chip
                                    key={key}
                                    selected={selectedQuickFilters.includes(key)}
                                    onPress={() => {
                                        let updated = [];
                                        if (key === "all") {
                                            // Always override and select only "all"
                                            updated = ["all"];
                                        } else {
                                            const isSelected = selectedQuickFilters.includes(key);

                                            if (isSelected) {
                                                // Deselect the chip
                                                updated = selectedQuickFilters.filter(f => f !== key);
                                            } else {
                                                // Add the chip, remove incompatible ones and "all"
                                                const incompatible = INCOMPATIBLE_FILTERS[key] || [];
                                                updated = selectedQuickFilters
                                                    .filter(f => f !== "all" && !incompatible.includes(f))
                                                    .concat(key);
                                            }

                                            // If everything was removed, fallback to "all"
                                            if (updated.length === 0) {
                                                updated = ["all"];
                                            }
                                        }

                                        setSelectedQuickFilters(updated);
                                    }}
                                    style={{
                                        margin: 2,
                                        backgroundColor: theme.colors.softPrimary,
                                        borderColor: "black",
                                    }}
                                    textStyle={{
                                        color:
                                            selectedQuickFilters.includes(key)
                                                ? "black"
                                                : theme.colors.primary,
                                    }}
                                    selectedColor={theme.colors.black}
                                >
                                    {label}
                                </Chip>
                            ))}
                        </View>
                    ))}
                </View>
                </List.Accordion>
                <List.Accordion
                        title="More Sort & Filter Options"
                        expanded={filterExpanded}
                        onPress={() => setFilterExpanded(!filterExpanded)}
                        style={styles.accordionBar}
                        titleStyle={styles.accordionTitle}
                        contentStyle={styles.accordionContent}
                        right={() => (
                            <MaterialCommunityIcons
                                name={filterExpanded ? "chevron-up" : "chevron-down"}
                                size={24}
                                color="black"
                            />
                        )}
                    >
                        <View style={styles.sortFilterContent}>
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
                        </View>
                    </List.Accordion>
            </Card>
            <TextInput
                label="Search Products"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchBar}
                mode="outlined"
            />
            <Divider style={{ marginVertical: 10 }} />
            <View style={{ marginVertical: 0 }}>
                <Text variant={"bodyLarge"} style={{ marginLeft: 10 }}>
                    {filteredProducts?.length.toString() + (filteredProducts.length===1 ? " Filtered Product" : " Filtered Products")}
                </Text>
            </View>
            <Divider style={{ marginVertical: 10 }} />
        </View>
    );

    let nActive = useMemo(() => filteredProducts.filter((c) => c.isActive).length, [filteredProducts]);
    let nInactive = useMemo( () => filteredProducts.filter((c) => !c.isActive).length, [filteredProducts]);

    console.log('AIA: ', nActive, nInactive);

    if (isLoading) {
    return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.surface}}>
            <ActivityIndicator size={100} animating={true} color={theme.colors.primary}/>
            </View>
    );
  }

  if (isError) {
    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.surface}}>
          <Text
              variant={"bodyLarge"}
          >
            Failed to load products. Please try again.
          </Text>
        </View>
    );
  }

  return (
      <KeyboardAwareView backgroundColor={theme.colors.surface} containerStyle={styles.surface} keyboardVerticalOffset={0}>
        <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.productId}
            renderItem={renderProductItem}
            ListHeaderComponent={TopSection()}
            ListEmptyComponent={<Text>No Products Found</Text>}
            ItemSeparatorComponent={() => (
                <Divider style={{ marginVertical: 10 }} />
            )}
            contentContainerStyle={{ paddingHorizontal: 2 }}
        />
      </KeyboardAwareView>
  );
};

const makeStyles = ({ colors }) =>
  StyleSheet.create({
    surface: {
      paddingHorizontal: 10,
      overflow: "visible",
      backgroundColor: colors.surface,
    },
    searchBar: { marginTop: 10, backgroundColor: colors.white },
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
      backgroundColor: colors.softPrimary,
      height: 50,
      minHeight: 50,
      paddingVertical: 0,
      justifyContent: "center",
      alignItems: "center",
      verticalAlign: "center",
      borderRadius: 0,
    },
    accordionContent: { justifyContent: "center" },
    accordionTitle: { color: "black", fontSize: 16, fontWeight: "bold" },
    sortFilterContent: {
      // paddingBottom: 20,
      borderRadius: 0,
      backgroundColor: colors.white,
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