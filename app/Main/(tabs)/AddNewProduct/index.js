import {Redirect, useRouter} from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { updateField } from "../../../../store/newProductSlice";
import * as Crypto from "expo-crypto";
import { useEffect, useState } from "react";
import {useNavigationState} from "@react-navigation/native";

const AddNewProduct = () => {
    const newProduct = useSelector((state) => state.newProduct);
    const dispatch = useDispatch();
    const router = useRouter();
    const currentRoute = useNavigationState((state) => state?.routes[state.index]?.name);

    const [newProductId, setNewProductId] = useState(null); // Use state to track productId

    useEffect(() => {
        const generateProductId = async () => {

            if (!newProductId || !newProduct.productId) {
                const id = newProduct.productId || Crypto.randomUUID(); // Use existing productId or generate a new one
                console.log('dispatching, id:', id);
                dispatch(updateField({ field: "productId", value: id }));
                setNewProductId(id); // Set the state after generating the productId
                console.log('dispatched');
            }
        };

        generateProductId();
    }, [dispatch]);

    console.log('nP:', newProduct, 'local pID:', newProductId);
    useEffect(() => {
        // Navigate to AddMediaItems after generating productId
        if (newProductId) {
            router.replace(`/Main/(tabs)/AddNewProduct/AddMediaItems?productId=${newProductId}`);
        }
    }, [newProductId, router]);

    return null; // Render nothing
};

export default AddNewProduct;
