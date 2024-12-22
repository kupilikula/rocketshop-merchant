import { Redirect, useLocalSearchParams } from "expo-router";
import ProductInfo from "../../../../components/ProductInfo";
import { useEffect } from "react";

export default function AddProductInfo() {
  // const params = useLocalSearchParams();
  // console.log('params:', params);
  useEffect(() => {
    return () => {
      console.log("AddProductInfo Unmounted!!!");
    };
  }, []);

  return <ProductInfo isNewProduct={true} />;
}
