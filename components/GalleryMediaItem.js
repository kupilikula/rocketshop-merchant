import React, {useRef, useState} from "react";
import {Image, StyleSheet, Text, TouchableWithoutFeedback, View} from "react-native";
import * as MediaLibrary from "expo-media-library";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {vi} from "@faker-js/faker";
import {Colors} from "../styles/Colors";


const GalleryMediaItem = ({item, thumbnail, toggleSelection, isSelected, selectionIndex, isGalleryScrolling}) => {
    const handlePressIn = () => {
        console.log('handlePressIn, isScrolling:', isGalleryScrolling());
        if (!isGalleryScrolling()) {
            setTimeout(() => {
                if (!isGalleryScrolling()) {
                    toggleSelection(item);
                }
            },100)

        }
    };

    return (<TouchableWithoutFeedback
        style={[styles.itemContainer, isSelected && styles.selectedItem,]}
        // style={{ backgroundColor: 'rgba(0, 0, 255, 0.5)' }}
        onPressOut={handlePressIn}
    >
        <View>
            {item.mediaType === MediaLibrary.MediaType.photo ? (
                <Image source={{uri: item.uri}} style={styles.image}/>) :
                (<View style={{position: 'relative'}}>
                    {thumbnail ? <Image source={{uri: thumbnail}} style={styles.image}/> : <View style={[styles.image, {backgroundColor: 'black'}]}/>}
                    <MaterialIcons name={'videocam'} size={28} color={'white'}
                                   style={{position: 'absolute', top: 10, right: 10}}/>
                </View>)}
            {isSelected && <View style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                borderWidth: 1,
                borderColor: 'white', ...styles.checkmark
            }}><Text style={{
                textAlign: 'center',
                color: 'white'
            }}>{(selectionIndex + 1).toString()}</Text></View>}
        </View>
    </TouchableWithoutFeedback>)
}

const styles = StyleSheet.create({
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
        backgroundColor: Colors.iconBlue,
        display: 'flex',
        justifyContent: 'center',
        alignContent: 'center'
    },
});
export default GalleryMediaItem;