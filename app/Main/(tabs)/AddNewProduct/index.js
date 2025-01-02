import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { updateField } from "../../../../store/newProductSlice";
import { v4 as uuidv4 } from 'uuid'; // For generating productId
import { useEffect, useState } from "react";

const AddNewProduct = () => {
  const newProduct = useSelector((state) => state.newProduct);
  const dispatch = useDispatch();
  const router = useRouter();

  const [newProductId, setNewProductId] = useState(null); // Use state to track productId

  useEffect(() => {
    const generateProductId = async () => {
      if (!newProductId || !newProduct.productId) {
        const id = newProduct.productId || uuidv4(); // Use existing productId or generate a new one
        dispatch(updateField({ field: "productId", value: id }));
        setNewProductId(id); // Set the state after generating the productId
      }
    };

    generateProductId();
  }, [dispatch, newProductId, newProduct.productId]);

  useEffect(() => {
    // Navigate to AddMediaItems after generating productId
    if (newProductId) {
      router.replace(
        `/Main/(tabs)/AddNewProduct/AddMediaItems?productId=${newProductId}`,
      );
    }
  }, [newProductId, router]);

  return null; // Render nothing
};

export default AddNewProduct;
