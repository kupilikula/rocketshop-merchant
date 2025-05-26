import React, {useState, useMemo, useCallback} from "react";
import {
    FlatList, View, StyleSheet, Pressable, Platform, useWindowDimensions, ActivityIndicator
} from "react-native";
import {
    Text, TextInput, Chip, RadioButton, List, Checkbox, useTheme, Divider, Card,
} from "react-native-paper";
import {useRouter} from "expo-router"; // Original import, though router not used in final JSX
import {useSelector} from "react-redux";
import {useStoreProducts} from "../../../../api/hooks/useStoreProducts";
import {ProductDisplayCompactMerchant} from "../../../../components/ProductDisplayCompactMerchant";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import KeyboardAwareView from "../../../../components/KeyboardAwareView";
import {usePushWithBackHref} from "../../../../utils/usePushWithBackHref";
import {getProductPath} from "../../../../utils/getPathUtils";

const IS_WEB = Platform.OS === 'web';

// Define TopSectionContent outside the Products component for stability
const TopSectionContent = React.memo(({
                                          theme, styles, IS_WEB,
                                          quickFilterExpanded, setQuickFilterExpanded,
                                          selectedQuickFilters, setSelectedQuickFilters, QUICK_FILTER_ROWS, INCOMPATIBLE_FILTERS,
                                          filterExpanded, setFilterExpanded, sortField, setSortField,
                                          sortOrder, toggleSortOrder, priceRange, setPriceRange, stockRange, setStockRange,
                                          uniqueCollections, selectedCollectionIds, handleCollectionToggle,
                                          uniqueProductTags, selectedTags, handleTagToggle,
                                          searchQuery, setSearchQuery,
                                          filteredProductsCount
                                      }) => {
    // This is the exact JSX from your original TopSection function, using props now
    return (
        <View style={{ marginTop: IS_WEB ? 0 : 20, marginBottom: 10 }}>
            <Card style={{ backgroundColor: theme.colors.surface, borderRadius: 0 }} mode={'elevated'}>
                <List.Accordion
                    title="Quick Filter & Sort"
                    expanded={quickFilterExpanded}
                    onPress={() => setQuickFilterExpanded(!quickFilterExpanded)}
                    style={styles.accordionBar}
                    titleStyle={styles.accordionTitle}
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
                                                updated = ["all"];
                                            } else {
                                                const isSelected = selectedQuickFilters.includes(key);
                                                if (isSelected) {
                                                    updated = selectedQuickFilters.filter(f => f !== key);
                                                } else {
                                                    const incompatible = INCOMPATIBLE_FILTERS[key] || [];
                                                    updated = selectedQuickFilters.filter(f => f !== "all" && !incompatible.includes(f)).concat(key);
                                                }
                                                if (updated.length === 0) {
                                                    updated = ["all"];
                                                }
                                            }
                                            setSelectedQuickFilters(updated);
                                        }}
                                        style={{ // Original inline style for Quick Filter Chips
                                            margin: 2,
                                            backgroundColor: theme.colors.softPrimary,
                                            borderColor: "black",
                                        }}
                                        textStyle={{ // Original textStyle for Quick Filter Chips
                                            color:
                                                selectedQuickFilters.includes(key)
                                                    ? "black"
                                                    : theme.colors.primary,
                                        }}
                                        selectedColor={theme.colors.black} // Original selectedColor prop
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
                            <Text style={styles.sectionTitle}>Sort By</Text>
                            <View style={styles.row}>
                                <RadioButton.Group onValueChange={setSortField} value={sortField}>
                                    <View style={styles.radioRow}>
                                        <RadioButton.Item mode="android" position={"leading"} color={theme.colors.primary} label="Price" value="price" labelStyle={{fontSize: 14, padding: 0, margin: 0}}/>
                                        <RadioButton.Item mode="android" position={"leading"} color={theme.colors.primary} label="Stock" value="stock" labelStyle={{fontSize: 14, padding: 0, margin: 0}}/>
                                    </View>
                                </RadioButton.Group>
                                <View style={{ display: "flex", flexDirection: "row" }}>
                                    <Chip mode="outlined" style={styles.sortOrderChip} onPress={toggleSortOrder}>
                                        <MaterialCommunityIcons name={sortOrder === "ascending" ? "arrow-up-bold" : "arrow-down-bold"} size={20} color={theme.colors.primary}/>
                                    </Chip>
                                </View>
                            </View>
                        </View>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Price Range</Text>
                            <View style={styles.row}>
                                <TextInput label="Min Price" value={priceRange.min} onChangeText={(value) => setPriceRange((prev) => ({ ...prev, min: value }))} style={styles.input} mode="outlined" keyboardType="numeric" dense/>
                                <TextInput label="Max Price" value={priceRange.max} onChangeText={(value) => setPriceRange((prev) => ({ ...prev, max: value }))} style={styles.input} mode="outlined" keyboardType="numeric" dense/>
                            </View>
                        </View>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Stock Range</Text>
                            <View style={styles.row}>
                                <TextInput label="Min Stock" value={stockRange.min} onChangeText={(value) => setStockRange((prev) => ({ ...prev, min: value }))} style={styles.input} mode="outlined" keyboardType="numeric" dense/>
                                <TextInput label="Max Stock" value={stockRange.max} onChangeText={(value) => setStockRange((prev) => ({ ...prev, max: value }))} style={styles.input} mode="outlined" keyboardType="numeric" dense/>
                            </View>
                        </View>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Collections</Text>
                            <View style={styles.flexWrapRowCompact}>
                                {[{ collectionId: 'All', collectionName: 'All' }, ...uniqueCollections].map((c) => (
                                    <Checkbox.Item mode={"android"} key={c.collectionId} label={c.collectionName} status={selectedCollectionIds.includes(c.collectionId) ? "checked" : "unchecked"} onPress={() => handleCollectionToggle(c)} style={styles.checkboxItemCompact} color={theme.colors.primary} uncheckedColor={theme.colors.primary} position={"leading"} labelStyle={styles.checkboxLabel}/>
                                ))}
                            </View>
                        </View>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Tags</Text>
                            <View style={styles.flexWrapRow}>
                                {["All", ...uniqueProductTags.slice(0, 10)].map((tag) => (
                                    <Chip
                                        key={tag}
                                        selected={selectedTags.includes(tag)}
                                        onPress={() => handleTagToggle(tag)}
                                        style={[styles.tagChip, selectedTags.includes(tag) && styles.tagChipSelected]}
                                        textStyle={{color: selectedTags.includes(tag) ? theme.colors.white : theme.colors.black}}
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
                onChangeText={setSearchQuery} // Use the passed prop
                style={styles.searchBar}
                mode="outlined"
                left={<TextInput.Icon icon="magnify" />}
            />
            <Divider style={{ marginVertical: 10 }} />
            <View style={{ marginVertical: 0, paddingHorizontal: IS_WEB ? 0 : 10 }}>
                <Text variant={"bodyLarge"}>
                    {filteredProductsCount.toString() + (filteredProductsCount === 1 ? " Filtered Product" : " Filtered Products")}
                </Text>
            </View>
            <Divider style={{ marginVertical: 10 }} />
        </View>
    );
});

