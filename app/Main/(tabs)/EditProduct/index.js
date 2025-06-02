import {useLocalSearchParams, useRouter} from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { updateField as updateEditProductField} from "../../../../store/editProductSlice";
import { v4 as uuidv4 } from 'uuid'; // For generating productId
import {useContext, useEffect, useState} from "react";
import {useStoreProduct} from "../../../../api/hooks/useStoreProduct";
import {ProductWorkflowContext} from "../../../../components/ProductWorkflowContext";
import _ from "lodash";
import {Platform} from "react-native";

const IS_WEB = Platform.OS === 'web';

const EditProduct = () => {

  const {setIsNewProduct, isNewProduct} = useContext(ProductWorkflowContext);
  const dispatch = useDispatch();
  const router = useRouter();
  const {storeId} = useSelector( (state) => state.store);
  const {productId} = useLocalSearchParams();
  console.log("productId", productId);
  const {data: productData} = useStoreProduct(storeId, productId);
  console.log('line 22, isNewProduct:', isNewProduct);

  useEffect(() => {
    console.log('pr:', productData);
    setIsNewProduct(false);
    if (productId) {
      console.log('prId:', productId);
      let modifiedData  = _.cloneDeep(productData);
      modifiedData.collections = modifiedData.collections.map((c) => c.collectionId);
      delete modifiedData.variants;
      console.log('mod:', modifiedData);
      dispatch(updateEditProductField({field: "all", value: modifiedData}));
      router.replace(
          IS_WEB ? '/(web_merchant)/(protected)/edit_product/product_info' : `/Main/(tabs)/EditProduct/EditProductInfo`,
      );

    }
  },[productId])

  return null; // Render nothing
};

export default EditProduct;
