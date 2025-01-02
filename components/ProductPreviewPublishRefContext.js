import React, { createContext, useRef, useContext } from "react";

const ProductPreviewPublishRefContext = createContext();

export const ProductPreviewPublishRefProvider = ({ children }) => {
    const productInfoFormRef = useRef();
    return (
        <ProductPreviewPublishRefContext.Provider value={productInfoFormRef}>
            {children}
        </ProductPreviewPublishRefContext.Provider>
    );
};

export const useProductPreviewPublishRef = () => useContext(ProductPreviewPublishRefContext);