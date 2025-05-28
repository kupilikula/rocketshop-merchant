import React, { useState, useMemo, useEffect } from 'react'; // Added useMemo, useEffect
import {
    View,
    StyleSheet,
    ScrollView as DefaultScrollView, // Renamed for clarity
    Alert,
    KeyboardAvoidingView,
    Platform,
    useWindowDimensions // Added
} from 'react-native';
import {
    Text,
    TextInput,
    Button,
    IconButton,
    Chip,
    Avatar,
    useTheme,
    Divider
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
// import { Image } from 'expo-image'; // expo-image was imported but not used in JSX, Avatar.Image is used
import { getAxiosClient } from '../../../../api/client';
import { setStore } from '../../../../store/storeSlice';
import {useRouter} from "expo-router";
import {useStoreDetails} from "../../../../api/hooks/useStoreDetails";
import {useQueryClient} from "react-query"; // Original import

const IS_WEB = Platform.OS === 'web';

export default function EditStoreDetails() {
    const theme = useTheme();
    const dispatch = useDispatch();
    const axiosClient = getAxiosClient();
    const queryClient = useQueryClient();
    const router = useRouter(); // Original import
    const {storeId} = useSelector((state) => state.store);
    const {data: storeData } = useStoreDetails(storeId);
    const store  = useMemo(() => storeData?.store, [storeData]);
    const { width: windowWidth } = useWindowDimensions();
    const styles = makeStyles(theme, IS_WEB, windowWidth);
    console.log('store:', store);
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState( "");
    const [handle, setHandle] = useState( "");
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState( []);
    const [newTag, setNewTag] = useState('');
    const [displayLogoUri, setDisplayLogoUri] = useState(null);

    useEffect(() => {
        // Initialize or update displayLogoUri when store.storeLogoImage changes or on initial load
        if (store?.storeLogoImage) {
            setDisplayLogoUri(`${store.storeLogoImage}?v=${new Date().getTime()}`);
        } else {
            setDisplayLogoUri(null);
        }
    }, [storeData]);

    // Sync local state if store prop changes (e.g., after save)
    useEffect(() => {
        if (!editing && Boolean(store)) { // Only sync if not in edit mode to preserve user's current edits
            console.log('Updating store data:', store);
            setName(store.storeName || "");
            setHandle(store.storeHandle || "");
            setDescription(store.storeDescription || "");
            setTags(store.storeTags || []);
        }
    }, [store, editing]);


    const pickImage = async () => {
        // Request permissions first
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            Alert.alert("Permission Denied", "You need to allow access to your photos to select a logo.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const uri = result.assets[0].uri;
            await uploadLogo(uri);
        }
    };

    const uploadLogo = async (uri) => {
        // ... (uploadLogo function as in original, ensure it's robust)
        try {
            const fileKey = `stores/${store.storeId}/logo.jpg`; // Assuming jpg, adjust if needed
            const contentType = 'image/jpeg'; // Match extension
            const presignedRes = await axiosClient.post(`/stores/${store.storeId}/mediaUploadPresignedUrls`, {
                fileKeysWithContentTypes: [{ fileKey, contentType }]
            });

            const presignedUrl = presignedRes.data[0].presignedUrl;
            const fileUri = presignedRes.data[0].fileUri;

            const imageFetch = await fetch(uri);
            const blob = await imageFetch.blob();

            await fetch(presignedUrl, {
                method: 'PUT',
                headers: { 'Content-Type': contentType, 'x-amz-acl': 'public-read' },
                body: blob,
            });

            await axiosClient.post(`/stores/${store.storeId}/updateLogoImage`, { storeLogoImage: fileUri });

            // --- START: Update displayLogoUri and Redux store ---
            const cacheBustedUri = `${fileUri}?v=${new Date().getTime()}`;
            setDisplayLogoUri(cacheBustedUri); // Update local state for immediate display in Avatar
            dispatch(setStore({ ...store, storeLogoImage: fileUri })); // Update Redux with the CANONICAL URI
            // --- END: Update displayLogoUri and Redux store ---

            // setLogo(fileUri);
            dispatch(setStore({ ...store, storeLogoImage: fileUri }));
            Alert.alert('Success', 'Logo updated successfully!');
        } catch (err) {
            console.error("Logo upload error:", err.response?.data || err.message || err);
            Alert.alert('Error', 'Failed to upload logo.');
        }
    };

    const handleSave = async () => {
        // ... (handleSave function as in original)
        try {
            await axiosClient.patch(`/stores/${store.storeId}/updateStoreDetails`, {
                storeName: name,
                storeHandle: handle,
                storeDescription: description,
                storeTags: tags,
            });
            queryClient.invalidateQueries(['storeDetails', storeId]);
            dispatch(setStore({ ...store, storeName: name, storeHandle: handle, storeDescription: description, storeTags: tags }));
            setEditing(false);
            Alert.alert('Success', 'Store details updated!');
        } catch (err) {
            console.error("Save details error:",err.response?.data || err.message || err);
            Alert.alert('Error', 'Failed to update store details.');
        }
    };
    const discardChanges = () => { // Renamed from discard
        setName(store.storeName || "");
        setHandle(store.storeHandle || "");
        setDescription(store.storeDescription || "");
        setTags(store.storeTags || []);
        // setLogo(store.storeLogoImage || null);
        setEditing(false);
        if (store.storeLogoImage) {
            setDisplayLogoUri(`${store.storeLogoImage}?v=${new Date().getTime()}`);
        } else {
            setDisplayLogoUri(null);
        }
    };

    const pageContent = useMemo(() => (
        // This View replicates the original inner View style={{ flex: 1, position: 'relative' }}
        // Its style is styles.mainContentWrapper
        <View style={styles.mainContentWrapper}>
            {IS_WEB && <Text variant={'titleLarge'} style={{alignSelf: 'center'}}>Store Details</Text>}
            <View style={styles.header}>
                {!editing && <IconButton icon="pencil" onPress={() => setEditing(true)} size={24} iconColor={theme.colors.primary}/>}
            </View>

            <View style={styles.logoContainer}>
                {displayLogoUri ? (
                    <Avatar.Image size={100} source={{ uri: displayLogoUri }} />
                ) : (
                    <Avatar.Icon size={100} icon="store" style={{ backgroundColor: theme.colors.surfaceVariant }} />
                )}
                {editing && <Button mode={'text'} onPress={pickImage} labelStyle={{fontSize: 16, marginTop: 10, color: theme.colors.primary}}>Change Logo</Button>}
            </View>

            {editing ? (
                <>
                    <TextInput label="Store Name" mode="outlined" value={name} onChangeText={setName} style={styles.input} />
                    <TextInput label="Store Handle (@yourstorehandle)" mode="outlined" value={handle} onChangeText={(text) => setHandle(text.toLowerCase().replace(/\s+/g, ''))} style={styles.input} autoCapitalize="none"/>
                    <TextInput label="Description" mode="outlined" multiline numberOfLines={3} value={description} onChangeText={setDescription} style={styles.input} />

                    <View style={{ marginVertical: 16 }}>
                        <Text variant="titleMedium" style={{ marginBottom: 8 }}>Store Tags</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TextInput
                                placeholder="Add tag and press '+'"
                                value={newTag}
                                onChangeText={setNewTag}
                                mode="outlined"
                                style={[{ flex: 1, marginRight: 8 }, styles.input]} // Keep original input style for consistency
                                onSubmitEditing={() => { // Allow adding tag by Enter key
                                    if (newTag.trim() && !tags.includes(newTag.trim())) {
                                        setTags([...tags, newTag.trim()]);
                                        setNewTag('');
                                    }
                                }}
                                returnKeyType="done"
                            />
                            <IconButton icon="plus-circle-outline" size={28} onPress={() => {
                                if (newTag.trim() && !tags.includes(newTag.trim())) {
                                    setTags([...tags, newTag.trim()]);
                                    setNewTag('');
                                }
                            }} />
                        </View>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
                            {tags.map((tag) => (
                                <Chip key={tag} style={{ marginRight: 4, marginBottom: 4, backgroundColor: theme.colors.primaryContainer }} textStyle={{color: theme.colors.onPrimaryContainer}} onClose={() => setTags(tags.filter((t) => t !== tag))}>
                                    {tag}
                                </Chip>
                            ))}
                        </View>
                    </View>

                    <View style={styles.actionButtonsRow}>
                        <Button mode="outlined" onPress={discardChanges} style={[styles.button, styles.cancelButton]} labelStyle={{color: theme.colors.error}}>
                            Discard
                        </Button>
                        <Button mode="contained" onPress={handleSave} style={styles.button} labelStyle={styles.buttonLabel}>
                            Save Changes
                        </Button>
                    </View>
                </>
            ) : (
                // VIEW Mode - using original structure and styles
                <>
                    <Divider style={{ marginVertical: 8 }} />
                    <Text variant={'titleMedium'} style={styles.displayText}>Store Name</Text>
                    <Text variant={'titleLarge'} style={styles.displayText}>{name}</Text>
                    <Divider style={{ marginVertical: 8 }} />
                    <Text variant={'titleMedium'} style={styles.displayText}>Store Handle</Text>
                    <Text variant={'titleLarge'} style={styles.displayText}>@{handle}</Text>
                    <Divider style={{ marginVertical: 8 }} />
                    <Text variant={'titleMedium'} style={styles.displayText}>Store Description</Text>
                    <Text variant={'bodyLarge'} style={[styles.displayText, {lineHeight: 22}]}>{description}</Text>
                    <Divider />
                    <View style={{ marginTop: 12 }}>
                        <Text variant="titleMedium">Store Tags</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
                            {(tags || []).map((tag) => ( // Ensure tags is an array
                                <Chip key={tag} style={{ marginRight: 4, marginBottom: 4, backgroundColor: theme.colors.secondaryContainer }} textStyle={{color: theme.colors.onSecondaryContainer}}>{tag}</Chip>
                            ))}
                        </View>
                    </View>
                </>
            )}
        </View>
    ), [editing, name, handle, description, tags, newTag, displayLogoUri, styles, theme, pickImage, handleSave, discardChanges]);


    if (IS_WEB) {
        return (
            <View style={styles.webPageContainer_Root}>
                <DefaultScrollView
                    style={styles.webScrollView_Shell}
                    contentContainerStyle={styles.webScrollViewContentContainer_Shell}
                    keyboardShouldPersistTaps="handled" // Good for forms
                >
                    {pageContent}
                </DefaultScrollView>
            </View>
        );
    } else { // Mobile
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1, backgroundColor: 'white' }} // Original KAV style
            >
                <DefaultScrollView
                    contentContainerStyle={styles.container_mobile_content} // Original styles.container for ScrollView content
                    style={{backgroundColor: 'white'}} // Original ScrollView style
                    keyboardShouldPersistTaps="handled"
                >
                    {pageContent}
                </DefaultScrollView>
            </KeyboardAvoidingView>
        );
    }
}

