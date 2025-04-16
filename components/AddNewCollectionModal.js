import {Button, Card, Chip, Modal, Portal, RadioButton, Switch, Text, TextInput, useTheme} from "react-native-paper";
import {Pressable, StyleSheet, View} from "react-native";
import React, {useState} from "react";
import {useAddNewCollection} from "@/api/hooks/useAddNewCollection";
import {useSelector} from "react-redux";


export const AddNewCollectionModal = (props) => {

    const theme = useTheme();
    const styles = makeStyles(theme);
    const {storeId} = useSelector((state) => state.store);
    const [isActive, setIsActive] = useState(false);
    const [storeFrontDisplay, setStoreFrontDisplay] = useState(false);
    const [storeFrontDisplayNumberOfItems, setStoreFrontDisplayNumberOfItems] = useState(4);
    const [collectionName, setCollectionName] = useState('Collection Name');
    const { mutate: addNewCollection, isLoading, error } = useAddNewCollection(storeId);

    const submitNewCollection = () => {
        if (!collectionName.trim()) return;

        addNewCollection({
            collectionName,
            isActive,
            storeFrontDisplay,
            storeFrontDisplayNumberOfItems,
        }, {
            onSuccess: () => {
                props.onDismiss();
            }
        });
    }

    return <Portal>
        <Modal
            visible={props.isVisible}
            onDismiss={props.onDismiss}
            contentContainerStyle={styles.modalContainer}
        >
            <Text variant={'titleLarge'}>New Collection Details</Text>
            <TextInput
                label="New Collection Name"
                mode="outlined"
                value={collectionName}
                onChangeText={(t) => setCollectionName(t)}
                style={{marginTop: 10}}
                multiline
                error={!collectionName.trim()}
            />
                <View style={styles.statusContainer}>
                    <Text variant={"titleMedium"} style={{ marginRight: 15 }}>
                        Collection Status
                    </Text>
                    <View style={{ display: "flex", flexDirection: "row" }}>
                        <Chip
                            textStyle={{ color: "black", textAlign: "center" }}
                            style={{
                                marginRight: 10,
                                backgroundColor: isActive
                                    ? theme.colors.active
                                    : theme.colors.inactive,
                            }}
                        >
                            {isActive ? "Active" : "Inactive"}
                        </Chip>
                        <Switch
                            value={isActive}
                            onValueChange={(value) => setIsActive(value)}
                            color={
                                isActive ? theme.colors.active : theme.colors.inactive
                            }
                        />
                    </View>
                </View>
                <View style={styles.statusContainer}>
                    <Text variant={"titleMedium"} style={{ marginRight: 15 }}>
                        Store Front Display
                    </Text>
                    <View style={{ display: "flex", flexDirection: "row" }}>
                        <Chip
                            textStyle={{ color: "black", textAlign: "center" }}
                            style={{
                                marginRight: 10,
                                backgroundColor: storeFrontDisplay
                                    ? theme.colors.active
                                    : theme.colors.inactive,
                            }}
                        >
                            {storeFrontDisplay ? "Enabled" : "Disabled"}
                        </Chip>
                        <Switch
                            value={storeFrontDisplay}
                            onValueChange={(value) =>
                                setStoreFrontDisplay(value)
                            }
                            color={
                                storeFrontDisplay
                                    ? theme.colors.active
                                    : theme.colors.inactive
                            }
                        />
                    </View>
                </View>
                {storeFrontDisplay && (
                    <View style={{ marginTop: 15 }}>
                        <Text variant={"titleMedium"}>Number of Items on Store Front</Text>
                        <RadioButton.Group
                            onValueChange={(value) =>
                                setStoreFrontDisplayNumberOfItems(parseInt(value))
                            }
                            value={storeFrontDisplayNumberOfItems.toString()}
                        >
                            <View style={styles.radioGroup}>
                                {[2, 4, 6, 8].map((number) => (
                                    <View key={number} style={styles.radioButtonContainer}>
                                        <RadioButton.Android value={number.toString()} color={theme.colors.primary} />
                                        <Text>{number.toString()}</Text>
                                    </View>
                                ))}
                            </View>
                        </RadioButton.Group>
                    </View>
                )}
            <View style={{display: 'flex', flexDirection: 'row', alignSelf: 'center'}}>
                <Button onPress={submitNewCollection} mode={'contained'} buttonColor={theme.colors.success} style={{borderRadius: 8}}>
                    Create New Collection
                </Button>
            </View>
        </Modal>
    </Portal>
}

const makeStyles = (theme) => StyleSheet.create({
    modalContainer: {
        backgroundColor: "white",
        marginHorizontal: 20,
        borderRadius: 8,
        display: "flex",
        flexDirection: "column",
        // alignItems: "center",
        padding: 16,
        // height: "100%",
        // width: "100%",
        // width: '100%'
    },
    statusContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginVertical: 15,
    },
    card: {
        width: "100%",
        padding: 15,
        backgroundColor: "white",
        marginBottom: 20,
    },
    radioGroup: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap", // Ensures wrapping if needed
    },
    radioButtonContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 15,
    },
})