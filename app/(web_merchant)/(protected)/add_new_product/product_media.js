import MediaGalleryWeb from "../../../../components/MediaGalleryWeb";
import {useContext, useEffect} from "react";
import {ProductWorkflowContext} from "../../../../components/ProductWorkflowContext";

export default function AddMediaItemsWeb() {
    const {mediaGalleryKey} = useContext(ProductWorkflowContext);


    useEffect(() => {
        console.log("Mounted AddMediaItemsWeb!!");
        return () => {
            console.log("AddMediaItemsWeb Unmounted!!!");
        };
    }, []);

    return <MediaGalleryWeb key ={mediaGalleryKey}/>;
}
