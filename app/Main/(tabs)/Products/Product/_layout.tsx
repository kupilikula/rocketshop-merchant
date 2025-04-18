import { Stack, useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {Text, useTheme} from "react-native-paper";
import { generateBoxShadowStyle } from "@/styles/generateShadow";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GenericHeader from "@/components/GenericHeader";
export default function Layout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return <Stack screenOptions={{ header: () => <GenericHeader title={'Product Details'} right={null}/>, animation: "none", contentStyle: { backgroundColor: theme.colors.surface }}} />;
}
