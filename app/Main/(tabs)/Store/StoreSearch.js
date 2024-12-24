import { Surface } from "react-native-paper";
import { useEffect, useState } from "react";
import { getStoreFullData } from "../../../../utils/fakeDataMethods";
import { useLocalSearchParams } from "expo-router";
import ProductSearch from "../../../../components/ProductSearch";

const getUniqueProducts = (storeData) => {
  const allProducts = storeData.collections.reduce(
    (A, c) => A.concat(c.products),
    [],
  );
  return [...new Set(allProducts)];
};

export default function StoreSearch(props) {
  const { initialSearchQuery } = useLocalSearchParams();

  const [storeFullData, setStoreFullData] = useState(null);
  const [uniqueProducts, setUniqueProducts] = useState([]);

  console.log('initialSQ:', initialSearchQuery);

  useEffect(() => {
    let d = getStoreFullData();
    setStoreFullData(d);
    setUniqueProducts(getUniqueProducts(d));
  }, []);

  return (
    storeFullData && (
      // <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <Surface
        mode={"flat"}
        style={{
          backgroundColor: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingHorizontal: 10,
          flex: 1,
            height: '100%',
            width: '100%'
        }}
      >
        <ProductSearch
            style={{marginTop: 10}}
          uniqueProducts={uniqueProducts}
          limitedResults={false}
          initialSearchQuery={initialSearchQuery}
        />
      </Surface>
    )
  );
  // </SafeAreaView>
}
