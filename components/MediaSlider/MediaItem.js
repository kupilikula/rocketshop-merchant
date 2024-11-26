import React from 'react';
import {TouchableOpacity, Image, StyleSheet, View} from 'react-native';

export default function MediaItem ({
                                 item,
                                 onPress,
                                 index,
                                 imageKey,
                                 local,
                                 orientation,
                                 width
                             }) {
    return (
        <View
            style={styles.container}
            onPress={() => onPress(index)}>
            <Image
                style={{width: width, aspectRatio: orientation==='landscape' ? '1.33' : '0.8', resizeMode: 'stretch'}}
                source={local ? item[imageKey] : {uri: item[imageKey]}}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {},
    image: {
        resizeMode: 'stretch',
    },
});