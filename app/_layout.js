import {Stack, useRouter} from "expo-router";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {AppState, Platform} from "react-native";
import { StatusBar } from "expo-status-bar";
import {useEffect, useRef} from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DefaultTheme } from "react-native-paper";
import {Provider, useDispatch, useSelector} from "react-redux";
import {persistor, store} from "@/store/store";
import * as NavigationBar from "expo-navigation-bar";
import {focusManager, QueryClient, QueryClientProvider} from "react-query";
import 'react-native-get-random-values';
import {setAxiosDependencies} from "@/api/client";
import AppShell from "@/components/AppShell";
import * as Linking from 'expo-linking';
import {PersistGate} from "redux-persist/integration/react";
import {initializeNotificationChannels, initializeNotificationHandler} from "../utils/initializeNotificationHandler";
import {ProductWorkflowProvider} from "../components/ProductWorkflowContext";

const queryClient = new QueryClient();
// const isLoggedIn = true;

export default function RootLayout() {

    const router = useRouter();

  const customTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      white: "#FFFFFF",
      black: "#000000",
      primary: "#3A86FF", // Royal Blue
      softPrimary: "#E3F2FD",
      secondary: "#FF6F59", // Sunset Orange
      softSecondary: "#FFE8E3",
      surface: "#FFFFFF", // Soft Primary
      card: "#FFFFFF", // White
      nestedCard: "#FFE8E3", // Soft Secondary
      text: "#000000", // Black
      error: "#D72638", // Bright Red
      softError: "#FAD4D8",
      success: "#37A745", // Green
      softSuccess: "#DFF3E2",
      active: "#85C185",
      inactive: "#D0D0D0",
      input: "#FFFFFF",
      grayBorder: "#AAAAAA",
      placeholder: "#8D99AE", // Medium Gray
      disabled: "#E0E0E0", // Light Gray for disabled elements
      warning: "#FFBE0B", // Gold
      icon: "#0196f9", // blue
      info: "#00C4CC", // Turquoise Blue for informational states
      secondaryContainer: "#FF6F59",
      onSecondaryContainer: 'white'
    },
    dark: false, // Set to true if creating a dark theme
  };

  AppState.addEventListener('change', (status) => {
    focusManager.setFocused(status === 'active');
  });

  useEffect(() => {
    const configureNavigationBar = async () => {
      if (Platform.OS === 'android') { // <--- Add this check
        try {
          await NavigationBar.setVisibilityAsync('hidden'); // Hide initially
          await NavigationBar.setBehaviorAsync('overlay-swipe'); // Allow swipe-up to reveal
          await NavigationBar.setBackgroundColorAsync('#00000000'); // Transparent background
        } catch (e) {
          console.log( 'Failed to configure Navigation Bar:', e);
        }}
    };

    if (Platform.OS==='android') {
      configureNavigationBar();
    }
  }, []);


  useEffect(() => {
    setAxiosDependencies(store.dispatch, router);
  }, [store.dispatch, router])


  useEffect(() => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') { // <--- Consider this check
      Linking.getInitialURL().then((url) => {
        console.log('🔗 Received initial URL:', url);
      });
    }
  }, []);

  useEffect(() => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') { // <--- Consider this check
      initializeNotificationHandler();
      initializeNotificationChannels();
    }
  }, []);


  return (
      <QueryClientProvider client={queryClient}>
          <SafeAreaProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <Provider store={store}>
              <PersistGate loading={null} persistor={persistor}>
                <ProductWorkflowProvider>
              <PaperProvider theme={customTheme}>
                <StatusBar style="dark" />
                <AppShell/>
              </PaperProvider>
                </ProductWorkflowProvider>
              </PersistGate>
            </Provider>
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </QueryClientProvider>
  );
}
