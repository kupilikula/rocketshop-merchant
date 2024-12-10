import React, {useEffect, useRef, useState} from 'react';
import {View, FlatList, TouchableOpacity, Text, StyleSheet, Image, Pressable, Platform} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import FlatListSlider from "./MediaSlider/FlatListSlider";
import MediaItem from "./MediaSlider/MediaItem";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as VideoThumbnails from "expo-video-thumbnails";
import {Button, Card, Surface} from "react-native-paper";
import {CameraView, useCameraPermissions} from "expo-camera";

export default function GalleryScreen(props) {
    const [media, setMedia] = useState([]);
    const [selectedItemsIds, setSelectedItemsIds] = useState([]);
    const [previewMediaItems, setPreviewMediaItems] = useState([]);
    const [orientation, setOrientation] = useState('landscape');
    const [openCamera, setOpenCamera] = useState(false);
    const [thumbnails, setThumbnails] = useState({});
    const [facing, setFacing] = useState('back');
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef(null);
    const [newAssetCounter, setNewAssetCounter] = useState(0);
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

            // const mediaItems = await MediaLibrary.getAssetsAsync({
            //     mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
            //     first: 50, // Limit the number of items fetched
            //     sortBy: [MediaLibrary.SortBy.creationTime]
            // });

            // Fetch all albums
            const albums = await MediaLibrary.getAlbumsAsync();
            console.log('Albums found:', albums);

            let allAssets = [];
            for (const album of albums) {
                const albumAssets = await MediaLibrary.getAssetsAsync({
                    album: album.id,
                    mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
                    first: 50, // Adjust as needed
                    sortBy: [MediaLibrary.SortBy.creationTime],
                });
                allAssets = [...allAssets, ...albumAssets.assets];
            }
            allAssets.sort( (p,q) => (q.creationTime - p.creationTime));
            console.log('All assets from all albums:', allAssets);

            // console.log('A:', mediaItems.assets);
            setMedia(allAssets);
            let newVideos = allAssets.filter((asset) => asset.mediaType==='video' && !Object.keys(thumbnails).includes(asset.id))
            console.log('O:', Object.keys(thumbnails));
            // console.log('O:', Object.keys(thumbnails).includes());
            console.log('newV:', newVideos);
            generateThumbnails(newVideos);
        };
        // console.log('r:', props.refreshMediaGalleryTimeStamp);
        getMedia();

    }, [newAssetCounter]);


    const toggleSelection = (item) => {
        setSelectedItemsIds((prev) => {
            if (prev.includes(item.id)) {
                return prev.filter((id) => id !== item.id);
            } else {
                return [...prev, item.id];
            }
        });
    };

    // useEffect(() => {
    //     console.log('sl:', selectedItemsIds.length-1);
    //     sliderRef.current?.scrollToIndex(selectedItemsIds.length-1);
    // }, [selectedItemsIds])

    const renderItem = ({ item }) => {
        // if (item.mediaType==='video'){
        //     console.log('item:', item);
        //     console.log('th:', thumbnails[item.id]);
        //     console.log('TH:', thumbnails);
        // }

        return (<TouchableOpacity
            style={[
                styles.itemContainer,
                selectedItemsIds.includes(item.id) && styles.selectedItem,
            ]}
            onPress={() => toggleSelection(item)}
        >
            {item.mediaType === MediaLibrary.MediaType.photo ? (
                <Image source={{ uri: item.uri }} style={styles.image} />
            ) : (
                <View style={{position: 'relative'}}>
                    <Image source={{ uri: thumbnails[item.id] }} style={styles.image} />
                    <MaterialIcons name={'videocam'} size={28} color={'white'} style={{position: 'absolute', top: 10, right: 10}}/>
                </View>
            )}
            {selectedItemsIds.includes(item.id) && <View style={{width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: 'white',...styles.checkmark}}><Text style={{textAlign: 'center', color: 'white'}}>{ (selectedItemsIds.indexOf(item.id)+1).toString()}</Text></View>}
        </TouchableOpacity>
    )};
    const previewItemUri = selectedItemsIds.length === 0 ?
        (media.length > 0 ? media[0].uri : null)
        :
        media.find((item) => item.id===selectedItemsIds[selectedItemsIds.length-1]).uri;

        // .uri : (media.length > 0 ? media[0].uri : null);
    console.log('s:',selectedItemsIds[selectedItemsIds.length-1]);
    console.log('preview:', previewItemUri);
    console.log('m:',media[0])

    useEffect(() => {
        let selectedItems = selectedItemsIds.map((id)=> media.find((item) => item.id===id))
        setPreviewMediaItems(selectedItems.map((item) => { return {...item, mediaType: item.mediaType==='photo'? 'image' : 'video', orientation: orientation} }));
        console.log('l:', previewMediaItems.length);
    }, [selectedItemsIds])

    const sliderRef = useRef();
    console.log('p:', previewMediaItems);
    // console.log('S:', selectedItems);

    if (!permission) {
        // Camera permissions are still loading.
        return <View />;
    }

    return (
        <Surface style={styles.cameraContainer}>
            {!openCamera ?
        <View style={styles.container}>
            <View style={{position: 'relative', justifyContent: 'center', alignItems: 'center', backgroundColor: 'black', width: '100%', aspectRatio: orientation==='landscape' ? '1.33' : '0.8'}}>
                {/*{previewItemUri &&*/}
                {/* <Image source={{uri: previewItemUri}} style={{width: '100%', height: 300}}/>}*/}
                { (!previewMediaItems || previewMediaItems.length===0) && <View style={{alignItems: 'center', justifyContent: 'center', flex: 1}}><MaterialIcons name={'landscape'} size={28} color={'white'} /></View>}
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
                                component = {<MediaItem />}
                />}
            </View>
            <View style={{display: 'flex', flexDirection: 'row'}}>
                <Pressable onPress={() => setOpenCamera(true)}>
                    <MaterialIcons name={'camera-alt'} color={'white'} size={28} style={{margin: 10}}/>
                </Pressable>
                <Pressable onPress={() => setOrientation('landscape')}>
                <MaterialIcons name={'stay-current-landscape'} color={'white'} size={28} style={{margin: 10}}/>
                </Pressable>
                <Pressable onPress={() => setOrientation('portrait')}>
                <MaterialIcons name={'stay-current-portrait'} color={'white'} size={28} style={{margin: 10}}/>
                </Pressable>
            </View>
            <FlatList
                data={media}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                numColumns={3}
                style={{height: 'auto'}}
            />
            {/*<Text style={styles.selectionText}>*/}
            {/*    Selected: {selectedItemsIds.length}*/}
            {/*</Text>*/}
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
                        <View style={{flex: 1, justifyContent: 'center'}}>
                            <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
                                <View style={{position: 'absolute', top: 10, left: 10}}>
                                    <Pressable onPress={() => setOpenCamera(false)}>
                                        <MaterialIcons name={'close'} size={36} color={'white'}/>
                                    </Pressable>
                                </View>
                                <View style={styles.buttonContainer}>
                                    {/*<TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>*/}
                                    {/*    <Text style={styles.text}>Flip Camera</Text>*/}
                                    {/*</TouchableOpacity>*/}
                                    <TouchableOpacity style={styles.cameraClickButton} onPress={async () => {
                                        let photo = await cameraRef.current.takePictureAsync({exif: true});
                                        console.log('photo:', photo);
                                        const asset = await savePhotoToGallery(photo.uri);
                                        // const asset = await MediaLibrary.createAssetAsync(photo.uri);
                                        console.log('asset:', asset);
                                        setOpenCamera(false);
                                        setRefreshMediaGalleryTimeStamp(Date.now());
                                    }}>
                                        <View style={{width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: 'black', backgroundColor: 'white', alignSelf: 'center', position: 'absolute'}}/>
                                    </TouchableOpacity>
                                </View>
                            </CameraView>
                        </View>
                    ))}
        </Surface>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center'
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
        flex: 1,
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
    button: {
        flex: 1,
        alignSelf: 'flex-end',
        alignItems: 'center',
    },
    cameraClickButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
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