const Products = () => {
    const {storeId} = useSelector((state) => state.store);
    const theme = useTheme();
    // const router = useRouter(); // router instance created but not used in the provided JSX, kept as per original
    const {data: products = [], isLoading, isError} = useStoreProducts(storeId);
    const [searchQuery, setSearchQuery] = useState("");
    const [priceRange, setPriceRange] = useState({min: "", max: ""});
    const [stockRange, setStockRange] = useState({min: "", max: ""});
    const [sortField, setSortField] = useState("price");
    const [sortOrder, setSortOrder] = useState("ascending");
    const [filterExpanded, setFilterExpanded] = useState(false);
    const [quickFilterExpanded, setQuickFilterExpanded] = useState(false);
    const [selectedCollectionIds, setSelectedCollectionIds] = useState(["All"]);
    const [selectedTags, setSelectedTags] = useState(["All"]);
    const [selectedQuickFilters, setSelectedQuickFilters] = useState(["all"]);

    const pushWithBackHref = usePushWithBackHref();
    // const insets = useSafeAreaInsets(); // Original import, available if needed
    const {width: windowWidth} = useWindowDimensions(); // For potential future responsive web styles
    const styles = makeStyles(theme, IS_WEB, windowWidth); // Pass theme, IS_WEB

    // --- ALL ORIGINAL CONSTANTS AND FUNCTIONS (QUICK_FILTER_ROWS, INCOMPATIBLE_FILTERS, filter logic, etc.) ---
    // These are assumed to be exactly as in your provided mobile code.
    const QUICK_FILTER_ROWS = [[{key: "all", label: "All"}, {key: "active", label: "Active"}, {
        key: "inactive",
        label: "Inactive"
    },], [{key: "low_stock", label: "Low Stock"}, {
        key: "out_of_stock",
        label: "Out of Stock"
    },], [{key: "recently_added", label: "Recently Added"}, {
        key: "added_long_ago",
        label: "Added Long Ago"
    },], [{key: "high_price", label: "High Price"}, {key: "low_price", label: "Low Price"},], [{
        key: "top_selling_day",
        label: "Top Selling (Day)"
    }, {key: "top_selling_week", label: "Top Selling (Week)"}, {
        key: "top_selling_month",
        label: "Top Selling (Month)"
    }, {key: "top_selling_year", label: "Top Selling (Year)"}, {
        key: "least_selling_day",
        label: "Least Selling (Day)"
    }, {key: "least_selling_week", label: "Least Selling (Week)"}, {
        key: "least_selling_month",
        label: "Least Selling (Month)"
    }, {key: "least_selling_year", label: "Least Selling (Year)"},],];

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
    const uniqueCollections = Array.from((products || []).flatMap((product) => product.collections).reduce((acc, collection) => {
        if (collection && collection.collectionId && !acc.has(collection.collectionId)) {
            acc.set(collection.collectionId, collection);
        }
        return acc;
    }, new Map()).values());
    const uniqueProductTags = Array.from(new Set((products || []).flatMap((product) => product.productTags || [])));
    const toggleSortOrder = () => setSortOrder((prev) => (prev === "ascending" ? "descending" : "ascending"));
    const handleCollectionToggle = (collection) => {
        if (collection.collectionId === "All") {
            setSelectedCollectionIds(["All"]);
        } else {
            setSelectedCollectionIds((prev) => {
                const newSelections = prev.includes(collection.collectionId) ? prev.filter((item) => item !== collection.collectionId) : [...prev.filter((item) => item !== "All"), collection.collectionId];
                return newSelections.length === 0 ? ["All"] : newSelections;
            });
        }
    };
    const handleTagToggle = (tag) => {
        if (tag === "All") {
            setSelectedTags(["All"]);
        } else {
            setSelectedTags((prev) => {
                const newSelections = prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev.filter((item) => item !== "All"), tag];
                return newSelections.length === 0 ? ["All"] : newSelections;
            });
        }
    };
    const applyQuickFilters = useCallback((inputProducts, filters) => {
        if (!inputProducts) return [];
        if (filters.includes("all")) return inputProducts;
        let result = [...inputProducts];
        if (filters.includes("active")) result = result.filter(p => p.isActive);
        if (filters.includes("inactive")) result = result.filter(p => !p.isActive);
        if (filters.includes("low_stock")) result = result.filter(p => p.stock > 0 && p.stock <= 5);
        if (filters.includes("out_of_stock")) result = result.filter(p => p.stock === 0);
        if (filters.includes("recently_added")) result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        if (filters.includes("added_long_ago")) result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        if (filters.includes("high_price")) result.sort((a, b) => b.price - a.price);
        if (filters.includes("low_price")) result.sort((a, b) => a.price - b.price);
        const timeRanges = ["day", "week", "month", "year"];
        for (const range of timeRanges) {
            if (filters.includes(`top_selling_${range}`)) {
                result = result.filter(p => p.salesStats && p.salesStats[range]).sort((a, b) => b.salesStats[range].revenue - a.salesStats[range].revenue).slice(0, 10);
            }
            if (filters.includes(`least_selling_${range}`)) {
                result = result.filter(p => p.salesStats && p.salesStats[range]).sort((a, b) => a.salesStats[range].revenue - b.salesStats[range].revenue).slice(0, 10);
            }
        }
        return result;
    }, []);
    const filteredProducts = useMemo(() => {
        if (isLoading || isError || !products) return [];
        let result = [...products];
        result = applyQuickFilters(result, selectedQuickFilters);
        if (searchQuery.trim()) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter((product) => product.productName.toLowerCase().includes(lowerQuery) || (product.description && product.description.toLowerCase().includes(lowerQuery)));
        }
        if (priceRange.min || priceRange.max) {
            const min = priceRange.min ? parseInt(priceRange.min, 10) : Number.NEGATIVE_INFINITY;
            const max = priceRange.max ? parseInt(priceRange.max, 10) : Number.POSITIVE_INFINITY;
            if (!isNaN(min) && !isNaN(max)) {
                result = result.filter((product) => product.price >= min && product.price <= max);
            }
        }
        if (stockRange.min || stockRange.max) {
            const min = stockRange.min ? parseInt(stockRange.min, 10) : Number.NEGATIVE_INFINITY;
            const max = stockRange.max ? parseInt(stockRange.max, 10) : Number.POSITIVE_INFINITY;
            if (!isNaN(min) && !isNaN(max)) {
                result = result.filter((product) => product.stock >= min && product.stock <= max);
            }
        }
        if (!selectedCollectionIds.includes("All")) {
            result = result.filter((product) => selectedCollectionIds.some((colId) => (product.collections || []).map((c) => c.collectionId).includes(colId)));
        }
        if (!selectedTags.includes("All")) {
            result = result.filter((product) => selectedTags.some((tag) => (product.productTags || []).includes(tag)));
        }
        const rankingFiltersActive = selectedQuickFilters.some(qf => qf.includes('selling_') || qf.includes('_price') || qf.includes('_added'));
        if (!rankingFiltersActive) {
            result = result.sort((a, b) => {
                const isAscending = sortOrder === "ascending";
                if (sortField === "price") {
                    return isAscending ? a.price - b.price : b.price - a.price;
                } else if (sortField === "stock") {
                    return isAscending ? a.stock - b.stock : b.stock - a.stock;
                }
                return 0;
            });
        }
        return result;
    }, [products, selectedQuickFilters, searchQuery, priceRange, stockRange, selectedCollectionIds, selectedTags, sortField, sortOrder, isLoading, isError, applyQuickFilters]);
    // --- END ORIGINAL CONSTANTS AND FUNCTIONS ---

    const renderProductItem = ({item}) => (
        <Pressable onPress={() => pushWithBackHref(getProductPath(item.productId))}>
            <ProductDisplayCompactMerchant product={item}/>
        </Pressable>);



    const loadingErrorContent = (message, isErrorState = false) => (
        <View style={IS_WEB ? styles.centeredContent : styles.mobileCenteredFullScreen}>
            {isErrorState && <MaterialCommunityIcons name="alert-circle-outline" size={48} color={theme.colors.error}
                                                     style={{marginBottom: 10}}/>}
            {!isErrorState && <ActivityIndicator size={IS_WEB ? "large" : 100} color={theme.colors.primary}
                                                 style={{marginBottom: 10}}/>}
            <Text variant="bodyLarge">{message}</Text>
        </View>);

    if (isLoading) {
        const loadingView = loadingErrorContent("Loading products...");
        return IS_WEB ? <View style={styles.webPageContainer_Root}><View
            style={styles.webMaxContentContainer_Shell}>{loadingView}</View></View> : loadingView;
    }

    if (isError) {
        const errorView = loadingErrorContent("Failed to load products. Please try again.", true);
        return IS_WEB ? <View style={styles.webPageContainer_Root}><View
            style={styles.webMaxContentContainer_Shell}>{errorView}</View></View> : errorView;
    }

    const flatListComponent = (<FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.productId}
            renderItem={renderProductItem}
            ListHeaderComponent={
            <TopSectionContent
                theme={theme} styles={styles} IS_WEB={IS_WEB}
                quickFilterExpanded={quickFilterExpanded} setQuickFilterExpanded={setQuickFilterExpanded}
                selectedQuickFilters={selectedQuickFilters} setSelectedQuickFilters={setSelectedQuickFilters}
                QUICK_FILTER_ROWS={QUICK_FILTER_ROWS} INCOMPATIBLE_FILTERS={INCOMPATIBLE_FILTERS}
                filterExpanded={filterExpanded} setFilterExpanded={setFilterExpanded}
                sortField={sortField} setSortField={setSortField}
                sortOrder={sortOrder} toggleSortOrder={toggleSortOrder}
                priceRange={priceRange} setPriceRange={setPriceRange}
                stockRange={stockRange} setStockRange={setStockRange}
                uniqueCollections={uniqueCollections} selectedCollectionIds={selectedCollectionIds} handleCollectionToggle={handleCollectionToggle}
                uniqueProductTags={uniqueProductTags} selectedTags={selectedTags} handleTagToggle={handleTagToggle}
                searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                filteredProductsCount={filteredProducts.length}
            />}
            ListEmptyComponent={<View style={styles.emptyListContainer}>
                <Text>
                    {searchQuery || selectedQuickFilters.length > 1 || !selectedQuickFilters.includes("all") || selectedCollectionIds.length > 1 || !selectedCollectionIds.includes("all") || selectedTags.length > 1 || !selectedTags.includes("all") || priceRange.min || priceRange.max || stockRange.min || stockRange.max ? "No products match your current filters." : "No Products Found"}
                </Text>
            </View>}
            ItemSeparatorComponent={() => <Divider style={{marginVertical: 10}}/>}
            contentContainerStyle={{paddingHorizontal: IS_WEB ? 2 : 2}} // Mobile gets original padding of 2
            keyboardShouldPersistTaps="handled"
        />);

    if (IS_WEB) {
        return (<View style={styles.webPageContainer_Root}>
                <View style={styles.webMaxContentContainer_Shell}>
                    {flatListComponent}
                </View>
            </View>);
    } else { // Mobile
        return (<KeyboardAwareView
                backgroundColor={theme.colors.surface} // Original prop
                containerStyle={styles.surface}       // Original prop (this is for ScrollView within KAV)
                keyboardVerticalOffset={0}            // Original prop
            >
                {flatListComponent}
            </KeyboardAwareView>);
    }
};

