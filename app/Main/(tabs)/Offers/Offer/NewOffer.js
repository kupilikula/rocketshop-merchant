import React, {useState} from "react";
import {
    StyleSheet, View,
} from "react-native";
import {useLocalSearchParams, useRouter} from "expo-router";
import {useSelector} from "react-redux";
import OfferDetailsScreen from "../../../../../components/OfferDetails";
import {Snackbar, useTheme} from "react-native-paper";
import {usePublishOffer} from "../../../../../api/hooks/usePublishOffer";

const NewOfferScreen = () => {
    const {storeId} = useSelector((state) => state.store);
    const theme = useTheme();
    const { offerId } = useLocalSearchParams();
    // const { data: offer, isLoading, isError } = useOffer(storeId, offerId);
    const { mutate: publishOffer } = usePublishOffer(storeId);
    const router = useRouter();
    const [isPublishedSnackbarVisible, setIsPublishedSnackbarVisible] = useState(false);
    const [errorPublishingSnackbarVisible, setErrorPublishingSnackbarVisible] = useState(false);

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
        router.push('/Main/(tabs)/Offers');
    }

    return <View style={{position: 'relative', flex: 1 }}>
            <OfferDetailsScreen offer={newOffer} publishHandler={publishHandler} publishButtonLabel={'Publish New Offer'} discardButtonLabel={'Discard New Offer'} discardHandler={discardNewOffer}/>
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
        </View>
};

export default NewOfferScreen;