import {View} from "react-native";
import {Card, Avatar, Text} from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FlatListSlider from "./MediaSlider/FlatListSlider";
import MediaItem from "./MediaSlider/MediaItem";
import { Rating } from '@kolking/react-native-rating';
import {Image} from 'expo-image';

const StoreLogo = props => <Image source={'https://picsum.photos/400'} style={{height: 60, width: 60, borderRadius: 30, borderStyle: 'solid', borderWidth:2, borderColor: 'white', margin:0, padding: 0}}/>

const imageData = [
    {
        mediaType: 'image',
        uri:
            'https://picsum.photos/700',
        desc:
            'Sample Description below the image for representation purpose only',
    },
    {
        mediaType: 'image',
        uri:
            'https://picsum.photos/500',
        desc:
            'Sample Description below the image for representation purpose only',
    },
    {
        mediaType: 'video',
        uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnail: 'https://picsum.photos/400',
        desc: 'Test Video'
    }
    ];

export default function ProductDisplayCardCustomerFeed (props) {

    // console.log('size:', size);
    return <Card mode={'elevated'} style={{width: '100%', borderRadius: 0, marginTop: 5, marginBottom: 5, backgroundColor: 'white'}}>
        <Card.Title title="Product Name ABCD adsfew we3lk efwekm dflkmlk" titleNumberOfLines={3} titleVariant={'titleLarge'} subtitle="Store Name" subtitleVariant={'bodyLarge'} subtitleNumberOfLines={2} left={StoreLogo} leftStyle={{width: 70, marginLeft: 10, paddingLeft: 0, marginRight: 0, paddingRight: 0}} style={{backgroundColor: 'black', marginLeft: 0, paddingLeft: 0}} titleStyle={{color: 'white', paddingLeft:0, marginLeft: 0}} subtitleStyle={{color: 'white'}}/>
        {/*<Image style={{borderRadius: 0, width:'100%', aspectRatio: '1.91'}} source={{ uri: "https://picsum.photos/700"}} />*/}
        <FlatListSlider
            data={imageData}
            local={false}
            orientation={'landscape'}
            separator={0}
            currentIndexCallback={index => console.log('Index', index)}
            // onPress={item => { console.log('pressed')}}
            indicator
            indicatorStyle={{}}
            indicatorContainerStyle={{}}
            indicatorActiveColor='#3498db'
            indicatorInActiveColor='#bdc3c7'
            indicatorActiveWidth={6}
            contentContainerStyle={{backgroundColor: '#f6effc'}}
            component = {<MediaItem />}
            />
        <Card.Content style={{backgroundColor: 'white',}}>
            <View style={{width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: 10}}>
                <View>
                    <Text variant="titleLarge">₹375</Text>
                    <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-start'}}>
                    <Rating disabled={true} variant={'stars-outline'} fillColor={'#faaf00'} baseColor={'black'} size={18} rating={3.5} onChange={()=>{}} /><Text style={{marginLeft: 10}} variant={'bodyLarge'}>3.5/5</Text>
                    </View>
                </View>
                <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', alignContent: 'center'}}>
                    <MaterialIcons name={'favorite-border'} size={28} style={{margin: 10}}/>
                    <MaterialIcons name={'share'} size={28} style={{margin: 10}}/>
                    <MaterialIcons name={'add-shopping-cart'} size={28} style={{margin: 10}}/>
                </View>
            </View>
        </Card.Content>
    </Card>
}