// import React, { useEffect, useRef, useState } from 'react';
// import {TouchableOpacity, View, StyleSheet, Pressable} from 'react-native';
// import { MaterialIcons } from '@expo/vector-icons';
// import { CameraView, useCameraPermissions } from 'expo-camera';
// import { Audio } from 'expo-av';
// import * as MediaLibrary from 'expo-media-library';
//
// const Camera = ({ setOpenCamera, setNewAssetCounter, setNewAsset }) => {
//     const [isRecording, setIsRecording] = useState(false);
//     const [cameraMode, setCameraMode] = useState('picture');
//     const [recordedUri, setRecordedUri] = useState(null);
//     const [facing, setFacing] = useState('back');
//     const [permission, requestPermission] = useCameraPermissions();
//     const cameraRef = useRef(null);
//
//     useEffect(() => {
//         const getAudioPermission = async () => {
//             if (cameraMode === 'video') {
//                 const { audioStatus } = await Audio.getPermissionsAsync();
//                 if (audioStatus !== 'granted') {
//                     await Audio.requestPermissionsAsync();
//                 }
//             }
//         };
//
//         getAudioPermission();
//     }, [cameraMode]);
//
//     useEffect(() => {
//         const saveVideo = async () => {
//             if (recordedUri) {
//                 try {
//                     const asset = await MediaLibrary.createAssetAsync(recordedUri);
//                     setNewAssetCounter((prev) => prev + 1);
//                     setNewAsset(asset);
//                     closeCamera();
//                 } catch (error) {
//                     console.error('Error saving video:', error);
//                 }
//             }
//         };
//
//         saveVideo();
//     }, [recordedUri]);
//
//     const startRecording = async () => {
//         if (cameraRef.current) {
//             const videoRecordPromise = cameraRef.current.recordAsync();
//             if (videoRecordPromise) {
//                 setIsRecording(true);
//                 const video = await videoRecordPromise;
//                 setRecordedUri(video.uri);
//             }
//         }
//     };
//
//     const stopRecording = async () => {
//         if (cameraRef.current && isRecording) {
//             try {
//                 cameraRef.current.stopRecording();
//                 setIsRecording(false);
//             } catch (error) {
//                 console.error('Error stopping video recording:', error);
//             }
//         }
//     };
//
//     const toggleCameraFacing = () => {
//         setFacing((current) => (current === 'back' ? 'front' : 'back'));
//     };
//
//     if (!permission) {
//         return <View />;
//     }
//
//     return (
//         <View style={{flex: 1, justifyContent: 'center', position: 'relative', width: '100%'}}>
//             <View style={{position: 'absolute', top: 10, left: 10, zIndex:5}}>
//                 <Pressable onPress={() => setOpenCamera(false)}>
//                     <MaterialIcons name={'close'} size={36} color={'white'}/>
//                 </Pressable>
//             </View>
//             <CameraView style={styles.camera} facing={facing} ref={cameraRef} mode={cameraMode}>
//                 {newPhotoTaken && <View style={{position: 'absolute', width: '100%', height: '100%', backgroundColor: 'black', zIndex: 100}}/>}
//                 <View style={styles.flipCameraButton}>
//                     <TouchableOpacity  onPress={toggleCameraFacing}>
//                         <MaterialIcons name={'flip-camera-ios'} size={36} color={'white'}/>
//                     </TouchableOpacity>
//                 </View>
//                 <View style={styles.toggleVideoButton}>
//                     <TouchableOpacity  onPress={() => {
//                         if (cameraMode==='picture') {
//                             setCameraMode('video');
//                         } else if (cameraMode==='video') {
//                             setCameraMode('picture')
//                         }}}>
//                         {cameraMode==='picture' ? <MaterialIcons name={'videocam'} size={36} color={'white'}/> :
//                             <MaterialIcons name={'image'} size={36} color={'white'}/>
//                         }
//                     </TouchableOpacity>
//                 </View>
//
//                 { cameraMode==='picture' ?
//                     <View style={styles.buttonContainer}>
//                         <TouchableOpacity style={styles.cameraClickButton} onPress={async () => {
//
//                             let photo = await cameraRef.current.takePictureAsync({exif: true});
//                             setNewPhotoTaken(true);
//                             const asset = await savePhotoToGallery(photo.uri);
//                             setNewAsset(asset);
//                             closeCamera();
//                         }}>
//                             <View style={{width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: 'black', backgroundColor: 'white', alignSelf: 'center', position: 'absolute'}}/>
//                         </TouchableOpacity>
//                     </View> :
//                     (
//                         <View style={styles.buttonContainer}>
//                             {isRecording ? (
//                                 <TouchableOpacity style={styles.videoClickButton} onPress={stopRecording}>
//                                     <View style={{width: 30, height: 30, borderRadius: 10, backgroundColor: 'red', alignSelf: 'center', position: 'absolute'}}/>
//                                 </TouchableOpacity>
//                             ) : (
//                                 <TouchableOpacity style={styles.videoClickButton} onPress={startRecording}>
//                                     <View style={{width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: 'black', backgroundColor: 'red', alignSelf: 'center', position: 'absolute'}}/>
//                                 </TouchableOpacity>
//
//                             )}
//                         </View>)
//                 }
//             </CameraView>
//
//         </View>
//     );
// };
//
// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         position: 'relative',
//     },
//     flipCameraButton: {
//         position: 'absolute',
//         top: 10,
//         left: 10,
//         zIndex: 5,
//     },
//     toggleVideoButton: {
//         position: 'absolute',
//         top: 10,
//         right: 10,
//         zIndex: 5,
//     },
//     buttonContainer: {
//         position: 'absolute',
//         bottom: 10,
//         alignSelf: 'center',
//     },
//     camera: {
//         flex: 1,
//         position: 'relative',
//     },
//     cameraClickButton: {
//         width: 60,
//         height: 60,
//         borderRadius: 30,
//         backgroundColor: 'white',
//         position: 'relative',
//         display: 'flex',
//         justifyContent: 'center',
//     },
//     videoClickButton: {
//         width: 60,
//         height: 60,
//         borderRadius: 30,
//         backgroundColor: 'red',
//         position: 'relative',
//         display: 'flex',
//         justifyContent: 'center',
//     },
//     recordingButton: {
//         width: 30,
//         height: 30,
//         borderRadius: 15,
//         backgroundColor: 'red',
//         alignSelf: 'center',
//     },
//     recordButton: {
//         width: 50,
//         height: 50,
//         borderRadius: 25,
//         borderWidth: 2,
//         borderColor: 'black',
//         backgroundColor: 'red',
//         alignSelf: 'center',
//     },
// });
//
// export default Camera;
