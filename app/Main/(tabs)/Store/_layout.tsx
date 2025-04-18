import { Stack } from "expo-router";
import {useTheme} from "react-native-paper";

export default function Layout() {
  // const router = useRouter();
  // const pathName = usePathname();
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{ header: () => null, contentStyle: {backgroundColor: theme.colors.surface} }}
      initialRouteName={"StoreFront"}
    />
  );
}
