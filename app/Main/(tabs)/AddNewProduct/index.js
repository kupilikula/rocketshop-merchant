import { useLocalSearchParams, useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { updateField } from "../../../../store/newProductSlice";
import { v4 as uuidv4 } from 'uuid';
import { useContext, useEffect, useState } from "react";
import { ProductWorkflowContext } from "../../../../components/ProductWorkflowContext";
import { Platform } from "react-native";

const IS_WEB = Platform.OS === 'web';

const AddNewProduct = () => {
  const newProduct = useSelector((state) => state.newProduct);
  const params = useLocalSearchParams();
  const dispatch = useDispatch();
  const router = useRouter();
  const { setIsNewVariant, setVariantInfo, setIsClone, setUseSameMediaForClone } = useContext(ProductWorkflowContext);

  // Local state to hold the productId that triggers navigation.
  // This will be set once, either by generating a new ID or syncing from Redux.
  const [newProductId, setNewProductId] = useState(null);
  // Flag to ensure ID generation/syncing logic runs only once per component lifecycle,
  // or until a valid newProduct.productId from Redux is acknowledged.
  const [idInitializationAttempted, setIdInitializationAttempted] = useState(false);

  useEffect(() => {
    console.log('Effect 1: Checking/Generating productId. Current Redux productId:', newProduct.productId, 'Local newProductId:', newProductId, 'Attempted:', idInitializationAttempted);

    if (idInitializationAttempted) {
      // If initialization was already attempted and newProductId is set, or Redux has it, do nothing more here.
      // This helps prevent re-runs if other dependencies change but ID is settled.
      if (newProductId || newProduct.productId) {
        return;
      }
    }

    if (newProduct.productId) {
      // If Redux already has a productId (e.g., from a previous incomplete session, or quick remount)
      // Sync it to local state if not already set, then mark as initialized.
      console.log('Effect 1: Redux store already has a productId:', newProduct.productId);
      if (newProductId !== newProduct.productId) { // Sync if local state is different or null
        setNewProductId(newProduct.productId);
      }
      setIdInitializationAttempted(true);
    } else if (!newProductId) { // Only generate if Redux has no ID AND local newProductId is not yet set.
      console.log('Effect 1: Generating new productId...');
      const id = uuidv4();
      dispatch(updateField({ field: "productId", value: id }));
      setNewProductId(id); // Set local state to trigger navigation effect
      setIdInitializationAttempted(true); // Mark that we've done this
    }
    // This effect depends on newProduct.productId to react to Redux changes,
    // newProductId (local) to know if it has already set it,
    // and idInitializationAttempted to gate the logic.
  }, [dispatch, newProduct.productId, newProductId, idInitializationAttempted]);


  useEffect(() => {
    console.log('Effect 2: Navigation check. Local newProductId:', newProductId);
    // This effect will run when newProductId (local state) is set.
    if (newProductId) {
      // Optional: Double-check if Redux state is consistent before navigating,
      // though this effect is primarily triggered by local newProductId.
      // if (newProduct.productId && newProductId === newProduct.productId) {
      console.log('Effect 2: newProductId is set, proceeding to route. Params:', params);

      const targetPathProductInfo = IS_WEB ? '/(web_merchant)/(protected)/add_new_product/product_info' : `/Main/(tabs)/AddNewProduct/AddProductInfo`;
      const targetPathMediaItems = IS_WEB ? '/(web_merchant)/(protected)/add_new_product/product_media' : `/Main/(tabs)/AddNewProduct/AddMediaItems`;

      if (params.isNewVariant === 'true') {
        setIsNewVariant(true);
        setVariantInfo({ useSameMedia: params.useSameMedia === 'true', parentProductId: params.parentProductId, differingAttributes: JSON.parse(params.differingAttributes) });
        if (params.useSameMedia === 'true') {
          router.replace(targetPathProductInfo);
        } else {
          router.replace(targetPathMediaItems);
        }
      } else if (params.isClone === 'true') {
        setIsClone(true);
        setUseSameMediaForClone(params.useSameMediaForClone === 'true');
        if (params.useSameMediaForClone === 'true') {
          router.replace(targetPathProductInfo);
        } else {
          router.replace(targetPathMediaItems);
        }
      } else {
        router.replace(targetPathMediaItems);
      }
      // } else {
      //   console.log('Effect 2: newProductId is set, but Redux productId might not be consistent yet. Waiting for next render.');
      // }
    }
    // Dependencies: This effect should run when newProductId changes, or if params/context setters change
    // which might influence the navigation target.
    // Router itself should be stable.
  }, [newProductId, router, params, setIsNewVariant, setVariantInfo, setIsClone, setUseSameMediaForClone]);

  return null; // This component's purpose is to set up and navigate.
};

export default AddNewProduct;