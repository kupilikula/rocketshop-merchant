import {View, Pressable, StyleSheet} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import LogoIconWithName from "./LogoIconWithName";
import { DrawerActions } from "@react-navigation/native";
import {useNavigation, useRouter} from "expo-router";
import {Badge, useTheme} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { generateBoxShadowStyle } from "../styles/generateShadow";
import {useSelector} from "react-redux";

export default function AppHeader(props) {
  const navigation = useNavigation();
  const theme = useTheme();
  const styles = makeStyles(theme);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {canReceiveMessages} = useSelector(state => state.store);

    const unreadCount = useSelector((state) => {
        const unread = state.badges.unreadMessages;
        if (!unread) return 0;
        return Object.values(unread).reduce((total, messages) => total + messages.length, 0);
    });

  return (
    <View
      style={[
        generateBoxShadowStyle(0, 4, "#171717", 0.2, 3, 4, "#171717"),
        {
          height: 60 + insets.top,
          paddingTop: insets.top,
          backgroundColor: "white",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        },
      ]}
    >
      <LogoIconWithName />
        <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end'}}>
            {canReceiveMessages && <Pressable
                onPress={() => router.push('/Main/(tabs)/Messaging')}
                // style={{backgroundColor: 'red'}}
            >
                <View
                    style={{
                        // width: 40,
                        // height: 40,
                        margin: 10,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        alignSelf: 'center'
                    }}
                >
                    <View style={styles.iconContainer}>
                        <MaterialIcons name="chat" size={24} color={theme.colors.secondary} />
                        {unreadCount > 0 && (
                            <Badge style={styles.badge}>{unreadCount}</Badge>
                        )}
                    </View>
                </View>
            </Pressable>}
      <Pressable
        onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
      >
        <View
          style={{
            // width: 40,
            // height: 40,
            margin: 10,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <MaterialIcons
            name={"menu"}
            size={28}
            style={{ color: theme.colors.secondary }}
          />
        </View>
      </Pressable>
        </View>
    </View>
  );
}

const makeStyles  = (theme) => StyleSheet.create({
    iconContainer: {
        position: 'relative',
        // width: 40, // Ensures enough space for the icon and badge
        alignItems: 'center',
        justifyContent: 'center',
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: 'red',
        color: 'white',
        fontSize: 10,
        height: 18,
        minWidth: 18,
        borderRadius: 9,
        textAlign: 'center',
        lineHeight: 18,
        overflow: 'hidden',
    },
})