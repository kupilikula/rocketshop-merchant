import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    Image,
    Pressable,
    Platform,
    TouchableWithoutFeedback
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import FlatListSlider from "./MediaSlider/FlatListSlider";
import MediaItem from "./MediaSlider/MediaItem";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as VideoThumbnails from "expo-video-thumbnails";
import {Button, Card, Surface} from "react-native-paper";
import {Camera, CameraView, useCameraPermissions} from "expo-camera";
import {Colors} from "../styles/Colors";
import * as FileSystem from 'expo-file-system';  // Import FileSystem
import {Audio} from 'expo-av';
import {gestureHandlerRootHOC, FlatList} from "react-native-gesture-handler";
import { useMemo } from "react";
import GalleryMediaItem from "./GalleryMediaItem";

const  MediaGallery = (props) => {
    const [media, setMedia] = useState([]);
    const [selectedItemsIds, setSelectedItemsIds] = useState([]);
    const [previewMediaItems, setPreviewMediaItems] = useState([]);
    const [orientation, setOrientation] = useState('landscape');
    const [openCamera, setOpenCamera] = useState(false);
    const [cameraMode, setCameraMode] = useState('picture');
    const [isRecording, setIsRecording] = useState(false);
    const [videoElapsedTime, setVideoElapsedTime] = useState(0);

    const [isVideo, setIsVideo] = useState(false);
    const [recordedUri, setRecordedUri] = useState(null);
    const videoUriRef = useRef(null);  // Use a ref to store video URI
    const [thumbnails, setThumbnails] = useState({});
    const [facing, setFacing] = useState('back');
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef(null);
    const [newAssetCounter, setNewAssetCounter] = useState(0);
    // const [newPhotoTaken, setNewPhotoTaken] = useState(false);
    const [newAsset, setNewAsset] = useState(null);
    // const [refreshMediaGalleryTimeStamp, setRefreshMediaGalleryTimeStamp] = useState(true);
    // const [isGalleryScrolling, setIsGalleryScrolling] = useState(false);
    const isGalleryScrollingRef = useRef(false); // Ref for synchronous scrolling state

    const scrollTimeoutRef = useRef(null);
    const previewFlatListSliderRef = useRef();
    const libraryFlatListRef = useRef();
    const timerRef = useRef(null);


    function toggleCameraFacing() {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    }

    const savePhotoToGallery = async (photoUri) => {
        let asset;
        try {
         asset =  await MediaLibrary.createAssetAsync(photoUri);
            setNewAssetCounter(newAssetCounter+1);
        } catch (err) {
            console.log('Error creating asset:', err);
        }

        return asset;
    };

    const generateThumbnails = async (assets) => {
        console.log('generate:', assets.length);
        if (assets.length>0) {
            const thumbnailMap = {};
            for (const asset of assets) {
                try {
                    const {uri} = await VideoThumbnails.getThumbnailAsync(asset.uri, {
                        time: 1000, // Extract frame at 1 second
                    });
                    thumbnailMap[asset.id] = uri;
                } catch (e) {
                    console.error(`Failed to generate thumbnail for ${asset.uri}:`, e);
                }
            }
            // console.log('t:', thumbnails.current);
            // console.log('T:', {...thumbnails.current, ...thumbnailMap});
            // thumbnails.current = {...thumbnails.current, ...thumbnailMap};
            setThumbnails({...thumbnails, ...thumbnailMap});
        }
    };

    useEffect(() => {
        const getMedia = async () => {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                alert('Permission to access media library is required!');
                return;
            }

            const mediaItems = await MediaLibrary.getAssetsAsync({
                mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
                first: 50, // Limit the number of items fetched
                sortBy: [MediaLibrary.SortBy.creationTime]
            });

            setMedia(mediaItems.assets);
            let newVideos = mediaItems.assets.filter((asset) => asset.mediaType==='video' && !Object.keys(thumbnails).includes(asset.id))
            generateThumbnails(newVideos);
        };
        // console.log('r:', props.refreshMediaGalleryTimeStamp);
        getMedia().then(() => {
            if (newAsset) {
                toggleSelection(newAsset);
            }
        });

    }, [newAssetCounter]);


    const toggleSelection = useCallback((item) => {
        setSelectedItemsIds((prev) => {
            if (prev.includes(item.id)) {
                return prev.filter((id) => id !== item.id);
            } else {
                return [...prev, item.id];
            }
        });
    }, []);

    const mediaMap = useMemo(() => {
        return new Map(media.map((item) => [item.id, item]));
    }, [media]);

    const selectedItems = useMemo(() => {
        return selectedItemsIds.map((id) => mediaMap.get(id));
    }, [selectedItemsIds, mediaMap]);

    const transformedItems = useMemo(() => {
        return selectedItems.map((item) => {
            return {
                ...item,
                mediaType: item?.mediaType === "photo" ? "image" : "video",
                orientation,
            };
        });
    }, [selectedItems, orientation]);

    useEffect(() => {
        console.log("useEffect start");
        const start = performance.now();

        // Update the state with the transformed items
        setPreviewMediaItems(transformedItems);

        console.log("useEffect end:", performance.now() - start, "ms");
    }, [transformedItems]);


    // useEffect(() => {
    //     console.log("Updated previewMediaItems:", previewMediaItems);
    // }, [previewMediaItems]);


    useEffect(() => {
        if (selectedItemsIds.length>0) {
            setTimeout(() => {
                previewFlatListSliderRef.current?.scrollToIndex(selectedItemsIds.length-1);
            }, 100)
        }

    }, [selectedItemsIds])


    const closeCamera = () => {
        setVideoElapsedTime(0);
        setOpenCamera(false);
    }

    useEffect(() => {

        const getAudioPermission = async () => {
            if (cameraMode === 'video') {
                const {status} = await Audio.getPermissionsAsync();
                console.log('a:', status);
                if (status !== "granted") {
                    await Audio.requestPermissionsAsync();
                }
            }
        };
        getAudioPermission();
    }, [cameraMode])

    const formatTime = (timeInSeconds) => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const startRecording = async () => {
        if (cameraRef.current) {

            let codecs = await CameraView.getAvailableVideoCodecsAsync();
            console.log('codecs:', codecs);
            setVideoElapsedTime(0);

            let videoRecordPromise;
            try {
                videoRecordPromise = cameraRef.current.recordAsync({codec: 'avc1', quality: '720p'});
            } catch (err) {
                console.log('record Error:', err);
            }
            if (videoRecordPromise) {
                setIsRecording(true);
                timerRef.current = setInterval(() => {
                    setVideoElapsedTime((prevTime) => prevTime + 1);
                }, 1000);
                console.log('line209, vRP:', videoRecordPromise);
                let video;
                try {
                    video = await videoRecordPromise;
                } catch (err) {
                    console.log('V Error:', err);
                }
                console.log('video:', JSON.stringify(video, null, 2))
                // console.log('v.l:', video.localUri);
                console.log('v.u:', video.uri);
                setRecordedUri(video.uri);
            }
        }
    };

    // Stop recording
    const stopRecording = async () => {

        const { status } = await MediaLibrary.requestPermissionsAsync();
        console.log('status:', status);
        if (status !== 'granted') {
            alert('Permission to access media library is required!');
            return;
        }

        console.log('line157');
        try {
            if (cameraRef.current && isRecording) {
                console.log('line159');
                cameraRef.current.stopRecording();
                setIsRecording(false);
                clearInterval(timerRef.current);
                console.log('line162');
            }
        } catch (error) {
            console.error('Error saving video:', error);
        }
    };

    useEffect(() => {

            const saveVideo = async () => {
                console.log('rURI:', recordedUri);
                console.log('recordedUri type:', typeof recordedUri);
                if (recordedUri) {
                    console.log('line187');

                    // Check file existence
                    const fileInfo = await FileSystem.getInfoAsync(recordedUri);
                    console.log('fileInfo:', fileInfo);
                    if (!fileInfo.exists) {
                        console.error('File does not exist:', recordedUri);
                        return;
                    }

                    const { status, canAskAgain } = await MediaLibrary.requestPermissionsAsync();
                    if (status !== 'granted' && canAskAgain) {
                        const fullPermission = await MediaLibrary.requestPermissionsAsync({ writeOnly: false });
                        console.log('Full permission status:', fullPermission.status);
                    }


                    try{
                    const asset = await MediaLibrary.createAssetAsync(recordedUri);
                    console.log('asset:', asset);
                    setNewAssetCounter(newAssetCounter + 1);}
                    catch (err) {
                        console.log('Error creating asset:',JSON.stringify(err, null, 2))
                    }
                }
                console.log('line165');
                closeCamera();
            }
            console.log('line167');
            saveVideo();
        },
        [recordedUri])

    // useEffect(() => {
    //     console.log('sIDs:', selectedItemsIds);
    // }, [selectedItemsIds])

    // const onViewableItemsChangedGallery = useRef(({ viewableItems }) => {
    //     // console.log("Visible items:", viewableItems);
    // });

    const renderItem = useCallback(({ item }) => {
        let i = selectedItemsIds.findIndex( (id) => id===item.id);
        let isSelected = i >=0;
        return <GalleryMediaItem item={item} toggleSelection={toggleSelection} isSelected={isSelected} selectionIndex={i} videoThumbnails={thumbnails} isGalleryScrolling={checkIsScrolling}/>;
    },[selectedItemsIds, toggleSelection]);


    const handleGalleryScroll = () => {
        // console.log('hGS:', isGalleryScrollingRef.current);
        if (!isGalleryScrollingRef.current) {
            isGalleryScrollingRef.current = true; // Set ref value immediately
        }

        // Clear existing timeout
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }

        // Set a timeout to reset scrolling state
        scrollTimeoutRef.current = setTimeout(() => {
            isGalleryScrollingRef.current = false; // Reset ref value
        }, 500); // Delay to debounce scroll state
    };

    const handleGalleryScrollEnd = () => {
        // console.log('hGSE:', isGalleryScrollingRef.current);
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }
        isGalleryScrollingRef.current = false;

    };
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, []);

    // Function to check scrolling state
    const checkIsScrolling = () => isGalleryScrollingRef.current;

    if (!permission) {
        // Camera permissions are still loading.
        return <View />;
    }


    return (
        <Surface style={styles.container}>
            {!openCamera ?
        <View style={{justifyContent: 'center', alignItems: 'center'}}>
            <View style={{position: 'relative', justifyContent: 'center', alignItems: 'center', backgroundColor: 'black', width: '100%', aspectRatio: orientation==='landscape' ? '1.33' : '0.8'}}>
                {/*<View style={{backgroundColor: 'green', width: '100%', aspectRatio: '1.33'}}></View>*/}
                { (previewMediaItems.length===0) && <View style={{alignItems: 'center', justifyContent: 'center', flex: 1, width: '100%', aspectRatio: orientation==='landscape' ? '1.33' : '0.8'}}><MaterialIcons name={'photo'} size={36} color={'white'} /></View>}
                {/*{ (previewMediaItems.length===0) && <Text style={{color: 'black'}}>TEST</Text>}*/}
                <FlatListSlider ref={previewFlatListSliderRef}
                                simultaneousHandlers={[libraryFlatListRef]}
                                data={previewMediaItems}
                                local={false}
                                orientation={orientation}
                                separator={0}
                                currentIndexCallback={index => console.log('Index', index)}
                    // onPress={item => { console.log('pressed')}}
                                indicator
                                indicatorStyle={{}}
                                indicatorContainerStyle={{position: 'absolute', bottom: 10}}
                                indicatorActiveColor='#3498db'
                                indicatorInActiveColor='#bdc3c7'
                                indicatorActiveWidth={6}
                                contentContainerStyle={{backgroundColor: 'black'}}
                                allowPanZoom={true}
                                component = {<MediaItem />}
                />
            </View>
            <View style={{display: 'flex', flexDirection: 'row', position: 'relative', justifyContent: 'flex-start', backgroundColor: Colors.shamrockGreen, width: '100%', alignItems: 'center'}}>
                <View style={{position: 'absolute', left: '50%', width: 50, transform: [{ translateX: -25 }],}}>
                <Pressable onPress={() => setOpenCamera(true)}>
                    <MaterialIcons name={'camera-alt'} color={'white'} size={28} style={{margin: 10}}/>
                </Pressable>
                </View>
                <View style={{display: 'flex', flexDirection: 'row', marginLeft: 'auto'}}>
                <Pressable onPress={() => setOrientation('landscape')}>
                <MaterialIcons name={'stay-current-landscape'} color={'white'} size={28} style={{margin: 10}}/>
                </Pressable>
                <Pressable onPress={() => setOrientation('portrait')}>
                <MaterialIcons name={'stay-current-portrait'} color={'white'} size={28} style={{margin: 10}}/>
                </Pressable>
                </View>
            </View>
            <FlatList
                ref={libraryFlatListRef}
                data={media}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                numColumns={3}
                style={{height: 'auto'}}
                extraData={selectedItemsIds}
                keyboardShouldPersistTaps="handled"
                disableScrollViewPanResponder={true}
                initialNumToRender={50}
                maxToRenderPerBatch={50}
                viewabilityConfig={{itemVisiblePercentThreshold: 10}}
                // onViewableItemsChanged={onViewableItemsChangedGallery.current}
                windowSize={50}
                scrollEnabled={true}
                onScroll={handleGalleryScroll}
                onMomentumScrollEnd={handleGalleryScrollEnd}
                onScrollEndDrag={handleGalleryScrollEnd}
                removeClippedSubviews={false}
                // onTouchStart={() => {
                //     console.log('FlatList Gallery touch start')
                // }}
                // onResponderGrant={() => console.log('FlatList onResponderGrant')}
                // onResponderRelease={() => console.log('FlatList onResponderRelease')}
                // onStartShouldSetResponder={() => true}
                // onMoveShouldSetResponder={() => true}
            />
        </View>
                :
                (!permission.granted ? (
                        <Card style={styles.permissionContainer}>
                            <Card.Content>
                                <Text variant={'titleMedium'} style={styles.message}>We need your permission to show the camera</Text>
                                <View  style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
                                    <Button mode="contained" style={{width: 'auto'}} onPress={requestPermission}>Grant Permission</Button>
                                </View>
                            </Card.Content>
                        </Card>
                    ) :
                    (
                        <View style={{flex: 1, justifyContent: 'center', position: 'relative', width: '100%'}}>
                            <View style={{position: 'absolute', top: 10, left: 10, zIndex:5}}>
                                <Pressable onPress={() => closeCamera()}>
                                    <MaterialIcons name={'close'} size={36} color={'white'}/>
                                </Pressable>
                            </View>
                            { cameraMode==='video' &&
                            <View style={styles.timerContainer}>
                                <Text style={styles.timerText}>{formatTime(videoElapsedTime)}</Text>
                            </View>
                            }

                            <CameraView style={styles.camera} facing={facing} ref={cameraRef} mode={cameraMode}>
                                {/*{newPhotoTaken && <View style={{position: 'absolute', width: '100%', height: '100%', backgroundColor: 'black', zIndex: 100}}/>}*/}
                                <View style={styles.flipCameraButton}>
                                <TouchableOpacity  onPress={toggleCameraFacing}>
                                    <MaterialIcons name={'flip-camera-ios'} size={36} color={'white'}/>
                                </TouchableOpacity>
                                </View>
                                <View style={styles.toggleVideoButton}>
                                    <TouchableOpacity  onPress={() => {
                                        if (cameraMode==='picture') {
                                            setCameraMode('video');
                                        } else if (cameraMode==='video') {
                                            setCameraMode('picture')
                                        }}}>
                                        {cameraMode==='picture' ? <MaterialIcons name={'videocam'} size={36} color={'white'}/> :
                                        <MaterialIcons name={'image'} size={36} color={'white'}/>
                                        }
                                    </TouchableOpacity>
                                </View>

                                { cameraMode==='picture' ?
                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity style={styles.cameraClickButton} onPress={async () => {
                                            try {
                                                let photo = await cameraRef.current.takePictureAsync({exif: true});
                                                const asset = await savePhotoToGallery(photo.uri);
                                                setNewAsset(asset);
                                                closeCamera();
                                            } catch (error) {
                                                console.log('Error taking pic:', error);
                                            }

                                    }}>
                                        <View style={styles.innerCameraClickButton}/>
                                    </TouchableOpacity>
                                </View> :
                                    (

                                        <View style={styles.buttonContainer}>
                                            <View style={{position: 'relative', width: '100%', height: '100%'}}>
                                            {isRecording ? (
                                                <TouchableOpacity style={styles.videoClickButtonOuter} onPress={stopRecording}>
                                                    <View style={styles.videoClickButtonInnerStop}/>
                                                </TouchableOpacity>
                                            ) : (
                                                <TouchableOpacity style={styles.videoClickButtonOuter} onPress={startRecording}>
                                                    <View style={styles.videoClickButtonInnerStart}/>
                                                </TouchableOpacity>

                                            )}
                                            </View>
                                        </View>

                                    )
                                    }
                            </CameraView>

                        </View>
                    ))}
        </Surface>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // padding: 10,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black'
    },
    cameraContainer: {
        width: '100%',
        height: '100%',
        backgroundColor: 'black'
    },
    permissionContainer: {
        // flex: 1,
        margin: 20,
        justifyContent: 'center',
        alignSelf: 'center',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
    },
    camera: {
        flex: 1,
        position: 'relative'
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 10,
        alignSelf: 'center',
        width: '100%',
        // flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: 'transparent',
        // margin: 64,
    },
    flipCameraButton: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        width: 50,
        height: 50
    },
    toggleVideoButton: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        width: 50,
        height: 50
    },
    button: {
        flex: 1,
        alignSelf: 'flex-end',
        alignItems: 'center',
    },
    cameraClickButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'white',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
    },
    innerCameraClickButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: 'black',
        backgroundColor: 'white',
        alignSelf: 'center',
        position: 'absolute'
    },
    videoClickButtonOuter: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'white',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        // position: 'absolute',
        left: '50%',
        transform: [{ translateX: -40 }],
    },
    videoClickButtonInnerStop: {
        width: 45, height: 45, borderRadius: 15, backgroundColor: 'red', borderWidth: 2, borderColor: 'black', alignSelf: 'center', position: 'absolute'
    },
    videoClickButtonInnerStart: {
        width: 70, height: 70, borderRadius: 35, borderWidth: 2, borderColor: 'black', backgroundColor: 'red', alignSelf: 'center', position: 'absolute'
    },
    timerContainer: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 5,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 10,
        borderRadius: 5,
    },
    timerText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
});

export default gestureHandlerRootHOC(MediaGallery);