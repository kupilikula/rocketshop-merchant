import React, { createContext, useRef, useContext } from "react";

const ProductInfoFormRefContext = createContext();

export const ProductInfoFormRefProvider = ({ children }) => {
    const productInfoFormRef = useRef();
    return (
        <ProductInfoFormRefContext.Provider value={productInfoFormRef}>
            {children}
        </ProductInfoFormRefContext.Provider>
    );
};

export const useProductInfoFormRef = () => useContext(ProductInfoFormRefContext);