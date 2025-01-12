import React, {useEffect} from "react";
import { StyleSheet, Pressable, View } from "react-native";
import {Image} from 'expo-image';
import { useVideoPlayer, VideoView } from "expo-video";
import { useEvent } from "expo";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import ZoomableImage from "./ZoomableImage";
export default function MediaItem({
  item,
  orientation,
  index,
  numberOfItems,
  local,
  width,
  height,
  allowPanZoom,
    onZoomAndPanEnd,
  simultaneousHandlers,
  showScrollButtons,
  scrollToIndex,
}) {
  // Initialize video player and event hook unconditionally
  const videoPlayer = item.mediaType === "video" && item.uri
      ? useVideoPlayer(item.uri)
      : null;

  useEffect(() => {
    return () => {
      if (videoPlayer) {
        videoPlayer.dispose(); // Ensure player cleanup
      }
    };
  }, [videoPlayer]);

  // Hook into videoPlayer events only if it exists
  const { isPlaying } = videoPlayer ? useEvent(videoPlayer, "playingChange", {
    isPlaying: videoPlayer?.playing || false,
  }) : { isPlaying: false };


  const playVideo = () => {
    if (item.mediaType === "video") {
      if (!isPlaying && !(videoPlayer.currentTime > 0)) {
        videoPlayer.play();
      }
    }
  };
  // console.log('nI:', numberOfItems);
  // console.log('I:', index);
  const scale = item.scale || 1; // Default to 1 if not present
  const offset = item.offset || { x: 0, y: 0 }; // Default to {x: 0, y: 0} if not present
  if (!item.width) {
    item.width = width;
  }
  if (!item.height) {
    item.height = height;
  }

  return (
    <View
      style={{
        position: "relative",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {index < numberOfItems - 1 && (
        <View
          style={{
            position: "absolute",
            right: 10,
            zIndex: 100,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Pressable
            onPress={() => {
              console.log("scrolling to index:", index + 1);
              scrollToIndex(index + 1);
            }}
          >
            <MaterialIcons
              name={"arrow-forward-ios"}
              size={40}
              color={"white"}
            />
          </Pressable>
        </View>
      )}
      {index > 0 && (
        <View
          style={{
            position: "absolute",
            left: 10,
            zIndex: 100,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Pressable onPress={() => scrollToIndex(index - 1)}>
            <MaterialIcons name={"arrow-back-ios"} size={40} color={"white"} />
          </Pressable>
        </View>
      )}

      <View style={styles.container}>
        <View style={{ width: width, height: height, overflow: 'hidden', backgroundColor: 'black'}}>
          {item.mediaType === "image" ? (
            !allowPanZoom ? (
              <Image
                style={{
                  position: "absolute", // Ensure the image is positioned absolutely within the container
                  width: width*scale, // Scale the width dynamically
                  // aspectRatio: '1.33',
                  height: item.height*width*scale/item.width, // Scale the height dynamically
                  left: width*(1-scale)/2 + offset.x,
                  top: (height - (item.height *scale/ item.width) * width)/2 + offset.y,
                }}
                source={local ? item.uri : { uri: item.uri }}
                cachePolicy="memory-disk" // Options: 'memory', 'disk', or 'none'
                  resizeMode={'cover'}
              />
            ) : (
              <ZoomableImage
                source={item.uri}
                size={{ width: width, height: height }}
                simultaneousHandlers={simultaneousHandlers}
                onZoomAndPanEnd={(scale, offset) =>
                    onZoomAndPanEnd(item.mediaId, scale, offset)
                }
              />
            )
          ) : (
            <Pressable onPress={() => playVideo()}>
              {isPlaying ||
              videoPlayer.currentTime > 0 ||
              !item["thumbnail"] ? (
                <VideoView
                  contentFit={"contain"}
                  style={{
                    width: "100%",
                    height: "100%",
                    alignSelf: "center",
                    marginVertical: "auto",
                  }}
                  player={videoPlayer}
                  allowsFullscreen
                  allowsPictureInPicture
                  nativeControls={true}
                />
              ) : (
                <View
                  style={{
                    display: "flex",
                    position: "relative",
                    justifyContent: "center",
                    alignItems: "center",
                    width: width,
                    height: height,
                  }}
                >
                  <MaterialIcons
                    name={"play-circle"}
                    size={50}
                    color={"white"}
                    style={{
                      opacity: 0.8,
                      position: "absolute",
                      zIndex: 10,
                      padding: 0,
                      margin: 0,
                    }}
                  />
                  <Image
                    source={{ uri: item.thumbnail }}
                    style={{
                      width: width,
                      aspectRatio: orientation === "landscape" ? "1.33" : "0.8",
                    }}
                  />
                </View>
              )}
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { margin: 0, padding: 0 },
  image: {},
});
