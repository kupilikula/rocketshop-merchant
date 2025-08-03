import React, {useMemo, useRef, useState} from "react";
import {
    StyleSheet,
    View,
    Platform, // Added
    useWindowDimensions, // Added
    ActivityIndicator // Added
} from "react-native";
import { useOffer } from "../../../../api/hooks/useOffer";
import {useLocalSearchParams, useRouter} from "expo-router";
import {useSelector} from "react-redux";
import {useUpdateOffer} from "../../../../api/hooks/useUpdateOffer";
import OfferDetailsScreen from "../../../../components/OfferDetails"; // Path to the component above
import {Button, Dialog, Portal, Snackbar, Text, useTheme} from "react-native-paper"; // Added Paper Text
import {useDeleteOffer} from "../../../../api/hooks/useDeleteOffer";
import {getOffersPath} from "../../../../utils/getPathUtils";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"; // For error icon

const IS_WEB = Platform.OS === 'web';

const EditOfferScreen = () => {
    // --- DEBUGGING: Render Counter ---
    const renderCount = useRef(0);
    renderCount.current = renderCount.current + 1;
    console.log(`--- EditOfferScreen: Render #${renderCount.current} ---`);
    // --- END DEBUGGING ---

    const {storeId} = useSelector((state) => state.store);
    const theme = useTheme();
    const router = useRouter();
    const { offerId } = useLocalSearchParams();
    const { width: windowWidth } = useWindowDimensions();
    const styles = useMemo(() => makeStyles(theme, IS_WEB, windowWidth), [theme, windowWidth]);

    const { data: offer, isLoading, isError } = useOffer(storeId, offerId);
    const { mutate: updateOffer } = useUpdateOffer(storeId, offerId);
    const { mutate: deleteOffer } = useDeleteOffer(storeId, offerId);

    // --- DEBUGGING: Log critical data sources ---
    console.log(`EditOfferScreen: storeId is "${storeId}", offerId is "${offerId}"`);
    console.log('EditOfferScreen: `isLoading` is', isLoading, '`isError` is', isError);
    // Log the offer object to see if it's changing unexpectedly
    console.log('EditOfferScreen: `offer` object from useOffer:', offer);
    // --- END DEBUGGING ---

    const [isPublishedSnackbarVisible, setIsPublishedSnackbarVisible] = useState(false);
    const [errorPublishingSnackbarVisible, setErrorPublishingSnackbarVisible] = useState(false);
    const [showDeleteOfferDialog, setShowDeleteOfferDialog] = useState(false);

    const publishHandler = async (data) => {
        try {
            await updateOffer(data);
            setIsPublishedSnackbarVisible(true);
        } catch (err) {
            setErrorPublishingSnackbarVisible(true);
        }
    };

    const confirmDeleteOffer =  () => {
        setShowDeleteOfferDialog(true);
    };

    const deleteOfferHandler = async () => {
        setShowDeleteOfferDialog(false); // Close dialog first
        try {
            await deleteOffer();
            router.push(getOffersPath());
        } catch (error) {
            console.error("Failed to delete offer:", error);
            // Optionally show another snackbar for deletion error
        }
    };

    const loadingErrorContent = (message, iconName = null, iconColor = theme.colors.primary) => (
        <View style={styles.centeredMessageContainer}>
            {iconName ? (
                <MaterialCommunityIcons name={iconName} size={48} color={iconColor} style={{ marginBottom: 16 }} />
            ) : (
                <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginBottom: 16 }} />
            )}
            <Text variant="titleMedium" style={{textAlign: 'center'}}>{message}</Text>
        </View>
    );

    if (isLoading) {
        const loadingView = loadingErrorContent("Loading offer details...");
        return IS_WEB
            ? <View style={styles.webPageContainer_Root}><View style={styles.webMaxContentContainer_Shell}>{loadingView}</View></View>
            : <View style={styles.mobileFullScreenMessageRoot}>{loadingView}</View>;
    }

    if (isError || !offer) { // If offer is null/undefined after loading attempt, treat as error/not found
        const errorView = loadingErrorContent(offer ? "Error loading offer details." : "Offer not found.", "alert-circle-outline", theme.colors.error);
        return IS_WEB
            ? <View style={styles.webPageContainer_Root}><View style={styles.webMaxContentContainer_Shell}>{errorView}</View></View>
            : <View style={styles.mobileFullScreenMessageRoot}>{errorView}</View>;
    }

    // Main content and overlays
    const mainOfferScreenContent = (
        <OfferDetailsScreen
            key={offerId}
            offer={offer}
            publishHandler={publishHandler}
            publishButtonLabel={'Save Changes'}
            discardButtonLabel={'Delete Offer'}
            discardHandler={confirmDeleteOffer}
            // isWeb={IS_WEB} // Pass isWeb to OfferDetailsScreen if it needs it for modals
        />
    );

    const overlays = (
        <>
            <Snackbar
                visible={isPublishedSnackbarVisible}
                onDismiss={() => setIsPublishedSnackbarVisible(false)}
                duration={2000}
                wrapperStyle={styles.snackbarWrapper}
                style={{backgroundColor: theme.colors.softSuccess,}}
                theme={{colors: {inverseOnSurface: 'black'}}}
            >
                Offer Details Updated!
            </Snackbar>
            <Snackbar
                visible={errorPublishingSnackbarVisible}
                onDismiss={() => setErrorPublishingSnackbarVisible(false)}
                duration={2000}
                wrapperStyle={styles.snackbarWrapper}
                style={{backgroundColor: theme.colors.softError,}}
                theme={{colors: {inverseOnSurface: 'black'}}}
            >
                Error Updating Offer
            </Snackbar>
            <Portal>
                <Dialog
                    visible={showDeleteOfferDialog}
                    onDismiss={() => setShowDeleteOfferDialog(false)}
                    style={IS_WEB ? styles.webDialogStyle : {}} // Apply web-specific style for Dialog width
                >
                    <Dialog.Title>Delete Offer</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium">{`Are you sure you want to delete the offer "${offer.offerName}"? This action cannot be undone.`}</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setShowDeleteOfferDialog(false)} mode={'outlined'} style={{borderRadius: 8, marginRight: 8}}>Cancel</Button>
                        <Button onPress={deleteOfferHandler} mode={'contained'} buttonColor={theme.colors.error} style={{borderRadius: 8}}>Yes, Delete</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </>
    );

    if (IS_WEB) {
        return (
            <View style={styles.webPageContainer_Root}>
                <View style={styles.webMaxContentContainer_Shell}>
                    {mainOfferScreenContent}
                    {overlays}
                </View>
            </View>
        );
    } else { // Mobile
        return (
            <View style={styles.mobileRootContainer}>
                {mainOfferScreenContent}
                {overlays}
            </View>
        );
    }
};

