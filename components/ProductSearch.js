import {Button, Divider, Searchbar} from "react-native-paper";
import { useEffect, useMemo, useState } from "react";
import Fuse from "fuse.js";
import { FlatList, View } from "react-native";
import { SearchResultProduct } from "./SearchResultProduct";
import { useRouter } from "expo-router";

export default function ProductSearch(props) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(
    props.initialSearchQuery || "",
  );
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    if (searchQuery === "") {
      setFilteredProducts(props.uniqueProducts);
    } else {
      const result = fuse.search(searchQuery).map(({ item }) => item);
      setFilteredProducts(result);
    }
  }, [searchQuery, props.uniqueProducts, fuse]);

  const onSearchQueryChange = (query) => {
    setSearchQuery(query);
  }; // 300ms debounce delay

  const fuse = useMemo(() => {
    return new Fuse(props.uniqueProducts, {
      keys: [
        "productName",
        "description",
        "collections",
        "tags",
        "attributes.*",
      ],
      threshold: 0.4,
      includeScore: false,
      ignoreLocation: true,
    });
  }, [props.uniqueProducts]);

  const flatListHeightStyle = props.limitedResults
    ? {
        height: Math.min(props.resultsLimit * 64 , filteredProducts.length * 64),
      }
    : {};

  return (
    <View
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        flex: 1,
        ...props.style,
      }}
    >
      <Searchbar
        placeholder="Search Products"
        onChangeText={onSearchQueryChange}
        value={searchQuery}
        style={{
          borderRadius: 5,
          backgroundColor: "white",
          elevation: 5,
          width: "100%",
            marginBottom: 5,
            borderWidth: 1,
        }}
      />

      {searchQuery !== "" && filteredProducts.length > 0 && (
        <View style={{ flex: 1, width: "100%", ...flatListHeightStyle }}>
          <FlatList
              keyboardShouldPersistTaps={"handled"}
            style={{ width: "100%" }}
            scrollEnabled={!props.limitedResults}
            data={filteredProducts}
            renderItem={({ item }) => (
              <SearchResultProduct
                product={item}
                withCheckBox={props.withCheckbox}
                onPressHandler={props.onSearchResultPressHandler}
              />
            )}
            ItemSeparatorComponent={() => <Divider style={{marginVertical: 2}}/>}
          />
        </View>
      )}
      {props.limitedResults &&
        searchQuery !== "" &&
        filteredProducts.length > props.resultsLimit && (
          <View
            style={{
              marginTop: 10,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Button
              mode={"contained"}
              buttonColor={"black"}
              textColor={"white"}
              onPress={() =>
                router.push({
                  pathname: "/Main/(tabs)/Store/StoreSearch",
                  params: { initialSearchQuery: searchQuery },
                })
              }
            >
              See More Results
            </Button>
          </View>
        )}
    </View>
  );
}
