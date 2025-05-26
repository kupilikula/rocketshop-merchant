import React, { useMemo, useState, useCallback } from "react"; // Added useCallback
import { View, StyleSheet, Pressable, ScrollView as DefaultScrollView, Platform, useWindowDimensions, ActivityIndicator } from "react-native"; // Added Platform, DefaultScrollView, useWindowDimensions, ActivityIndicator
import {
    Text,
    Card,
    Button,
    Divider,
    // Surface, // Not used in final JSX
    useTheme,
    Chip,
} from "react-native-paper";
import { useRouter } from "expo-router";
// import MaterialIcons from "@expo/vector-icons/MaterialIcons"; // Not used in this file's JSX
import { MaterialCommunityIcons } from "@expo/vector-icons"; // For error icon
import { useOffers } from "../../../../api/hooks/useOffers";
import { useSelector } from "react-redux";
import ScrollableScreen from "../../../../components/ScrollableScreen"; // For mobile
import {getNewOfferPath, getOfferPath} from "../../../../utils/getPathUtils";

const IS_WEB = Platform.OS === 'web';

const OffersScreen = () => {
    const theme = useTheme();
    const router = useRouter();
    const storeId = useSelector((state) => state.store.storeId);
    const { data: offers = [], isLoading, isError } = useOffers(storeId);
    const { width: windowWidth } = useWindowDimensions(); // For makeStyles if needed
    const styles = makeStyles(theme, IS_WEB, windowWidth);

    console.log('offers:', offers); // Original console.log

    const renderOfferItem = useCallback((item) => ( // Wrapped with useCallback for stability if pageContent is memoized
        <View key={item.offerId} style={{ width: "100%" }}>
            <Pressable
                onPress={() => router.push(getOfferPath(item.offerId))}
            >
                <Card style={styles.offerCard}>
                    <View style={styles.cardContent}>
                        <View style={{flex: 1, marginRight: 8}}>
                            <Text variant={"titleLarge"}>{item.offerName}</Text>
                            <Text variant={"bodyLarge"}>Offer Type: {item.offerType}</Text>
                            <View
                                style={{ // Original inline style
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
                                        {item.applicableTo.collectionIds.length.toString() + " Collections  "}
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
                            textStyle={{ color: "black" }} // Original inline style
                            style={{ // Original inline style
                                backgroundColor: item.isActive ? theme.colors.softSuccess : theme.colors.inactive,
                                alignSelf: 'flex-start', // Keep chip from stretching vertically
                            }}
                        >
                            {item.isActive ? "Active" : "Inactive"}
                        </Chip>
                    </View>
                </Card>
            </Pressable>
            <Divider style={{ marginVertical: 10 }} />
        </View>
    ), [router, styles, theme, getOfferPath]); // Dependencies for useCallback


    const nActive = useMemo(() => (offers || []).filter((o) => o.isActive).length, [offers]);
    const nInactive = useMemo(() => (offers || []).filter((o) => !o.isActive).length, [offers]);

    const pageContent = useMemo(() => (
        <>
            <View style={{ marginVertical: 10 }}>
                <View
                    style={{ // Original inline style
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        marginVertical: 15,
                    }}
                >
                    <Button
                        onPress={() => router.push(getNewOfferPath())}
                        mode={"contained"}
                        icon={"plus"}
                        style={{ // Original inline style
                            borderRadius: 8,
                            backgroundColor: theme.colors.secondary,
                        }}
                        labelStyle={{paddingVertical: 4, color: theme.colors.onSecondary || 'white'}}
                    >
                        Create New Offer
                    </Button>
                </View>
            </View>
            <View style={{ marginBottom: 10, paddingHorizontal: IS_WEB ? 0 : 0 }}>
                <Text variant={"bodyLarge"} style={{ marginLeft: IS_WEB ? 0 : 10 }}>
                    {nActive.toString() + " Active Offer" + (nActive !== 1 ? "s" : "")}
                </Text>
                <Text variant={"bodyLarge"} style={{ marginLeft: IS_WEB ? 0 : 10 }}>
                    {nInactive.toString() + " Inactive Offer" + (nInactive !== 1 ? "s" : "")}
                </Text>
            </View>
            <View
                style={{ // Original inline style
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center", // This will center cards if they don't take full width
                    justifyContent: "center",
                    padding: IS_WEB ? 0 : 2, // Original padding was 2
                }}
            >
                {(offers || []).map(item => renderOfferItem(item))}
            </View>
        </>
    ), [offers, nActive, nInactive, theme, router, styles, renderOfferItem, getNewOfferPath]);


    const loadingErrorContent = (message, isErrorState = false) => (
        <View style={IS_WEB ? styles.centeredWebMessageContent : styles.mobileCenteredFullScreen}>
            {isErrorState && <MaterialCommunityIcons name="alert-circle-outline" size={48} color={theme.colors.error} style={{ marginBottom: 10 }} />}
            {!isErrorState && <ActivityIndicator size={IS_WEB ? "large" : 100} color={theme.colors.primary} style={{ marginBottom: 10 }} />}
            <Text variant={isErrorState ? "titleLarge" : "bodyLarge"}>{message}</Text>
        </View>
    );

    if (isLoading) {
        const loadingView = loadingErrorContent("Loading offers...");
        return IS_WEB
            ? <View style={styles.webPageContainer_Root}><View style={styles.webScrollView_Shell}>{loadingView}</View></View>
            : loadingView;
    }

    if (isError) {
        const errorView = loadingErrorContent("Error Loading Offers.", true);
        return IS_WEB
            ? <View style={styles.webPageContainer_Root}><View style={styles.webScrollView_Shell}>{errorView}</View></View>
            : errorView;
    }

    if (IS_WEB) {
        return (
            <View style={styles.webPageContainer_Root}>
                <DefaultScrollView
                    style={styles.webScrollView_Shell}
                    contentContainerStyle={styles.webScrollViewContentContainer_Shell}
                    keyboardShouldPersistTaps="handled"
                >
                    {pageContent}
                </DefaultScrollView>
            </View>
        );
    } else { // Mobile
        return (
            <ScrollableScreen
                backgroundColor={theme.colors.surface} // Original prop
                innerStyle={styles.container}         // Original prop
                // Assuming ScrollableScreen passes keyboardShouldPersistTaps to its internal ScrollView
            >
                {pageContent}
            </ScrollableScreen>
        );
    }
};

const makeStyles = (theme, isWeb, windowWidth) => {
    // const { colors } = theme; // Original used theme.colors directly
    return StyleSheet.create({
        // --- Original Mobile Styles (MUST BE PRESERVED EXACTLY) ---
        container: { // For ScrollableScreen innerStyle on MOBILE
            flex: 1,
            backgroundColor: theme.colors.surface, // Original
            paddingHorizontal: 10, // Original
            // No justifyContent or alignItems, content flows top-down
        },
        offerCard: { // Original style
            borderRadius: 0,
            elevation: 2,
            width: "100%", // Original
            backgroundColor: "white", // Original
        },
        cardContent: { // Original style
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start", // Original
            padding: 10, // Original
            position: "relative", // Original
        },

        // --- Styles for Loading/Error States ---
        mobileCenteredFullScreen: { // For mobile full screen loading/error
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.colors.surface, // Original background for these states
            padding: 20,
        },
        centeredWebMessageContent: { // For web loading/error content within the shell
            flex:1,
            alignItems:'center',
            justifyContent:'center',
            width:'100%',
            padding: 20,
        },

        // --- New Web Layout Container Styles ---
        webPageContainer_Root: {
            flex: 1,
            backgroundColor: 'white',
            alignItems: 'center',
        },
        webScrollView_Shell: { // The ScrollView component itself on web
            width: '100%',
            maxWidth: 768, // Max width for offers list
            flex: 1,
            backgroundColor: theme.colors.surface, // Matches mobile ScrollableScreen bg
        },
        webScrollViewContentContainer_Shell: { // contentContainerStyle for the web ScrollView
            paddingHorizontal: 10, // Matches mobile styles.container.paddingHorizontal
            paddingVertical: IS_WEB ? 20 : 0,
            flexGrow: 1,
            // justifyContent: 'flex-start', // Default, content starts at top
        },
    });
};

export default OffersScreen;