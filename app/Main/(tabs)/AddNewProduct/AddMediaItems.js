import MediaGallery from "../../../../components/MediaGallery";
import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";

export default function AddMediaItems() {
  const params = useLocalSearchParams();
  useEffect(() => {
    console.log("Mounted AddMediaItems!!");
    return () => {
      console.log("AddMediaItems Unmounted!!!");
    };
  }, []);

  console.log("params:", params);
  return <MediaGallery />;
}
