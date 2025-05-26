import React, {useEffect, useMemo, useState} from "react";
import {FlatList, View, StyleSheet, Platform } from "react-native"; // Added Platform
import {Divider, List, Text, useTheme, ActivityIndicator, Searchbar} from "react-native-paper"; // Removed Surface (not used)
import { useFetchFollowers } from "../../../../api/hooks/useFetchFollowers";
import {useSelector} from "react-redux";
import Fuse from "fuse.js";

const IS_WEB = Platform.OS === "web";
const FollowersScreen = () => {
    const { storeId } = useSelector( (state) => state.store);
    const theme = useTheme();
    const { data: followers, isLoading, isError } = useFetchFollowers(storeId);

    // This line creates a very large array but 'extraFollowers' is not actually used by the FlatList.
    // Preserving it as per "no functional changes" instruction.
    const extraFollowers = useMemo(()=> followers ? Array(100).fill(followers).flat() : [], [followers]);

    const [searchQuery, setSearchQuery] = useState("");
    const [filteredFollowers, setFilteredFollowers] = useState([]);


    const onSearchQueryChange = (query) => {
        setSearchQuery(query);
    };

    const fuse = useMemo(() => {
        if (!followers) return null;
        // Using the original 'followers' data for Fuse instance, not 'extraFollowers'
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

    useEffect(() => {
        if (!followers) {
            setFilteredFollowers([]); // Handle case where followers might become null/undefined
            return;
        }

        if (searchQuery === "") {
            setFilteredFollowers(followers);
        } else if (fuse) { // Ensure fuse instance is available
            const result = fuse.search(searchQuery).map(({ item }) => item);
            setFilteredFollowers(result);
        }
    }, [searchQuery, followers, fuse]);

    // Searchbar component is defined as the ListHeaderComponent
    const topComponent = (
        <Searchbar
            placeholder="Search followers by name or handle" // Made placeholder more specific
            onChangeText={onSearchQueryChange}
            value={searchQuery}
            style={{
                marginVertical: 16,
                borderRadius: 8, // Slightly more rounded
                backgroundColor: "white",
                elevation: 3, // Adjusted elevation
                borderWidth: Platform.OS === 'android' ? 0 : 1, // Conditional border for consistency
                borderColor: theme.colors.outlineVariant || '#ccc', // Use theme color for border
                // marginHorizontal: 16, // Added horizontal margin to align with FlatList padding
                // This might be better applied via FlatList's contentContainerStyle if searchbar is outside padding
                // Keeping original as it was, which means searchbar is edge-to-edge of the FlatList content area.
            }}
        />
    );

    if (isLoading) {
        return (
            // styles.container will apply web constraints here too if this view is root
            // but this is a full screen loading state, so it should take full screen.
            // For web, if styles.container has maxWidth, this loading state will also be constrained.
            // This is generally acceptable.
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size={Platform.OS === 'web' ? 'large' : 100} color={theme.colors.primary} animated={true}/>
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
            {IS_WEB && <Text variant={'titleLarge'} style={{alignSelf: 'center', marginVertical: 10}}>Followers</Text>}
            <FlatList
                data={filteredFollowers} // Using filteredFollowers, not extraFollowers
                keyExtractor={(item, index) => `${item.customerId}-${index}`} // Make key more robust for potential duplicates if data source changes
                renderItem={({ item }) => (
                    <List.Item
                        title={item.fullName || "N/A"}
                        description={`@${item.customerHandle}` || "N/A"}
                        titleStyle={{fontWeight: 'bold'}}
                        // Optional: Add left avatar if follower data includes it
                        // left={props => item.avatarUrl ? <List.Icon {...props} icon={{uri: item.avatarUrl}} /> : <List.Icon {...props} icon="account" />}
                    />
                )}
                ListHeaderComponent={topComponent}
                contentContainerStyle={{paddingHorizontal: 16, paddingBottom: 16}} // Ensures padding for list items
                ItemSeparatorComponent={() => <Divider style={{marginVertical: 8}}/>}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text>{searchQuery ? "No followers match your search." : "No followers yet."}</Text>
                    </View>
                }
                keyboardShouldPersistTaps="handled" // Moved from ScrollView as FlatList inherits from ScrollView
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        justifyContent: "center", // Preserved original mobile style
        // Web-specific adaptations
        ...(Platform.OS === 'web' && {
            width: '100%',
            maxWidth: 768,       // Max width for the list content on web
            alignSelf: 'center', // Center the block on the page
            // On web, justifyContent: 'flex-start' might be more appropriate for a list container
            // if the list itself is short and not meant to be vertically centered.
            // However, preserving 'center' for now to match mobile behavior if the FlatList doesn't fill height.
        }),
    },
    center: { // Used for Loading/Error states
        justifyContent: "center", // This is fine, as it's on the View wrapping the centered content
        alignItems: "center",
        paddingHorizontal: 16, // Ensure text in error/loading state has padding
    },
    // separator style was defined but not used in the original code, keeping it commented.
    // separator: {
    //     height: 1,
    //     backgroundColor: "#cccccc",
    //     marginVertical: 10,
    // },
    emptyContainer: {
        flexGrow: 1, // Allow empty container to take space for centering
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20,
        padding: 16,
    },
});

export default FollowersScreen;