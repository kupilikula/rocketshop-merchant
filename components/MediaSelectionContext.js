import React, { createContext, useState } from "react";

export const MediaSelectionContext = createContext();

export const MediaSelectionProvider = ({ children }) => {
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isMediaSelected, setIsMediaSelected] = useState(false);

    return (
        <MediaSelectionContext.Provider
            value={{
                isCameraOpen,
                setIsCameraOpen,
                isMediaSelected,
                setIsMediaSelected,
            }}
        >
            {children}
        </MediaSelectionContext.Provider>
    );
};