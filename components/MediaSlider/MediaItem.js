import React from "react";
import { Image, StyleSheet, Pressable, View } from "react-native";
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
  simultaneousHandlers,
  showScrollButtons,
  scrollToIndex,
}) {
  console.log("index:", index, " , item:", item);

  // Initialize video player and event hook unconditionally
  const videoPlayer = useVideoPlayer(
    item.mediaType === "video" ? item.uri : null,
    (player) => {
      // Optional setup for the player
    },
  );

  const { isPlaying } = useEvent(videoPlayer, "playingChange", {
    isPlaying: videoPlayer ? videoPlayer.playing : false,
  });

  const playVideo = () => {
    if (item.mediaType === "video") {
      if (!isPlaying && !(videoPlayer.currentTime > 0)) {
        videoPlayer.play();
      }
    }
  };
  // console.log('nI:', numberOfItems);
  // console.log('I:', index);

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
        <View style={{ width: width, height: height }}>
          {item.mediaType === "image" ? (
            !allowPanZoom ? (
              <Image
                style={{
                  width: "100%",
                  aspectRatio: orientation === "landscape" ? "1.33" : "0.8",
                }}
                source={local ? item.uri : { uri: item.uri }}
              />
            ) : (
              <ZoomableImage
                source={item.uri}
                size={{ width: width, height: height }}
                simultaneousHandlers={simultaneousHandlers}
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
