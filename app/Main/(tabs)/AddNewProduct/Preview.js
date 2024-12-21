import {Pressable, ScrollView, Switch, View} from "react-native";
import {Button, Card, Surface, useTheme, Checkbox, Text} from "react-native-paper";
import ProductDisplayCardCustomerStore from "../../../../components/ProductDisplayCardCustomerStore";
import {useDispatch, useSelector} from "react-redux";
import {StyleSheet} from "react-native";
import {useEffect, useState} from "react";
import {resetNewProduct} from "../../../../store/newProductSlice";
import {useNavigation, useRouter} from "expo-router";
import {CommonActions} from "@react-navigation/native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";


export default function Preview(props) {

    const dispatch = useDispatch();
    const router = useRouter();
    const theme = useTheme();
    const newProduct = useSelector((state) => state.newProduct);
    const navigation = useNavigation();
    const publishProduct = () => {
        //publish
        // reset redux new product to empty
        console.log('resetting:', newProduct);
        dispatch(resetNewProduct());
        console.log('after reset:', newProduct);
        resetNavigationStack();
    };

    const saveAsDraft = () => {
        // save draft
        // reset redux new product to empty
        dispatch(resetNewProduct());
        resetNavigationStack();
    };

    const discard = () => {
        // reset redux new product to empty
        console.log('DISCARDING: redux product before reset:', newProduct);
        dispatch(resetNewProduct());
        console.log('AFTER DISCARDING: redux product before reset:', newProduct);
        resetNavigationStack();
    };

    const resetNavigationStack = () => {
        // Reset the navigation stack to the Dashboard tab
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: "Dashboard" }], // Replace with your Dashboard screen name
            })
        );
    }
    const PreviewHeader = () => {
        return <View style={{height: 60, paddingHorizontal: 15, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', }}>
            <Pressable onPressIn={() => { router.back()}}>
                <MaterialIcons name={'arrow-back'} size={36} style={{color: 'black'}}/>
            </Pressable>
            <Text variant={'titleLarge'} style={{ color: 'black'}}>Product Preview</Text>
            <Button onPress={publishProduct} mode={'contained'} style={{borderRadius: 8, backgroundColor: theme.colors.success }}>Publish</Button>
        </View>;
    }

    useEffect(() => {
        navigation.setOptions({header: PreviewHeader});
    },[navigation])


    return <Surface style={{flex: 1, padding: 10}}>
        <ScrollView style={{flex: 1}}>
        <ProductDisplayCardCustomerStore product={newProduct} showProductDescription={true} showRating={newProduct.enableRatings}/>
        <Card style={styles.card}>
            <Card.Content style={{position: 'relative'}}>
                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%',}}>
                    <Button onPress={discard} icon={'delete'} mode={'contained'} labelStyle={{color: 'white'}} style={{ borderRadius: 8, backgroundColor: theme.colors.error}}>Discard</Button>
                    <Button onPress={saveAsDraft} mode={'outlined'} style={{borderRadius: 8, borderWidth: 2,  borderColor: theme.colors.primary }}>Save As Draft</Button>
                </View>

            </Card.Content>
        </Card>
        </ScrollView>
    </Surface>
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
    },
    card: {
        position: 'relative',
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