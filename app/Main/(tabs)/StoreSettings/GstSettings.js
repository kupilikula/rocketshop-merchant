import React, { useState, useMemo } from "react"; // Added useMemo
import {
    View,
    StyleSheet,
    Alert,
    Platform, // Added
    ScrollView as DefaultScrollView, // Added and aliased
    useWindowDimensions // Added
} from "react-native";
import { Text, Button, useTheme } from "react-native-paper"; // List, Checkbox not used in this file's JSX
import {useDispatch, useSelector} from "react-redux";
import { useRouter } from "expo-router";
import { getAxiosClient } from "../../../../api/client";
// import GstRateDropdown from "../../../../components/GstRateDropdown"; // Not used in this file's JSX
import {setStoreSettings} from "../../../../store/storeSettingsSlice"; // Ensure path is correct
import GstSettingsComponent from "../../../../components/GstSettingsComponent";

const IS_WEB = Platform.OS === 'web';

export default function GstSettingsScreen() {
    const theme = useTheme();
    const dispatch = useDispatch();
    const axiosClient = getAxiosClient();
    const router = useRouter();
    const { storeId } = useSelector((state) => state.store);
    const { defaultGstInclusive, defaultGstRate } = useSelector((state) => state.storeSettings);
    const { width: windowWidth } = useWindowDimensions();
    const styles = makeStyles(theme, IS_WEB, windowWidth);

    const [inclusive, setInclusive] = useState(defaultGstInclusive || false); // Ensure boolean
    const [rate, setRate] = useState(defaultGstRate || 0); // Ensure number

    const handleSave = async () => {
        try {
            const res = await axiosClient.patch(`/stores/${storeId}/updateGstSettings`, {
                defaultGstInclusive: inclusive,
                defaultGstRate: rate,
            });
            dispatch(setStoreSettings(res.data.storeSettings));
            Alert.alert("Success", "GST Settings updated.");
            router.back();
        } catch (error) {
            console.error(error.response?.data || error.message || error);
            Alert.alert("Error", error.response?.data?.message || "Failed to update GST Settings.");
        }
    };

    const pageContent = useMemo(() => (
        <>
            <GstSettingsComponent
                rate={rate}
                setRate={setRate}
                inclusive={inclusive}
                setInclusive={setInclusive}
            />
            {/* Original button container style */}
            <View style={{ marginTop: 32, flexDirection: "row", justifyContent: "space-between" }}>
                <Button
                    mode="outlined"
                    onPress={() => router.back()}
                    style={{ marginRight: 8, borderRadius: 8, borderColor: theme.colors.error, minWidth: 120 }}
                    labelStyle={{color: theme.colors.error}}
                >
                    Cancel
                </Button>
                <Button
                    mode="contained"
                    onPress={handleSave}
                    style={{ borderRadius: 8, minWidth: 120 }}
                    // labelStyle={{color: theme.colors.onPrimary}} // Assuming default contrast is fine
                >
                    Save Changes
                </Button>
            </View>
        </>
    ), [rate, inclusive, theme, router, handleSave, setRate, setInclusive]); // Added missing handlers to deps

    // This screen doesn't have explicit loading/error states for initial data fetch
    // as data comes from Redux. Action loading is handled by Button's loading prop if added.

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
            // Mobile root is now a ScrollView for consistency and to handle potential overflow
            <DefaultScrollView
                style={styles.mobileScrollView_Style}
                contentContainerStyle={styles.container_mobile_content}
                keyboardShouldPersistTaps="handled"
            >
                {pageContent}
            </DefaultScrollView>
        );
    }
}

const makeStyles = (theme, isWeb, windowWidth) => {
    // const { colors } = theme; // Original styles used theme.colors directly
    return StyleSheet.create({
        // --- Original Mobile Styles (MUST BE PRESERVED EXACTLY) ---
        // styles.container is now split into mobileScrollView_Style and container_mobile_content
        mobileScrollView_Style: { // For the ScrollView component itself on Mobile
            flex: 1,
            backgroundColor: "white", // From original styles.container
        },
        container_mobile_content: { // For ScrollView's contentContainerStyle on MOBILE
            padding: 16,        // Original padding from styles.container
            // backgroundColor: 'white', // Already on ScrollView style, not needed here if transparent
            flexGrow: 1,        // To allow content to take space and scroll if needed
            // justifyContent: 'center', // Original did not have this, content is top-aligned
        },
        listItem: { // Original style, though not used in this screen's JSX
            paddingHorizontal: 0,
        },

        // --- New Web Layout Container Styles ---
        webPageContainer_Root: {
            flex: 1,
            backgroundColor: 'white',
            alignItems: 'center',
        },
        webScrollView_Shell: { // The ScrollView component itself on web
            width: '100%',
            maxWidth: 600, // Max width for GST settings form
            flex: 1,
            backgroundColor: 'white', // Matches mobile backgroundColor
        },
        webScrollViewContentContainer_Shell: { // contentContainerStyle for the web ScrollView
            padding: 16, // Matches mobile padding
            flexGrow: 1,
            // justifyContent: 'flex-start', // Default behavior, content flows from top
        },
    });
};
