import { Stack } from "expo-router";
import ProductInfoHeader from '../../../../components/ProductInfoHeader';
import MediaHeader from '@/components/MediaHeader';
import PreviewHeader from '@/components/PreviewHeader';
import {ProductWorkflowProvider} from '@/components/ProductWorkflowContext';

export default function AddNewProductStack() {


    return (
        // <ProductWorkflowProvider>
        <Stack initialRouteName={"index"}>
            <Stack.Screen name={"index"} options={{ header: () => null }} />
            <Stack.Screen
                name={"product_media"}
                options={{
                    title: "Product Media",
                    header: () => <MediaHeader />,
                }}
            />
            <Stack.Screen
                name={"product_info"}
                options={{
                    title: "Product Info",
                    header: () => <ProductInfoHeader/>
                }}
            />
            <Stack.Screen
                name={"shipping"}
                options={{
                    title: "Shipping",
                    header: () => null,
                    // header: () => <ShippingHeader/>
                }}
            />
            <Stack.Screen
                name={"preview"}
                options={{
                    title: "Preview",
                    header: () => <PreviewHeader/>
                }}
            />
        </Stack>
        // </ProductWorkflowProvider>
    );
}
