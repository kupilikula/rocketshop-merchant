// src/components/web/marketplace/WebFooter.js
import React from 'react';
import { View, StyleSheet, Pressable, Platform, Linking } from 'react-native';
import { Text, useTheme, Divider } from 'react-native-paper';
import { Link } from 'expo-router';

const WebFooter = () => {
    const theme = useTheme();
    const styles = makeStyles(theme);
    const currentYear = new Date().getFullYear();

    return (
        <View style={styles.footerContainer}>
            <View style={styles.contentBar}>
                <View style={styles.linksContainer}>
                    <Link href="/(marketing_static)/about" asChild>
                        <Pressable style={styles.linkPressable}>
                            <Text style={styles.linkText}>About Us</Text>
                        </Pressable>
                    </Link>
                    <Link href="/(marketing_static)/terms" asChild>
                        <Pressable style={styles.linkPressable}>
                            <Text style={styles.linkText}>Terms and Conditions</Text>
                        </Pressable>
                    </Link>
                    <Link href="/(marketing_static)/privacy" asChild>
                        <Pressable style={styles.linkPressable}>
                            <Text style={styles.linkText}>Privacy Policy</Text>
                        </Pressable>
                    </Link>
                    <Link href="/(marketing_static)/contact" asChild>
                        <Pressable style={styles.linkPressable}>
                            <Text style={styles.linkText}>Contact Us</Text>
                        </Pressable>
                    </Link>
                </View>
                <Text style={styles.copyrightText}>
                    © {currentYear} RocketShop
                </Text>
            </View>
        </View>
    );
};

const makeStyles = (theme) => StyleSheet.create({
    footerContainer: {
        backgroundColor: theme.colors.secondary, // A very light grey or off-white
        width: '100%', // Ensure it spans the width if used in FlatList footer
        paddingVertical: Platform.OS === 'web' ? 10 : 8, // Reduced vertical padding
    },
    contentBar: {
        flexDirection: Platform.OS === 'web' ? 'row' : 'column', // Row on web, column on mobile
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Platform.OS === 'web' ? 40 : 15, // Standard padding
        paddingVertical: Platform.OS === 'web' ? 5 : 10, // Minimal vertical padding for the bar itself
        minHeight: Platform.OS === 'web' ? 40 : 'auto', // Ensure a minimum height for the bar on web
    },
    linksContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap', // Allow links to wrap on smaller screens if needed
        justifyContent: Platform.OS === 'web' ? 'flex-start' : 'center', // Center links on mobile when they wrap
        alignItems: 'center',
        marginBottom: Platform.OS === 'web' ? 0 : 10, // Space below links on mobile
    },
    linkPressable: {
        paddingHorizontal: Platform.OS === 'web' ? 12 : 8, // Spacing between links
        paddingVertical: 5, // Clickable area
    },
    linkText: {
        fontSize: Platform.OS === 'web' ? 13 : 12,
        color: 'white',
        textDecorationLine: 'none',
    },
    copyrightText: {
        fontSize: Platform.OS === 'web' ? 13 : 12,
        color: 'white',
        textAlign: Platform.OS === 'web' ? 'right' : 'center',
    }
});

export default WebFooter;
