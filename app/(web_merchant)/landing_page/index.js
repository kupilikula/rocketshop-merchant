// app/(web_merchant)/landing_page/index.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Platform } from 'react-native';
import {useDispatch} from "react-redux";
import {useRouter} from "expo-router";
import {openAuthModal} from "../../../store/authSlice";
import LogoIconWithName from "../../../components/LogoIconWithName";
import {useTheme} from "react-native-paper";
// For web, you might use specific components from 'react-native-web'
// or ensure your universal components render well on web.
const IS_WEB = Platform.OS === 'web';
// Placeholder for an Icon component (e.g., from @expo/vector-icons)
const Icon = ({ name, size, color }) => <Text>{name}</Text>; // Replace with actual icon




const MerchantLandingPage = () => {

    const dispatch = useDispatch();
    const router = useRouter();
    const theme = useTheme();
    const styles = makeStyles(theme);
    // Dummy navigation function - replace with your actual navigation logic
    const navigateTo = (screen) => console.log(`Navigating to ${screen}`);

    const handleLoginPress = () => {
        if (IS_WEB) {
            dispatch(openAuthModal({ reason: 'drawerLoginClick' }));
        } else {
            router.push('/Authentication');
        }

    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.heroSection}>
                <Text style={styles.headline}>Set Up Your Shop in Minutes</Text>
                <Text style={styles.subHeadline}>
                    Sell your products on our marketplace. Easy setup and management with Mobile and Web interfaces.
                </Text>
                <TouchableOpacity onPress={() => handleLoginPress()} style={styles.primaryCtaButton}>
                    <Text style={styles.primaryCtaButtonText}>Become a Merchant</Text>
                </TouchableOpacity>
            </View>

        </ScrollView>
    );
};

// Reusable components (BenefitItem, StepItem) - define these according to your design system
const BenefitItem = ({ iconName, title, description }) => (
    <View style={styles.benefitItem}>
        <Icon name={iconName} size={30} color="#007AFF" />
        <Text style={styles.benefitTitle}>{title}</Text>
        <Text style={styles.benefitDescription}>{description}</Text>
    </View>
);

const StepItem = ({ number, title, description }) => (
    <View style={styles.stepItem}>
        <View style={styles.stepNumberCircle}><Text style={styles.stepNumberText}>{number}</Text></View>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepDescription}>{description}</Text>
    </View>
);

// Basic Styles - you'll need to expand and refine these significantly for web
const makeStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        backgroundColor: '#fff', // Or your brand's background color
    },
    navBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        // Web-specific: consider sticky or fixed positioning
    },
    logo: {
        width: 150,
        height: 40,
        resizeMode: 'contain',
    },
    loginButton: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        backgroundColor: theme.colors.primary, // Example primary color
        borderRadius: 5,
    },
    loginButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    heroSection: {
        padding: 40, // Larger padding for impact
        alignItems: 'center', // Center text for a common landing page pattern
        backgroundColor: 'white', // A light background to differentiate
    },
    headline: {
        fontSize: 32, // Larger for web
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
        color: '#333',
    },
    subHeadline: {
        fontSize: 18, // Larger for web
        textAlign: 'center',
        color: '#555',
        marginBottom: 30,
        maxWidth: 600, // Constrain width for readability on wider screens
    },
    primaryCtaButton: {
        backgroundColor: theme.colors.secondary, // Example success/CTA color
        paddingVertical: 15,
        paddingHorizontal: 35,
        borderRadius: 8,
        elevation: 2, // Shadow for native
        // Web-specific: box-shadow
    },
    primaryCtaButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    heroImage: {
        width: '80%', // Example
        height: 300,
        resizeMode: 'contain',
        marginTop: 30,
    },
    section: {
        paddingVertical: 40,
        paddingHorizontal: 20,
        alignItems: 'center', // Center section titles and content by default
    },
    sectionTitle: {
        fontSize: 28, // Larger for web
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
        color: '#333',
    },
    benefitsGrid: {
        flexDirection: 'row', // On web, this could wrap
        flexWrap: 'wrap', // Important for responsiveness
        justifyContent: 'space-around',
        width: '100%',
        maxWidth: 960, // Max width for content area
    },
    benefitItem: {
        width: '100%', // On mobile
        // On web: theme.breakpoints.up('sm') { width: '45%' }, theme.breakpoints.up('md') { width: '30%' }
        alignItems: 'center',
        padding: 20,
        marginBottom: 20,
    },
    benefitTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginTop: 10,
        marginBottom: 5,
    },
    benefitDescription: {
        textAlign: 'center',
        color: '#666',
        fontSize: 16,
    },
    stepsContainer: {
        width: '100%',
        maxWidth: 960,
    },
    stepItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        paddingVertical: 10,
        // Add more styling for visual appeal
    },
    stepNumberCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    stepNumberText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    stepTitle: {
        fontSize: 20,
        fontWeight: '600',
    },
    stepDescription: {
        fontSize: 16,
        color: '#666',
        // Adjust to be under title if not enough space in row
    },
    footer: {
        backgroundColor: '#343a40', // Dark footer
        paddingVertical: 40,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    footerCta: {
        marginBottom: 30,
    },
    footerLinks: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    footerLinkText: {
        color: '#adb5bd',
        marginHorizontal: 15,
        fontSize: 14,
    },
    copyright: {
        color: '#6c757d',
        fontSize: 12,
    },
});

export default MerchantLandingPage