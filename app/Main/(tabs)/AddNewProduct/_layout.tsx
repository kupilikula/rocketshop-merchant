import { Stack } from "expo-router";
import ProductInfoHeader from '../../../../components/ProductInfoHeader';
import MediaHeader from '@/components/MediaHeader';
import PreviewHeader from '@/components/PreviewHeader';
import {ProductWorkflowProvider} from '@/components/ProductWorkflowContext';

export default function AddNewProductStack() {


    return (
        <ProductWorkflowProvider>
    <Stack initialRouteName={"index"}>
      <Stack.Screen name={"index"} options={{ header: () => null }} />
      <Stack.Screen
        name={"AddMediaItems"}
        options={{
          title: "Product Media",
            header: () => <MediaHeader />,
        }}
      />
      <Stack.Screen
        name={"AddProductInfo"}
        options={{
          title: "Product Info",
            header: () => <ProductInfoHeader/>
        }}
      />
        <Stack.Screen
            name={"Shipping"}
            options={{
                title: "Shipping",
                header: () => null,
                // header: () => <ShippingHeader/>
            }}
        />
        <Stack.Screen
            name={"Preview"}
            options={{
                title: "Preview",
                header: () => <PreviewHeader/>
            }}
        />
    </Stack>
        </ProductWorkflowProvider>
  );
}
