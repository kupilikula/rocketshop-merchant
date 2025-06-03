import {Platform, Pressable, View} from "react-native";
import {generateBoxShadowStyle} from "@/styles/generateShadow";
import {resetNewProduct} from "@/store/newProductSlice";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {Text} from "react-native-paper";
import React, {useCallback, useContext} from "react";
import {CommonActions} from "@react-navigation/native";
import {useNavigation, useRouter} from "expo-router";
import {useDispatch} from "react-redux";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {ProductWorkflowContext} from "@/components/ProductWorkflowContext";

const headerTitle = (isNewProduct, isNewVariant, isClone) => {

    if (isNewVariant) {
        return 'New Variant Media';
    } else if (isClone) {
        return 'New Clone Media';
    } else if (isNewProduct) {
        return 'New Product Media';
    }
}

const IS_WEB = Platform.OS === 'web';

const MediaHeader = () => {

    const navigation = useNavigation();
    const dispatch = useDispatch();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const {isNewProduct, isNewVariant, isClone, isCameraOpen, isMediaSelected} = useContext(ProductWorkflowContext);

    const resetNavigationStack = useCallback(() => {
        // Reset the navigation stack to the Dashboard tab
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: "Dashboard" }], // Replace with your Dashboard screen name
            }),
        );
    }, [navigation]);

    if (isCameraOpen) {
        return null;
        // return <View style={{height: 60 + insets.top, backgroundColor: "#000000"}}/>;
    } else {
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
                        backgroundColor: "black",
                    },
                ]}
            >
                {/* Left Icon (Back Button) */}
                <Pressable
                    onPressIn={() => {
                        console.log("cancel workflow");
                        dispatch(resetNewProduct());
                        resetNavigationStack();
                    }}
                    style={{ flex: 1 }}
                >
                    <MaterialIcons
                        name="close"
                        size={36}
                        style={{ color: "white" }}
                    />
                </Pressable>

                {/* Title */}
                <Text
                    variant="titleLarge"
                    style={{
                        flex: 3, // Allow the title to occupy its space while centering
                        textAlign: "center",
                        color: "white",
                    }}
                >
                    {headerTitle(isNewProduct, isNewVariant, isClone)}
                </Text>

                {/* Right Icon (Forward Button) */}
                <Pressable
                    onPressIn={() => {
                        console.log("press");
                        if (isMediaSelected) {
                            router.push(IS_WEB ? './product_info' : "./AddProductInfo");
                        }
                    }}
                    style={{ flex: 1, alignItems: "flex-end" }}
                >
                    <MaterialIcons
                        name="arrow-forward"
                        size={36}
                        style={{
                            color: isMediaSelected ? "white" : "black",
                        }}
                    />
                </Pressable>
            </View>
        );
    }
};

export default MediaHeader;