import React from "react";
import { FlatList, View, StyleSheet } from "react-native";
import {Divider, List, Surface, Text, useTheme} from "react-native-paper";
import { useFetchFollowers } from "../../../../api/hooks/useFetchFollowers";
import { useLocalSearchParams } from "expo-router";
import {useSelector} from "react-redux";

const FollowersScreen = () => {
    const { storeId } = useSelector( (state) => state.store); // Assuming storeId is passed as a parameter
    const theme = useTheme();
    const { data: followers, isLoading, isError } = useFetchFollowers(storeId);

    if (isLoading) {
        return (
            <Surface style={[styles.container, styles.center]}>
                <Text>Loading followers...</Text>
            </Surface>
        );
    }

    if (isError) {
        return (
            <Surface style={[styles.container, styles.center]}>
                <Text>Error loading followers. Please try again later.</Text>
            </Surface>
        );
    }


    return (
        <Surface style={styles.container}>
            <FlatList
                data={followers}
                keyExtractor={(item) => item.customerId}
                renderItem={({ item }) => (
                    <List.Item
                        title={item.fullName}
                        description={item.customerHandle}
                    />
                )}
                ItemSeparatorComponent={() => <Divider style={{marginVertical: 8}}/>}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text>No followers yet.</Text>
                    </View>
                }
            />
        </Surface>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    center: {
        justifyContent: "center",
        alignItems: "center",
    },
    separator: {
        height: 1,
        backgroundColor: "#cccccc",
        marginVertical: 10,
    },
    emptyContainer: {
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20,
    },
});

export default FollowersScreen;