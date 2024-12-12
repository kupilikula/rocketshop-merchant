import React, {useEffect, useRef, useState} from 'react';
import {
    View,
    FlatList,
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
import {CameraView, useCameraPermissions} from "expo-camera";
import {Colors} from "../styles/Colors";
import * as FileSystem from 'expo-file-system';  // Import FileSystem
import {Audio} from 'expo-av';


export default function MediaGallery(props) {
    const [media, setMedia] = useState([]);
    const [selectedItemsIds, setSelectedItemsIds] = useState([]);
    const [previewMediaItems, setPreviewMediaItems] = useState([]);
    const [orientation, setOrientation] = useState('landscape');
    const [openCamera, setOpenCamera] = useState(false);
    const [cameraMode, setCameraMode] = useState('picture');
    const [isRecording, setIsRecording] = useState(false);
    const [isVideo, setIsVideo] = useState(false);
    const [recordedUri, setRecordedUri] = useState(null);
    const videoUriRef = useRef(null);  // Use a ref to store video URI
    const [thumbnails, setThumbnails] = useState({});
    const [facing, setFacing] = useState('back');
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef(null);
    const [newAssetCounter, setNewAssetCounter] = useState(0);
    const [newPhotoTaken, setNewPhotoTaken] = useState(false);
    const [newAsset, setNewAsset] = useState(null);
    // const [refreshMediaGalleryTimeStamp, setRefreshMediaGalleryTimeStamp] = useState(true);

    function toggleCameraFacing() {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    }

    const savePhotoToGallery = async (photoUri) => {
        const asset=  await MediaLibrary.createAssetAsync(photoUri);
        setNewAssetCounter(newAssetCounter+1);
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


    const toggleSelection = (item) => {
        console.log('line95');
        setSelectedItemsIds((prev) => {
            if (prev.includes(item.id)) {
                return prev.filter((id) => id !== item.id);
            } else {
                return [...prev, item.id];
            }
        });
    };

    useEffect(() => {
        let selectedItems = selectedItemsIds.map((id)=> media.find((item) => item.id===id))
        setPreviewMediaItems(selectedItems.map((item) => { return {...item, mediaType: item.mediaType==='photo'? 'image' : 'video', orientation: orientation} }));
    }, [selectedItemsIds])


    useEffect(() => {
        setTimeout(() => {
            sliderRef.current?.scrollToIndex(selectedItemsIds.length-1);
        }, 100)

    }, [selectedItemsIds])

    const renderItem = ({ item }) => {

        return (<TouchableWithoutFeedback
            style={[
                styles.itemContainer,
                selectedItemsIds.includes(item.id) && styles.selectedItem,
            ]}
            onPress={() => {
                console.log('line126');
                toggleSelection(item)
            }}
        >
                <View style={{}}>
            {item.mediaType === MediaLibrary.MediaType.photo ? (
                <Image source={{ uri: item.uri }} style={styles.image} />
            ) : (
                <View style={{position: 'relative'}}>
                    <Image source={{ uri: thumbnails[item.id] }} style={styles.image} />
                    <MaterialIcons name={'videocam'} size={28} color={'white'} style={{position: 'absolute', top: 10, right: 10}}/>
                </View>
            )}
            {selectedItemsIds.includes(item.id) && <View style={{width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: 'white',...styles.checkmark}}><Text style={{textAlign: 'center', color: 'white'}}>{ (selectedItemsIds.indexOf(item.id)+1).toString()}</Text></View>}
                </View>
        </TouchableWithoutFeedback>
    )};

    const sliderRef = useRef();
    console.log('p:', previewMediaItems);
    // console.log('S:', selectedItems);

    const closeCamera = () => {
        setOpenCamera(false);
        setNewPhotoTaken(false);
        // setNewPhoto(null);
    }

    useEffect(() => {

        const getAudioPermission = async () => {
            if (cameraMode === 'video') {
                const {audioStatus} = await Audio.getPermissionsAsync();
                console.log('a:', audioStatus);
                if (audioStatus !== "granted") {
                    await Audio.requestPermissionsAsync();
                }
            }
        };
        getAudioPermission();
    }, [cameraMode])

    const startRecording = async () => {
        if (cameraRef.current) {
            console.log('line149');
            // const cameraStatus = await cameraRef.current.getCameraPermissionStatus();
            // console.log('Camera permission status:', cameraStatus);


            const videoRecordPromise = cameraRef.current.recordAsync();
            if (videoRecordPromise) {
                setIsRecording(true);
                console.log('line 152');
                const video = await videoRecordPromise;
                videoUriRef.current = video.uri;  // Store the video URI in the ref
                console.log('video.uri', video.uri);
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
                // const fileName = recordedUri.split('/').pop();  // Get the file name
                // const newUri = FileSystem.documentDirectory + fileName;  // Create new URI in document directory
                // console.log('Moving video to new URI:', newUri);
                //
                // await FileSystem.moveAsync({
                //     from: recordedUri,
                //     to: newUri,
                // });
                //
                // console.log('File moved successfully to:', newUri);
                // const fileInfo = await FileSystem.getInfoAsync(newUri);
                // console.log('fileInfo:', fileInfo);
                if (recordedUri) {
                    console.log('line187');
                    const asset = await MediaLibrary.createAssetAsync(recordedUri);
                    setNewAssetCounter(newAssetCounter + 1);
                }
                console.log('line165');
                closeCamera();
            }
                console.log('line167');
            saveVideo();
        },
        [recordedUri])

    // useEffect(() => {
    //     if (newAsset) {
    //         console.log('nA:', newAsset);
    //         toggleSelection(newAsset);
    //     }
    // }, [newAsset])

    if (!permission) {
        // Camera permissions are still loading.
        return <View />;
    }


    return (
        <Surface style={styles.container}>
            {!openCamera ?
        <View style={{justifyContent: 'center', alignItems: 'center'}}>
            <View style={{position: 'relative', justifyContent: 'center', alignItems: 'center', backgroundColor: 'black', width: '100%', aspectRatio: orientation==='landscape' ? '1.33' : '0.8'}}>
                {/*{previewItemUri &&*/}
                {/* <Image source={{uri: previewItemUri}} style={{width: '100%', height: 300}}/>}*/}
                { (!previewMediaItems || previewMediaItems.length===0) && <View style={{alignItems: 'center', justifyContent: 'center', flex: 1}}><MaterialIcons name={'photo'} size={36} color={'white'} /></View>}
                {previewMediaItems && previewMediaItems.length > 0 &&
                <FlatListSlider ref={sliderRef}
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
                />}
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
                data={media}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                numColumns={3}
                style={{height: 'auto'}}
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
                                <Pressable onPress={() => setOpenCamera(false)}>
                                    <MaterialIcons name={'close'} size={36} color={'white'}/>
                                </Pressable>
                            </View>
                            {/*{newPhoto ?*/}
                            {/*    <View style={{position: 'absolute', width: '100%', height: '100%'}}>*/}
                            {/*        <Image source={{uri: newPhoto.uri}} style={{width: '100%', height: '100%'}}/>*/}
                            {/*    </View>*/}
                            {/*:*/}
                            <CameraView style={styles.camera} facing={facing} ref={cameraRef} mode={cameraMode}>
                                {newPhotoTaken && <View style={{position: 'absolute', width: '100%', height: '100%', backgroundColor: 'black', zIndex: 100}}/>}
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

                                            let photo = await cameraRef.current.takePictureAsync({exif: true});
                                            setNewPhotoTaken(true);
                                            const asset = await savePhotoToGallery(photo.uri);
                                            setNewAsset(asset);
                                            closeCamera();
                                    }}>
                                        <View style={{width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: 'black', backgroundColor: 'white', alignSelf: 'center', position: 'absolute'}}/>
                                    </TouchableOpacity>
                                </View> :
                                    (
                                        <View style={styles.buttonContainer}>
                                            {isRecording ? (
                                                <TouchableOpacity style={styles.videoClickButton} onPress={stopRecording}>
                                                    <View style={{width: 30, height: 30, borderRadius: 10, backgroundColor: 'red', alignSelf: 'center', position: 'absolute'}}/>
                                                </TouchableOpacity>
                                            ) : (
                                                <TouchableOpacity style={styles.videoClickButton} onPress={startRecording}>
                                                    <View style={{width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: 'black', backgroundColor: 'red', alignSelf: 'center', position: 'absolute'}}/>
                                                </TouchableOpacity>

                                            )}
                                        </View>)
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
    itemContainer: {
        margin: 0,
        borderWidth: 1,
        borderRadius: 0,
        overflow: 'hidden',
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ddd',
    },
    selectedItem: {
        borderWidth: 1,
        borderColor: 'green',
    },
    image: {
        width: 120,
        height: 120,
        resizeMode: 'cover',
    },
    videoText: {
        fontSize: 30,
    },
    checkmark: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: '#0196f9',
        display: 'flex',
        justifyContent: 'center',
        alignContent: 'center'
    },
    selectionText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 18,
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
        alignSelf: 'center'
        // flex: 1,
        // flexDirection: 'row',
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
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'white',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center'
    },
    videoClickButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'white',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center'
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
});