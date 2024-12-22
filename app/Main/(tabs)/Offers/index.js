import React, {useState} from 'react';
import {FlatList, View, StyleSheet, Pressable, ScrollView} from 'react-native';
import {Text, Switch, Card, Button, Divider, Surface, useTheme, Chip} from 'react-native-paper';
import {useRouter} from 'expo-router';
import {faker} from '@faker-js/faker';
import {getOffer} from "../../../../utils/fakeDataMethods";
import * as Crypto from 'expo-crypto';
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const OffersScreen = () => {

    // console.log(getOffer());
    const existingOffers = faker.helpers.multiple(getOffer, {count: faker.number.int(20)});
    console.log('EO:', existingOffers);

    const [offers, setOffers] = useState(existingOffers);
    const theme = useTheme();
    const router = useRouter();
    const styles = makeStyles(theme);

    const toggleOfferActivation = (offerId) => {
        setOffers((prevOffers) => prevOffers.map((offer) => offer.offerId === offerId ? {
            ...offer,
            isActive: !offer.isActive
        } : offer));
    };

    const renderOfferItem = (item) => (
        <View key={item.offerId} style={{width: '100%'}}>
        <Pressable onPress={() => router.push(`/Main/(tabs)/Offers/Offer/${item.offerId}`)}>
        <Card style={styles.offerCard} >
                <View style={styles.cardContent}>
                    <View>
                        <Text variant={'titleLarge'}>{item.name}</Text>
                        <Text variant={'bodyLarge'}>Offer Type: {item.type}</Text>
                        <View style={{display: 'flex', flexWrap: 'wrap', flexDirection: 'row'}}>
                            {item.applicableTo.products.length > 0 && <Text
                                variant={'bodyLarge'}>{item.applicableTo.products.length.toString() + ' Products  '}</Text>}
                            {item.applicableTo.collections.length > 0 && <Text
                                variant={'bodyLarge'}>{item.applicableTo.collections.length.toString() + ' Collections  '}</Text>}
                            {item.applicableTo.tags.length > 0 && <Text
                                variant={'bodyLarge'}>{item.applicableTo.tags.length.toString() + ' Tags  '}</Text>}
                        </View>
                        <Text variant={'bodyLarge'}>
                            Valid: {item.validity.startDate.toLocaleDateString()} - {item.validity.endDate.toLocaleDateString()}
                        </Text>

                    </View>
                    {/*<Switch*/}
                    {/*    value={item.isActive}*/}
                    {/*    onValueChange={() => toggleOfferActivation(item.offerId)}*/}
                    {/*    color={item.isActive ? theme.colors.success : theme.colors.primary}*/}
                    {/*/>*/}
                    <Chip textStyle={{color: 'white'}} style={{
                        backgroundColor: item.isActive ? theme.colors.success : '#aaa'
                    }}>{item.isActive ? 'Active' : 'Inactive'}</Chip>
                </View>

        </Card>
        </Pressable>
            <Divider style={{marginVertical: 10}}/>
        </View>
    );

    let nActive = offers.filter((o)=> o.isActive).length;
    let nInactive = offers.filter((o)=> !o.isActive).length;

    return (<Surface style={styles.container}>
            <ScrollView>
                <View style={{marginVertical: 10}}>
                    <View style={{marginLeft: 8, marginTop: 8, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start'}}>
                        <MaterialIcons name={'discount'} size={40} color={theme.colors.primary} style={{}}/>
                        <Text variant={'displaySmall'} style={{marginLeft: 10, color: theme.colors.secondary}}>Offers</Text>
                    </View>
                    <Text variant={'bodyLarge'} style={{marginLeft: 10}}>{nActive.toString() + ' Active Offer' + (nActive !== 1 ? 's' : '')}</Text>
                    <Text variant={'bodyLarge'} style={{marginLeft: 10}}>{nInactive.toString() + ' Inactive Offer'  + (nInactive !== 1 ? 's' : '')}</Text>
                    <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', marginVertical: 15}}>
                        <Button onPress={() => router.push('/Main/(tabs)/Offers/Offer/' + Crypto.randomUUID())}
                                mode={'contained'} icon={'plus'}
                                style={{borderRadius: 8, backgroundColor: theme.colors.secondary}}>Create New Offer</Button>
                    </View>
                </View>


                <View style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 2}}>
                    {offers.map(renderOfferItem)}
                </View>
                {/*<FlatList*/}
                {/*    data={offers}*/}
                {/*    keyExtractor={(item) => item.offerId}*/}
                {/*    renderItem={renderOfferItem}*/}
                {/*    ItemSeparatorComponent={() => <Divider />}*/}
                {/*    ListEmptyComponent={<Text style={styles.emptyText}>No Offers Available</Text>}*/}
                {/*    contentContainerStyle={styles.listContent}*/}
                {/*/>*/}
            </ScrollView>
        </Surface>);
};

const makeStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        paddingHorizontal: 10,
    },
    listContent: {
        padding: 10,
    },
    offerCard: {
        borderRadius: 8, elevation: 2, width: '100%', backgroundColor: 'white'
    },
    cardContent: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 10, position: 'relative'
    },
    offerName: {
        fontSize: 16, fontWeight: 'bold',
    },
    offerDetails: {
        fontSize: 14, color: theme.colors.textSecondary,
    },
    emptyText: {
        textAlign: 'center', marginTop: 20, fontSize: 16, color: theme.colors.text,
    },
});

export default OffersScreen;
