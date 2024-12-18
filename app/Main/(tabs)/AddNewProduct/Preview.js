import {Text, View} from "react-native";
import {Button, Surface, useTheme} from "react-native-paper";
import ProductDisplayCardCustomerStore from "../../../../components/ProductDisplayCardCustomerStore";
import {useSelector} from "react-redux";


export default function Preview(props) {
    const theme = useTheme();
    const newProduct = useSelector((state) => state.newProduct);
    console.log('newP:', newProduct);
    return <Surface style={{flex: 1, padding: 10}}>
        <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 15}}>
            <Button mode={'outlined'} style={{borderRadius: 8, borderWidth: 2,  borderColor: theme.colors.primary }}>Save As Draft</Button>
            <Button mode={'contained'} style={{borderRadius: 8, backgroundColor: theme.colors.success }}>Publish Product</Button>
        </View>
        <ProductDisplayCardCustomerStore product={newProduct} showProductDescription={true}/>
    </Surface>
}