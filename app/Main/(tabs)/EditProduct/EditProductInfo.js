import ProductInfo from "../../../../components/ProductInfo";
import { useEffect } from "react";

export default function EditProductInfo() {
  // const params = useLocalSearchParams();
  // console.log('params:', params);
  useEffect(() => {
    return () => {
      console.log("EditProductInfo Unmounted!!!");
    };
  }, []);

  return <ProductInfo/>;
}
