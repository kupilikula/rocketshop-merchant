import { View, Text } from "react-native";
import { Redirect } from "expo-router";

export default function Index() {
  const isLoggedIn = true;
  if (isLoggedIn) {
    return <Redirect href={"/Main"} />;
  } else {
    return <Redirect href={"/Authentication"} />;
  }
}
