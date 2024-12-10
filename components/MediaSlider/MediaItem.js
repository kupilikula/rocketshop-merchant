import React from 'react';
import {Image, StyleSheet, Pressable, View} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import {useEvent} from "expo";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
;
export default function MediaItem ({
                                 item,
                                 orientation,
                                 index,
                                 local,
                                 width
                             }) {

    let videoPlayer;
    let isPlaying;
    if (item.mediaType==='video') {
        videoPlayer = useVideoPlayer(item['uri'], player => {
            // player.loop = true;
            // player.play();
        });
        ({isPlaying} = useEvent(videoPlayer, 'playingChange', { isPlaying: videoPlayer.playing }));
    }

    const onPress = (item) => {
        if (item.mediaType==='video') {
            if (!isPlaying && !(videoPlayer.currentTime > 0)) {
                videoPlayer.play()
            }
        }
    }

    return (
        <Pressable style={styles.container} onPress={() => onPress(item)}>
            {item.mediaType==='image' ?
            (<Image
                style={{width: width, aspectRatio: orientation==='landscape' ? '1.33' : '0.8'}}
                source={local ? item.uri : {uri: item.uri}}
            />) :
                ( (isPlaying || videoPlayer.currentTime > 0 || !item['thumbnail']) ?
                <VideoView contentFit={'contain'}
                           style={{width: width, aspectRatio: orientation === 'landscape' ? '1.78' : '0.8', alignSelf: 'center', marginVertical: 'auto'}}
                           player={videoPlayer} allowsFullscreen allowsPictureInPicture nativeControls={true}/> :
                        <View style={{display: 'flex', position: 'relative', flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                            <MaterialIcons name={'play-circle'} size={50} color={'white'}
                                           style={{opacity: 0.8, position: 'absolute', zIndex: 10, padding: 0, margin: 0}}/>
                            <Image source={{uri: item.thumbnail}} style={{width: width, aspectRatio: orientation==='landscape' ? '1.33' : '0.8'}} />
                        </View>
                )
            }
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {margin: 0, padding: 0},
    image: {},
});