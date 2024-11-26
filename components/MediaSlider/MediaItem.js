import React from 'react';
import {Image, StyleSheet, Pressable} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
;
export default function MediaItem ({
                                 mediaType,
                                 item,
                                 onPress,
                                 index,
                                 imageKey,
                                 local,
                                 orientation,
                                 width
                             }) {

    let videoPlayer;
    if (mediaType==='video') {
        videoPlayer = useVideoPlayer(item['video'], player => {
            player.loop = true;
            // player.play();
        });
    }


    return (
        <Pressable
            style={styles.container}
            onPress={() => onPress(index)}>
            {mediaType==='image' ?
            (<Image
                style={{width: width, aspectRatio: orientation==='landscape' ? '1.33' : '0.8', resizeMode: 'stretch'}}
                source={local ? item[imageKey] : {uri: item[imageKey]}}
            />) :
                <VideoView contentFit={'contain'} style={{width: width, aspectRatio: orientation==='landscape' ? '1.5' : '0.8'}} player={videoPlayer} allowsFullscreen allowsPictureInPicture />
            }
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {margin: 0, padding: 0},
    image: {
        resizeMode: 'stretch',
    },
});