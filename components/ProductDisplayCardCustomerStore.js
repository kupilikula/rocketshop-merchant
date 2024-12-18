import {View, StyleSheet, Pressable} from "react-native";
import {Card, Text} from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FlatListSlider from "./MediaSlider/FlatListSlider";
import MediaItem from "./MediaSlider/MediaItem";
import { Rating } from '@kolking/react-native-rating';
import {Colors} from "../styles/Colors";
import {useRouter} from "expo-router";

export default function ProductDisplayCardCustomerStore (props) {

    const router = useRouter();
    console.log('props:', props);
    // console.log('size:', size);
    return <Card mode={'elevated'} style={styles.card}>
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
            flatListWrapperStyle={{backgroundColor: 'white', width: '100%', aspectRatio: '1.33'}}
            allowPanZoom={false}
            component = {<MediaItem />}
            />
        <Card.Content style={styles.cardContent}>
            <Text variant={'titleLarge'} style={styles.titleTextStyle}>
                {props.product.productName}
            </Text>
            <View style={styles.cardContentView}>
                <View>
                    <Text variant="titleLarge">{'₹' + props.product.price.toString()}</Text>
                    {props.product.numberOfRatings > 0 &&
                    <View style={styles.rating}>
                        <Rating disabled={true} variant={'stars-outline'} fillColor={'#faaf00'} baseColor={'black'} size={18} rating={props.product.rating} onChange={()=>{}} />
                        <Text style={styles.ratingText} variant={'bodyLarge'}>
                            {props.product.rating.toString() + '/5 ' + '(' + props.product.numberOfRatings.toString() + ')'}
                        </Text>
                    </View>
                    }
                </View>
                <View style={styles.actionButtonsContainer}>
                    <MaterialIcons name={'bookmark'} size={28} style={styles.actionButton}/>
                    <MaterialIcons name={'share'} size={28} style={styles.actionButton}/>
                    <MaterialIcons name={'add-shopping-cart'} size={28} style={styles.actionButton}/>
                </View>
            </View>
            {props.product.attributes.length > 0 &&
            <View style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                {props.product.attributes.map((a, i) => {
                    return <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}} key={i.toString()}>
                        <Text variant={'titleMedium'}>{a.key + ': '}</Text>
                        <Text variant={'titleMedium'}>{a.value}</Text>
                    </View>
                })}
            </View>}
            {props.showProductDescription && <View style={{marginTop: 15}}>
                <Text variant={'bodyLarge'}>{props.product.description}</Text>
            </View>}
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
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