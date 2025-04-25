import React, {useMemo} from "react";
import {Divider, Surface, Text, useTheme, ActivityIndicator} from "react-native-paper";
import {FlatList, View, StyleSheet, Pressable} from "react-native";
import {useLocalSearchParams, useRouter} from "expo-router";
import ProductDisplayCardCustomerStore from "../../../../components/ProductDisplayCardCustomerStore";
import GenericHeader from "../../../../components/GenericHeader";
import {usePushWithBackHref} from "../../../../utils/usePushWithBackHref";
import {useCollections, useStoreCollections} from "../../../../api/hooks/useCollections";
import {useStoreProducts} from "../../../../api/hooks/useStoreProducts";
import {useStoreDetails} from "../../../../api/hooks/useStoreDetails";
import {useSelector} from "react-redux";
import {ProductDisplayCompactMerchant} from "../../../../components/ProductDisplayCompactMerchant";

export default function OtherProductsPage() {
    // const { collectionId } = useLocalSearchParams(); // Get collectionId from route params
    const {storeId} = useSelector((state) => state.store);
    const theme = useTheme()
    const styles = makeStyles(theme);
    const pushWithBackHref = usePushWithBackHref();
    // Use custom hook to fetch collection products
    const {
        data: products,
        isLoading,
        isError,
    } = useStoreProducts(storeId);

    const {
        data: collections,
        isLoading: isLoadingCollections,
        isError: isErrorCollections,
    } = useCollections(storeId);

    const otherProducts = useMemo(() => products?.filter(p=> !p.collections?.some(c=>c.isActive) && p.isActive), [products]);
    const noActiveCollections = useMemo(() => collections?.filter(c => c.isActive).length === 0, [collections]);
    console.log('otherProducts:', otherProducts);
    console.log('products:', products);
    const ListElement = React.memo((product) => {
        const pushWithBackHref = usePushWithBackHref();

        return (
                <Pressable
                    onPress={() =>
                        pushWithBackHref("/Main/(tabs)/Products/" + product.productId)
                    }
                    style={{ marginVertical: 5 }}
                >
                    <ProductDisplayCompactMerchant product={product} />
                </Pressable>
        );
    });

    const renderItem = ({ item }) => <ListElement {...item} />;

    return (
        <>
            <GenericHeader title={noActiveCollections ? 'All Products' : 'Other Products'}/>
            {
                isLoading &&  <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
                    <ActivityIndicator size={100} animating={true} color={theme.colors.primary}/>
                </View>
            }
            {
                (isError) &&
                <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
                    <Text variant={'titleLarge'}>Error loading products</Text>
                </View>
            }
            { !isLoading && !isError && otherProducts?.length > 0  &&
                <View  style={{backgroundColor: theme.colors.surface, height: '100%'}}>

                    <FlatList
                        data={otherProducts}
                        renderItem={renderItem}
                        ItemSeparatorComponent={() => <Divider style={{marginVertical: 2}}/>}
                        keyExtractor={(item) => item.productId.toString()}
                        contentContainerStyle={{paddingHorizontal: 10}}
                    />
                </View>}
        </>
    );
}

const makeStyles = (theme) => StyleSheet.create({
    container: {
        backgroundColor: theme.colors.surface,
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        width: "100%",
        padding: 20,
        borderBottomWidth: 2,
        borderColor: "#cccccc",
    },
});