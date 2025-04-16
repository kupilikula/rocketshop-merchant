import { Surface, Text } from "react-native-paper";
import { useLocalSearchParams } from "expo-router";
import ProductSearch from "../../../../components/ProductSearch";
import { useStoreProducts } from "../../../../api/hooks/useStoreProducts";
import {useSelector} from "react-redux";

export default function StoreSearch(props) {
    const { initialSearchQuery } = useLocalSearchParams();
    const {storeId} = useSelector((state) => state.store);
    // Fetch store products using the custom hook
    const { data: storeProducts, isLoading, isError } = useStoreProducts(storeId);

    if (isLoading) {
        return (
            <Surface
                mode={"flat"}
                style={{
                    backgroundColor: "white",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    width: "100%",
                }}
            >
                <Text>Loading products...</Text>
            </Surface>
        );
    }

    if (isError) {
        return (
            <Surface
                mode={"flat"}
                style={{
                    backgroundColor: "white",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    width: "100%",
                }}
            >
                <Text>Error loading products.</Text>
            </Surface>
        );
    }

    return (
        storeProducts && (
            <Surface
                mode={"flat"}
                style={{
                    backgroundColor: "white",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    paddingHorizontal: 10,
                    flex: 1,
                    height: "100%",
                    width: "100%",
                }}
            >
                <ProductSearch
                    style={{ marginTop: 10 }}
                    uniqueProducts={storeProducts}
                    limitedResults={false}
                    initialSearchQuery={initialSearchQuery}
                    onSearchResultPressHandler={(p) => router.push(
                        `/Main/(tabs)/Products/Product/${p.productId}`,
                    )}
                />
            </Surface>
        )
    );
}