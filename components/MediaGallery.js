import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
    View,
    TouchableOpacity,
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
import {Button, Card, Surface, Text, useTheme} from "react-native-paper";
import {Camera, CameraView, useCameraPermissions} from "expo-camera";
import {Colors} from "../styles/Colors";
import * as FileSystem from 'expo-file-system';  // Import FileSystem
import {Audio} from 'expo-av';
import {gestureHandlerRootHOC, FlatList} from "react-native-gesture-handler";
import { useMemo } from "react";
import GalleryMediaItem from "./GalleryMediaItem";
import {useNavigation, useRouter} from "expo-router";
import {useIsFocused} from "@react-navigation/native";
import {resetNewProduct, updateField} from "../store/newProductSlice";
import {useDispatch, useSelector} from "react-redux";
import _ from "lodash";
import * as Crypto from 'expo-crypto';
import {CommonActions} from "@react-navigation/native";

const  MediaGallery = (props) => {
    const [media, setMedia] = useState([]);
    const [selectedItemsIds, setSelectedItemsIds] = useState([]);
    const [previewMediaItems, setPreviewMediaItems] = useState([]);
    const [orientation, setOrientation] = useState('landscape');
    const [openCamera, setOpenCamera] = useState(false);
    const [cameraMode, setCameraMode] = useState('picture');
    const [isRecording, setIsRecording] = useState(false);
    const [videoElapsedTime, setVideoElapsedTime] = useState(0);

    const [recordedUri, setRecordedUri] = useState(null);
    const [thumbnails, setThumbnails] = useState({});
    const [facing, setFacing] = useState('back');
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef(null);
    const [newAssetTrigger, setNewAssetTrigger] = useState({counter: 0, asset: null});
    const isGalleryScrollingRef = useRef(false); // Ref for synchronous scrolling state

    const scrollTimeoutRef = useRef(null);
    const previewFlatListSliderRef = useRef();
    const libraryFlatListRef = useRef();
    const timerRef = useRef(null);

    const theme = useTheme();
    const navigation = useNavigation();
    const router = useRouter();

    const isFocused = useIsFocused();
    const dispatch = useDispatch();

    const productDataMediaItems = useSelector((state) => state.newProduct.mediaItems);
    function toggleCameraFacing() {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    }


    useEffect(()=> {
       console.log('MediaGallery mounted');
       return () => {
           console.log('MediaGallery UNmounted');
       }
    },[])

    // const forceUpdate = useCallback(() => setNewAssetTrigger((prev) => ({ ...prev })), []);


    const savePhotoToGallery = async (photoUri) => {
        let asset;
        try {
            asset = await MediaLibrary.createAssetAsync(photoUri);
            console.log('new image asset:', asset);
            setNewAssetTrigger((prev) => ({counter: prev.counter+1, asset: asset}));
        } catch (err) {
            console.log('Error creating asset:', err);
        }

        return asset;
    };

    const resetNavigationStack = () => {
        // Reset the navigation stack to the Dashboard tab
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: "Dashboard" }], // Replace with your Dashboard screen name
            })
        );
    }


    const MediaHeader = ({cameraOpen}) => {

        if (cameraOpen) { return null}
        else {
            return <View style={{height: 60, paddingHorizontal: 15, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'black', color: 'white'}}>
                <Pressable onPressIn={() => {
                    console.log('cancel workflow');
                    dispatch(resetNewProduct());
                    resetNavigationStack();
                }}
                >
                    <MaterialIcons name={'close'} size={36} style={{color: 'white'}}/>
                </Pressable>
                <Text variant={'titleLarge'} style={{ color: 'white'}}>Product Media</Text>
                <Pressable onPressIn={() => {console.log('press'); router.push('./AddProductInfo')}}><MaterialIcons name={'arrow-forward'} size={36} style={{color: 'white'}}/></Pressable>
            </View>;

        }
    }

    const generateThumbnails = async (assets) => {
        console.log('generate:', assets.length);
        if (assets.length>0) {
            const thumbnailMap = {};
            for (const asset of assets) {
                try {

                    let assetUri = null;
                    if (Platform.OS==='ios') {
                        let assetInfo = await MediaLibrary.getAssetInfoAsync(asset);
                        assetUri = assetInfo.localUri;
                    } else {
                        assetUri = asset.uri;
                    }

                    const {uri} = await VideoThumbnails.getThumbnailAsync(assetUri, {
                        time: 1000, // Extract frame at 1 second
                    });
                    thumbnailMap[asset.id] = uri;
                } catch (e) {
                    console.error(`Failed to generate thumbnail for ${asset.id}:`, e);
                }
            }
            // console.log('t:', thumbnails.current);
            // console.log('T:', {...thumbnails.current, ...thumbnailMap});
            // thumbnails.current = {...thumbnails.current, ...thumbnailMap};
            setThumbnails({...thumbnails, ...thumbnailMap});
        }
    };

    useEffect(() => {
        console.log('get Media useEffect');
        const getMedia = async () => {
            console.log('get Media line122 ');
            try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                alert('Permission to access media library is required!');
                return;
            }
            console.log('get Media line128 ');
            const mediaItems = await MediaLibrary.getAssetsAsync({
                mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
                first: 50, // Limit the number of items fetched
                sortBy: [MediaLibrary.SortBy.creationTime]
            });

            // console.log('M0:', mediaItems.assets.slice(0,10));

            let newVideos = mediaItems.assets.filter((asset) => asset.mediaType==='video' && !Object.keys(thumbnails).includes(asset.id))
            generateThumbnails(newVideos);

            setMedia(mediaItems.assets);

            } catch (err) {
                console.log('Err line 136:', err);
            }
        };
        // console.log('r:', props.refreshMediaGalleryTimeStamp);
        getMedia().then(() => {
            // console.log('line 147, newAsset:', newAsset);
            closeCamera();
            if (newAssetTrigger.asset) {
                console.log('line 149')
                toggleSelection(newAssetTrigger.asset);
            }
        }).catch((err) => console.log('line150 err:', err));

    }, [newAssetTrigger.counter]);


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

    // console.log('line 190, selectedItems dependency:', selectedItems);
    // console.log('line 191, orientation dependency:', orientation);
    useEffect(() => {
        console.log('line 193, selectedItems:', selectedItems);

        const transformItemsAndSetPreviews = async () => {
            console.log('selectedItems inside transform:', selectedItems);
            try {
                console.log('LINE201');
                const itemsWithPromises = selectedItems.map(async (item, i) => {

                                // console.log('line 182, i:', i, ', item:', item);
                                let localUri = null;
                                try {
                                if (item.mediaType === 'video' && Platform.OS === 'ios') {
                                    let assetInfo = await MediaLibrary.getAssetInfoAsync(item);
                                    localUri = assetInfo.localUri;
                                }
                                    }catch (e) {
                                    // console.log('line206, e:', e);
                                }
                                console.log('localuri:', localUri);


                    return {
                        ...item,
                        mediaType: item.mediaType === "photo" ? "image" : "video",
                        uri: localUri || item.uri,
                        orientation,
                        thumbnail: thumbnails[item.id] || '',
                        mediaId: Crypto.randomUUID(),
                    };
                });
                const resolvedItems = await Promise.all(itemsWithPromises);
                // console.log('resolvedItems:', resolvedItems);
                setPreviewMediaItems(resolvedItems);
            } catch (err) {
                console.log('line217, err:', err);
            }
        };
        transformItemsAndSetPreviews();
    }, [selectedItems,orientation]);


    // useEffect(() => {
    //     console.log("Updated previewMediaItems:", previewMediaItems);
    // }, [previewMediaItems]);


        useEffect(() => {
            if (selectedItemsIds.length>0) {
                setTimeout(() => {
                    previewFlatListSliderRef.current?.scrollToIndex(previewMediaItems.length-1);
                }, 200)
            }

        }, [previewMediaItems])


    const closeCamera = () => {
        setVideoElapsedTime(0);
        cameraRef.current = null;
        setTimeout(() => setOpenCamera(false), 100);

        console.log('closed camera');
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

    useEffect(() => {
        console.log('effect: openCamera:', openCamera);
            navigation.setOptions({header: () => <MediaHeader cameraOpen={openCamera}/>})
    },[navigation, openCamera])

    const formatTime = (timeInSeconds) => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    useEffect(() => {
        console.log('newAssetTrigger updated:', newAssetTrigger);
    }, [newAssetTrigger]);

    useEffect(() => {
        console.log('newAssetTrigger.counter useEffect triggered:', newAssetTrigger.counter);
        // Perform media fetching logic
    }, [newAssetTrigger.counter]);

    const startRecording = async () => {
        console.log('line292')
        if (cameraRef.current) {
            try {
            setVideoElapsedTime(0);
            let videoRecordPromise;

                videoRecordPromise = cameraRef.current.recordAsync({codec: 'avc1', quality: '720p'});

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
            } catch (err) {
                console.log('record Error:', err);
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

            if (recordedUri) {
            const saveVideo = async () => {
                console.log('rURI:', recordedUri);
                console.log('recordedUri type:', typeof recordedUri);

                try{
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

                    const asset = await MediaLibrary.createAssetAsync(recordedUri);
                    console.log('asset:', asset);
                    setNewAssetTrigger((prev) => ({counter: prev.counter + 1, asset: asset}));
                    console.log('line 357, newAssetTrigger:', newAssetTrigger);
                    // forceUpdate();
                    } catch (err) {
                        console.log('Error creating asset:',JSON.stringify(err, null, 2))
                    } finally {
                        console.log('line165');
                    }
            }
            console.log('line167');
            saveVideo();
            }
        },
        [recordedUri])

    const renderItem = useCallback(({ item }) => {
        let i = selectedItemsIds.findIndex( (id) => id===item.id);
        let isSelected = i >=0;
        return <GalleryMediaItem item={item} thumbnail={thumbnails[item.id] || ''} toggleSelection={toggleSelection} isSelected={isSelected} selectionIndex={i} isGalleryScrolling={checkIsScrolling}/>;
    },[selectedItemsIds, toggleSelection, thumbnails]);


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

    useEffect(() => {
        console.log("preview Media Items", previewMediaItems);
        if (!isFocused){
            // Save state to Redux when screen loses focus
            dispatch(updateField( {field:"mediaItems", value: _.cloneDeep(previewMediaItems)}));
            setPreviewMediaItems([]);
        } else {
            console.log('previewitems:', previewMediaItems, ' storeMitems:', productDataMediaItems);
            setPreviewMediaItems(productDataMediaItems);
        }
    }, [isFocused]);

    const debouncedToggleCameraMode = useRef(_.debounce(() => {
        setCameraMode((prev) => (prev === 'picture' ? 'video' : 'picture'));
    }, 200)).current;

    // if (!permission) {
    //     // Camera permissions are still loading.
    //     return <View />;
    // }


    return (
        <Surface style={styles.container}>
            <>
            {!openCamera &&
        <View style={{flex: 1, display: 'flex', flexDirection: 'column' , justifyContent: 'flex-start', alignItems: 'center', backgroundColor: 'black'}}>
            <View style={{position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', backgroundColor: 'red', width: '100%', aspectRatio: orientation==='landscape' ? '1.33' : '0.8'}}>
                {/*<View style={{backgroundColor: 'magenta', width: '100%', aspectRatio: '1.33'}}></View>*/}
                { (previewMediaItems.length===0) && <View style={{backgroundColor: 'black', alignItems: 'center', justifyContent: 'center', width: '100%', aspectRatio: orientation==='landscape' ? '1.33' : '0.8'}}><MaterialIcons name={'photo'} size={36} color={'white'} /></View>}
                {/*{ (previewMediaItems.length===0) && <Text style={{color: 'black'}}>TEST</Text>}*/}
                <FlatListSlider ref={previewFlatListSliderRef}
                                simultaneousHandlers={[libraryFlatListRef]}
                                data={previewMediaItems}
                                local={false}
                                orientation={orientation}
                                separator={0}
                                currentIndexCallback={index => console.log('Index', index)}
                                keyExtractor={(item) => item.id}
                    // onPress={item => { console.log('pressed')}}
                                indicator
                                indicatorStyle={{}}
                                indicatorContainerStyle={{position: 'absolute', bottom: 10}}
                                indicatorActiveColor='#3498db'
                                indicatorInActiveColor='#bdc3c7'
                                indicatorActiveWidth={6}
                                contentContainerStyle={{backgroundColor: 'blue'}}
                                flatListWrapperStyle={{backgroundColor: 'orange'}}
                                allowPanZoom={true}
                                component = {<MediaItem />}
                />
            </View>
            <View style={{display: 'flex', flexDirection: 'row', position: 'relative', justifyContent: 'flex-start', backgroundColor: theme.colors.secondary, width: '100%', alignItems: 'center'}}>
                <View style={{position: 'absolute', left: '50%', width: 50, transform: [{ translateX: -25 }],}}>
                <Pressable onPress={() => setOpenCamera(true)}>
                    <MaterialIcons name={'camera-alt'} color={'black'} size={28} style={{margin: 10}}/>
                </Pressable>
                </View>
                <View style={{display: 'flex', flexDirection: 'row', marginLeft: 'auto'}}>
                <Pressable onPress={() => setOrientation('landscape')}>
                <MaterialIcons name={'stay-current-landscape'} color={'black'} size={28} style={{margin: 10}}/>
                </Pressable>
                <Pressable onPress={() => setOrientation('portrait')}>
                <MaterialIcons name={'stay-current-portrait'} color={'black'} size={28} style={{margin: 10}}/>
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
            />
        </View>
            }

                            {openCamera &&
                                <>
                                {!permission?.granted &&
                                    <Card style={styles.permissionContainer}>
                                        <Card.Content>
                                            <Text variant={'titleMedium'} style={styles.message}>We need your permission to show the camera</Text>
                                            <View  style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
                                                <Button mode="contained" style={{width: 'auto'}} onPress={requestPermission}>Grant Permission</Button>
                                            </View>
                                        </Card.Content>
                                    </Card>
                                }
                                {permission.granted &&
                                <>
                                    <View style={{position: 'absolute', top: 10, left: 10, zIndex:5}}>
                                        <Pressable onPress={() => closeCamera()}>
                                            <MaterialIcons name={'close'} size={36} color={'white'}/>
                                        </Pressable>
                                    </View>
                                { cameraMode==='video' &&
                                    <View style={styles.timerContainer}>
                                        <Text style={styles.timerText} variant={'bodyLarge'}>{formatTime(videoElapsedTime)}</Text>
                                    </View>
                                }
                                    <View style={styles.flipCameraButton}>
                                        <Pressable  onPress={toggleCameraFacing}>
                                            <MaterialIcons name={'flip-camera-ios'} size={36} color={'white'}/>
                                        </Pressable>
                                    </View>
                                    <View style={styles.toggleVideoButton}>
                                        <Pressable  onPress={() => { debouncedToggleCameraMode()}}>
                                            {cameraMode==='picture' ? <MaterialIcons name={'videocam'} size={36} color={'white'}/> :
                                                <MaterialIcons name={'image'} size={36} color={'white'}/>
                                            }
                                        </Pressable>
                                    </View>
                                    { cameraMode==='picture' &&
                                        <View style={styles.buttonContainer}>
                                            <TouchableOpacity style={styles.cameraClickButton} onPress={async () => {
                                                try {
                                                    let photo = await cameraRef.current.takePictureAsync({exif: true});
                                                    const asset = await savePhotoToGallery(photo.uri);
                                                    closeCamera();
                                                } catch (error) {
                                                    console.log('Error taking pic:', error);
                                                }

                                            }}>
                                                <View style={styles.innerCameraClickButton}/>
                                            </TouchableOpacity>
                                        </View>
                                    }
                                    {cameraMode==='video' &&
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
                                    }
                                    {isFocused && <CameraView style={styles.camera} facing={facing} ref={cameraRef} mode={cameraMode} active={true}/>}
                                </>
                                }
                                </>
                            }
            </>
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
        position: 'absolute',
        width: '100%',
        height: '100%'
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
        height: 50,
        zIndex: 5,
    },
    toggleVideoButton: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        width: 50,
        height: 50,
        zIndex: 5,
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
        zIndex: 5
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
        zIndex: 5,
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