import { Stack } from "expo-router";
import ProductInfoHeader from '../../../../components/ProductInfoHeader';
import MediaHeader from '@/components/MediaHeader';
import PreviewHeader from '@/components/PreviewHeader';
import {ProductWorkflowProvider} from '@/components/ProductWorkflowContext';

export default function EditProductStack() {


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
