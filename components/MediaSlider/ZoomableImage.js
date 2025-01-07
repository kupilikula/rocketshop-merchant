import React, { useEffect, useRef, useState } from "react";
import {
  PixelRatio,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {
  PanGestureHandler,
  PinchGestureHandler,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { Fontisto } from "@expo/vector-icons";
import { Colors } from "../../styles/Colors";
import { runOnJS } from "react-native-reanimated";
import {useTheme} from "react-native-paper";


// const { width, height } = Dimensions.get('window');
const pixelRatio = PixelRatio.get(); // Get the device's pixel density

export default function ZoomableImage({ source, size, simultaneousHandlers, onZoomAndPanEnd }) {

  const theme = useTheme();
  // Shared values for scale and translation
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // Image dimensions
  const [imageWidth, setImageWidth] = useState(400);
  const [imageHeight, setImageHeight] = useState(300);

  const lastScale = useRef(1);
  const lastOffset = useRef({ x: 0, y: 0 });

  const [lockFullWidth, setLockFullWidth] = useState(false);
  const [lockFullHeight, setLockFullHeight] = useState(false);

  // Image dimensions onLoad
  const onImageLoad = (event) => {
    const { width: imgWidth, height: imgHeight } = event.nativeEvent.source;
    setImageWidth(imgWidth / pixelRatio);
    setImageHeight(imgHeight / pixelRatio);
  };

  // Pinch Gesture Handler to manage zoom (scale)
  const pinchGestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startScale = scale.value;
    },
    onActive: (event, context) => {
      if (!lockFullHeight && !lockFullWidth) {
        let newScaleValue = context.startScale * event.scale;
        let newScaledImageWidth = size.width * newScaleValue;
        let newScaledImageHeight =
          size.width * (imageHeight / imageWidth) * newScaleValue; // Preserve aspect ratio
        console.log(
          "cSV:",
          context.startScale,
          " ,nSV:",
          newScaleValue,
          " , nsIW:",
          newScaledImageWidth,
          " , nsIH:",
          newScaledImageHeight,
        );
        if (
          newScaledImageWidth < size.width &&
          newScaledImageHeight < size.height
        ) {
          let A = [
            Math.abs(Math.log(newScaleValue)),
            Math.abs(
              Math.log(
                (imageWidth / size.width) * (size.height / imageHeight),
              ) - Math.log(newScaleValue),
            ),
          ];
          let A_index = A.indexOf(Math.min(...A));
          console.log("A:", A);
          console.log("A_i:", A_index);
          let limitedScaleValue =
            A_index === 0
              ? 1
              : (imageWidth / size.width) * (size.height / imageHeight);
          console.log("lSV:", limitedScaleValue);
          scale.value = limitedScaleValue;
        } else {
          scale.value = newScaleValue; // Apply scaling
        }
      }
    },
    onEnd: () => {
      lastScale.current = scale.value;
      if (onZoomAndPanEnd) {
        runOnJS(onZoomAndPanEnd)(scale.value, {x: translateX.value, y: translateY.value}); // Pass scale and offset
      }
    },
  });

  // Pan Gesture Handler to manage dragging (translateX, translateY)
  const panGestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startX = translateX.value;
      context.startY = translateY.value;
    },
    onActive: (event, context) => {
      // Compute scaled image dimensions in container units
      const scaledImageWidth = size.width * scale.value;
      const scaledImageHeight =
        size.width * (imageHeight / imageWidth) * scale.value; // Preserve aspect ratio

      // Compute max translations
      const maxTranslateX = Math.max(
        0,
        (scaledImageWidth - size.width) / (2 * scale.value),
      );
      const maxTranslateY = Math.max(
        0,
        (scaledImageHeight - size.height) / (2 * scale.value),
      );

      // Compute new translations
      let newTranslateX = context.startX + event.translationX;
      let newTranslateY = context.startY + event.translationY;

      // Clamp translations to within boundaries
      if (!lockFullWidth) {
        newTranslateX = Math.min(
          Math.max(newTranslateX, -maxTranslateX),
          maxTranslateX,
        );
        translateX.value = newTranslateX;
      }
      if (!lockFullHeight) {
        newTranslateY = Math.min(
          Math.max(newTranslateY, -maxTranslateY),
          maxTranslateY,
        );
        translateY.value = newTranslateY;
      }
      // Apply translations
    },
    onEnd: () => {
      lastOffset.current = { x: translateX.value, y: translateY.value };
      if (onZoomAndPanEnd) {
        runOnJS(onZoomAndPanEnd)(scale.value, {x: translateX.value, y: translateY.value}); // Pass scale and offset
      }
    },
  });

  // Animated styles based on shared values
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value }, // Apply translation first
        { translateY: translateY.value }, // Apply vertical translation
        { scale: scale.value },           // Apply scaling after translation
      ],
    };
  });

  // Center the image initially when it loads by setting translateY and translateX to zero
  useEffect(() => {
    translateX.value = 0;
    translateY.value = 0;
  }, []);

  const onLockFullWidthToggled = () => {
    if (!lockFullWidth) {
      scale.value = 1;
      translateX.value = 0; // Reset the horizontal translation
      if (onZoomAndPanEnd) {
        runOnJS(onZoomAndPanEnd)(scale.value, {x: translateX.value, y: translateY.value}); // Pass scale and offset
      }
      setLockFullWidth(true);
    } else {
      setLockFullWidth(false);
    }
  };

  // Function to reset the image to the full height of the container
  const onLockFullHeightToggled = () => {
    if (!lockFullHeight) {
      const scaleFactor =
        (imageWidth / size.width) * (size.height / imageHeight); // Calculate scale to fit the height
      scale.value = scaleFactor;
      translateY.value = 0; // Reset the vertical translation
      if (onZoomAndPanEnd) {
        runOnJS(onZoomAndPanEnd)(scale.value, {x: translateX.value, y: translateY.value}); // Pass scale and offset
      }
      setLockFullHeight(true);
    } else {
      setLockFullHeight(false);
    }
    // translateX.value = (size.width - imageWidth*scaleFactor) / 2; // Center the image horizontally
  };

  return (
    <View
      style={{ ...styles.container, width: size.width, height: size.height }}
    >
      <PanGestureHandler
        onGestureEvent={panGestureHandler}
        simultaneousHandlers={[pinchGestureHandler, ...simultaneousHandlers]}
        minPointers={1}
        maxPointers={1}
        requireToFail={simultaneousHandlers[0]}
        waitFor={simultaneousHandlers[0]}
      >
        <Animated.View
          style={[styles.imageContainer, animatedStyle]}
          pointerEvents="box-none"
          onTouchStart={(e) => {
            // e.stopPropagation(); // Explicitly allow touch propagation
            // console.log('Animated.View touch detected');
          }}
          onResponderGrant={() => console.log("Animated.View onResponderGrant")}
          onResponderRelease={() =>
            console.log("Animated.View onResponderRelease")
          }
        >
          <PinchGestureHandler
            onGestureEvent={pinchGestureHandler}
            simultaneousHandlers={[panGestureHandler, ...simultaneousHandlers]}
            minPointers={2}
            maxPointers={2}
            requireToFail={simultaneousHandlers[0]}
            waitFor={simultaneousHandlers[0]}
          >
            <Animated.Image
              source={{ uri: source }}
              onLoad={onImageLoad}
              style={{
                width: size.width,
                height: (imageHeight / imageWidth) * size.width,
                // height: size.height,
                // height: 200, // Ensuring it uses full height
                resizeMode: "contain", // To scale without cropping
              }}
              pointerEvents="auto"
            />
          </PinchGestureHandler>
        </Animated.View>
      </PanGestureHandler>
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 5,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <TouchableWithoutFeedback onPress={onLockFullHeightToggled}>
          <View
            style={{
              // width: 40,
              // height: 60,
              paddingVertical: 8,
              marginRight: 5,
              borderRadius: 8,
              backgroundColor: lockFullHeight ? theme.colors.icon : "black",
              opacity: lockFullHeight ? 0.8 : 0.5,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Fontisto name="arrow-v" color="white" size={36} />
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={onLockFullWidthToggled}>
          <View
            style={{
              // width: 60,
              // height: 40,
              paddingHorizontal: 8,
              borderRadius: 8,
              backgroundColor: lockFullWidth ? theme.colors.icon : "black",
              opacity: lockFullWidth ? 0.8 : 0.5,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {/*<MaterialIcons name={'lock'} size={36}/>*/}
            <Fontisto name="arrow-h" color="white" size={36} />
          </View>
        </TouchableWithoutFeedback>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black", // Optional, just to ensure visibility if image doesn't take full space
    padding: 0,
    // width: 400,
    // height: 300,
    // width: '100%',
    // height: '100%'
  },
  imageContainer: {
    // flex: 1,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
    padding: 0,
    margin: 0,
  },
});
