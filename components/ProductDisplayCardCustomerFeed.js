import {View, StyleSheet} from "react-native";
import {Card, Text} from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FlatListSlider from "./MediaSlider/FlatListSlider";
import MediaItem from "./MediaSlider/MediaItem";
import { Rating } from '@kolking/react-native-rating';
import {Image} from 'expo-image';
import {Colors} from "../styles/Colors";

const StoreLogo = (_) => <Image source={_.logoImage} style={styles.logo}/>

export default function ProductDisplayCardCustomerFeed (props) {

    // console.log('size:', size);
    return <Card mode={'elevated'} style={styles.card}>
        <Card.Title title={props.product.productName}
                    titleNumberOfLines={3}
                    titleVariant={'titleLarge'}
                    subtitle={props.product.storeName}
                    subtitleVariant={'bodyLarge'}
                    subtitleNumberOfLines={2}
                    left={() => StoreLogo({logoImage: props.product.storeLogoImage})}
                    leftStyle={styles.titleLogoLeftStyle}
                    style={styles.titleComponentStyle}
                    titleStyle={styles.titleTextStyle}
                    subtitleStyle={styles.subtitleTextStyle}/>
        <FlatListSlider
            data={props.product.mediaItems}
            local={false}
            orientation={'landscape'}
            separator={0}
            currentIndexCallback={index => console.log('Index', index)}
            // onPress={item => { console.log('pressed')}}
            indicator
            indicatorStyle={{}}
            indicatorContainerStyle={{position: 'absolute', bottom: 10}}
            indicatorActiveColor='#3498db'
            indicatorInActiveColor='#bdc3c7'
            indicatorActiveWidth={6}
            contentContainerStyle={{backgroundColor: 'white'}}
            component = {<MediaItem />}
            />
        <Card.Content style={styles.cardContent}>
            <View style={styles.cardContentView}>
                <View>
                    <Text variant="titleLarge">{'₹' + props.product.price.toString()}</Text>
                    <View style={styles.rating}>
                        <Rating disabled={true} variant={'stars-outline'} fillColor={'#faaf00'} baseColor={'black'} size={18} rating={props.product.rating} onChange={()=>{}} />
                        <Text style={styles.ratingText} variant={'bodyLarge'}>
                            {props.product.rating.toString() + '/5'}
                        </Text>
                    </View>
                </View>
                <View style={styles.actionButtonsContainer}>
                    <MaterialIcons name={'favorite-border'} size={28} style={styles.actionButton}/>
                    <MaterialIcons name={'share'} size={28} style={styles.actionButton}/>
                    <MaterialIcons name={'add-shopping-cart'} size={28} style={styles.actionButton}/>
                </View>
            </View>
        </Card.Content>
    </Card>
}

const styles = StyleSheet.create({
    card: {
        width: '100%',
        borderRadius: 0,
        marginBottom: 10,
        backgroundColor: 'white'
    },
    logo: {
        height: 60,
        width: 60,
        borderRadius: 30,
        borderStyle: 'solid',
        borderWidth: 2,
        borderColor: Colors.vividSkyBlue,
        margin:0,
        padding: 0
    },
    titleComponentStyle: {
        backgroundColor: 'black',
        marginLeft: 0,
        paddingLeft: 0
    },
    titleLogoLeftStyle: {
        width: 70,
        marginLeft: 10,
        paddingLeft: 0,
        marginRight: 0,
        paddingRight: 0
    },
    titleTextStyle: {
        color: 'white',
        paddingLeft:0,
        marginLeft: 0
    },
    subtitleTextStyle: {
        color: 'white'
    },
    cardContent: {
        backgroundColor: 'white'
    },
    cardContentView: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10
    },
    rating: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start'
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