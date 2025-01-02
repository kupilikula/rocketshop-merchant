import { Pressable, ScrollView, View } from "react-native";
import { Button, Surface, useTheme, Text } from "react-native-paper";
import ProductDisplayCardCustomerStore from "../../../../components/ProductDisplayCardCustomerStore";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect } from "react";
import { resetNewProduct } from "../../../../store/newProductSlice";
import { useNavigation, useRouter } from "expo-router";
import { CommonActions } from "@react-navigation/native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { generateBoxShadowStyle } from "../../../../styles/generateShadow";
import { v4 as uuidv4 } from 'uuid';
import axiosClient from "../../../../api/client";
import * as MediaLibrary from "expo-media-library";
import * as ImageManipulator from 'expo-image-manipulator';
import _ from "lodash";
import {useProductPreviewPublishRef} from "../../../../components/ProductPreviewPublishRefContext";

const convertHeicToJpg = async (uri) => {
    try {
        const result = await ImageManipulator.manipulateAsync(
            uri,
            [],
            { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
        );
        console.log('Converted image:', result);
        return result.uri;
    } catch (error) {
        console.error('Image conversion error:', error);
    }
};

export default function Preview(props) {
  const dispatch = useDispatch();
  const router = useRouter();
  const theme = useTheme();
  const newProduct = useSelector((state) => state.newProduct);
  const storeId = useSelector((state) => state.store.storeId); // Access the storeId from Redux
    const productPreviewPublishRef = useProductPreviewPublishRef();
    const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const resetNavigationStack = () => {
    // Reset the navigation stack to the Dashboard tab
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Dashboard" }], // Replace with your Dashboard screen name
      }),
    );
  };

    async function publishProduct() {
        try {

            // Generate fileKeys for each mediaItem
            const fileKeysWithContentTypes = newProduct.mediaItems.map((item) => ({
                    fileKey: `stores/${storeId}/products/${newProduct.productId}/${item.mediaId}`,
                    contentType: item.contentType==='image/heic' ? 'image/jpg' : item.contentType
                }));
            console.log('f:', fileKeysWithContentTypes);
            const { data: presignedUrls } = await axiosClient.post(`/stores/${storeId}/products/mediaUploadPresignedUrls`, {
                fileKeysWithContentTypes
            });

            // Request presigned URLs for all mediaItems

            console.log('presignedUrls:', presignedUrls);

            let updatedMediaItems = _.cloneDeep(newProduct.mediaItems);
            // Upload each mediaItem to Spaces
            await Promise.all(
                newProduct.mediaItems.map(async (item, index) => {
                    const presignedUrl = presignedUrls[index].presignedUrl;
                    console.log('pre:', presignedUrl);

                    // console.log('line66, blob:', blob);
                    // console.log('line89:, blob.type:', blob.type);

                        let convertedItemUri = null;
                        if (item.contentType === 'image/heic') {
                            convertedItemUri = await convertHeicToJpg(item.uri);
                            console.log('convertedItemUri:', convertedItemUri);
                            updatedMediaItems[index].contentType = 'image/jpg';
                        }

                        let blob;
                        if (convertedItemUri) {
                            console.log('computing blob of converted item');
                            let res = await fetch(convertedItemUri);
                            blob = res.blob();
                            console.log('line 87, blob:', blob);
                        } else {
                            let assetInfo = await MediaLibrary.getAssetInfoAsync(item);
                            console.log('assetInfo:', assetInfo);
                            let res = await fetch(assetInfo.localUri || assetInfo.uri);
                            blob = await res.blob();
                            console.log('line 94, blob:', blob);
                        }


                    // Replace the local uri with the Spaces URI after upload
                    console.log('line 58,item.uri:', item.uri);
                    try {
                        let r = await fetch(presignedUrl, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': updatedMediaItems[index].contentType, // Update Content-Type based on your files
                                'x-amz-acl': 'public-read',
                            },
                            body: blob,
                        });
                        console.log('r:', r);
                        // Update the mediaItem with its uploaded URI
                        updatedMediaItems[index].uri = presignedUrls[index].fileUri;
                    } catch (err) {
                        console.log('err:', err);
                    }

                })
            );
            console.log('updatedMediaItems:', updatedMediaItems);
            // Send the updated product data to the backend
            await axiosClient.post(`/stores/${storeId}/products/addNewProduct`, {
                ...newProduct,
                mediaItems: updatedMediaItems,
            });

            console.log('Product published successfully!');
            // resetNewProduct()
        } catch (error) {
            console.error('Failed to publish product:', error);
        }
    }

  useEffect(() => {
    const PreviewHeader = () => {
      return (
        <View
          style={[
            generateBoxShadowStyle(0, 4, "#171717", 0.2, 3, 4, "#171717"),
            {
              height: 60 + insets.top,
              paddingTop: insets.top,
              paddingHorizontal: 15,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "white",
            },
          ]}
        >
          <Pressable
            onPressIn={() => {
              router.back();
            }}
          >
            <MaterialIcons
              name={"arrow-back"}
              size={36}
              style={{ color: "black" }}
            />
          </Pressable>
          <Text variant={"titleLarge"} style={{ color: "black" }}>
            Product Preview
          </Text>
          <Button
            onPress={publishProduct}
            mode={"contained"}
            style={{ borderRadius: 8, backgroundColor: theme.colors.success }}
          >
            Publish
          </Button>
        </View>
      );
    };

    navigation.setOptions({
      header: PreviewHeader,
      insets,
      router,
      publishProduct,
      theme,
    });
  }, [navigation]);

    useEffect(() => {
        // Attach the `handleSubmit` method to the ref passed in initialParams
        if (productPreviewPublishRef) {
            productPreviewPublishRef.current = {
                publish: () =>
                {
                    console.log('207 publish');
                    publishProduct();
                },
            };
        }
    }, [productPreviewPublishRef]);

  const saveAsDraft = () => {
    // save draft
    // reset redux new product to empty
    dispatch(resetNewProduct());
    resetNavigationStack();
  };

  const discard = () => {
    // reset redux new product to empty
    console.log("DISCARDING: redux product before reset:", newProduct);
    dispatch(resetNewProduct());
    console.log("AFTER DISCARDING: redux product before reset:", newProduct);
    resetNavigationStack();
  };

  return (
      <ScrollView style={{ flex: 1, backgroundColor: theme.colors.surface, paddingHorizontal: 10, paddingVertical: 20}}>
    {/*<Surface style={{ flex: 1, paddingHorizontal: 10, backgroundColor: theme.colors.surface }}>*/}

        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            width: "100%",
            marginTop: 8,
            marginBottom: 16,
          }}
        >
          <Button
            onPress={discard}
            icon={"delete"}
            mode={"contained"}
            labelStyle={{ color: "white" }}
            style={{ borderRadius: 8, backgroundColor: theme.colors.error }}
          >
            Discard
          </Button>
          <Button
            onPress={saveAsDraft}
            mode={"outlined"}
            style={{
              borderRadius: 8,
              borderWidth: 2,
              borderColor: theme.colors.primary,
            }}
          >
            Save As Draft
          </Button>
        </View>
        <ProductDisplayCardCustomerStore
          product={newProduct}
          showProductDescription={true}
          showRating={newProduct.enableRatings}
        />
    {/*</Surface>*/}
      </ScrollView>
  );
}
