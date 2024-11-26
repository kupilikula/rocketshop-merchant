import {View, Text} from "react-native";
import {Card, Button, Avatar} from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {Image} from 'expo-image';
import FlatListSlider from "./MediaSlider/FlatListSlider";
import MediaItem from "./MediaSlider/MediaItem";
import {useCallback, useState} from "react";
const StoreLogo = props => <Avatar.Icon {...props} icon="folder" />

const imageData = [
    {
        image:
            'https://picsum.photos/700',
        desc:
            'Sample Description below the image for representation purpose only',
    },
    {
        image:
            'https://picsum.photos/700',
        desc:
            'Sample Description below the image for representation purpose only',
    }];

export default function ProductDisplayCardCustomerFeed (props) {

    // console.log('size:', size);
    return <View  >
    <Card mode={'elevated'} style={{width: '100%', borderRadius: 0, marginTop: 10, marginBottom: 10}}>
        <Card.Title title="Product Name" subtitle="Store Name" left={StoreLogo}/>
        {/*<Image style={{borderRadius: 0, width:'100%', aspectRatio: '1.91'}} source={{ uri: "https://picsum.photos/700"}} />*/}
        <FlatListSlider
            data={imageData}
            imageKey={'image'}
            local={false}
            orientation={'portrait'}
            separator={0}
            currentIndexCallback={index => console.log('Index', index)}
            onPress={item => {}}
            indicator
            indicatorStyle={{}}
            indicatorContainerStyle={{}}
            indicatorActiveColor='#3498db'
            indicatorInActiveColor='#bdc3c7'
            indicatorActiveWidth={6}
            contentContainerStyle={{}}
            component = {<MediaItem />}
            />
        <Card.Content>
            <View style={{width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: 10}}>
                <View>
                    <Text variant="titleLarge">Price</Text>
                    <Text variant="bodyMedium">Rating</Text>
                </View>
                <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', alignContent: 'center'}}>
                    <MaterialIcons name={'favorite-border'} size={28} style={{margin: 10}}/>
                    <MaterialIcons name={'share'} size={28} style={{margin: 10}}/>
                    <MaterialIcons name={'add-shopping-cart'} size={28} style={{margin: 10}}/>
                </View>
            </View>
        </Card.Content>
    </Card>
</View>
}