import React, {useState} from "react";
import {
    StyleSheet, Text, View,
} from "react-native";
import { useOffer } from "../../../../api/hooks/useOffer";
import {useLocalSearchParams, useRouter} from "expo-router";
import {useSelector} from "react-redux";
import {useUpdateOffer} from "../../../../api/hooks/useUpdateOffer";
import OfferDetailsScreen from "../../../../components/OfferDetails";
import {Button, Dialog, Portal, Snackbar, useTheme} from "react-native-paper";
import {useDeleteOffer} from "../../../../api/hooks/useDeleteOffer";

const EditOfferScreen = () => {
    const {storeId} = useSelector((state) => state.store);
    const theme = useTheme();
    const router = useRouter();
    const { offerId } = useLocalSearchParams();
    const { data: offer, isLoading, isError } = useOffer(storeId, offerId);
    const { mutate: updateOffer } = useUpdateOffer(storeId, offerId);
    const { mutate: deleteOffer } = useDeleteOffer(storeId, offerId);
    const [isPublishedSnackbarVisible, setIsPublishedSnackbarVisible] = useState(false);
    const [errorPublishingSnackbarVisible, setErrorPublishingSnackbarVisible] = useState(false);
    const [showDeleteOfferDialog, setShowDeleteOfferDialog] = useState(false);

    const publishHandler = async (data) => {
        try {
            const res = await updateOffer(data);
            setIsPublishedSnackbarVisible(true);
        } catch (err) {
            setErrorPublishingSnackbarVisible(true)
        }
    }

    const confirmDeleteOffer =  () => {
        setShowDeleteOfferDialog(true);
    }

    const deleteOfferHandler = async () => {
        await deleteOffer();
        setShowDeleteOfferDialog(true);
        router.push('/Main/(tabs)/Offers');
    }


  return offer ? <View style={{position: 'relative', flex: 1 }}>
      <OfferDetailsScreen offer={offer} publishHandler={publishHandler} publishButtonLabel={'Save Changes'} discardButtonLabel={'Delete Offer'} discardHandler={confirmDeleteOffer}/>
          <Snackbar
              visible={isPublishedSnackbarVisible}
              onDismiss={() => setIsPublishedSnackbarVisible(false)}
              duration={2000}
              wrapperStyle={{top: 0, position: 'absolute'}}
              style={{backgroundColor: theme.colors.softSuccess,}}
              theme={{colors: {inverseOnSurface: 'black'}}}
          >
              Offer Details Updated!
          </Snackbar>
          <Snackbar
              visible={errorPublishingSnackbarVisible}
              onDismiss={() => setErrorPublishingSnackbarVisible(false)}
              duration={2000}
              wrapperStyle={{top: 0, position: 'absolute'}}
              style={{backgroundColor: theme.colors.softError,}}
              theme={{colors: {inverseOnSurface: 'black'}}}
          >
              Error Updating Offer
          </Snackbar>
          <Portal>
              <Dialog visible={showDeleteOfferDialog} onDismiss={() => setShowDeleteOfferDialog(false)}>
                  <Dialog.Title>Delete Offer</Dialog.Title>
                  <Dialog.Content>
                      <Text variant="bodyMedium">{`Are you sure you want to delete the offer ${offer.offerName}?`}</Text>
                  </Dialog.Content>
                  <Dialog.Actions>
                      <Button onPress={() => setShowDeleteOfferDialog(false)} mode={'contained'} buttonColor={theme.colors.primary} style={{borderRadius: 8}}>Cancel</Button>
                      <Button onPress={deleteOfferHandler} mode={'contained'} buttonColor={theme.colors.error} style={{borderRadius: 8}}>Yes, Delete This Offer</Button>
                  </Dialog.Actions>
              </Dialog>
          </Portal>
      </View>
      : null;
};

export default EditOfferScreen;