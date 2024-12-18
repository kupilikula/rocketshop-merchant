import MediaGallery from "../../../../components/MediaGallery";
import {useLocalSearchParams} from "expo-router";

export default function AddMediaItems () {

        const params = useLocalSearchParams();
        console.log('params:', params);
        return <MediaGallery/>
    }