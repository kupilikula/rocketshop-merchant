import {
    Card,
    Chip, Divider,
    RadioButton,
    Surface,
    Switch,
    useTheme,
} from "react-native-paper";
import { StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Text } from "react-native-paper";
import { Pressable, View } from "react-native";
import { getCollection } from "../../../../../utils/fakeDataMethods";
import { ProductDisplayCompactMerchant } from "../../../../../components/ProductDisplayCompactMerchant";
import ReorderableList, {
  ReorderableListItem,
  reorderItems,
  useReorderableDrag,
} from "react-native-reorderable-list";
import React, { useState } from "react";

const ListElement = React.memo((product) => {
  const drag = useReorderableDrag();
  const router = useRouter();
  // console.log();
  return (
    <ReorderableListItem>
      <Pressable
        onLongPress={drag}
        onPress={() =>
          router.push("/Main/(tabs)/Products/Product/" + product.productId)
        }
        style={{ marginVertical: 5 }}
      >
        <ProductDisplayCompactMerchant product={product} />
      </Pressable>
    </ReorderableListItem>
  );
});
export default function CollectionPage(props) {
  // const { collectionId } = useLocalSearchParams();
  const collection = getCollection();
  const [isActive, setIsActive] = useState(collection.isActive);
  const [storeFrontDisplay, setStoreFrontDisplay] = useState(
    collection.storeFrontDisplay,
  );
  const [storeFrontNumberOfItems, setStoreFrontNumberOfItems] = useState(
    collection.storeFrontDisplayNumberOfItems,
  );
  const [productsData, setProductsData] = useState(collection.products);

  const theme = useTheme();
  const styles = makeStyles(theme);
  const handleReorder = ({ from, to }) => {
    const newData = reorderItems(productsData, from, to);
    setProductsData(newData);
  };

  const handleCollectionStatusToggle = (switchStatus) => {
    console.log("s:", switchStatus);
    setIsActive(switchStatus);
  };
  const renderItem = ({ item }) => <ListElement {...item} />;

  const CollectionSettings = () => {
    return (
      <Card
        style={{
          width: "100%",
          padding: 15,
          backgroundColor: "white",
          marginBottom: 20,
        }}
      >
        <View style={{ width: "100%" }}>
          {/* Status */}
          <View style={styles.statusContainer}>
            <Text variant={"titleMedium"} style={{ marginRight: 15 }}>
              Collection Status
            </Text>
            <View style={{ display: "flex", flexDirection: "row" }}>
              <Chip
                textStyle={{ color: "black", textAlign: "center" }}
                style={{
                  marginRight: 10,
                  backgroundColor: isActive
                    ? theme.colors.active
                    : theme.colors.inactive,
                }}
              >
                {isActive ? "Active" : "Inactive"}
              </Chip>
              <Switch
                // style={ Platform.OS==='ios' ? { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }]} : {}}
                value={isActive}
                onValueChange={handleCollectionStatusToggle}
                color={isActive ? theme.colors.active : theme.colors.inactive} // Green for Active, Red for Draft
              />
            </View>
          </View>
          <View style={styles.statusContainer}>
            <Text variant={"titleMedium"} style={{ marginRight: 15 }}>
              Store Front Display
            </Text>
            <View style={{ display: "flex", flexDirection: "row" }}>
              <Chip
                textStyle={{ color: "black", textAlign: "center" }}
                style={{
                  marginRight: 10,
                  backgroundColor: storeFrontDisplay
                    ? theme.colors.active
                    : theme.colors.inactive,
                }}
              >
                {storeFrontDisplay ? "Enabled" : "Disabled"}
              </Chip>
              <Switch
                // style={ Platform.OS==='ios' ? { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }]} : {}}
                value={storeFrontDisplay}
                onValueChange={setStoreFrontDisplay}
                color={
                  storeFrontDisplay
                    ? theme.colors.active
                    : theme.colors.inactive
                } // Green for Active, Red for Draft
              />
            </View>
          </View>

          {storeFrontDisplay && (
            <View style={{ marginTop: 15 }}>
              <Text variant={"titleMedium"}>
                Number of Items on Store Front
              </Text>
              <View style={styles.radioButtonGroup}>
                <RadioButton.Group
                  onValueChange={(v) => setStoreFrontNumberOfItems(parseInt(v))}
                  value={storeFrontNumberOfItems}
                >
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      flexWrap: "wrap",
                    }}
                  >
                    {[2, 4, 6, 8].map((number, index) => (
                      <RadioButton.Item
                        key={index}
                        label={number.toString()}
                        value={number} // "percentageOff" etc.
                        mode="android"
                        color={theme.colors.primary}
                        position="leading"
                        style={styles.radioButtonItem}
                        //
                      />
                    ))}
                  </View>
                </RadioButton.Group>
              </View>
            </View>
          )}
        </View>
      </Card>
    );
  };

  return (
    <Surface
      mode={"flat"}
      style={{
          flex: 1,
        paddingHorizontal: 10,
        backgroundColor: theme.colors.surface,
      }}
    >
      <ReorderableList
        style={{}}
        data={productsData}
        onReorder={handleReorder}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <Divider style={{marginVertical: 5}}/>}
        ListHeaderComponent={
          <>
            <View
              style={{
                width: "100%",
                padding: 10,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <Text variant={"titleLarge"} style={{ marginTop: 10 }}>
                {collection.collectionName}
              </Text>
              <Text variant={"bodyLarge"} style={{}}>
                {collection.products.length.toString() + " Products"}
              </Text>
            </View>
            <CollectionSettings />
            <Text variant={"bodyLarge"} style={{ marginBottom: 10 }}>
              Drag & Drop to Reorder Products
            </Text>
          </>
        }
        keyExtractor={(item) => item.productId}
      />

      {/*<FlatList*/}
      {/*    data={collection.products}*/}
      {/*    renderItem={({item}) => <ProductDisplayCompactMerchant product={item}/> }*/}
      {/*    ListHeaderComponent={        <View style={{ width: '100%', margin: 10}}>*/}
      {/*        <Text variant={'titleLarge'}>{collection.collectionName}</Text>*/}
      {/*    </View>}*/}
      {/*/>*/}
    </Surface>
  );
}

const makeStyles = ({ colors }) =>
  StyleSheet.create({
    statusContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginVertical: 15,
    },
  });
