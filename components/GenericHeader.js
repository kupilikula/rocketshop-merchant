import {Pressable, View} from "react-native";
import {generateBoxShadowStyle} from "../styles/generateShadow";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Text, useTheme} from "react-native-paper";
import {useRouter} from "expo-router";
import {useSafeAreaInsets} from "react-native-safe-area-context";

const GenericHeader = ({title, titleSize = 'titleLarge', showBackButton = true, left = null, right = null}) => {

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
            {showBackButton && !left &&
                <Pressable
                    onPressIn={() => {
                        router.back();
                    }}
                    style={{width: 90}}
                >
                    <MaterialIcons
                        name={"arrow-back"}
                        size={36}
                        style={{ color: "black" }}
                    />
                </Pressable>
            }
            {left}
            {!showBackButton && !left && <View style={{width: 90}}/>}
            <Text variant={titleSize} style={{ color: "black" }}>
                {title}
            </Text>
            {!right && <View style={{width: 90}}/>}
            {right}
        </View>
    );
};

export default GenericHeader;