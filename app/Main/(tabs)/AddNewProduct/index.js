import {useLocalSearchParams, useRouter} from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { updateField } from "../../../../store/newProductSlice";
import { v4 as uuidv4 } from 'uuid'; // For generating productId
import {useContext, useEffect, useState} from "react";
import {ProductWorkflowContext} from "../../../../components/ProductWorkflowContext";


const AddNewProduct = () => {
  const newProduct = useSelector((state) => state.newProduct);
  const params = useLocalSearchParams();
  const dispatch = useDispatch();
  const router = useRouter();
  const {setIsNewVariant, setVariantInfo, setIsClone, setUseSameMediaForClone} = useContext(ProductWorkflowContext);

  const [newProductId, setNewProductId] = useState(null); // Use state to track productId

  useEffect(() => {
    const generateProductId = async () => {
      console.log('inside generateProduct Id effect');
      if (!newProductId || !newProduct.productId) {
        console.log('generating new productId');
        const id = uuidv4(); // Use existing productId or generate a new one
        dispatch(updateField({ field: "productId", value: id }));
        setNewProductId(id); // Set the state after generating the productId
      }
    };

    generateProductId();
  }, [dispatch, newProductId, newProduct.productId]);



  useEffect(() => {
    // Navigate to AddMediaItems after generating productId
    console.log('inside index effect, newProductId:', newProductId);
    if (newProductId && newProduct.productId && newProductId===newProduct.productId) {
      console.log('inside index effect, routing to media');
      console.log('params:', params);
      if (params.isNewVariant==='true') {
        setIsNewVariant(true);
        setVariantInfo({useSameMedia: params.useSameMedia==='true', parentProductId: params.parentProductId, differingAttributes: JSON.parse(params.differingAttributes)});
        if (params.useSameMedia==='true') {
          router.replace(
              `/Main/(tabs)/AddNewProduct/AddProductInfo`,
          );
        } else {
          router.replace(
              `/Main/(tabs)/AddNewProduct/AddMediaItems`,
          );
        }

      } else if (params.isClone==='true') {
        setIsClone(true);
        setUseSameMediaForClone(params.useSameMediaForClone==='true');
        if (params.useSameMediaForClone==='true') {
          router.replace(
              `/Main/(tabs)/AddNewProduct/AddProductInfo`,
          );
        } else {
          router.replace(
              `/Main/(tabs)/AddNewProduct/AddMediaItems`,
          );
        }


      } else {
        router.replace(
            `/Main/(tabs)/AddNewProduct/AddMediaItems`,
        );
      }

    }
  }, [newProductId, router]);

  return null; // Render nothing
};

export default AddNewProduct;
