import {ScrollView, Switch, View} from "react-native";
import {Button, Card, Surface, useTheme, Checkbox, Text} from "react-native-paper";
import ProductDisplayCardCustomerStore from "../../../../components/ProductDisplayCardCustomerStore";
import {useSelector} from "react-redux";
import {StyleSheet} from "react-native";
import {useState} from "react";

export default function Preview(props) {

    const [enableRatings, setEnableRatings] = useState(false);
    const [enableReviews, setEnableReviews] = useState(false);
    const [enableStockTracking, setEnableStockTracking] = useState(false);
    const [gstInclusive, setGstInclusive] = useState(false);
    const theme = useTheme();
    const newProduct = useSelector((state) => state.newProduct);
    return <ScrollView>
    <Surface style={{flex: 1, padding: 10}}>
        <ProductDisplayCardCustomerStore product={newProduct} showProductDescription={true} showRating={enableRatings}/>
        <Card style={styles.card}>
            <Card.Content>
                <View style={styles.optionColumn}>
                    <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', marginVertical: 8, marginHorizontal: 10}}>
                        <Switch
                            value={enableRatings}
                            onValueChange={setEnableRatings}
                            style={{}}
                        />
                        <Text variant={'bodyLarge'}>Enable Ratings</Text>
                    </View>
                    <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', marginVertical: 8, marginHorizontal: 10}}>
                        <Switch
                            value={enableReviews}
                            onValueChange={setEnableReviews}
                            style={{}}
                        />
                        <Text variant={'bodyLarge'}>Enable Reviews</Text>
                    </View>
                    <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', marginVertical: 8, marginHorizontal: 10}}>
                        <Switch
                            value={enableStockTracking}
                            onValueChange={setEnableStockTracking}
                            style={{}}
                        />
                        <Text variant={'bodyLarge'}>Enable Stock Tracking</Text>
                    </View>
                    <Checkbox.Item
                        label="GST Inclusive"
                        position={'leading'}
                        labelStyle={{ fontSize: 16}}
                        status={gstInclusive ? "checked" : "unchecked"}
                        onPress={() => setGstInclusive(!gstInclusive)}
                    />
                </View>
                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%',}}>
                    <Button mode={'outlined'} style={{borderRadius: 8, borderWidth: 2,  borderColor: theme.colors.primary }}>Save As Draft</Button>
                    <Button mode={'contained'} style={{borderRadius: 8, backgroundColor: theme.colors.success }}>Publish Product</Button>
                </View>

            </Card.Content>
        </Card>

    </Surface>
    </ScrollView>
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
    },
    card: {
        marginBottom: 15,
        backgroundColor: 'white'
    },
    optionColumn: {
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        marginBottom: 15,
        // marginBottom: 10,
        // backgroundColor: 'white',
        padding: 0
    },
    input: {
        marginBottom: 10,
    },
    actionButtons: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        marginTop: 20,
    },
    publishButton: {
        backgroundColor: "#4caf50",
    },
});