import {View, Text} from "react-native";
import {Card, Button, Avatar} from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const LeftContent = props => <Avatar.Icon {...props} icon="folder" />

export default function ProductDisplayCardCustomerFeed (props) {
    return   <Card mode={'elevated'} style={{borderRadius: 0, marginTop: 10, marginBottom: 10}}>
        <Card.Title title="Product Name" subtitle="Store Name" left={LeftContent}/>
        <Card.Cover style={{borderRadius: 0}} source={{uri: 'https://picsum.photos/700'}} />
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
}