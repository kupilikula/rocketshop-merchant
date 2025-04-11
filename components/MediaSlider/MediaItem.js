import React, { useEffect, useState } from "react";
import { StyleSheet, Pressable, View } from "react-native";
import { Image } from "expo-image";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEvent } from "expo";
import * as FileSystem from "expo-file-system";
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
    const [isTapped, setIsTapped] = useState(false);
    const [playableUri, setPlayableUri] = useState(null);

    useEffect(() => {
        const preparePlayableUri = async () => {
            if (item.mediaType !== "video") return;

            const isLocalFile = item.uri?.startsWith("file://");

            if (isLocalFile) {
                try {
                    const filename = encodeURIComponent(item.uri);
                    const destPath = FileSystem.cacheDirectory + filename + ".mov";
                    const fileInfo = await FileSystem.getInfoAsync(destPath);

                    if (!fileInfo.exists) {
                        await FileSystem.copyAsync({ from: item.uri, to: destPath });
                    }

                    setPlayableUri(destPath);
                } catch (err) {
                    console.error("Error caching local video:", err);
                    setPlayableUri(item.uri); // fallback
                }
            } else {
                setPlayableUri(item.uri); // remote URL, use directly
            }
        };

        preparePlayableUri();
    }, [item]);

    const videoPlayer = useVideoPlayer(item.mediaType === "video" ? playableUri : undefined);

    const { isPlaying } = videoPlayer
        ? useEvent(videoPlayer, "playingChange", {
            isPlaying: videoPlayer?.playing || false,
        })
        : { isPlaying: false };

    const playVideo = () => {
        if (item.mediaType === "video") {
            setIsTapped(true);
            if (!isPlaying && !(videoPlayer.currentTime > 0)) {
                videoPlayer.play();
            }
        }
    };

    const scale = item.scale || 1;
    const offset = item.offset || { x: 0, y: 0 };
    if (!item.width) item.width = width;
    if (!item.height) item.height = height;

    return (
        <View style={{ position: "relative", justifyContent: "center", alignItems: "center" }}>
            {index < numberOfItems - 1 && (
                <View style={{ position: "absolute", right: 10, zIndex: 100, justifyContent: "center", alignItems: "center" }}>
                    <Pressable onPress={() => scrollToIndex(index + 1)}>
                        <MaterialIcons name={"arrow-forward-ios"} size={40} color={"white"} />
                    </Pressable>
                </View>
            )}
            {index > 0 && (
                <View style={{ position: "absolute", left: 10, zIndex: 100, justifyContent: "center", alignItems: "center" }}>
                    <Pressable onPress={() => scrollToIndex(index - 1)}>
                        <MaterialIcons name={"arrow-back-ios"} size={40} color={"white"} />
                    </Pressable>
                </View>
            )}

            <View style={styles.container}>
                <View style={{ width, height, overflow: "hidden", backgroundColor: "black" }}>
                    {item.mediaType === "image" ? (
                        !allowPanZoom ? (
                            <Image
                                style={{
                                    position: "absolute",
                                    width: width * scale,
                                    height: (item.height * width * scale) / item.width,
                                    left: (width * (1 - scale)) / 2 + offset.x,
                                    top: (height - (item.height * scale / item.width) * width) / 2 + offset.y,
                                }}
                                source={local ? item.uri : { uri: item.uri }}
                                cachePolicy="memory-disk"
                                resizeMode="cover"
                            />
                        ) : (
                            <ZoomableImage
                                source={item.uri}
                                size={{ width, height }}
                                simultaneousHandlers={simultaneousHandlers}
                                onZoomAndPanEnd={(scale, offset) => onZoomAndPanEnd(item.mediaId, scale, offset)}
                            />
                        )
                    ) : (
                        <Pressable onPress={playVideo}>
                            {isTapped || !item.thumbnail ? (
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
                                        width,
                                        height,
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
                                            width,
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
});