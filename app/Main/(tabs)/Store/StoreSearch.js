import {Button, Searchbar, Surface} from "react-native-paper";
import {useEffect, useState} from "react";
import {getStoreFullData} from "../../../../utils/fakeDataMethods";
import Fuse from "fuse.js";
import {FlatList, View} from "react-native";
import {SearchResultProduct} from "../../../../components/SearchResultProduct";
import {useLocalSearchParams} from "expo-router";
import ProductSearch from "../../../../components/ProductSearch";

const getUniqueProducts = (storeData) => {
    const allProducts= storeData.collections.reduce( (A,c) => A.concat(c.products), []);
    return [...new Set(allProducts)];
}

export default function StoreSearch (props) {

    const {initialSearchQuery} = useLocalSearchParams();

    const [storeFullData, setStoreFullData] = useState(null);
    const [uniqueProducts, setUniqueProducts] = useState([]);

    useEffect(() => {
        let d = getStoreFullData();
        setStoreFullData(d);
        setUniqueProducts(getUniqueProducts(d));
    },[])

    return storeFullData &&
        // <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
        <Surface mode={'flat'} style={{
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 10,
            flex: 1
    }}>
            <ProductSearch uniqueProducts={uniqueProducts} limitedResults={false} initialSearchQuery={initialSearchQuery}/>
    </Surface>
        // </SafeAreaView>

}