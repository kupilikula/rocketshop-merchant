import {View} from "react-native";
import {Card, Avatar, Text} from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FlatListSlider from "./MediaSlider/FlatListSlider";
import MediaItem from "./MediaSlider/MediaItem";
import { Rating } from '@kolking/react-native-rating';

const StoreLogo = props => <Avatar.Icon {...props} icon="folder" size={50} />

const imageData = [
    {
        image:
            'https://picsum.photos/700',
        desc:
            'Sample Description below the image for representation purpose only',
    },
    {
        image:
            'https://picsum.photos/500',
        desc:
            'Sample Description below the image for representation purpose only',
    }];

export default function ProductDisplayCardCustomerFeed (props) {

    // console.log('size:', size);
    return <Card mode={'elevated'} style={{width: '100%', borderRadius: 0, marginTop: 10, marginBottom: 10, backgroundColor: 'white'}}>
        <Card.Title title="Product Name ABCD adsfew we3lk efwekm dflkmlk" titleNumberOfLines={3} titleVariant={'titleLarge'} subtitle="Store Name" subtitleVariant={'bodyLarge'} subtitleNumberOfLines={2} left={StoreLogo}/>
        {/*<Image style={{borderRadius: 0, width:'100%', aspectRatio: '1.91'}} source={{ uri: "https://picsum.photos/700"}} />*/}
        <FlatListSlider
            data={imageData}
            imageKey={'image'}
            local={false}
            orientation={'landscape'}
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
                    <Text variant="titleLarge">₹375</Text>
                    <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-start'}}>
                    <Rating disabled={true} variant={'stars-outline'} fillColor={'#faaf00'} baseColor={'black'} size={18} rating={3.5} onChange={()=>{}} /><Text style={{marginLeft: 5}} variant={'bodyMedium'}>3.5/5</Text>
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