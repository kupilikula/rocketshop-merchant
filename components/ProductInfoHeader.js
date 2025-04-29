import {Pressable, View} from "react-native";
import {generateBoxShadowStyle} from "@/styles/generateShadow";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {Button, Text, useTheme} from "react-native-paper";
import React, {useContext} from "react";
import {useRouter} from "expo-router";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {ProductWorkflowContext} from "@/components/ProductWorkflowContext";
import {resetEditProduct} from "@/store/editProductSlice";
import {useDispatch, useSelector} from "react-redux";

const headerTitle = (isNewProduct, isNewVariant, isClone) => {

    if (isNewVariant) {
        return 'New Variant Info';
    } else if (isClone) {
        return 'New Clone Info';
    } else if (isNewProduct) {
        return 'New Product Info';
    } else {
        return 'Edit Product Info';
    }
}

const ProductInfoHeader = (props) => {

    const router = useRouter();
    const dispatch = useDispatch();
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const {isNewProduct, isNewVariant, isClone, productInfoFormRef, resetWorkflow} = useContext(ProductWorkflowContext);
    const {productId: editingProductId} = useSelector(state => state.editProduct);

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
            {isNewProduct ?
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
            </Pressable> :
                (
                    <Button
                        onPressIn={() => {
                                // reset redux new product to empty
                                dispatch(resetEditProduct());
                                resetWorkflow();
                                router.replace(`/Main/(tabs)/Products/${editingProductId}`);
                        }}
                        mode={'outlined'}
                        style={{borderColor: theme.colors.error, color: theme.colors.error}}
                        labelStyle={{color: theme.colors.error}}
                    >
                        Discard
                    </Button>
                )
            }
            <Text variant={"titleLarge"} style={{ color: "black" }}>
                {headerTitle(isNewProduct, isNewVariant, isClone)}
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