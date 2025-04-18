import React from "react";
import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { Text, Card, Button, Divider, Surface, useTheme, Chip } from "react-native-paper";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useOffers } from "../../../../api/hooks/useOffers"; // Import custom hook
import { useSelector } from "react-redux"; // Assuming storeId is in Redux store

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
                            textStyle={{ color: "white" }}
                            style={{
                                backgroundColor: item.isActive ? theme.colors.success : "#aaa",
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
        return (
            <Surface style={styles.container}>
                <Text variant="titleLarge" style={{ textAlign: "center", marginTop: 20 }}>
                    Loading offers...
                </Text>
            </Surface>
        );
    }

    if (isError) {
        return (
            <Surface style={styles.container}>
                <Text variant="titleLarge" style={{ textAlign: "center", marginTop: 20, color: theme.colors.error }}>
                    Failed to load offers. Please try again later.
                </Text>
            </Surface>
        );
    }

    let nActive = offers.filter((o) => o.isActive).length;
    let nInactive = offers.filter((o) => !o.isActive).length;

    return (
        <Surface style={styles.container}>
            <ScrollView>
                <View style={{ marginVertical: 10 }}>
                    <Text variant={"bodyLarge"} style={{ marginLeft: 10 }}>
                        {nActive.toString() + " Active Offer" + (nActive !== 1 ? "s" : "")}
                    </Text>
                    <Text variant={"bodyLarge"} style={{ marginLeft: 10 }}>
                        {nInactive.toString() +
                            " Inactive Offer" +
                            (nInactive !== 1 ? "s" : "")}
                    </Text>
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
            </ScrollView>
        </Surface>
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
            borderRadius: 8,
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