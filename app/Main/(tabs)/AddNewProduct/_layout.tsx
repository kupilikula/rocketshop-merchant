import { Stack } from "expo-router";
import ProductInfoHeader from '../../../../components/ProductInfoHeader';
import {useRef, useState} from "react";
import {ProductInfoFormRefProvider, useProductInfoFormRef} from '@/components/ProductInfoFormRefContext';
import {MediaSelectionProvider} from '@/components/MediaSelectionContext';
import MediaHeader from '@/components/MediaHeader';
import {ProductPreviewPublishRefProvider} from '@/components/ProductPreviewPublishRefContext';
import PreviewHeader from '@/components/PreviewHeader';

export default function AddNewProductStack() {
    return (
        <ProductPreviewPublishRefProvider>
        <MediaSelectionProvider>
        <ProductInfoFormRefProvider>
    <Stack initialRouteName={"index"}>
      <Stack.Screen name={"index"} options={{ header: () => null }} />
      <Stack.Screen
        name={"AddMediaItems"}
        options={{
          title: "Product Media",
            header: () => <MediaHeader />
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
            name={"Preview"}
            options={{
                title: "Preview",
                header: () => <PreviewHeader/>
            }}
        />
    </Stack>
        </ProductInfoFormRefProvider>
        </MediaSelectionProvider>
        </ProductPreviewPublishRefProvider>
  );
}
