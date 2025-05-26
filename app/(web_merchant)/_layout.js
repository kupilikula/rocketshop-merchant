// app/(web_marketplace)/_layout.js
import React from 'react';
import {Slot, usePathname} from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import WebHeader from "../../components/WebHeader";
import WebFooter from "../../components/WebFooter";


export default function WebMarketplaceLayout() {

    const pathname = usePathname();
    console.log('pathname:', pathname);
    const hideHeader = ['/store_selector'].includes(pathname);

    return (
        <View style={styles.layoutContainer}>
            {!hideHeader && <WebHeader />}
            <View style={styles.slotViewport}>
                <Slot />
            </View>
            <WebFooter />
        </View>
    );
}

const styles = StyleSheet.create({
    layoutContainer: {
        flex: 1, // Takes full height from its parent (presumably app/_layout.js root)
        flexDirection: 'column', // Stacks Header, Slot Viewport, Footer vertically
        width: '100%',
        backgroundColor: 'white',
        // Ensure app/_layout.js provides a full viewport height (e.g., height: '100vh' for web)
        // Add for debugging if needed:
        // borderColor: 'blue',
        // borderWidth: 2,
    },
    slotViewport: { // This View replaces the ScrollView for pages needing their own scroll
        flex: 1, // CRITICAL: Takes available space between WebHeader and WebFooter
        width: '100%',
        position: 'relative', // Good for children positioning contexts
        overflow: 'hidden',   // IMPORTANT: Ensures this View clips content, giving a fixed boundary
                              // for pages like Feed.js that will use flex:1 to fill it.
        // Add for debugging if needed:
        // borderColor: 'cyan',
        // borderWidth: 1,
    },
    // contentScrollContainer and contentScrollContentContainer are no longer needed
    // if you remove the ScrollView here. If other pages in this segment *do* need
    // an overall scroll, you might need a more complex layout strategy or
    // apply scrolling within those specific pages.
});