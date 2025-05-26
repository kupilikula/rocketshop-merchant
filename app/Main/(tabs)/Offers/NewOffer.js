import React, {useState} from "react";
import {
    Platform,
    StyleSheet, useWindowDimensions, View,
} from "react-native";
import {useLocalSearchParams, useRouter} from "expo-router";
import {useSelector} from "react-redux";
import OfferDetailsScreen from "../../../../components/OfferDetails";
import {Snackbar, useTheme} from "react-native-paper";
import {usePublishOffer} from "../../../../api/hooks/usePublishOffer";
import {getOffersPath} from "../../../../utils/getPathUtils";

const IS_WEB = Platform.OS === 'web';

const NewOfferScreen = () => {
    const {storeId} = useSelector((state) => state.store);
    const theme = useTheme();
    const { offerId } = useLocalSearchParams();
    // const { data: offer, isLoading, isError } = useOffer(storeId, offerId);
    const { mutate: publishOffer } = usePublishOffer(storeId);
    const router = useRouter();
    const [isPublishedSnackbarVisible, setIsPublishedSnackbarVisible] = useState(false);
    const [errorPublishingSnackbarVisible, setErrorPublishingSnackbarVisible] = useState(false);
    const { width: windowWidth } = useWindowDimensions();
    const styles = makeStyles(theme, IS_WEB, windowWidth);

    const newOffer = {
        offerType: 'Percentage Off',
        offerName: 'New Offer',
        offerDisplayText: 'New Offer Display Text',
        offerCode: '',
        requireCode: false,
        discountDetails: {},
        applicableTo: {
            productIds: [],
            collectionIds: [],
            tags: [],
        },
        conditions: {},
        validityDateRange: {validFrom: new Date(), validUntil: new Date()},
        isActive: false,
    }

    const publishHandler = async (data) => {
        try {
            const res = await publishOffer(data);
            setIsPublishedSnackbarVisible(true);
        } catch (err) {
            setErrorPublishingSnackbarVisible(true)
        }
    }

    const discardNewOffer = () => {
        router.push(getOffersPath());
    }

    const mainContent = <OfferDetailsScreen offer={newOffer} publishHandler={publishHandler} publishButtonLabel={'Publish New Offer'} discardButtonLabel={'Discard New Offer'} discardHandler={discardNewOffer}/>

    const overlays =             <>
        <Snackbar
            visible={isPublishedSnackbarVisible}
            onDismiss={() => setIsPublishedSnackbarVisible(false)}
            duration={2000}
            wrapperStyle={{top: 0, position: 'absolute'}}
            style={{backgroundColor: theme.colors.softSuccess,}}
            theme={{colors: {inverseOnSurface: 'black'}}}
        >
            New Offer Published!
        </Snackbar>
        <Snackbar
            visible={errorPublishingSnackbarVisible}
            onDismiss={() => setErrorPublishingSnackbarVisible(false)}
            duration={2000}
            wrapperStyle={{top: 0, position: 'absolute'}}
            style={{backgroundColor: theme.colors.softError,}}
            theme={{colors: {inverseOnSurface: 'black'}}}
        >
            Error Publishing New Offer
        </Snackbar>
    </>

    if (IS_WEB) {
        return (
            <View style={styles.webPageContainer_Root}>
                <View style={styles.webMaxContentContainer_Shell}>
                    {mainContent}
                    {overlays}
                </View>
            </View>
        );
    } else {
        return (
            <View style={styles.mobileRootContainer}>
                {mainContent}
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

export default NewOfferScreen;