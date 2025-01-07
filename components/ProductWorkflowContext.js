import React, {createContext, useRef, useState} from "react";

export const ProductWorkflowContext = createContext();

export const ProductWorkflowProvider = ({ children }) => {
    const productInfoFormRef = useRef();
    const productPreviewPublishRef = useRef();
    const [isNewProduct, setIsNewProduct] = useState(true);
    const [isPublishing, setIsPublishing] = useState(false);
    const [published, setPublished] = useState(false);
    const [publishFailure, setPublishFailure] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isMediaSelected, setIsMediaSelected] = useState(false);
    const [mediaGalleryKey, setMediaGalleryKey] = useState(0);

    const resetWorkflow = () =>
    {
        setIsNewProduct(true);
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