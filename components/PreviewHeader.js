import {Pressable, View} from "react-native";
import {generateBoxShadowStyle} from "../styles/generateShadow";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {Button, Text, useTheme} from "react-native-paper";
import {useProductPreviewPublishRef} from "./ProductPreviewPublishRefContext";
import {useRouter} from "expo-router";
import {useSafeAreaInsets} from "react-native-safe-area-context";

const PreviewHeader = () => {

    const ref = useProductPreviewPublishRef();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const theme = useTheme();

    const onPublish = () => {
        if (ref.current) {
            ref.current.publish(); // Call the exposed method
        }
    };

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
            >
                <MaterialIcons
                    name={"arrow-back"}
                    size={36}
                    style={{ color: "black" }}
                />
            </Pressable>
            <Text variant={"titleLarge"} style={{ color: "black" }}>
                Product Preview
            </Text>
            <Button
                onPress={onPublish}
                mode={"contained"}
                style={{ borderRadius: 8, backgroundColor: theme.colors.success }}
            >
                Publish
            </Button>
        </View>
    );
};

export default PreviewHeader;