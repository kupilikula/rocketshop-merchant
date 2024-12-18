import { Redirect } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { updateField } from "../../../../store/newProductSlice";
import * as Crypto from "expo-crypto";
import { useEffect, useState } from "react";

const AddNewProduct = () => {
    const newProduct = useSelector((state) => state.newProduct);
    const dispatch = useDispatch();

    const [newProductId, setNewProductId] = useState(null); // Use state to track productId

    useEffect(() => {
        const generateProductId = async () => {
            const id = Crypto.randomUUID();
            console.log('dispatching, id:', id);
            dispatch(updateField({ field: "productId", value: id }));
            setNewProductId(id); // Set the state after generating the productId
            console.log('dispatched')
        };

        generateProductId();
    }, [dispatch]);

    // Wait until the newProductId is set before redirecting
    if (!newProductId) {
        return null; // Render nothing until productId is available
    }
    console.log('nP:', newProduct, 'local pID:', newProductId);
    return <Redirect href={`./AddMediaItems?productId=${newProductId}`} />;
};

export default AddNewProduct;
