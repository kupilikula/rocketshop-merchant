import { Drawer } from "expo-router/drawer";
import {usePathname, useRouter} from "expo-router";
import DrawerMenu from "../../components/DrawerMenu";
import AppHeader from "../../components/AppHeader";
import {useEffect, useState} from "react";
import {disconnectSocket, getSocket} from "../../api/websocket";
import {useDispatch, useSelector} from "react-redux";
import {addUnreadMessage} from "../../store/badgesSlice";
import {useQueryClient} from "react-query";

export default function Layout() {
  const pathName = usePathname();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const {merchantId} = useSelector((state)=> state.merchant);
  const { storeId } = useSelector((state) => state.store);

  useEffect(() => {
      console.log('Mounting MAIN');
      return () => {
          console.log('Unmounting Main');
      }
  },[])

    useEffect(() => {
        const socketType = "global"; // Define the socket type
        console.log('global useEffect');
        // Function to initialize and manage the global socket connection
        const initializeSocket = async () => {
            if (!merchantId || !storeId) {
                console.error("Merchant ID or storeId not found. Cannot initialize global socket.");
                return;
            }
            const socket = await getSocket(socketType, null, storeId); // Get or connect the global socket
            if (!socket) {
                console.error("Failed to initialize the global socket.");
                return;
            }

            console.log(`Global socket initialized, ID: ${socket.id} , merchantId: ${merchantId}`);
            console.log(`Existing "newMessage" listeners:`, socket.listeners("newMessage").length);

            // Remove any existing listeners
            socket.removeAllListeners("newMessage");

            // Add the 'newMessage' listener
            socket.on("newMessage", (message) => {
                console.log("Received newMessage event:", message);
                console.log(`Active "newMessage" listeners:`, socket.listeners("newMessage").length);
                console.log("newMessage socket.id:", socket.id);

                // Update Redux store
                dispatch(addUnreadMessage(message));

                // Invalidate 'chats' query
                queryClient.invalidateQueries(["chats"]);
            });

            console.log("Global socket listener for 'newMessage' added.");
        };

        const handleReconnect = async () => {
            console.log("Socket reconnected. Reinitializing listeners...");
            await initializeSocket(); // Reattach listeners after reconnection
        };

        const attachReconnectHandler = async () => {
            const socket = await getSocket(socketType);
            if (!socket) {
                console.error("Failed to attach reconnect handler: Global socket not initialized.");
                return;
            }

            // Ensure only one reconnect handler is active
            socket.off("connect", handleReconnect);
            socket.on("connect", handleReconnect);
        };

        const setupSocket = async () => {
            if (merchantId && storeId) {
                await initializeSocket();
                await attachReconnectHandler();
            }
        };

        setupSocket();

        // Clean up on unmount
        return () => {
            disconnectSocket(socketType); // Disconnect the global socket
        };
    }, [merchantId, storeId]); // Re-run when merchantId changes



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
          pathName.startsWith("/Main/Shipping") ||
            pathName.startsWith("/Main/Offers/Offer") ||
          pathName.startsWith("/Main/StoreSettings") ||
            pathName.startsWith("/CreateStore")
              ? null : (
            <AppHeader />
          );
        },
      })}
      drawerContent={(props) => <DrawerMenu {...props} />}
    ></Drawer>
  );
}
