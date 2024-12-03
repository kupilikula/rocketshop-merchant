import {FlatList, ScrollView, View} from "react-native";
import {Image} from 'expo-image';
import {Button, Card, Searchbar, Surface, Text} from "react-native-paper";
import {foregroundColor} from "../../../utils/foregroundColor";
import {useEffect, useState} from "react";
import StoreFrontCollectionCard from "../../../components/StoreFrontCollectionCard";
import {getStoreFullData} from "../../../utils/fakeDataMethods";
import Fuse from 'fuse.js';
import debounce from 'lodash.debounce';
import {SearchResultProduct} from "../../../components/SearchResultProduct";

const getUniqueProducts = (storeData) => {
    const allProducts= storeData.collections.reduce( (A,c) => A.concat(c.products), []);
    return [...new Set(allProducts)];
}

export default function StoreFront(props) {

    // const results = useQuery({ queryKey: ['storeDataFull', storeId], queryFn: getStoreDataFull });
    const [storeFullData, setStoreFullData] = useState(null);
    const [textColor, setTextColor] = useState(null);
    const [oppositeColor, setOppositeColor] = useState(null);
    const [followButtonText, setFollowButtonText] = useState('Follow');
    const [followButtonLoading, setFollowButtonLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [uniqueProducts, setUniqueProducts] = useState([])
    const [filteredProducts, setFilteredProducts] = useState([]);

    useEffect(() => {
        let d = getStoreFullData();
        setStoreFullData(d);
        setUniqueProducts(getUniqueProducts(d));
    },[])

    useEffect(() => {
        if (searchQuery === '') {
            setFilteredProducts(uniqueProducts);
        } else {
            const result = fuse.search(searchQuery).map(({ item }) => item);
            setFilteredProducts(result);
        }
    }, [searchQuery, uniqueProducts]);

    useEffect( () => {
        if (storeFullData) {
            let {textColor: t, oppositeColor: o} = foregroundColor(storeFullData.storeBrandColor);
            setTextColor(t);
            setOppositeColor(o);
        }
    }, [storeFullData])

    const onSearchQueryChange = (query) => {
        setSearchQuery(query);
    };  // 300ms debounce delay

    const fuse = new Fuse(uniqueProducts, {
        keys: ['productName', 'productDescription'],  // Specify fields to search
        includeScore: true,
        threshold: 0.3,  // You can adjust this for fuzziness
    });


    const onFollowButtonPress = () => {
        if (followButtonText==='Follow') {
            setFollowButtonLoading(true);
            setTimeout(() =>{
                setFollowButtonText('Following');
                setFollowButtonLoading(false);
            }, 1000)

        } else {
            setFollowButtonText('Follow');
        }
    }

    return storeFullData && <Surface mode={'flat'} style={{
        backgroundColor: 'white',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    }}>
        <ScrollView>
        <View style={{padding: 10, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <Card style={{
                width: '100%',
                height: 'auto',
                padding: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: storeFullData.storeBrandColor
            }}>
                <View style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                    height: 'auto'
                }}>
                    <Image source={storeFullData.storeLogoImage} style={{
                        height: 80,
                        width: 80,
                        borderRadius: 40,
                        borderStyle: 'solid',
                        borderWidth: 2,
                        borderColor: textColor,
                        margin: 0,
                        padding: 0
                    }}/>
                    <View>
                        <Text variant={'displaySmall'} style={{marginTop: 10, color: textColor}}>{storeFullData.storeName}</Text>
                    </View>
                    <View>
                        <Text variant={'titleMedium'} style={{color: textColor}}>{uniqueProducts.length.toString() + ' Products ' +
                            + storeFullData.collections.length + ' Collections'}</Text>
                    </View>
                    <View style={{marginTop: 10}}>
                        <Button mode={'elevated'} elevation={5} loading={followButtonLoading} buttonColor={'white'} textColor={'black'} style={{borderRadius: 5}} labelStyle={{fontSize: 18}} onPress={onFollowButtonPress}>{followButtonText}</Button>
                    </View>
                </View>
            </Card>
            <Searchbar
                placeholder="Search Products"
                onChangeText={onSearchQueryChange}
                value={searchQuery}
                style={{borderRadius: 5, marginTop: 10, backgroundColor: '#efefef', elevation: 5}}
            />
            {searchQuery!=='' && filteredProducts.length > 0 && <View style={{width: '100%', height: Math.min(300, filteredProducts.length*60)}}>
                <FlatList scrollEnabled={false} data={filteredProducts} renderItem={({item}) => (<SearchResultProduct product={item}/>)}/>
            </View>
            }
            <View style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%'}}>
                {storeFullData.collections.map( (c) => {
                    return <StoreFrontCollectionCard collection={c} key={c.collectionId}/>
                })}
            </View>
        </View>
        <View>
        </View>
        </ScrollView>
    </Surface>
}

