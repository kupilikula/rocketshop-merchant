import React, { useState } from 'react';
import { FlatList, View, StyleSheet, Pressable } from 'react-native';
import { Text, Switch, Card, Button, Divider, Surface, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { faker } from '@faker-js/faker';
import {getOffer} from "../../../../utils/fakeDataMethods";

const generateOffers = () =>
    Array.from({ length: 10 }, () => ({
        offerId: faker.string.uuid(),
        name: faker.commerce.promotionCode(),
        type: faker.helpers.arrayElement(['Percentage Off', 'Fixed Amount Off', 'Buy N Get K Free', 'Free Shipping']),
        validity: {
            startDate: faker.date.future().toLocaleDateString(),
            endDate: faker.date.future().toLocaleDateString(),
        },
        isActive: faker.datatype.boolean(),
    }));

const OffersScreen = () => {

    // console.log(getOffer());
    const existingOffers = faker.helpers.multiple(getOffer);
    console.log('EO:', existingOffers);

    const [offers, setOffers] = useState(existingOffers);
    const theme = useTheme();
    const router = useRouter();
    const styles = makeStyles(theme);

    const toggleOfferActivation = (offerId) => {
        setOffers((prevOffers) =>
            prevOffers.map((offer) =>
                offer.offerId === offerId ? { ...offer, isActive: !offer.isActive } : offer
            )
        );
    };

    const renderOfferItem = ({ item }) => (
        <Card style={styles.offerCard}>
            <Pressable onPress={() => router.push(`/Main/(tabs)/Offers/Offer/${item.offerId}`)}>
                <View style={styles.cardContent}>
                    <View>
                        <Text style={styles.offerName}>{item.name}</Text>
                        <Text style={styles.offerDetails}>Type: {item.type}</Text>
                        <Text style={styles.offerDetails}>
                            Valid: {item.validity.startDate.toLocaleDateString()} - {item.validity.endDate.toLocaleDateString()}
                        </Text>
                    </View>
                    <Switch
                        value={item.isActive}
                        onValueChange={() => toggleOfferActivation(item.offerId)}
                        color={theme.colors.primary}
                    />
                </View>
            </Pressable>
        </Card>
    );

    return (
        <Surface style={styles.container}>
            <FlatList
                data={offers}
                keyExtractor={(item) => item.offerId}
                renderItem={renderOfferItem}
                ItemSeparatorComponent={() => <Divider />}
                ListEmptyComponent={<Text style={styles.emptyText}>No Offers Available</Text>}
                contentContainerStyle={styles.listContent}
            />
        </Surface>
    );
};

const makeStyles = (theme) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        listContent: {
            padding: 10,
        },
        offerCard: {
            marginBottom: 10,
            borderRadius: 8,
            elevation: 2,
        },
        cardContent: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 10,
        },
        offerName: {
            fontSize: 16,
            fontWeight: 'bold',
        },
        offerDetails: {
            fontSize: 14,
            color: theme.colors.textSecondary,
        },
        emptyText: {
            textAlign: 'center',
            marginTop: 20,
            fontSize: 16,
            color: theme.colors.text,
        },
    });

export default OffersScreen;
