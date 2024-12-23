// import { useLocalSearchParams } from "expo-router";
import { getProductForStore } from "../../../../../utils/fakeDataMethods";
import ProductScreenMerchant from "../../../../../components/ProductScreenMerchant";

export default function ProductPage(props) {
  // const { productId } = useLocalSearchParams();

  return (
    <ProductScreenMerchant
      product={getProductForStore()}
      showProductDescription={true}
    />
  );
}
