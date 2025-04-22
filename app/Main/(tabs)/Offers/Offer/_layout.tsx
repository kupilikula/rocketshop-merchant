import { Stack, useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { generateBoxShadowStyle } from "@/styles/generateShadow";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GenericHeader from "@/components/GenericHeader";

export default function Layout() {

  return <Stack screenOptions={{ header: () => <GenericHeader title={"Offer Details"} /> }} />;
}
