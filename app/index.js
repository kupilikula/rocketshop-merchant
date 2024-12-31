import { Redirect } from "expo-router";
import {useSelector} from "react-redux";

export default function Index() {

  const merchantId = useSelector((state) => state.merchant.merchantId);

  const isLoggedIn = merchantId;
  if (isLoggedIn) {
    return <Redirect href={"/Main"} />;
  } else {
    return <Redirect href={"/Authentication"} />;
  }
}
