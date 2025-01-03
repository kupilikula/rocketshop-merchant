import MediaGallery from "../../../../components/MediaGallery";
import {useLocalSearchParams, useRouter} from "expo-router";
import {useContext, useEffect} from "react";
import {AddNewProductWorkflowContext} from "../../../../components/AddNewProductWorkflowContext";
import {useSelector} from "react-redux";

export default function AddMediaItems() {
  const params = useLocalSearchParams();
  const {mediaGalleryKey} = useContext(AddNewProductWorkflowContext);


  useEffect(() => {
    console.log("Mounted AddMediaItems!!");
    return () => {
      console.log("AddMediaItems Unmounted!!!");
    };
  }, []);

  console.log("params:", params);
  return <MediaGallery key ={mediaGalleryKey}/>;
}
