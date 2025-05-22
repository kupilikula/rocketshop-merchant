// app/(web_merchant)/landing_page/index.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Platform } from 'react-native';
import {useDispatch} from "react-redux";
import {useRouter} from "expo-router";
import {openAuthModal} from "../../../store/authSlice";
// For web, you might use specific components from 'react-native-web'
// or ensure your universal components render well on web.
const IS_WEB = Platform.OS === 'web';
// Placeholder for an Icon component (e.g., from @expo/vector-icons)
const Icon = ({ name, size, color }) => <Text>{name}</Text>; // Replace with actual icon




const MerchantLandingPage = () => {

    const dispatch = useDispatch();
    const router = useRouter();
    // Dummy navigation function - replace with your actual navigation logic
    const navigateTo = (screen) => console.log(`Navigating to ${screen}`);

    const handleLoginPress = () => {
        // For web, we'll use the new openAuthModal flow.
        // For mobile, if /Authentication is a full screen, router.push is fine.
        // To unify, we could always use openAuthModal if it's set up to work on both.
        // For now, sticking to user's original for mobile, adapting for web via IS_WEB if needed,
        // or just dispatching openAuthModal if WebHeader is the only consumer of this for web.
        // Since this component is shared, let's assume openAuthModal is the preferred way.
        if (IS_WEB) {
            dispatch(openAuthModal({ reason: 'drawerLoginClick' }));
        } else {
            router.push('/Authentication');
        }

    };

    return (
        <ScrollView style={styles.container}>
            {/* 1. Navigation Bar */}
            <View style={styles.navBar}>
                <Image source={{ uri: '/path-to-your-logo.png' }} style={styles.logo} />
                <TouchableOpacity onPress={() => handleLoginPress()} style={styles.loginButton}>
                    <Text style={styles.loginButtonText}>Login</Text>
                </TouchableOpacity>
            </View>

            {/* 2. Hero Section */}
            <View style={styles.heroSection}>
                <Text style={styles.headline}>Grow Your Business with [Your Platform Name]</Text>
                <Text style={styles.subHeadline}>
                    Join our vibrant marketplace and connect with thousands of eager buyers. Easy setup, powerful tools, and dedicated support.
                </Text>
                <TouchableOpacity onPress={() => navigateTo('CreateStore')} style={styles.primaryCtaButton}>
                    <Text style={styles.primaryCtaButtonText}>Become a Merchant</Text>
                </TouchableOpacity>
                {/* Optional: <Image source={{ uri: '/path-to-hero-image.jpg' }} style={styles.heroImage} /> */}
            </View>

            {/* 3. Key Benefits Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Why Sell With Us?</Text>
                <View style={styles.benefitsGrid}>
                    <BenefitItem iconName="users" title="Wider Reach" description="Access a large and growing customer base." />
                    <BenefitItem iconName="settings" title="Easy Management" description="Intuitive tools for products, orders, and payments." />
                    <BenefitItem iconName="shield" title="Secure Payments" description="Reliable and secure transaction processing." />
                </View>
            </View>

            {/* 4. How It Works Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Get Started in 3 Simple Steps</Text>
                <View style={styles.stepsContainer}>
                    <StepItem number="1" title="Sign Up" description="Create your merchant account in minutes." />
                    <StepItem number="2" title="List Products" description="Easily add your products and set up your store." />
                    <StepItem number="3" title="Start Selling" description="Begin receiving orders and grow your sales." />
                </View>
            </View>

            {/* 5. Social Proof (Optional) */}
            {/* <View style={styles.section}>
        <Text style={styles.sectionTitle}>What Our Merchants Say</Text>
        {/* ... Testimonial components ... * /
      </View> */}

            {/* 6. Footer */}
            <View style={styles.footer}>
                <TouchableOpacity onPress={() => navigateTo('CreateStore')} style={[styles.primaryCtaButton, styles.footerCta]}>
                    <Text style={styles.primaryCtaButtonText}>Ready to Start? Sign Up Now!</Text>
                </TouchableOpacity>
                <View style={styles.footerLinks}>
                    <TouchableOpacity onPress={() => navigateTo('AboutUs')}><Text style={styles.footerLinkText}>About Us</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => navigateTo('Terms')}><Text style={styles.footerLinkText}>Terms of Service</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => navigateTo('Privacy')}><Text style={styles.footerLinkText}>Privacy Policy</Text></TouchableOpacity>
                </View>
                <Text style={styles.copyright}>© {new Date().getFullYear()} [Your Platform Name]. All rights reserved.</Text>
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
const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        backgroundColor: '#007AFF', // Example primary color
        borderRadius: 5,
    },
    loginButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    heroSection: {
        padding: 40, // Larger padding for impact
        alignItems: 'center', // Center text for a common landing page pattern
        backgroundColor: '#f8f9fa', // A light background to differentiate
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
        backgroundColor: '#28a745', // Example success/CTA color
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