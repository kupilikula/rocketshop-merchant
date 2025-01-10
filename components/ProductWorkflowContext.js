import React, {createContext, useRef, useState} from "react";

export const ProductWorkflowContext = createContext();

export const ProductWorkflowProvider = ({ children }) => {
    const productInfoFormRef = useRef();
    const productPreviewPublishRef = useRef();
    const [isNewProduct, setIsNewProduct] = useState(true);
    const [isNewVariant, setIsNewVariant] = useState(false);
    const [isClone, setIsClone] = useState(false);
    const [useSameMediaForClone, setUseSameMediaForClone] = useState(false);
    const [variantInfo, setVariantInfo] = useState({});
    const [isPublishing, setIsPublishing] = useState(false);
    const [published, setPublished] = useState(false);
    const [publishFailure, setPublishFailure] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isMediaSelected, setIsMediaSelected] = useState(false);
    const [mediaGalleryKey, setMediaGalleryKey] = useState(0);

    const resetWorkflow = () =>
    {
        setIsNewProduct(true);
        setIsNewVariant(false);
        setIsClone(false);
        setUseSameMediaForClone(false);
        setVariantInfo({});
        setIsPublishing(false);
        setPublished(false);
        setPublishFailure(false);
        setIsCameraOpen(false);
        setIsMediaSelected(false);
        setMediaGalleryKey(0);
    }

    return (
        <ProductWorkflowContext.Provider
            value={{
                isNewProduct,
                setIsNewProduct,
                isNewVariant,
                setIsNewVariant,
                isClone,
                setIsClone,
                useSameMediaForClone,
                setUseSameMediaForClone,
                variantInfo,
                setVariantInfo,
                isCameraOpen,
                setIsCameraOpen,
                isMediaSelected,
                setIsMediaSelected,
                isPublishing,
                setIsPublishing,
                published,
                setPublished,
                publishFailure,
                setPublishFailure,
                productInfoFormRef,
                productPreviewPublishRef,
                mediaGalleryKey,
                setMediaGalleryKey,
                resetWorkflow
            }}
        >
            {children}
        </ProductWorkflowContext.Provider>
    );
};