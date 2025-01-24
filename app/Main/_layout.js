import { Drawer } from "expo-router/drawer";
import { usePathname } from "expo-router";
import DrawerMenu from "../../components/DrawerMenu";
import AppHeader from "../../components/AppHeader";

export default function Layout() {
  const pathName = usePathname();

  return (
    <Drawer
      initialRouteName={"(tabs)"}
      backBehavior={"history"}
      screenOptions={({ route }) => ({
        drawerPosition: "right",
        drawerType: "front",
        headerShadowVisible: true,
        headerTitle: "",
        contentContainerStyle: { flex: 1, height: "100%" },
        drawerContentStyle: { flex: 1, height: "100%" },
        drawerContentContainerStyle: {
          flex: 1,
          height: "100%", // Ensure full height
        },
        sceneContainerStyle: { flex: 1, height: "100%" },
        drawerStyle: {
          flex: 1,
          height: "100%",
          width: "80%",
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
        },
        header: () => {
          console.log("pathName:", pathName);
          return pathName.startsWith("/Main/AddNewProduct") ||
          pathName.startsWith("/Main/EditProduct") ||
            pathName.startsWith("/Main/Products/Product") ||
            pathName.startsWith("/Main/Orders/Order") ||
            pathName.startsWith("/Main/Collections/Collection") ||
            pathName.startsWith("/Main/Customers/Customer") ||
            pathName.startsWith("/Main/Messaging") ||
            pathName.startsWith("/Main/Offers/Offer") ? null : (
            <AppHeader />
          );
        },
      })}
      drawerContent={(props) => <DrawerMenu {...props} />}
    ></Drawer>
  );
}
