import {View, StyleSheet, Pressable, ScrollView, Switch, Platform} from "react-native";
import {Button, Card, Chip, Surface, Text, ToggleButton, useTheme} from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FlatListSlider from "./MediaSlider/FlatListSlider";
import MediaItem from "./MediaSlider/MediaItem";
import { Rating } from '@kolking/react-native-rating';
import {Colors} from "../styles/Colors";
import {useNavigation, useRouter} from "expo-router";
import React, {useEffect, useState} from "react";

export default function ProductScreenMerchant (props) {

    const router = useRouter();
    const theme = useTheme();
    const navigation = useNavigation();

    console.log('props:', props.product.productId);
    const [productStatus, setProductStatus] = useState(props.product.productStatus);

    // useEffect(() => {
    //     navigation.setOptions({
    //         header: () => <View style={{height: 60, backgroundColor: theme.colors.secondary, width: '100%'}}></View>
    //         // headerTitle: 'All Products',
    //         // headerLeft: () =>
    //     });
    // },[navigation])

    const handleStatusChange = (status) => {
        setProductStatus(!status ? 'Draft' : 'Active')
        console.log(`Product status changed to: ${status}`);
    };

    const handleArchive = () => {
        console.log(`Product ${props.product.productId} archived`);
    };

    console.log('props.product:', props.product);
    // console.log('size:', size);
    return <Surface style={{flex: 1, width: '100%', flexDirection: 'column', alignItems: 'center', padding: 10}}>
        <ScrollView>
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
                <View style={styles.actionContainer}>
                    <Button mode={'contained'} style={{borderRadius: 8, marginBottom: 15}}>Edit Product</Button>
                    <View style={styles.statusContainer}>
                    <Switch
                        // style={ Platform.OS==='ios' ? { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }]} : {}}
                        value={productStatus==='Active'}
                        onValueChange={handleStatusChange}
                        // color={productStatus==='Active' ? "#f44336" : "#4caf50"} // Green for Active, Red for Draft
                    />
                    <Chip textStyle={{color: 'white', textAlign: 'center'}}
                          style={{marginLeft: 10, backgroundColor: productStatus==='Active' ? "#4caf50" : "#aaaaaa"}}>
                        {productStatus}
                    </Chip>
                    </View>
                </View>
                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start'}}>
                    <View>
                    <Text variant="titleMedium">{'Price: ₹' + props.product.price.toString()}</Text>
                    <Text variant="titleMedium">{'Stock: ' + props.product.stock.toString()}</Text>
                    </View>
                        {/*<Button*/}
                        {/*    mode="contained"*/}
                        {/*    style={styles.actionButton}*/}
                        {/*    onPress={() => router.push(`/EditProductInfo/${props.product.productId}`)}*/}
                        {/*>*/}
                        {/*    Edit Product*/}
                        {/*</Button>*/}
                </View>
                <View style={styles.gstContainer}>
                    <Text>{"GST Rate: " + props.product.gstRate + "%"}</Text>
                </View>

                <View style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop: 10}}>
                    {props.product.attributes.map((a, i) => {
                        return <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}} key={i.toString()}>
                            <Text variant={'titleMedium'}>{a.key + ': '}</Text>
                            <Text variant={'titleMedium'}>{a.value}</Text>
                        </View>
                    })}
                </View>
            </View>
            {props.product.numberOfRatings > 0 &&
            <View style={styles.rating}>
                <Rating disabled={true} variant={'stars-outline'} fillColor={'#faaf00'} baseColor={'black'} size={18} rating={props.product.rating} onChange={()=>{}} />
                <Text style={styles.ratingText} variant={'bodyLarge'}>
                    {props.product.rating.toString() + '/5 ' + '(' + props.product.numberOfRatings.toString() + ')'}
                </Text>
            </View>}
            <View style={{marginTop: 10}}>
                <Text variant={'bodyLarge'} style={{color: 'black'}}>{props.product.description}</Text>
            </View>
            <View style={{marginTop: 15}}>
                <Text variant={"titleMedium"} style={{marginBottom: 10}}>Collections:</Text>
                <View style={styles.collectionsContainer}>
                {props.product.collections.map((c) => <View style={{display: 'flex', flexDirection:'row', margin: 5}} key={c}><Chip textStyle={{color: 'white'}} style={{backgroundColor: theme.colors.secondary}}>{c}</Chip></View>)}
                </View>
            </View>

            <Text variant={"titleMedium"} style={{marginTop: 10}}>Tags:</Text>
            <View style={styles.tagsContainer}>
                {props.product.tags.map((tag, i) => (
                    <Chip key={i} style={styles.chip}>
                        {tag}
                    </Chip>
                ))}
            </View>

        </Card.Content>
    </Card>
        </ScrollView>
    </Surface>
}

const styles = StyleSheet.create({
    card: {
        position: 'relative',
        width: '100%',
        borderRadius: 0,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: "#aaa"
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
        marginTop: 10,
        position: 'relative'
    },
    rating: {
        marginTop: 15,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
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
    },
    collectionsContainer: {flexDirection: "row", flexWrap: "wrap", },
    tagsContainer: { flexDirection: "row", flexWrap: "wrap", marginVertical: 10 },
    chip: { margin: 5 },
    gstContainer: { marginTop: 10, fontSize: 12, color: "gray" },
    actionContainer: {
        position: 'absolute',
        right: 0,
        top: 0,
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "flex-end",
    },
    statusContainer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
    },

    toggleButtons: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        width: "100%",
    },
    toggleButton: {
        borderRadius: 0,
        // marginHorizontal: 5,
        width: "50%",
    },
    activeButton: {
        backgroundColor: "#4caf50", // Green for Active
    },
    draftButton: {
        backgroundColor: "#f44336", // Red for Draft
    },
    archiveButton: { marginTop: 20, alignSelf: "center" },
})