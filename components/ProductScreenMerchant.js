import {View, StyleSheet, Pressable} from "react-native";
import {Card, Surface, Text} from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FlatListSlider from "./MediaSlider/FlatListSlider";
import MediaItem from "./MediaSlider/MediaItem";
import { Rating } from '@kolking/react-native-rating';
import {Colors} from "../styles/Colors";
import {useRouter} from "expo-router";

export default function ProductScreenMerchant (props) {

    const router = useRouter();
    console.log('props:', props.product.productId);
    // console.log('size:', size);
    return <Surface style={{flex: 1, width: '100%', justifyContent: 'flex-start', flexDirection: 'column', alignItems: 'center', padding: 10}}>
    <Card mode={'elevated'} style={styles.card}>
        <FlatListSlider
            data={props.product.mediaItems}
            local={false}
            orientation={'landscape'}
            separator={0}
            currentIndexCallback={index => console.log('Index', index)}
            // onPress={item => { console.log('pressed')}}
            keyExtractor={(item) => item.mediaId}
            indicator
            indicatorStyle={{}}
            indicatorContainerStyle={{position: 'absolute', bottom: 10}}
            indicatorActiveColor='#3498db'
            indicatorInActiveColor='#bdc3c7'
            indicatorActiveWidth={6}
            flatListWrapperStyle={{backgroundColor: 'black', width: '100%', aspectRatio: props.orientation==='portrait' ? '0.8' : '1.33'}}
            // contentContainerStyle={{backgroundColor: 'black'}}
            allowPanZoom={false}
            component = {<MediaItem />}
            />
        <Card.Content style={styles.cardContent}>
            <Text variant={'titleLarge'} style={styles.titleTextStyle}>
                {props.product.productName}
            </Text>
            <View style={styles.cardContentView}>
                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start'}}>
                    <View>
                    <Text variant="titleMedium">{'Price: ₹' + props.product.price.toString()}</Text>
                    <Text variant="titleMedium">{'Stock: ' + props.product.stock.toString()}</Text>
                    </View>
                    <View style={styles.rating}>
                        <Rating disabled={true} variant={'stars-outline'} fillColor={'#faaf00'} baseColor={'black'} size={18} rating={props.product.rating} onChange={()=>{}} />
                        <Text style={styles.ratingText} variant={'bodyLarge'}>
                            {props.product.rating.toString() + '/5 ' + '(' + props.product.numberOfRatings.toString() + ')'}
                        </Text>
                    </View>
                </View>
                <View style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop: 10}}>
                    {props.product.attributes.map((a, i) => {
                        return <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}} key={i.toString()}>
                            <Text variant={'bodyLarge'}>{a.key + ': '}</Text>
                            <Text variant={'bodyLarge'}>{a.value}</Text>
                        </View>
                    })}
                </View>
            </View>
            <View style={{marginTop: 10}}>
                <Text variant={'bodyLarge'}>{props.product.productDescription}</Text>
            </View>
        </Card.Content>
    </Card>
    </Surface>
}

const styles = StyleSheet.create({
    card: {
        width: '100%',
        borderRadius: 0,
        backgroundColor: 'white'
    },
    titleTextStyle: {
        color: 'black',
        paddingLeft:0,
        marginLeft: 0,
        marginTop: 10
    },
    cardContent: {
        backgroundColor: 'white'
    },
    cardContentView: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        marginTop: 10
    },
    rating: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        // justifyContent: 'flex-start'
    },
    ratingText: {
        marginLeft: 10
    },
    actionButtonsContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        alignContent: 'center'
    },
    actionButton: {
        margin: 10
    }
})