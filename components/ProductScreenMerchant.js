import {View, StyleSheet, ScrollView, Switch, Pressable} from "react-native";
import {
    Card,
    Chip, FAB,
    IconButton, Menu,
    Surface,
    Text,
    useTheme,
} from "react-native-paper";
import FlatListSlider from "./MediaSlider/FlatListSlider";
import MediaItem from "./MediaSlider/MediaItem";
import { Rating } from "@kolking/react-native-rating";
import React, { useState } from "react";
import {useRouter} from "expo-router";
import axiosClient from "../api/client";
import {useDispatch, useSelector} from "react-redux";
import {useQueryClient} from "react-query";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import GenerateVariantModal from "./GenerateVariantModal";
import {updateField} from "../store/newProductSlice";
import MarkAsVariantModal from "./MarkAsVariantModal";
import CloneProductModal from "./CloneProductModal";
import {ProductReviewsList} from "./ProductReviews";
import ScrollableScreen from "./ScrollableScreen";
import GenericHeader from "./GenericHeader";
import ConfirmDeleteProductModal from "./ConfirmDeleteProductModal";

export default function ProductScreenMerchant(props) {
  // const router = useRouter();
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useDispatch();
  const styles = makeStyles(theme);
  const queryClient = useQueryClient();
  const {storeId} = useSelector((state) => state.store);
    const [generateVariantModalVisible, setGenerateVariantModalVisible] = useState(false);
    const [markAsVariantModalVisible, setMarkAsVariantModalVisible] = useState(false);
    const [isCloneModalVisible, setIsCloneModalVisible] = useState(false);
    const [fabOpen, setFabOpen] = useState(false);
    const [deleteProductModal, setDeleteProductModal] = useState(false);

    const handleFabToggle = () => setFabOpen(!fabOpen);
  const [isActive, setIsActive] = useState(props.product.isActive);

  const handleStatusChange = async (status) => {
      console.log("status:", status);
      setIsActive(status);
      await axiosClient.put(`/stores/${storeId}/products/${props.product.productId}/editProduct`, {isActive: status});
      await queryClient.invalidateQueries(["merchantProduct", storeId, props.product.productId])

      console.log(`Product status changed to: ${status}`);
  };

    const handleEditProduct = () => {
        router.push({
            pathname: "/Main/(tabs)/EditProduct",
            params: { productId: props.product.productId },
        });
    };

    const handleToggleIsActive = () => {
        setIsActive(!isActive);
        console.log(`Product status changed to: ${!isActive}`);
    };


    const handleGenerateVariant = () => {
        setFabOpen(false);
        setGenerateVariantModalVisible(true);
    };

    const handleGenerateVariantModalClose = () => {
        setGenerateVariantModalVisible(false);
    };

    const handleGenerateVariantSubmit = (differingAttributes, useSameMedia) => {
        const updatedAttributes = props.product.attributes.map((attr) => {
            // Check if the attribute is in differingAttributes
            const differingAttr = differingAttributes.find((diff) => diff.key === attr.key);
            return differingAttr ? { key: attr.key, value: differingAttr.value } : attr;
        });
        console.log('props.product.productId:', props.product.productId);
        const prePopulatedData = {
            ...props.product,
            collections: props.product.collections.map((c) => c.collectionId),
            attributes: updatedAttributes,
            mediaItems: useSameMedia ? props.product.mediaItems : [],
        };
        delete prePopulatedData.productId;
        delete prePopulatedData.variants;

        dispatch(updateField({ field: "all", value: prePopulatedData }));
        router.push({
            pathname: "/Main/(tabs)/AddNewProduct",
            params: {  isNewVariant: true, useSameMedia, parentProductId: props.product.productId, differingAttributes: JSON.stringify(differingAttributes) },
        });
        setGenerateVariantModalVisible(false);
    };


    const handleMarkAsVariantProductSelect = (selectedProduct) => {
        setMarkAsVariantModalVisible(false);
        // Validate differing attributes and submit to the backend
        console.log("Selected Product:", selectedProduct);

        const differingAttributes = computeDifferingAttributes(props.product, selectedProduct);

        if (differingAttributes.length === 0) {
            alert("Products must differ in at least one attribute.");
            return;
        }

        // Submit to backend
        submitMarkAsVariant(props.product.productId, selectedProduct.productId, differingAttributes);
    };

    const computeDifferingAttributes = (product1, product2) => {
        const attributes1 =product1.attributes || [];
        const attributes2 = product2.attributes || [];

        return attributes1.filter(
            (attr) =>
                !attributes2.some(
                    (attr2) => attr.key === attr2.key && attr.value === attr2.value
                )
        );
    };

    const submitMarkAsVariant = async (productId, parentProductId, differingAttributes) => {
        try {
            const response = await axiosClient.post(`/stores/${storeId}/products/markAsVariant`, {productId, parentProductId, differingAttributes})
            await Promise.all([queryClient.invalidateQueries(["merchantProduct", storeId, productId]), queryClient.invalidateQueries(["merchantProduct", storeId, parentProductId]) ])
        } catch (err) {
            console.error(err);
            alert("An error occurred while marking the product as a variant.");
        }
    };
    const handleMarkAsVariant = () => {
        setFabOpen(false);
        setMarkAsVariantModalVisible(true);
        console.log("Mark as Variant of Another Product");
    };

    const handleCloneProduct = () => {
        setFabOpen(false);
        setIsCloneModalVisible(true);
        console.log("Clone Product");
    };

    const submitCloneProduct = (useSameMedia) => {
        const prePopulatedData = {
            ...props.product,
            collections: props.product.collections.map((c) => c.collectionId),
            mediaItems: useSameMedia ? props.product.mediaItems : [],
        };
        delete prePopulatedData.productId;
        delete prePopulatedData.variants;

        dispatch(updateField({ field: "all", value: prePopulatedData }));
        router.push({
            pathname: "/Main/(tabs)/AddNewProduct",
            params: {  isClone: true, useSameMediaForClone: useSameMedia },
        });
        setGenerateVariantModalVisible(false);
    }


  console.log("props.product:", props.product);
  // console.log('size:', size);
  return (
          <>
              <GenericHeader title={'Product Details'} right={<IconButton
                  icon="pencil"
                  size={28}
                  onPress={() => {
                      router.push({pathname: '/Main/(tabs)/EditProduct', params: { productId: props.product.productId, backHref: `/Main/(tabs)/Products/${props.product.productId}`} } )
                  }}
                  style={styles.actionButton}
                  iconColor={theme.colors.black}
              />}/>
    <ScrollableScreen innerStyle={styles.container}>
        <Card mode={"contained"} style={styles.card}>
          <FlatListSlider
            data={props.product.mediaItems}
            local={false}
            orientation={"landscape"}
            separator={0}
            currentIndexCallback={(index) => console.log("Index", index)}
            // onPress={item => { console.log('pressed')}}
            keyExtractor={(item) => item.mediaId}
            indicator
            indicatorStyle={{}}
            indicatorContainerStyle={{ position: "absolute", bottom: 10 }}
            indicatorActiveColor="#3498db"
            indicatorInActiveColor="#bdc3c7"
            indicatorActiveWidth={6}
            flatListWrapperStyle={{
              backgroundColor: "black",
              width: "100%",
              aspectRatio: props.orientation === "portrait" ? "0.8" : "1.33",
            }}
            // contentContainerStyle={{backgroundColor: 'black'}}
            allowPanZoom={false}
            component={<MediaItem />}
          />
          <Card.Content style={styles.cardContent}>
            <Text variant={"titleLarge"} style={styles.titleTextStyle}>
              {props.product.productName}
            </Text>
            <View style={styles.cardContentView}>
              <View style={styles.actionContainer}>
                <View style={{display: "flex", flexDirection: "row", justifyContent: "flex-end", alignItems: "center"}}>
                    <IconButton
                        icon="delete"
                        size={28}
                        onPress={() => {
                            setDeleteProductModal(true);
                        }}
                        style={styles.actionButton}
                        iconColor={theme.colors.error}
                    />
                </View>
                <View style={styles.statusContainer}>
                  <Switch
                    // style={ Platform.OS==='ios' ? { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }]} : {}}
                    value={isActive}
                    onValueChange={handleStatusChange}
                    // color={productStatus==='Active' ? "#f44336" : "#4caf50"} // Green for Active, Red for Draft
                  />
                  <Chip
                    textStyle={{ color: "black", textAlign: "center" }}
                    style={{
                      marginLeft: 10,
                      backgroundColor: isActive
                        ? theme.colors.active
                        : theme.colors.inactive,
                    }}
                  >
                    {isActive ? "Active" : "Inactive"}
                  </Chip>
                </View>
              </View>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: "100%",
                  alignItems: "flex-start",
                }}
              >
                <View>
                  <Text variant="titleMedium">
                    {"Price: ₹" + props.product.price.toString()}
                  </Text>
                  <Text variant="titleMedium">
                    {"Stock: " + props.product.stock.toString()}
                  </Text>
                </View>
              </View>
              <View style={styles.gstContainer}>
                <Text>{"GST Rate: " + props.product.gstRate + "%"}</Text>
              </View>

              <View
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  marginTop: 10,
                }}
              >
                {props.product.attributes.map((a, i) => {
                  return (
                    <View
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                      key={i.toString()}
                    >
                      <Text variant={"titleMedium"}>{a.key + ": "}</Text>
                      <Text variant={"titleMedium"}>{a.value}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
            {props.product.numberOfRatings > 0 && (
              <View style={styles.rating}>
                <Rating
                  disabled={true}
                  variant={"stars-outline"}
                  fillColor={"#faaf00"}
                  baseColor={"black"}
                  size={18}
                  rating={props.product.rating}
                  onChange={() => {}}
                />
                <Text style={styles.ratingText} variant={"bodyLarge"}>
                  {props.product.rating.toString() +
                    "/5 " +
                    "(" +
                    props.product.numberOfRatings.toString() +
                    ")"}
                </Text>
              </View>
            )}
              {props.product.variants?.length > 0 &&
                  <>
                      <Text variant="titleMedium" style={{marginVertical: 8}}>Variants</Text>
                      <View
                          style={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "flex-start",
                              flexWrap: "wrap",
                          }}
                      >
                          {props.product.variants.map((v) => {
                              return (
                                  <Pressable
                                      key={v.productId}
                                      style={{
                                          alignSelf: "flex-start", // Ensures Pressable fits its child
                                          marginRight: 8, // Adds spacing between Pressables
                                          marginVertical: 4
                                      }}
                                      onPress={() =>
                                          router.push("/Main/(tabs)/Products/" + v.productId)
                                      }
                                  >
                                      <View
                                          style={{
                                              display: "flex",
                                              alignItems: "center",
                                              padding: 8,
                                              borderRadius: 8,
                                              backgroundColor: theme.colors.softPrimary,
                                              borderWidth: 1,
                                          }}
                                      >
                                          {v.differingAttributes.map((a, index) => (
                                              <View
                                                  key={index}
                                                  style={{
                                                      display: "flex",
                                                      flexDirection: "row",
                                                      justifyContent: "flex-start",
                                                      alignItems: "center",
                                                  }}
                                              >
                                                  <Text variant="titleSmall">{a.key + ": "}</Text>
                                                  <Text variant="titleSmall">{a.value}</Text>
                                              </View>
                                          ))}
                                      </View>
                                  </Pressable>
                              );
                          })}
                      </View>
                  </>
              }
            <View style={{ marginTop: 10 }}>
              <Text variant={"bodyLarge"} style={{ color: "black" }}>
                {props.product.description}
              </Text>
            </View>
            <View style={{ marginTop: 15 }}>
              <Text variant={"titleMedium"} style={{ marginBottom: 10 }}>
                Collections:
              </Text>
              <View style={styles.collectionsContainer}>
                {props.product.collections.map((c) => (
                  <View
                    style={{ display: "flex", flexDirection: "row", margin: 5 }}
                    key={c.collectionId}
                  >
                    <Chip
                      textStyle={{ color: "white" }}
                      style={{ backgroundColor: theme.colors.primary }}
                    >
                      {c.collectionName}
                    </Chip>
                  </View>
                ))}
              </View>
            </View>

            <Text variant={"titleMedium"} style={{ marginTop: 10 }}>
              Tags:
            </Text>
            <View style={styles.tagsContainer}>
              {props.product.productTags.map((tag, i) => (
                <Chip
                  key={tag}
                  style={styles.tagChipSelected}
                  textStyle={{ color: theme.colors.white }}
                >
                  {tag}
                </Chip>
              ))}
            </View>
              <ProductReviewsList productId={props.product.productId} />
          </Card.Content>
        </Card>
        <ConfirmDeleteProductModal
            visible={deleteProductModal}
            onDismiss={() => setDeleteProductModal(false)}
            productId={props.product.productId}
        />
    </ScrollableScreen>
              <View style={styles.fabContainer}>
                  <Menu
                      visible={fabOpen}
                      onDismiss={() => setFabOpen(false)}
                      style={{backgroundColor: theme.colors.softSecondary}}
                      contentStyle={{backgroundColor: theme.colors.softSecondary}}
                      mode={'elevated'}
                      anchor={
                          <FAB
                              icon={fabOpen ? "close" : "plus"}
                              color={'white'}
                              style={styles.fab}
                              onPress={handleFabToggle}
                          />
                      }
                  >

                      <Menu.Item onPress={handleCloneProduct} title="Clone Product" leadingIcon={({size, color}) => <MaterialIcons name={'file-copy'} size={size}/>} />
                      <Menu.Item
                          onPress={handleGenerateVariant}
                          title="Generate Variant"
                          leadingIcon="plus-circle"
                      />
                      <Menu.Item
                          onPress={handleMarkAsVariant}
                          title="Mark as Variant"
                          leadingIcon="palette-swatch-variant"
                      />
                  </Menu>
              </View>
              <GenerateVariantModal
                  visible={generateVariantModalVisible}
                  onClose={handleGenerateVariantModalClose}
                  product={props.product}
                  onGenerate={handleGenerateVariantSubmit}
              />
              <MarkAsVariantModal
                  visible={markAsVariantModalVisible}
                  onClose={() => setMarkAsVariantModalVisible(false)}
                  onProductSelect={handleMarkAsVariantProductSelect}
              />
              <CloneProductModal
                  visible={isCloneModalVisible}
                  onClose={() => setIsCloneModalVisible(false)}
                  onConfirm={submitCloneProduct}
              />
        </>
  );
}

const makeStyles = (theme) =>
  StyleSheet.create({
    card: {
      position: "relative",
      width: "100%",
      borderRadius: 0,
      backgroundColor: "white",
      // marginVertical: 15,
      overflow: "hidden",
    },
    titleTextStyle: {
      color: "black",
      paddingLeft: 0,
      marginLeft: 0,
      marginTop: 10,
    },
    cardContent: {
      backgroundColor: "white",
    },
    cardContentView: {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
      marginTop: 10,
      position: "relative",
    },
    rating: {
      marginTop: 15,
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
    },
    ratingText: {
      marginLeft: 10,
    },
    actionButtonsContainer: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      alignContent: "center",
    },
    actionButton: {
      marginBottom: 10,
    },
    collectionsContainer: { flexDirection: "row", flexWrap: "wrap" },
    tagsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginVertical: 10,
    },
    chip: { margin: 5 },
    gstContainer: { marginTop: 10, fontSize: 12, color: "gray" },
    actionContainer: {
      position: "absolute",
      right: 0,
      top: 0,
      flexDirection: "column",
      justifyContent: "space-between",
      alignItems: "flex-end",
    },
    statusContainer: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
    },

    toggleButtons: {
      flexDirection: "row",
      justifyContent: "space-evenly",
      width: "100%",
    },
    toggleButton: {
      borderRadius: 0,
      // marginHorizontal: 5,
      width: "50%",
    },
    archiveButton: { marginTop: 20, alignSelf: "center" },
    tagChipSelected: {
      margin: 5,
      backgroundColor: theme.colors.secondary,
      color: theme.colors.white,
    },
      container: {
          flex: 1,
          position: "relative",
          backgroundColor: theme.colors.surface,
      },
      scrollView: {
          flex: 1,
          paddingHorizontal: 16,
      },
      fabContainer: {
          position: "absolute",
          bottom: 16,
          right: 16,
      },
      fab: {
        color: 'white',
          backgroundColor: theme.colors.secondary, // Adjust the color as needed
      },

      menu: {
          position: "absolute",
          // left: 20,
          // top: 80,
          backgroundColor: theme.colors.surface,
          borderRadius: 8,
      },
  });
