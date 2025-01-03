import {Pressable, View} from "react-native";
import {generateBoxShadowStyle} from "@/styles/generateShadow";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {Text} from "react-native-paper";
import React, {useContext} from "react";
import {useRouter} from "expo-router";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {AddNewProductWorkflowContext} from "@/components/AddNewProductWorkflowContext";

const ProductInfoHeader = (props) => {

    const router = useRouter();
    const insets = useSafeAreaInsets();
    const {productInfoFormRef} = useContext(AddNewProductWorkflowContext);
    const onSubmit = () => {
        if (productInfoFormRef.current) {
            productInfoFormRef.current.submitForm(); // Call the exposed method
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
                    color: "black",
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
                Product Info
            </Text>
            <Pressable onPressIn={onSubmit}>
                <MaterialIcons
                    name={"arrow-forward"}
                    size={36}
                    style={{ color: "black" }}
                />
            </Pressable>
        </View>
    );
};

export default ProductInfoHeader;