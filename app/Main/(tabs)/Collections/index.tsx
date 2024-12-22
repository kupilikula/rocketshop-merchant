import React, { useState } from "react";
import { ListRenderItemInfo, Pressable, StyleSheet, View } from "react-native";
import ReorderableList, {
  ReorderableListItem,
  ReorderableListReorderEvent,
  reorderItems,
  useReorderableDrag,
} from "react-native-reorderable-list";
import { Text, Surface, useTheme } from "react-native-paper";
import { faker } from "@faker-js/faker";
import { getCollection } from "@/utils/fakeDataMethods";
import CollectionListItem from "../../../../components/CollectionListItem";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
interface ListElementProps {
  collectionId: string;
  collectionName: string;
}
const collectionsList = faker.helpers.uniqueArray(getCollection, 15);

const ListElement: React.FC<ListElementProps> = React.memo((collection) => {
  const drag = useReorderableDrag();
  const router = useRouter();
  console.log(collection);
  return (
    <ReorderableListItem>
      <Pressable
        onLongPress={drag}
        onPress={() => {
          router.push(
            "/Main/(tabs)/Collections/Collection/" + collection.collectionId,
          );
        }}
      >
        <CollectionListItem collection={collection} onDelete={() => {}} />
      </Pressable>
    </ReorderableListItem>
  );
});

const CollectionsScreen = () => {
  const theme = useTheme();

  const [data, setData] = useState(collectionsList);

  const renderItem = ({ item }: ListRenderItemInfo<ListElementProps>) => (
    <ListElement {...item} />
  );

  const handleReorder = ({ from, to }: ReorderableListReorderEvent) => {
    const newData = reorderItems(data, from, to);
    setData(newData);
  };

  let nActive = data.filter((c) => c.isActive).length;
  let nInactive = data.filter((c) => !c.isActive).length;
  return (
    <Surface
      style={{ paddingHorizontal: 10, backgroundColor: theme.colors.surface }}
    >
      <ReorderableList
        style={{}}
        data={data}
        onReorder={handleReorder}
        renderItem={renderItem}
        keyExtractor={(item) => item.collectionId}
        ListHeaderComponent={
          <>
            <View style={{ marginVertical: 10 }}>
              <View
                style={{
                  marginLeft: 8,
                  marginTop: 8,
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-start",
                }}
              >
                <MaterialIcons
                  name={"category"}
                  size={44}
                  color={theme.colors.primary}
                  style={{}}
                />
                <Text
                  variant={"displaySmall"}
                  style={{ marginLeft: 10, color: theme.colors.secondary }}
                >
                  Collections
                </Text>
              </View>
              <Text variant={"bodyLarge"} style={{ marginLeft: 10 }}>
                {nActive.toString() +
                  " Active Collection" +
                  (nActive !== 1 ? "s" : "")}
              </Text>
              <Text variant={"bodyLarge"} style={{ marginLeft: 10 }}>
                {nInactive.toString() +
                  " Inactive Collection" +
                  (nInactive !== 1 ? "s" : "")}
              </Text>
            </View>
            <Text variant={"bodyMedium"} style={{ marginLeft: 10 }}>
              Drag & drop to reorder
            </Text>
          </>
        }
      />
    </Surface>
  );
};

const styles = StyleSheet.create({
  card: {
    // justifyContent: 'center',
    // alignItems: 'center',
    // margin: 6,
    // borderRadius: 5,
    // backgroundColor: 'green',
    borderWidth: 1,
    borderColor: "#ddd",
    height: 100,
  },
  text: {
    fontSize: 20,
    color: "black",
  },
});

export default CollectionsScreen;