const makeStyles = (theme, isWeb, windowWidth) => {
    // const { colors } = theme; // Original used theme.colors directly
    return StyleSheet.create({
        // --- Original Mobile Styles (MUST BE PRESERVED EXACTLY) ---
        container_mobile_content: { // For ScrollView's contentContainerStyle on MOBILE
            position: 'relative', // Original
            padding: 16,          // Original
            flexGrow: 1,          // Original
            backgroundColor: 'white', // Original
        },
        mainContentWrapper: { // Replicates the original inner View style={{ flex: 1, position: 'relative' }}
            flex: 1,              // Original from inner View
            position: 'relative', // Original from inner View, for absolute positioned header
        },
        header: { // For the Edit IconButton
            flexDirection: 'row',
            justifyContent: 'flex-end',
            // marginBottom: 16, // Original, but not needed if absolute and positioned from top/right of padded area
            position: 'absolute',
            top: 0, // Relative to mainContentWrapper, which is inside the padded area
            right: 0,
            zIndex: 1, // Ensure it's above other content
        },
        logoContainer: { // Original
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: 16,
            marginTop: 30, // Add margin to clear absolute positioned edit icon
        },
        input: { // Original
            marginBottom: 16,
            backgroundColor: "white",
        },
        displayText: { // Original
            marginBottom: 8,
            color: theme.colors.onSurface, // Add default color for better theming
        },
        button: { // Original base style for buttons, specific overrides inline
            borderRadius: 8,
            minWidth: 140, // Give buttons a decent min width
            justifyContent: 'center',
        },
        buttonLabel: { // For consistent button text
            fontSize: 16,
        },
        actionButtonsRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 24, // More space above action buttons
        },
        cancelButton: {
            borderColor: theme.colors.error,
        },

        // --- New Web Layout Container Styles ---
        webPageContainer_Root: {
            flex: 1,
            backgroundColor: 'white',
            alignItems: 'center',
        },
        webScrollView_Shell: { // The ScrollView component itself on web
            width: '100%',
            maxWidth: 768, // Max width for store details form
            flex: 1,
            backgroundColor: 'white', // Matches mobile content background
        },
        webScrollViewContentContainer_Shell: { // contentContainerStyle for the web ScrollView
            position: 'relative', // For absolute positioned header
            padding: 16,          // Matches mobile padding
            flexGrow: 1,
            backgroundColor: 'white', // Matches mobile background
        },
    });
};
