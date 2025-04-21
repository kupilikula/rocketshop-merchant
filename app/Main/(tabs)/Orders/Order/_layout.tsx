import { Stack, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Pressable, View } from "react-native";
import { generateBoxShadowStyle } from "@/styles/generateShadow";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {Text, useTheme} from "react-native-paper";
import GenericHeader from "@/components/GenericHeader";

export default function Layout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return <Stack screenOptions={{ header: () => <GenericHeader title={"Order Details"}/>, contentStyle: { backgroundColor: theme.colors.surface} }} />;
}
