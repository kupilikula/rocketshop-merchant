import {Pressable, View} from "react-native";
import {generateBoxShadowStyle} from "../styles/generateShadow";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Text, useTheme} from "react-native-paper";
import {useLocalSearchParams, useRouter} from "expo-router";
import {useSafeAreaInsets} from "react-native-safe-area-context";

const GenericHeader = ({title, right}) => {

    const router = useRouter();
    const insets = useSafeAreaInsets();
    const theme = useTheme();

    return (
        <View
            style={[
                generateBoxShadowStyle(0, 4, "#171717", 0.2, 3, 4, "#171717"),
                {
                    height: 60 + insets.top,
                    paddingTop: insets.top,
                    paddingHorizontal: 15,
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: "white",
                },
            ]}
        >
            <Pressable
                onPressIn={() => {
                    router.back();
                }}
                style={{width: 60}}
            >
                <MaterialIcons
                    name={"arrow-back"}
                    size={36}
                    style={{ color: "black" }}
                />
            </Pressable>
            <Text variant={"titleLarge"} style={{ color: "black" }}>
                {title}
            </Text>
            {right ||
            <View style={{width: 60}}/>
            }
        </View>
    );
};

export default GenericHeader;