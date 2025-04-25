import {Surface, Text, useTheme} from "react-native-paper";
import {useLocalSearchParams, useRouter} from "expo-router";
import ProductSearch from "../../../../components/ProductSearch";
import { useStoreProducts } from "../../../../api/hooks/useStoreProducts";
import {useSelector} from "react-redux";
import KeyboardAwareView from "../../../../components/KeyboardAwareView";
import {usePushWithBackHref} from "../../../../utils/usePushWithBackHref";

export default function StoreProductsSearch(props) {
    const { initialSearchQuery } = useLocalSearchParams();
    const {storeId} = useSelector((state) => state.store);
    const router = useRouter();
    const theme = useTheme();
    const pushWithBackHref = usePushWithBackHref();
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
            <KeyboardAwareView
                backgroundColor={theme.colors.surface}
                containerStyle={{
                    padding: 10,
                }}
                innerStyle={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    flex: 1,
                    backgroundColor: theme.colors.surface,
                }}
            >
                <ProductSearch
                    style={{ marginTop: 10 }}
                    uniqueProducts={storeProducts}
                    limitedResults={false}
                    initialSearchQuery={initialSearchQuery}
                    onSearchResultPressHandler={(p) =>
                        pushWithBackHref(`/Main/(tabs)/Products/${p.productId}`)}
                />
            </KeyboardAwareView>
        )
    );
}