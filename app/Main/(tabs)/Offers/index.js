import React from "react";
import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import {Text, Card, Button, Divider, Surface, useTheme, Chip, ActivityIndicator} from "react-native-paper";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useOffers } from "../../../../api/hooks/useOffers"; // Import custom hook
import { useSelector } from "react-redux";
import ScrollableScreen from "../../../../components/ScrollableScreen"; // Assuming storeId is in Redux store

const OffersScreen = () => {
    const theme = useTheme();
    const router = useRouter();
    const storeId = useSelector((state) => state.store.storeId); // Get storeId from Redux
    const { data: offers = [], isLoading, isError } = useOffers(storeId);
    console.log('offers:', offers);
    const styles = makeStyles(theme);

    const renderOfferItem = (item) => (
        <View key={item.offerId} style={{ width: "100%" }}>
            <Pressable
                onPress={() => router.push(`/Main/(tabs)/Offers/Offer/${item.offerId}`)}
            >
                <Card style={styles.offerCard}>
                    <View style={styles.cardContent}>
                        <View>
                            <Text variant={"titleLarge"}>{item.offerName}</Text>
                            <Text variant={"bodyLarge"}>Offer Type: {item.offerType}</Text>
                            <View
                                style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    flexDirection: "row",
                                }}
                            >
                                {item.applicableTo.productIds?.length > 0 && (
                                    <Text variant={"bodyLarge"}>
                                        {item.applicableTo.productIds.length.toString() + " Products  "}
                                    </Text>
                                )}
                                {item.applicableTo.collectionIds?.length > 0 && (
                                    <Text variant={"bodyLarge"}>
                                        {item.applicableTo.collectionIds.length.toString() +
                                            " Collections  "}
                                    </Text>
                                )}
                                {item.applicableTo.productTags?.length > 0 && (
                                    <Text variant={"bodyLarge"}>
                                        {item.applicableTo.productTags.length.toString() + " Tags  "}
                                    </Text>
                                )}
                            </View>
                            <Text variant={"bodyLarge"}>
                                Valid: {new Date(item.validityDateRange.validFrom).toLocaleDateString()} -{" "}
                                {new Date(item.validityDateRange.validUntil).toLocaleDateString()}
                            </Text>
                        </View>
                        <Chip
                            textStyle={{ color: "black" }}
                            style={{
                                backgroundColor: item.isActive ? theme.colors.softSuccess : theme.colors.inactive,
                            }}
                        >
                            {item.isActive ? "Active" : "Inactive"}
                        </Chip>
                    </View>
                </Card>
            </Pressable>
            <Divider style={{ marginVertical: 10 }} />
        </View>
    );

    if (isLoading) {
        return <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: theme.colors.surface,
            }}
        >
            <ActivityIndicator size={100} animating={true} color={theme.colors.primary} />
        </View>;
    }

    if (isError) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: theme.colors.surface,
                }}
            >
                <Text variant={"titleLarge"}>Error Loading Offers.</Text>
            </View>
        );
    }

    let nActive = offers.filter((o) => o.isActive).length;
    let nInactive = offers.filter((o) => !o.isActive).length;

    return (
        <ScrollableScreen innerStyle={styles.container} backgroundColor={theme.colors.surface}>
                <View style={{ marginVertical: 10 }}>
                    <View
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "center",
                            marginVertical: 15,
                        }}
                    >
                        <Button
                            onPress={() =>
                                router.push("/Main/(tabs)/Offers/Offer/NewOffer")
                            }
                            mode={"contained"}
                            icon={"plus"}
                            style={{
                                borderRadius: 8,
                                backgroundColor: theme.colors.secondary,
                            }}
                        >
                            Create New Offer
                        </Button>
                    </View>
                </View>
            <View style={{ marginBottom: 10 }}>
            <Text variant={"bodyLarge"} style={{ marginLeft: 10 }}>
                {nActive.toString() + " Active Offer" + (nActive !== 1 ? "s" : "")}
            </Text>
            <Text variant={"bodyLarge"} style={{ marginLeft: 10 }}>
                {nInactive.toString() +
                    " Inactive Offer" +
                    (nInactive !== 1 ? "s" : "")}
            </Text>
            </View>
            <View
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 2,
                    }}
                >
                    {offers.map(renderOfferItem)}
                </View>
        </ScrollableScreen>
    );
};

const makeStyles = (theme) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.surface,
            paddingHorizontal: 10,
        },
        offerCard: {
            borderRadius: 0,
            elevation: 2,
            width: "100%",
            backgroundColor: "white",
        },
        cardContent: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            padding: 10,
            position: "relative",
        },
    });

export default OffersScreen;