const makeStyles = (theme, isWeb, windowWidth) => {
    return StyleSheet.create({
        mobileRootContainer: { // Original root style for mobile
            position: 'relative', // Original from inline style
            flex: 1,
            backgroundColor: theme.colors.surface, // Provide a consistent background
        },
        // --- Web Layout Styles ---
        webPageContainer_Root: {
            flex: 1,
            backgroundColor: 'white',
            alignItems: 'center',
            // justifyContent: 'center', // Only if shell is not flex:1
        },
        webMaxContentContainer_Shell: {
            width: '100%',
            maxWidth: 900, // Max width for a details/form screen
            flex: 1, // Make it take up vertical space
            backgroundColor: theme.colors.surface, // Content area background, matches mobile
            position: 'relative', // For Snackbars to be positioned within this shell
            // If OfferDetailsScreen is not inherently scrollable, this shell might need to be a ScrollView
            // However, OfferDetailsScreen uses ScrollableScreen for mobile, so it should be scrollable.
            // For web, OfferDetailsScreen itself will render a ScrollView.
        },
        // --- Snackbar Web Styling ---
        snackbarWrapper: {
            position: 'absolute',
            top: IS_WEB ? 20 : 0,
            left: IS_WEB ? '50%' : undefined, // Centering snackbar on web
            transform: IS_WEB ? [{ translateX: '-50%' }] : [], // Centering snackbar on web
            minWidth: IS_WEB ? 340 : undefined, // Min width for web snackbar
            maxWidth: IS_WEB ? 500 : undefined, // Max width for web snackbar
            zIndex: 1500, // Ensure snackbar is on top
            // On mobile, it defaults to bottom. If top is desired for mobile too, remove IS_WEB checks for top.
            // Original had top:0 for mobile as well.
        },
        // --- Web Dialog Style ---
        webDialogStyle: {
            maxWidth: 500,
            width: IS_WEB ? '90%' : undefined, // Apply width only on web
            alignSelf: 'center', // Dialog is usually already centered by Portal
        },
        // --- Loading/Error State Styles ---
        mobileFullScreenMessageRoot: { // Root for mobile loading/error
            flex:1,
            backgroundColor: theme.colors.surface,
            justifyContent: 'center',
            alignItems: 'center'
        },
        centeredMessageContainer: { // Content of the loading/error view (text and indicator)
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            width: '100%',
            flex: IS_WEB ? 1 : 0, // On web, allow it to take flex space if shell is flex
        },
    });
};

export default EditOfferScreen;