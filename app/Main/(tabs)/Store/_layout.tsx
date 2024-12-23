import { Stack } from "expo-router";

export default function Layout() {
  // const router = useRouter();
  // const pathName = usePathname();

  return (
    <Stack
      screenOptions={{ header: () => null }}
      initialRouteName={"StoreFront"}
    />
  );
}
