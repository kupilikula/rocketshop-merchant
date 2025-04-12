import { Redirect } from "expo-router";
import {useSelector} from "react-redux";

export default function Index() {

  const isAuthenticated = useSelector((state) => state.auth.authenticationStatus==='AUTHENTICATED');

  if (isAuthenticated) {
    return <Redirect href={"/Main"} />;
  } else {
    return <Redirect href={"/Authentication"} />;
  }
}
