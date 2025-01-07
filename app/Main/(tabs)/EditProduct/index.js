import {useLocalSearchParams, useRouter} from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { updateField as updateEditProductField} from "../../../../store/editProductSlice";
import { v4 as uuidv4 } from 'uuid'; // For generating productId
import {useContext, useEffect, useState} from "react";
import {useStoreProduct} from "../../../../api/hooks/useStoreProduct";
import {ProductWorkflowContext} from "../../../../components/ProductWorkflowContext";
import _ from "lodash";


const EditProduct = () => {

  const {setIsNewProduct} = useContext(ProductWorkflowContext);
  const dispatch = useDispatch();
  const router = useRouter();
  const {storeId} = useSelector( (state) => state.store);
  const {productId} = useLocalSearchParams();
  const {data: productData} = useStoreProduct(storeId, productId);
  console.log('pr:', productData);

  useEffect(() => {
    setIsNewProduct(false);
    if (productId) {
      let modifiedData  = _.cloneDeep(productData);
      modifiedData.collections = modifiedData.collections.map((c) => c.collectionId);
      console.log('mod:', modifiedData);
      dispatch(updateEditProductField({field: "all", value: modifiedData}));
      router.replace(
          `/Main/(tabs)/EditProduct/EditProductInfo`,
      );

    }
  },[productId])

  return null; // Render nothing
};

export default EditProduct;
