import {Stack, useRouter} from "expo-router";
import GenericHeader from "../../components/GenericHeader";
import {Button, useTheme} from "react-native-paper";
import {clearPendingRequest, clearRedirectAfterAuth, setAuthenticationStatus} from "../../store/authSlice";
import {useDispatch} from "react-redux";

export default function Layout() {

  const router = useRouter();
  const dispatch = useDispatch();
  const theme = useTheme();

  return <Stack screenOptions={{headerShown: true}} >
    <Stack.Screen name={'index'} options={{header: () => null}}/>
    </Stack>
}
