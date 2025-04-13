import React from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Text, Card, useTheme, IconButton, Button } from "react-native-paper";
import { useSelector, useDispatch } from "react-redux";
import { Image } from "expo-image";
import { setStore } from "../store/storeSlice";
import {useLocalSearchParams, useRouter} from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {useGetMerchantStores} from "../api/hooks/useGetMerchantStores";
import StoreSelectorHeader from "../components/StoreSelectorHeader";

export default function StoreSelector() {
    const params = useLocalSearchParams();
    const theme = useTheme();
    const merchantId = useSelector((state) => state.merchant.merchantId);
    const { data: stores = [], isLoading } = useGetMerchantStores(merchantId);
    const activeStoreId = useSelector((state) => state.store.storeId);
    const dispatch = useDispatch();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const styles = makeStyles(theme);

    console.log('params:', params);
    const {exitToLogout} = params;

    const handleSelect = (store) => {
        dispatch(setStore(store));
        router.push("/Main/(tabs)/Dashboard");
    };

    return (<>
        <StoreSelectorHeader exitToLogout={exitToLogout}/>
        <ScrollView
            style={[styles.screen]}
            contentContainerStyle={{
                flexGrow: 1,
                paddingBottom: insets.bottom + 40,
                justifyContent: "center",
            }}
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
                                </Card>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}
            <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
            <Button icon={'plus'} labelStyle={{color: theme.colors.success, fontSize: 20}} style={{borderRadius: 8, padding: 8, backgroundColor: 'white', borderColor: theme.colors.success}} mode="outlined" onPress={() => router.push("/CreateStore")}>
                Create New Store
            </Button>
            </View>

        </ScrollView>
        </>
    );
}

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