const makeStyles = (theme, isWeb, windowWidth) => {
    const {colors} = theme; // Destructure for use as 'colors' as in original
    return StyleSheet.create({
        // --- Original Mobile Styles (EXACTLY as provided by user) ---
        surface: {
            paddingHorizontal: 10, overflow: "visible", backgroundColor: colors.surface, flexGrow: 1, // Added to ensure ScrollView can grow, KAV often needs this for content container
        },
        searchBar: {marginTop: 10, backgroundColor: colors.white},
        section: {marginHorizontal: 10, marginVertical: 5},
        sectionTitle: {fontSize: 16, fontWeight: "bold"}, // Original: no color, will inherit
        radioRow: {flexDirection: "row", justifyContent: "flex-start", margin: 0, padding: 0},
        input: {flex: 1, marginHorizontal: 5, backgroundColor: colors.white},
        row: {flexDirection: "row", justifyContent: "flex-start", alignItems: "center"},
        flexWrapRow: {flexDirection: "row", flexWrap: "wrap", marginVertical: 10},
        flexWrapRowCompact: {flexDirection: "row", flexWrap: "wrap", marginVertical: 5},
        accordionBar: {
            backgroundColor: colors.softPrimary,
            height: 50,
            minHeight: 50,
            paddingVertical: 0,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 0, // verticalAlign: "center", // Not a valid RN style
        },
        accordionContent: {
            justifyContent: "center", // Original
            backgroundColor: colors.white, // Ensure content area has consistent background like sortFilterContent
        },
        accordionTitle: {color: "black", fontSize: 16, fontWeight: "bold"},
        sortFilterContent: {
            // paddingBottom: 20, // Original commented out
            borderRadius: 0, backgroundColor: colors.white,
        },
        sortOrderChip: { // For the sort asc/desc chip
            margin: 0,
            padding: 0,
            backgroundColor: colors.white, // 'color' prop for text on chip is not a style, handled by textStyle or theme
        },
        tagChip: { // For tags in "More Sort & Filter Options"
            margin: 5, backgroundColor: colors.softSecondary, // 'color' prop for text on chip is not a style
        },
        tagChipSelected: { // For selected tags in "More Sort & Filter Options"
            backgroundColor: colors.secondary, // 'color' prop for text on chip is not a style
        },
        checkboxItemCompact: {
            flex: 1, // This can make items take full available width in a row before wrapping
            marginHorizontal: 2, paddingVertical: 0, paddingHorizontal: 5,
        }, // Added from my previous attempt for quick filter chips as base, original used inline style for these
        quickFilterChip: {
            margin: 2, // Base margin
            // backgroundColor and borderColor will be from inline styles for mobile fidelity
        },
        quickFilterChipSelected: {
            // This style could be merged if selected state changes background/border,
            // but original relied on inline logic and selectedColor prop.
        }, // Added from my previous attempt for label styles - ensure these match original or are not needed
        radioLabel: {fontSize: 14, padding: 0, margin: 0},
        checkboxLabel: {fontSize: 14},


        // --- New Web Layout Container Styles ---
        webPageContainer_Root: {
            flex: 1,
            backgroundColor: 'white',
            alignItems: 'center',
        },
        webMaxContentContainer_Shell: {
            width: '100%', maxWidth: 900, // Max width for the products list and filters
            flex: 1, backgroundColor: colors.surface, // Match mobile KAV background
            paddingHorizontal: isWeb ? 20 : 0, paddingVertical: isWeb ? 20 : 0,
        },

        // --- Common Centered Styles (for loading/error) ---
        mobileCenteredFullScreen: {
            flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface, // Original loading/error background
            padding: 20,
        },
        centeredContent: { // Used inside web shell for loading/error
            flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%', padding: 20,
        },
        emptyListContainer: {
            flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 20, marginTop: 20,
        }
    });
};

export default Products;