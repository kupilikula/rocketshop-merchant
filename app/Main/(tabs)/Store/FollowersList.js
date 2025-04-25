import React, {useEffect, useMemo, useState} from "react";
import {FlatList, View, StyleSheet } from "react-native";
import {Divider, List, Surface, Text, useTheme, ActivityIndicator, Searchbar} from "react-native-paper";
import { useFetchFollowers } from "../../../../api/hooks/useFetchFollowers";
import {useSelector} from "react-redux";
import Fuse from "fuse.js";

const FollowersScreen = () => {
    const { storeId } = useSelector( (state) => state.store); // Assuming storeId is passed as a parameter
    const theme = useTheme();
    const { data: followers, isLoading, isError } = useFetchFollowers(storeId);
    const extraFollowers = useMemo(()=> Array(100).fill(followers).flat(), [followers]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredFollowers, setFilteredFollowers] = useState([]);


    const onSearchQueryChange = (query) => {
        setSearchQuery(query);
    };

    // Initialize Fuse instance with store data
    const fuse = useMemo(() => {
        if (!followers) return null;
        return new Fuse(followers, {
            keys: [
                "customerHandle",
                "fullName",
            ],
            threshold: 0.4,
            includeScore: false,
            ignoreLocation: true,
        });
    }, [followers]);

    // Update filtered stores when search query changes
    useEffect(() => {
        if (!followers) return;

        if (searchQuery === "") {
            setFilteredFollowers(followers);
        } else {
            const result = fuse.search(searchQuery).map(({ item }) => item);
            setFilteredFollowers(result);
        }
    }, [searchQuery, followers, fuse]);

    const topComponent =             <Searchbar
        placeholder="Search followed stores"
        onChangeText={onSearchQueryChange}
        value={searchQuery}
        style={{
            // margin: 16,
            marginVertical: 16,
            borderRadius: 5,
            backgroundColor: "white",
            elevation: 5,
            borderWidth: 1,
        }}
    />

    if (isLoading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size={100} color={theme.colors.primary} animated={true}/>
            </View>
        );
    }

    if (isError) {
        return (
            <View style={[styles.container, styles.center]}>
                <Text>Error loading followers. Please try again later.</Text>
            </View>
        );
    }



    return (
        <View style={styles.container}>
            <FlatList
                data={filteredFollowers}
                keyExtractor={(item, index) => index}
                renderItem={({ item }) => (
                    <List.Item
                        title={item.fullName}
                        description={item.customerHandle}
                    />
                )}
                ListHeaderComponent={topComponent}
                contentContainerStyle={{padding: 16}}
                ItemSeparatorComponent={() => <Divider style={{marginVertical: 8}}/>}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text>No followers yet.</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        justifyContent: "center",
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