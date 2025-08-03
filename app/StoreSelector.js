import React from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView, Platform } from "react-native"; // Added Platform
import {Text, Card, useTheme, IconButton, Button, Chip} from "react-native-paper";
import { useSelector, useDispatch } from "react-redux";
import { Image } from "expo-image";
import { setStore } from "../store/storeSlice";
import {useLocalSearchParams, useRouter} from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {useGetMerchantStores} from "../api/hooks/useGetMerchantStores";
import StoreSelectorHeader from "../components/StoreSelectorHeader";
import {useSelectStore} from "../api/hooks/useSelectStore";
import {getCreateStorePath} from "../utils/getPathUtils";

export default function StoreSelector() {
    const {exitToLogout} = useLocalSearchParams();
    const theme = useTheme();
    const merchantId = useSelector((state) => state.merchant.merchantId);
    const dispatch = useDispatch();
    const router = useRouter();
    const { data: stores = [], isLoading } = useGetMerchantStores(merchantId);
    const selectStoreMutation = useSelectStore(dispatch, router);
    const activeStoreId = useSelector((state) => state.store.storeId);
    const insets = useSafeAreaInsets();
    const styles = makeStyles(theme);

    const handleSelect = (store) => {
        selectStoreMutation.mutate({store});
    };

    return (<>
            <StoreSelectorHeader exitToLogout={exitToLogout}/>
            <ScrollView
                style={[styles.screen]} // styles.screen remains unchanged
                contentContainerStyle={[
                    { // Base styles for content container, identical to original for mobile
                        flexGrow: 1,
                        paddingBottom: insets.bottom + 40,
                        justifyContent: "center",
                    },
                    Platform.OS === 'web' && { // Web-specific additions
                        maxWidth: 768,      // Max width for the content list on web (e.g., 768px)
                        width: '100%',        // Ensures it takes available width up to maxWidth
                        alignSelf: 'center',  // Centers the content block within the ScrollView
                    }
                ]}
            >
                {stores?.length > 0 && (
                    <Text variant="titleLarge" style={{ marginBottom: 16, alignSelf: "center" }}>
                        Select Store
                    </Text>
                )}

                {stores.length > 0 && (
                    <View style={styles.listContainer}>
                        {stores.map((item) => {
                            const isActive = activeStoreId === item.storeId;
                            return (
                                <TouchableOpacity
                                    key={item.storeId}
                                    onPress={() => handleSelect(item)}
                                >
                                    <Card
                                        style={[
                                            styles.card,
                                            isActive && {
                                                borderColor: theme.colors.primary,
                                                borderWidth: 2,
                                            },
                                        ]}
                                    >
                                        <View style={styles.content}>
                                            {item.storeLogoImage ? (
                                                <Image
                                                    source={{ uri: item.storeLogoImage }}
                                                    style={styles.logo}
                                                    contentFit="cover"
                                                />
                                            ) : (
                                                <View
                                                    style={[styles.logo, styles.placeholderLogo]}
                                                />
                                            )}
                                            <Text variant="titleMedium">
                                                {item.storeName}
                                            </Text>
                                        </View>
                                        {!item.isActive &&
                                            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', }}>
                                                <Chip style={{backgroundColor: theme.colors.inactive}} selectedColor={'black'}>
                                                    Inactive
                                                </Chip>
                                            </View>
                                        }
                                    </Card>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}
                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
                    <Button icon={'plus'} labelStyle={{color: theme.colors.success, fontSize: 20}} style={{borderRadius: 8, padding: 8, backgroundColor: 'white', borderColor: theme.colors.success}} mode="outlined" onPress={() => router.push(getCreateStorePath())}>
                        Create New Store
                    </Button>
                </View>

            </ScrollView>
        </>
    );
}

// makeStyles function remains unchanged, ensuring no pixel difference on mobile
const makeStyles = (theme) => StyleSheet.create({
    screen: {
        flex: 1,
        padding: 16,
        backgroundColor: theme.colors.surface,
    },
    listContainer: {
        paddingBottom: 40,
    },
    card: {
        marginBottom: 12,
        padding: 12,
        borderRadius: 8,
        backgroundColor: "white",
        position: "relative",
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
    },
    logo: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
        backgroundColor: "#eee",
    },
    placeholderLogo: {
        backgroundColor: "#ccc",
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});