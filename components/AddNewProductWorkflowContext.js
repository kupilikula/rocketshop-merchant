import React, {createContext, useRef, useState} from "react";

export const AddNewProductWorkflowContext = createContext();

export const AddNewProductWorkflowProvider = ({ children }) => {
    const productInfoFormRef = useRef();
    const productPreviewPublishRef = useRef();
    const [isPublishing, setIsPublishing] = useState(false);
    const [published, setPublished] = useState(false);
    const [publishFailure, setPublishFailure] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isMediaSelected, setIsMediaSelected] = useState(false);
    const [mediaGalleryKey, setMediaGalleryKey] = useState(0);

    return (
        <AddNewProductWorkflowContext.Provider
            value={{
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
                setMediaGalleryKey
            }}
        >
            {children}
        </AddNewProductWorkflowContext.Provider>
    );
};