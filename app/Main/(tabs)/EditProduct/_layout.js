import {Stack, useRouter} from "expo-router";
import ProductInfoHeader from '../../../../components/ProductInfoHeader';
import MediaHeader from '@/components/MediaHeader';
import PreviewHeader from '@/components/PreviewHeader';
import {ProductWorkflowProvider} from '@/components/ProductWorkflowContext';
import GenericHeader from "@/components/GenericHeader";
import {Pressable} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";

export default function EditProductStack() {

    const router = useRouter();

    return (
        <ProductWorkflowProvider>
    <Stack initialRouteName={"index"}>
      <Stack.Screen name={"index"} options={{ header: () => null }} />
      <Stack.Screen
        name={"EditProductInfo"}
        options={{
          title: "Product Info",
            header: () => <ProductInfoHeader/>
        }}
      />
        <Stack.Screen
            name={"EditShipping"}
            options={{
                title: "Edit Shipping",
                header: () => <GenericHeader title={'Edit Shipping'} right={<Pressable onPressIn={()=> router.push('/Main/(tabs)/EditProduct/EditPreview')}>
                    <MaterialIcons
                        name={"arrow-forward"}
                        size={36}
                        style={{ color: "black" }}
                    />
                </Pressable>}/>
            }}
        />
        <Stack.Screen
            name={"EditPreview"}
            options={{
                title: "Preview",
                header: () => <PreviewHeader/>
            }}
        />
    </Stack>
        </ProductWorkflowProvider>
  );
}
