import {Button, Searchbar, Surface} from "react-native-paper";
import {useEffect, useState} from "react";
import Fuse from "fuse.js";
import {FlatList, SafeAreaView, View} from "react-native";
import {SearchResultProduct} from './SearchResultProduct';
import {useLocalSearchParams, useRouter} from "expo-router";

const getUniqueProducts = (storeData) => {
    const allProducts= storeData.collections.reduce( (A,c) => A.concat(c.products), []);
    return [...new Set(allProducts)];
}

export default function ProductSearch (props) {

    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState(props.initialSearchQuery || '');
    const [filteredProducts, setFilteredProducts] = useState([]);

    useEffect(() => {
        if (searchQuery === '') {
            setFilteredProducts(props.uniqueProducts);
        } else {
            const result = fuse.search(searchQuery).map(({ item }) => item);
            setFilteredProducts(result);
        }
    }, [searchQuery, props.uniqueProducts]);

    const onSearchQueryChange = (query) => {
        setSearchQuery(query);
    };  // 300ms debounce delay

    const fuse = new Fuse(props.uniqueProducts, {
        keys: ['productName', 'productDescription'],  // Specify fields to search
        includeScore: true,
        threshold: 0.3,  // You can adjust this for fuzziness
    });
    const flatListHeightStyle = props.limitedResults ? { height: Math.min(props.resultsLimit*60, filteredProducts.length*60)} : {};

    return  <View style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', flex: 1, ...props.style}}>
            <Searchbar
                    placeholder="Search Products"
                    onChangeText={onSearchQueryChange}
                    value={searchQuery}
                    style={{borderRadius: 5, backgroundColor: '#efefef', elevation: 5, width: '100%'}}
                />
            {searchQuery!=='' && filteredProducts.length > 0 && <View style={{flex: 1, width: '100%', ...flatListHeightStyle}}>
                <FlatList style={{width: '100%'}} scrollEnabled={!props.limitedResults} data={filteredProducts} renderItem={({item}) => (<SearchResultProduct product={item}/>)}/>
                </View>
            }
        {props.limitedResults && searchQuery!=='' && filteredProducts.length > props.resultsLimit && <View style={{marginTop: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
            <Button mode={'contained'} buttonColor={'black'} textColor={'white'} onPress={() => router.push({pathname: '/Main/(tabs)/Store/StoreSearch', params: {initialSearchQuery: searchQuery}})}>See More Results</Button>
        </View>}

    </View>

}