import React from 'react'; // useEffect, useState, useMemo not used directly here
import {View, StyleSheet, Platform, ActivityIndicator} from 'react-native'; // Removed ScrollView as KAV handles it
import {Surface, Text, useTheme} from "react-native-paper"; // Surface is used for loading/error
import {useLocalSearchParams, useRouter} from "expo-router";
import ProductSearch from "../../../../components/ProductSearch";
import { useStoreProducts } from "../../../../api/hooks/useStoreProducts";
import {useSelector} from "react-redux";
import KeyboardAwareView from "../../../../components/KeyboardAwareView"; // Your custom KAV
import {usePushWithBackHref} from "../../../../utils/usePushWithBackHref";
import MaterialIcons from "@expo/vector-icons/MaterialIcons"; // For error icon

export default function StoreProductsSearch() {
    const { initialSearchQuery } = useLocalSearchParams();
    const {storeId} = useSelector((state) => state.store);
    // const router = useRouter(); // router is imported but not used
    const theme = useTheme();
    const pushWithBackHref = usePushWithBackHref();
    const { data: storeProducts, isLoading, isError } = useStoreProducts(storeId);

    const IS_WEB = Platform.OS === 'web';
    const styles = makeStyles(theme, IS_WEB); // Pass theme and IS_WEB

    // Original inline style for ProductSearch on mobile
    const productSearchMobileStyle = { marginTop: 10 };

    if (isLoading) {
        // For loading/error, mobile used a full Surface. Web will show centered loading within its structure.
        const loadingContent = (
            <View style={styles.centeredContent}>
                <ActivityIndicator size="large" color={theme.colors.primary} style={{marginBottom:10}}/>
                <Text>Loading products...</Text>
            </View>
        );
        if (IS_WEB) {
            return <View style={styles.webRootContainer}><View style={styles.webMaxContentContainer}>{loadingContent}</View></View>;
        }
        // Mobile loading - using a simple View that mimics the original Surface's full-screen intent
        return <View style={styles.mobileFullScreenCentered}>{loadingContent}</View>;
    }

    if (isError) {
        const errorContent = (
            <View style={styles.centeredContent}>
                <MaterialIcons name="error-outline" size={48} color={theme.colors.error} style={{marginBottom:10}} />
                <Text>Error loading products.</Text>
            </View>
        );
        if (IS_WEB) {
            return <View style={styles.webRootContainer}><View style={styles.webMaxContentContainer}>{errorContent}</View></View>;
        }
        // Mobile error - using a simple View that mimics the original Surface's full-screen intent
        return <View style={styles.mobileFullScreenCentered}>{errorContent}</View>;
    }

    const productSearchComponent = (
        <ProductSearch
            // Apply original mobile style directly, or a specific web style
            style={IS_WEB ? styles.productSearchWeb : productSearchMobileStyle}
            uniqueProducts={storeProducts || []} // Ensure uniqueProducts is always an array
            limitedResults={false}
            initialSearchQuery={initialSearchQuery || ""} // Ensure initialSearchQuery is always a string
            onSearchResultPressHandler={(p) =>
                pushWithBackHref(`/Main/(tabs)/Products/${p.productId}`)}
        />
    );

    if (!storeProducts) { // Handles the case where data might be null post-loading without error
        const emptyContent = (
            <View style={styles.centeredContent}>
                <Text>No products found for this store.</Text>
            </View>
        );
        if (IS_WEB) {
            return <View style={styles.webRootContainer}><View style={styles.webMaxContentContainer}>{emptyContent}</View></View>;
        }
        return <View style={styles.mobileFullScreenCentered}>{emptyContent}</View>;
    }

    if (IS_WEB) {
        return (
            <View style={styles.webRootContainer}>
                <View style={styles.webMaxContentContainer}>
                    <View style={styles.webInnerContentWrapper}>
                        <Text variant={'titleLarge'}>Search Products in Store</Text>
                        {productSearchComponent}
                    </View>
                </View>
            </View>
        );
    } else { // Mobile
        // Using KeyboardAwareView with its EXACT original props from your app
        return (
            <KeyboardAwareView
                backgroundColor={theme.colors.surface}
                containerStyle={{
                    padding: 10, // This is for the ScrollView inside KAV
                    flexGrow: 1, // Ensure ScrollView's content area can grow
                }}
                innerStyle={{ // This is for the View inside KAV's ScrollView
                    width: "100%",
                    flex: 1, // Make this View take available space
                    display: "flex", // Original
                    flexDirection: "column", // Original
                    alignItems: "center", // Original: centers ProductSearch if it's narrower
                    backgroundColor: theme.colors.surface, // Original
                }}
            >
                {productSearchComponent}
            </KeyboardAwareView>
        );
    }
}

const makeStyles = (theme, isWeb) => StyleSheet.create({
    // --- Root containers for Web ---
    webRootContainer: { // Outermost container for the web page
        flex: 1,
        backgroundColor: theme.colors.surface, // Consistent with KAV bg
        alignItems: 'center', // Centers the webMaxContentContainer
        paddingTop: isWeb ? 20 : 0, // Some top padding for web page content area
        paddingBottom: isWeb ? 20 : 0,
    },
    webMaxContentContainer: { // The block that has maxWidth
        width: '100%',
        maxWidth: 800,      // Max width for the search content area
        flex: 1,            // Allow it to grow vertically if content is shorter
        flexDirection: 'column', // Ensure children stack vertically
        // backgroundColor: theme.colors.surface, // Background for content area, matches KAV innerStyle
        // Not strictly needed if webRootContainer has it and this is transparent
    },
    webInnerContentWrapper: { // Simulates KAV's innerStyle effects for content placement
        width: '100%',
        flex: 1,
        padding: 10, // This matches KAV's containerStyle.padding (applied to ScrollView part)
        alignItems: 'center', // Matches KAV's innerStyle.alignItems to center ProductSearch
        backgroundColor: theme.colors.surface, // Matches KAV innerStyle bg
    },

    // --- Style for ProductSearch on Web ---
    productSearchWeb: {
        marginTop: 10, // Original mobile margin
        width: '100%', // Make ProductSearch take the full width of webInnerContentWrapper
                       // If ProductSearch on mobile was narrower and centered, then for web,
                       // to match that, remove width:100% and webInnerContentWrapper.alignItems:'center' will center it.
                       // Assuming for web a full-width search within the padded container is desired.
    },

    // --- Mobile FullScreen Centered Container (for loading/error) ---
    mobileFullScreenCentered: {
        flex: 1,
        backgroundColor: "white", // Original Surface background
        alignItems: "center",
        justifyContent: "center",
    },

    // --- Common Centered Content (for text within loading/error states) ---
    centeredContent: {
        // This View is the direct parent of ActivityIndicator/Text
        // It will be centered by its parent (mobileFullScreenCentered or webMaxContentContainer)
        alignItems: "center",
        justifyContent: "center",
        padding: 20, // Padding around the text/indicator
        // flex:1 here would make it try to take all space of its parent,
        // which is fine if the parent is already sized (like webMaxContentContainer)
    },
});