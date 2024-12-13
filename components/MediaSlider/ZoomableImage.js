import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Image,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Pressable,
    PixelRatio,
    TouchableWithoutFeedback
} from 'react-native';
import { PinchGestureHandler, PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, useAnimatedGestureHandler } from 'react-native-reanimated';
import {Fontisto} from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";


// const { width, height } = Dimensions.get('window');
const pixelRatio = PixelRatio.get(); // Get the device's pixel density

export default function ZoomableImage({ source, size, simultaneousHandlers }) {
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
                scale.value = context.startScale * event.scale;  // Apply scaling
            }

        },
        onEnd: () => {
            lastScale.current = scale.value;
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
            const scaledImageHeight = size.width * (imageHeight / imageWidth) * scale.value; // Preserve aspect ratio

            // Compute max translations
            const maxTranslateX = Math.max(0, (scaledImageWidth - size.width) / (2*scale.value));
            const maxTranslateY = Math.max(0, (scaledImageHeight - size.height) / (2*scale.value));

            // Compute new translations
            let newTranslateX = context.startX + event.translationX;
            let newTranslateY = context.startY + event.translationY;

            // Clamp translations to within boundaries
            if (!lockFullWidth) {
                newTranslateX = Math.min(Math.max(newTranslateX, -maxTranslateX), maxTranslateX);
                translateX.value = newTranslateX;
            }
            if (!lockFullHeight) {

                newTranslateY = Math.min(Math.max(newTranslateY, -maxTranslateY), maxTranslateY);
                console.log('mTY:', maxTranslateY, ' , nTY:', newTranslateY, ', s.v:', scale.value, ' ,sIH:', scaledImageHeight, ' , sH:', size.height);
                translateY.value = newTranslateY;
            }
            // Apply translations


            },
        onEnd: () => {
            lastOffset.current = { x: translateX.value, y: translateY.value };
        },
    });

    // Animated styles based on shared values
    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { scale: scale.value },
                { translateX: translateX.value },
                { translateY: translateY.value },
            ],
        };
    });

    // Center the image initially when it loads by setting translateY and translateX to zero
    useEffect(() => {
        translateX.value = 0;
        translateY.value = 0;
    }, []);

    // Adjusting the image to fit correctly within the screen's bounds
    const imageContainerStyle = useAnimatedStyle(() => {
        const screenAspectRatio = size.width / size.height;
        const imageAspectRatio = imageWidth / imageHeight;

        // Calculate the initial offset
        let initialTranslateY = 0;
        if (imageAspectRatio < screenAspectRatio) {
            // Image is taller than the screen
            initialTranslateY = (size.height - (size.width / imageAspectRatio)) / 2;
        }

        return {
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: initialTranslateY, // This centers the image vertically if needed
        };
    });

    const onLockFullWidthToggled = () => {
        if (!lockFullWidth) {
            scale.value = 1;
            translateX.value = 0; // Reset the horizontal translation
            setLockFullWidth(true);
        } else {
            setLockFullWidth(false);
        }

        // translateY.value = 150; // Center the image vertically
    };

    // Function to reset the image to the full height of the container
    const onLockFullHeightToggled = () => {

        if (!lockFullHeight) {
            const scaleFactor = (imageWidth/size.width)*(size.height / imageHeight); // Calculate scale to fit the height
            scale.value = scaleFactor;
            translateY.value = 0; // Reset the vertical translation
            setLockFullHeight(true);
        } else{
            setLockFullHeight(false);
        }
        // translateX.value = (size.width - imageWidth*scaleFactor) / 2; // Center the image horizontally
    };

    return (
        <View style={{...styles.container, width: size.width, height: size.height, borderWidth: 2, borderStyle: 'solid'}}>
            <GestureHandlerRootView style={{ flex: 1, backgroundColor: 'yellow', position: 'relative'}}>
                {/* Pan Gesture Handler */}
                <PanGestureHandler onGestureEvent={panGestureHandler}
                                   simultaneousHandlers={[pinchGestureHandler, simultaneousHandlers]}
                                   minPointers={1}
                                   maxPointers={1}
                >
                    <Animated.View style={[styles.imageContainer, animatedStyle]}>
                        {/* Pinch Gesture Handler */}
                        <PinchGestureHandler onGestureEvent={pinchGestureHandler}
                                             simultaneousHandlers={simultaneousHandlers}
                                             minPointers={2}
                                             maxPointers={2}
                        >
                            <Animated.Image
                                source={{ uri: source }}
                                onLoad={onImageLoad}
                                style={{
                                    width: size.width,
                                    height: (imageHeight/imageWidth)*size.width,
                                    // height: size.height,
                                    // height: 200, // Ensuring it uses full height
                                    resizeMode: 'contain', // To scale without cropping
                                }}
                            />
                        </PinchGestureHandler>
                    </Animated.View>
                </PanGestureHandler>
                {/* Reset Buttons */}
            </GestureHandlerRootView>
            <View style={{position: 'absolute', bottom: 0, left: 5, display: 'flex', flexDirection:'row', alignItems: 'center'}}>
                <TouchableWithoutFeedback onPress={onLockFullWidthToggled}>
                    <View style={{width:40, height:60, marginRight: 5, borderRadius: 15, backgroundColor: lockFullWidth ? 'blue' : 'black', opacity: lockFullWidth ? 1 : 0.5, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        <Fontisto name="arrow-v" color="white" size={40} />
                    </View>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPress={onLockFullHeightToggled} >
                    <View style={{width:60, height:40, borderRadius: 15, backgroundColor: lockFullHeight ? 'blue' : 'black', opacity: lockFullHeight ? 1 : 0.5, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        {/*<MaterialIcons name={'lock'} size={36}/>*/}
                        <Fontisto name="arrow-h" color="white" size={40} />
                    </View>
                </TouchableWithoutFeedback>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'red', // Optional, just to ensure visibility if image doesn't take full space
        padding: 0,
        // width: 400,
        // height: 300,
        // width: '100%',
        // height: '100%'
    },
    imageContainer: {
        flex: 1,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'green',
        padding: 0,
        margin: 0,
    },
});
