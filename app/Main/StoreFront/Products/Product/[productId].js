// import {View, StyleSheet} from "react-native";
// import {Card, Text} from "react-native-paper";
// import MaterialIcons from "@expo/vector-icons/MaterialIcons";
// import FlatListSlider from "../../../../../components/MediaSlider/FlatListSlider";
// import MediaItem from "../../../../../components/MediaSlider/MediaItem";
// import { Rating } from '@kolking/react-native-rating';
// import {useLocalSearchParams} from "expo-router";
// // import {useQuery} from "react-query";
//
//
//
// export default function ProductPage (props) {
//
//     const { productId} = useLocalSearchParams();
//
//     // const productQuery = useQuery({ queryKey: ['getProduct', productId], queryFn: () => getProduct(productId) })
//
//
//
//     // console.log('size:', size);
//     return <Card mode={'elevated'} style={styles.card}>
//         <FlatListSlider
//             data={props.product.mediaItems}
//             local={false}
//             orientation={'landscape'}
//             separator={0}
//             currentIndexCallback={index => console.log('Index', index)}
//             // onPress={item => { console.log('pressed')}}
//             indicator
//             indicatorStyle={{}}
//             indicatorContainerStyle={{position: 'absolute', bottom: 10}}
//             indicatorActiveColor='#3498db'
//             indicatorInActiveColor='#bdc3c7'
//             indicatorActiveWidth={6}
//             contentContainerStyle={{backgroundColor: 'white'}}
//             component = {<MediaItem />}
//         />
//         <Card.Content style={styles.cardContent}>
//             <Text variant={'titleLarge'} style={styles.titleTextStyle}>
//                 {props.product.productName}
//             </Text>
//             <View style={styles.cardContentView}>
//                 <View>
//                     <Text variant="titleLarge">{'₹' + props.product.price.toString()}</Text>
//                     <View style={styles.rating}>
//                         <Rating disabled={true} variant={'stars-outline'} fillColor={'#faaf00'} baseColor={'black'} size={18} rating={props.product.rating} onChange={()=>{}} />
//                         <Text style={styles.ratingText} variant={'bodyLarge'}>
//                             {props.product.rating.toString() + '/5'}
//                         </Text>
//                     </View>
//                 </View>
//                 <View style={styles.actionButtonsContainer}>
//                     <MaterialIcons name={'favorite-border'} size={28} style={styles.actionButton}/>
//                     <MaterialIcons name={'share'} size={28} style={styles.actionButton}/>
//                     <MaterialIcons name={'add-shopping-cart'} size={28} style={styles.actionButton}/>
//                 </View>
//             </View>
//         </Card.Content>
//     </Card>
// }
//
// const styles = StyleSheet.create({
//     card: {
//         width: '100%',
//         borderRadius: 0,
//         marginBottom: 10,
//         backgroundColor: 'white'
//     },
//     titleTextStyle: {
//         color: 'black',
//         paddingLeft:0,
//         marginLeft: 0,
//         marginTop: 10
//     },
//     cardContent: {
//         backgroundColor: 'white'
//     },
//     cardContentView: {
//         width: '100%',
//         display: 'flex',
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         marginTop: 10
//     },
//     rating: {
//         display: 'flex',
//         flexDirection: 'row',
//         justifyContent: 'flex-start'
//     },
//     ratingText: {
//         marginLeft: 10
//     },
//     actionButtonsContainer: {
//         display: 'flex',
//         flexDirection: 'row',
//         alignItems: 'center',
//         alignContent: 'center'
//     },
//     actionButton: {
//         margin: 10
//     }
// })