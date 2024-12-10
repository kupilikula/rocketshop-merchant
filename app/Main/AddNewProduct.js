import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import {useRef, useState} from 'react';
import {Platform, Pressable, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Card, Text, Button, Surface} from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MediaGallery from "../../components/MediaGallery";
import * as MediaLibrary from "expo-media-library";

export default function AddNewProduct () {

        return <MediaGallery/>
    }


// const styles = StyleSheet.create({
//     cameraContainer: {
//         width: '100%',
//         height: '100%',
//         backgroundColor: 'black'
//     },
//     permissionContainer: {
//         flex: 1,
//         margin: 20,
//         justifyContent: 'center',
//         alignSelf: 'center',
//     },
//     container: {
//         flex: 1,
//         justifyContent: 'center',
//     },
//     message: {
//         textAlign: 'center',
//         paddingBottom: 10,
//     },
//     camera: {
//         flex: 1,
//         position: 'relative'
//     },
//     buttonContainer: {
//         position: 'absolute',
//         bottom: 10,
//         alignSelf: 'center'
//         // flex: 1,
//         // flexDirection: 'row',
//         // backgroundColor: 'transparent',
//         // margin: 64,
//     },
//     button: {
//         flex: 1,
//         alignSelf: 'flex-end',
//         alignItems: 'center',
//     },
//     cameraClickButton: {
//       width: 40,
//       height: 40,
//       borderRadius: 20,
//       backgroundColor: 'white',
//         position: 'relative',
//         display: 'flex',
//         justifyContent: 'center'
//     },
//     text: {
//         fontSize: 24,
//         fontWeight: 'bold',
//         color: 'white',
//     },
// });