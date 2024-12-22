import React, {useState, useMemo} from 'react';
import {FlatList, View, StyleSheet, Pressable} from 'react-native';
import {
    Text,
    TextInput,
    Chip,
    RadioButton,
    List,
    Surface,
    Checkbox,
    useTheme,
    Divider, Card,
} from 'react-native-paper';
import {useRouter} from "expo-router";
import Fuse from "fuse.js";
import {getProductForStore} from "../../../../utils/fakeDataMethods";
import {faker} from '@faker-js/faker';
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {ProductDisplayCompactMerchant} from "../../../../components/ProductDisplayCompactMerchant";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const initialProducts = faker.helpers.multiple(getProductForStore, {count: 100});
const collections = ['Electronics', 'Fashion', 'Books', 'Home Appliances'];
const tags = ['Best Sellers', 'Featured', 'HandMade', 'New Arrival', 'Discount', 'Popular'];

const Products = () => {
    const [products, setProducts] = useState(initialProducts);
    const [searchQuery, setSearchQuery] = useState('');
    const [priceRange, setPriceRange] = useState({min: '', max: ''});
    const [sortField, setSortField] = useState('price'); // Default sorting by price
    const [sortOrder, setSortOrder] = useState('ascending'); // Default sorting order
    const [filterExpanded, setFilterExpanded] = useState(false);
    const [selectedCollections, setSelectedCollections] = useState(['All']);
    const [selectedTags, setSelectedTags] = useState(['All']);


    const router = useRouter();
    const theme = useTheme();
    const styles = makeStyles(theme);

    const fuse = useMemo(() => {
        return new Fuse(products, {
            keys: [
                'productName',
                'description',
                'collections',
                'tags',
                'attributes.*'
            ],
            threshold: 0.4,
            includeScore: false,
            ignoreLocation: true,
        });
    }, [products]);

    const toggleSortOrder = () => {
        setSortOrder((prev) => (prev === 'ascending' ? 'descending' : 'ascending'));
    };
    const filteredProducts = useMemo(() => {
        let result = products;

        // Search filtering
        if (searchQuery.trim()) {
            const searchResults = fuse.search(searchQuery);
            result = searchResults.map((res) => res.item);
        }

        // Price range filtering
        if (priceRange.min || priceRange.max) {
            const min = priceRange.min ? parseInt(priceRange.min, 10) : Number.NEGATIVE_INFINITY;
            const max = priceRange.max ? parseInt(priceRange.max, 10) : Number.POSITIVE_INFINITY;
            result = result.filter(product => product.price >= min && product.price <= max);
        }

        // Collections filtering
        if (!selectedCollections.includes('All')) {
            result = result.filter(product =>
                selectedCollections.some(collection => product.collections.includes(collection))
            );
        }

        // Tags filtering
        if (!selectedTags.includes('All')) {
            result = result.filter(product =>
                selectedTags.some(tag => product.tags.includes(tag))
            );
        }

        // Sorting
        result = [...result].sort((a, b) => {
            const isAscending = sortOrder === 'ascending';
            if (sortField === 'price') {
                return isAscending ? a.price - b.price : b.price - a.price;
            } else if (sortField === 'stock') {
                return isAscending ? a.stock - b.stock : b.stock - a.stock;
            }
            return 0;
        });

        return result;
    }, [searchQuery, priceRange, selectedCollections, selectedTags, sortField, sortOrder, fuse]);

    const handleCollectionToggle = (collection) => {
        if (collection === 'All') {
            setSelectedCollections(['All']);
        } else {
            setSelectedCollections((prev) => {
                const newSelections = prev.includes(collection)
                    ? prev.filter((item) => item !== collection)
                    : [...prev.filter((item) => item !== 'All'), collection];
                return newSelections.length === 0 ? ['All'] : newSelections;
            });
        }
    };

    const handleTagToggle = (tag) => {
        if (tag === 'All') {
            setSelectedTags(['All']);
        } else {
            setSelectedTags((prev) => {
                const newSelections = prev.includes(tag)
                    ? prev.filter((item) => item !== tag)
                    : [...prev.filter((item) => item !== 'All'), tag];
                return newSelections.length === 0 ? ['All'] : newSelections;
            });
        }
    };


    const renderProductItem = ({item}) => {
        console.log('item:', item);
        // return <ProductDisplayCardMerchantListing product={item} showProductDescription={false} orientation={'landscape'}/>
        return <Pressable onPress={() => router.push('/Main/(tabs)/Products/Product/' + item.productId)} style={{overflow: 'visible'}}>
            <ProductDisplayCompactMerchant product={item}/>
        </Pressable>
    };

    const TopSection = () => (
        <>
        <View style={{marginVertical: 10}}>
            <View style={{marginLeft: 8, marginTop: 8, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start'}}>
                <MaterialIcons name={'shopping-bag'} size={44} color={theme.colors.primary} style={{}}/>
                <Text variant={'displaySmall'} style={{marginLeft: 10, color: theme.colors.secondary}}>Products</Text>
            </View>
            <Text variant={'bodyLarge'} style={{marginLeft: 10}}>{nActive.toString() + ' Active Product' + (nActive > 1 ? 's' : '')}</Text>
            <Text variant={'bodyLarge'} style={{marginLeft: 10}}>{nInactive.toString() + ' Inactive Product'  + (nInactive > 1 ? 's' : '')}</Text>
        </View>

    <View style={{marginBottom: 10, backgroundColor: theme.colors.surface}}>
            <TextInput
                label="Search Products"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchBar}
                mode="outlined"
            />
            <View style={{backgroundColor: theme.colors.surface, overflow: 'hidden', borderRadius: 8}}>
            <List.Accordion
                title="Sort & Filter"
                expanded={filterExpanded}
                onPress={() => setFilterExpanded(!filterExpanded)}
                style={styles.accordionBar}
                titleStyle={styles.accordionTitle}
                contentStyle={styles.accordionContent}
                right={() => <MaterialCommunityIcons name={filterExpanded ? 'chevron-up' : 'chevron-down'} size={24}
                                                     color="white"/>}
            >
                <Card style={styles.sortFilterContent}>
                    <View style={styles.section}>
                        {/* Sort Options */}
                        <Text style={styles.sectionTitle}>Sort By</Text>
                        <View style={styles.row}>
                            <RadioButton.Group onValueChange={setSortField} value={sortField}>
                                <View style={styles.radioRow}>
                                    <RadioButton.Item mode='android' position={'leading'} color={theme.colors.primary}
                                                      label="Price" value="price"/>
                                    <RadioButton.Item mode='android' position={'leading'} color={theme.colors.primary}
                                                      label="Stock" value="stock"/>
                                </View>
                            </RadioButton.Group>
                            <View style={{display: 'flex', flexDirection: 'row'}}>
                                <Chip
                                    mode="outlined"
                                    style={styles.sortOrderChip}
                                    icon={() => (
                                        <MaterialCommunityIcons
                                            name={sortOrder === 'ascending' ? 'arrow-up-bold' : 'arrow-down-bold'}
                                            size={20}
                                            color={theme.colors.primary}
                                        />
                                    )}
                                    onPress={toggleSortOrder}
                                >
                                    {sortOrder === 'ascending' ? 'Ascending' : 'Descending'}
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
                                onChangeText={(value) => setPriceRange(prev => ({...prev, min: value}))}
                                style={styles.input}
                                mode="outlined"
                                keyboardType="numeric"
                                dense
                            />
                            <TextInput
                                label="Max Price"
                                value={priceRange.max}
                                onChangeText={(value) => setPriceRange(prev => ({...prev, max: value}))}
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
                            {["All", ...collections].map((collection) => (
                                <Checkbox.Item
                                    mode={'android'}
                                    key={collection}
                                    label={collection}
                                    status={selectedCollections.includes(collection) ? 'checked' : 'unchecked'}
                                    onPress={() => handleCollectionToggle(collection)}
                                    style={styles.checkboxItemCompact}
                                    color={theme.colors.primary}
                                    uncheckedColor={theme.colors.primary}
                                    position={'leading'}
                                />
                            ))}
                        </View>
                    </View>

                    <View style={styles.section}>
                        {/* Tags Filter */}
                        <Text style={styles.sectionTitle}>Tags</Text>
                        <View style={styles.flexWrapRow}>
                            {["All", ...tags].map((tag) => (
                                <Chip
                                    key={tag}
                                    selected={selectedTags.includes(tag)}
                                    onPress={() => handleTagToggle(tag)}
                                    style={[styles.tagChip, selectedTags.includes(tag) && styles.tagChipSelected]}
                                    textStyle={{color: selectedTags.includes(tag) ? theme.colors.white : theme.colors.black}}
                                    selectedColor={'white'}
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
        </>
    );

    let nActive = products.filter((c) => c.isActive).length;
    let nInactive = products.filter((c) => !c.isActive).length;

    return (
        <Surface style={styles.surface}>
            <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item.productId}
                renderItem={renderProductItem}
                ItemSeparatorComponent={() => <Divider style={{marginVertical: 10}}/>}
                ListHeaderComponent={TopSection()}
                ListEmptyComponent={<Text>No Products Found</Text>}
                contentContainerStyle={{overflow: 'visible', padding: 2}}
            />
        </Surface>
    );
};

const makeStyles = ({colors}) => StyleSheet.create({
    surface: {flex: 1, paddingHorizontal: 10, overflow: 'visible', backgroundColor: colors.surface},
    searchBar: {marginVertical: 10, backgroundColor: colors.white},
    section: {marginHorizontal: 10, marginVertical: 5},
    sectionTitle: {fontSize: 16, fontWeight: 'bold'},
    radioRow: {flexDirection: 'row', justifyContent: 'space-around'},
    input: {flex: 1, marginHorizontal: 5, backgroundColor: colors.white},
    row: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
    flexWrapRow: {flexDirection: 'row', flexWrap: 'wrap', marginVertical: 10},
    flexWrapRowCompact: {flexDirection: 'row', flexWrap: 'wrap', marginVertical: 5},
    accordionBar: {
        backgroundColor: colors.primary,
        height: 50,
        minHeight: 50,
        paddingVertical: 0,
        justifyContent: 'center',
        alignItems: 'center',
        verticalAlign: 'center',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    accordionContent: {justifyContent: 'center'},
    accordionTitle: {color: 'white', fontSize: 16},
    sortFilterContent: {
        paddingBottom: 20,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.grayBorder
    },
    sortOrderChip: {margin: 5, backgroundColor: colors.white, color: colors.black},
    tagChip: {margin: 5, backgroundColor: colors.softSecondary, color: colors.black},
    tagChipSelected: {backgroundColor: colors.secondary, color: colors.white},
    checkboxItemCompact: {flex: 1, marginHorizontal: 2, paddingVertical: 0, paddingHorizontal: 5,},
});

export default Products;
