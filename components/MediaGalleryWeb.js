// MediaGalleryWeb.js
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { View, StyleSheet, Platform, ScrollView, Alert } from "react-native";
import { Button, Text, useTheme, ActivityIndicator, IconButton, Caption, Modal, Portal, Card as PaperCard } from "react-native-paper";
import * as ImagePicker from 'expo-image-picker';
import * as Crypto from "expo-crypto";
import mime from 'mime';
import _ from "lodash";

import ReactCrop, { centerCrop, makeAspectCrop, convertToPixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import { ProductWorkflowContext } from "./ProductWorkflowContext";
import { useDispatch, useSelector } from "react-redux";
import { updateField as updateNewProductField } from "../store/newProductSlice";

import MediaItem from "./MediaSlider/MediaItem"; // Your original MediaItem

const IS_WEB = Platform.OS === 'web';

const CROP_ASPECT_RATIO = 4 / 3;
const MIN_CROP_DIMENSION_PX_ON_ORIGINAL = 50;
const MIN_DISPLAYED_CROP_DIMENSION_PX = 30;

const PREVIEW_VIEWPORT_WIDTH = 400;
const PREVIEW_VIEWPORT_HEIGHT = 300;
const INFO_BAR_HEIGHT = 50;
const TOTAL_ITEM_WIDTH = PREVIEW_VIEWPORT_WIDTH;
const TOTAL_ITEM_HEIGHT = PREVIEW_VIEWPORT_HEIGHT + INFO_BAR_HEIGHT;

const WebImageCropper = ({ imageSrc, onCropComplete, onCancel }) => {
    const theme = useTheme();
    const imgRef = useRef(null);
    const [crop, setCrop] = useState();
    const lastPixelCropRef = useRef(null);
    const [error, setError] = useState('');

    const onImageLoad = useCallback((e) => {
        setError('');
        const { naturalWidth: imgWidth, naturalHeight: imgHeight } = e.currentTarget;
        imgRef.current = e.currentTarget;
        const minAllowedOrigWidth = MIN_CROP_DIMENSION_PX_ON_ORIGINAL;
        const minAllowedOrigHeightAtAspect = MIN_CROP_DIMENSION_PX_ON_ORIGINAL / CROP_ASPECT_RATIO;
        if (imgWidth < minAllowedOrigWidth || imgHeight < minAllowedOrigHeightAtAspect) {
            let errorMsg = "Image is too small for the required 4:3 crop.";
            if (imgWidth < minAllowedOrigWidth && imgHeight < minAllowedOrigHeightAtAspect) { errorMsg = `Image too small. Min ${minAllowedOrigWidth}px width & ${Math.round(minAllowedOrigHeightAtAspect)}px height required on original.`;}
            else if (imgWidth < minAllowedOrigWidth) { errorMsg = `Image width too small. Min ${minAllowedOrigWidth}px width required on original.`;}
            else { errorMsg = `Image height too small. Min ${Math.round(minAllowedOrigHeightAtAspect)}px height required on original.`;}
            setError(errorMsg); setCrop(undefined); lastPixelCropRef.current = null; return;
        }
        const initialCrop = centerCrop(makeAspectCrop({ unit: '%', width: 90 }, CROP_ASPECT_RATIO, imgWidth, imgHeight), imgWidth, imgHeight);
        setCrop(initialCrop);
        lastPixelCropRef.current = convertToPixelCrop(initialCrop, imgWidth, imgHeight);
    }, []);

    const handleApply = () => {
        setError('');
        if (!lastPixelCropRef.current || !lastPixelCropRef.current.width || !lastPixelCropRef.current.height || !imgRef.current) {
            setError("Please select or adjust the crop area using the handles."); return;
        }
        const displayedImageElement = imgRef.current;
        const pixelCropOnDisplayedImage = lastPixelCropRef.current;
        const W_orig_cropper = displayedImageElement.naturalWidth;
        const H_orig_cropper = displayedImageElement.naturalHeight;
        const W_disp_cropper = displayedImageElement.width;
        const H_disp_cropper = displayedImageElement.height;

        if (W_disp_cropper <= 0 || H_disp_cropper <= 0 || W_orig_cropper <= 0 || H_orig_cropper <= 0) {
            setError("Cannot calculate crop: image dimensions are invalid in cropper."); return;
        }
        // Scaling factors to convert from displayed image coordinates to original image coordinates
        const scaleX_dispToOrig = W_orig_cropper / W_disp_cropper;
        const scaleY_dispToOrig = H_orig_cropper / H_disp_cropper;

        const cropOnOriginalImage = {
            x: pixelCropOnDisplayedImage.x * scaleX_dispToOrig,
            y: pixelCropOnDisplayedImage.y * scaleY_dispToOrig,
            width: pixelCropOnDisplayedImage.width * scaleX_dispToOrig,
            height: pixelCropOnDisplayedImage.height * scaleY_dispToOrig,
        };
        if (cropOnOriginalImage.width < MIN_CROP_DIMENSION_PX_ON_ORIGINAL || cropOnOriginalImage.height < MIN_CROP_DIMENSION_PX_ON_ORIGINAL) {
            setError(`Final crop selection is too small. Minimum ${MIN_CROP_DIMENSION_PX_ON_ORIGINAL}px (on original image) required.`); return;
        }
        onCropComplete(cropOnOriginalImage);
    };

    return (
        <PaperCard style={styles.cropperCard}>
            <PaperCard.Title title="Crop Image" subtitle={`Aspect Ratio: ${CROP_ASPECT_RATIO.toFixed(2)} (4:3)`} />
            <PaperCard.Content style={styles.cropperContent}>
                {Boolean(error) && <Text style={[styles.cropperErrorText, { color: theme.colors.error }]}>{error}</Text>}
                <div className="ReactCropContainer" style={{ display: error ? 'none' : 'block', width: '100%', position: 'relative', cursor: 'grab' }}>
                    <ReactCrop crop={crop} onChange={(pxC, percC) => setCrop(percC)}
                               onComplete={(pxC) => { if (pxC && pxC.width && pxC.height) { lastPixelCropRef.current = pxC; if (pxC.width < MIN_DISPLAYED_CROP_DIMENSION_PX || pxC.height < MIN_DISPLAYED_CROP_DIMENSION_PX) { setError(`Visual crop selection is too small. Min ${MIN_DISPLAYED_CROP_DIMENSION_PX}px.`); } else { setError(''); }} else { lastPixelCropRef.current = null; }}}
                               aspect={CROP_ASPECT_RATIO} minWidth={MIN_DISPLAYED_CROP_DIMENSION_PX} >
                        <img ref={imgRef} src={imageSrc} alt="Crop Target" style={{ display: 'block', maxHeight: '60vh', maxWidth: '100%', objectFit: 'contain' }} onLoad={onImageLoad} />
                    </ReactCrop>
                </div>
            </PaperCard.Content>
            <PaperCard.Actions style={[styles.cropperActions, {borderTopColor: theme.colors.outlineVariant}]}>
                <Button onPress={onCancel} mode="outlined" disabled={!imageSrc}>Cancel</Button>
                <Button onPress={handleApply} mode="contained" disabled={!lastPixelCropRef.current || !!error || !imgRef.current}>Apply Crop</Button>
            </PaperCard.Actions>
        </PaperCard>
    );
};

const generateVideoThumbnailWeb = async (file) => {
    return new Promise((resolve) => {
        if (!file || !file.type || !file.type.startsWith('video/')) { resolve(null); return; }
        try {
            const video = document.createElement('video'); video.preload = 'metadata';
            const objectUrl = URL.createObjectURL(file); video.src = objectUrl;
            video.onloadedmetadata = () => { video.currentTime = Math.min(1, video.duration || 1); };
            video.onseeked = () => {
                const canvas = document.createElement('canvas'); const aspectRatio = video.videoWidth / video.videoHeight;
                canvas.width = 150; canvas.height = 150 / aspectRatio;
                if (canvas.height > 150) { canvas.height = 150; canvas.width = 150 * aspectRatio; }
                const ctx = canvas.getContext('2d');
                if (ctx) { ctx.drawImage(video, 0, 0, canvas.width, canvas.height); resolve(canvas.toDataURL('image/jpeg', 0.7)); }
                else { resolve(null); }
                URL.revokeObjectURL(objectUrl);
            };
            video.onerror = (e) => { console.error("Error loading video for thumbnail:", e); resolve(null); URL.revokeObjectURL(objectUrl); };
        } catch (error) { console.error("Error in generateVideoThumbnailWeb:", error); resolve(null); }
    });
};

const MediaPreviewCardWeb = ({ item, onRemove, onCrop, theme, index, numberOfItems }) => {
    const itemForMediaItemComponent = {
        ...item, width: item.W_orig, height: item.H_orig,
    };
    return (
        <View style={[styles.previewItemContainer, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outline }]}>
            <View style={styles.mediaItemViewport}>
                <MediaItem item={itemForMediaItemComponent} width={PREVIEW_VIEWPORT_WIDTH} height={PREVIEW_VIEWPORT_HEIGHT}
                           allowPanZoom={false} local={!item.uri?.startsWith('http')} showScrollButtons={false}
                           index={index} numberOfItems={numberOfItems} />
            </View>
            <View style={[styles.previewItemInfoBar, {backgroundColor: theme.colors.elevation.level2, borderTopColor: theme.colors.outline}]}>
                <Caption numberOfLines={1} style={[styles.previewItemFilenameText, { color: theme.colors.onSurfaceVariant }]}> {item.filename} </Caption>
                <View style={styles.previewItemActionsRow}>
                    {item.mediaType === 'image' && ( <IconButton icon="crop" size={22} onPress={() => onCrop(item)} style={styles.previewItemActionButton} iconColor={theme.colors.primary} accessibilityLabel="Crop image"/> )}
                    <IconButton icon="delete-forever" size={22} onPress={() => onRemove(item.mediaId)} style={styles.previewItemActionButton} iconColor={theme.colors.error} accessibilityLabel="Remove image"/>
                </View>
            </View>
        </View>
    );
};

const MediaGalleryWeb = (props) => {
    const theme = useTheme();
    const dispatch = useDispatch();
    const { setIsMediaSelected } = useContext(ProductWorkflowContext);
    const { productId, mediaItems: reduxMediaItems } = useSelector((state) => state.newProduct);

    const [selectedPreviewItems, setSelectedPreviewItems] = useState([]);
    const [imagePickerPermissionStatus, requestImagePickerPermission] = ImagePicker.useMediaLibraryPermissions();
    const [isLoadingMedia, setIsLoadingMedia] = useState(false);
    const [isCropping, setIsCropping] = useState(false);
    const [currentItemToCrop, setCurrentItemToCrop] = useState(null);

    useEffect(() => { setSelectedPreviewItems(_.cloneDeep(reduxMediaItems || [])); }, [reduxMediaItems]);
    useEffect(() => {
        const h = setTimeout(() => { if (!_.isEqual(selectedPreviewItems, reduxMediaItems)) dispatch(updateNewProductField({ field: "mediaItems", value: _.cloneDeep(selectedPreviewItems) })); }, 500);
        return () => clearTimeout(h);
    }, [selectedPreviewItems, dispatch, reduxMediaItems]);
    useEffect(() => { setIsMediaSelected(selectedPreviewItems.length > 0); }, [selectedPreviewItems, setIsMediaSelected]);

    const pickMediaCallback = useCallback(async () => {
        if (!imagePickerPermissionStatus?.granted) {
            const { status } = await requestImagePickerPermission();
            if (status !== 'granted') { Alert.alert("Permission Required", "File access is needed."); return; }
        }
        try {
            setIsLoadingMedia(true);
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All, allowsMultipleSelection: true, allowsEditing: false,
            });
            if (result.canceled || !result.assets || result.assets.length === 0) { setIsLoadingMedia(false); return; }
            const newItemsProcessingPromises = result.assets.map(async (asset, index) => {
                if (!asset || !asset.uri) { console.error(`Asset at index ${index} invalid. Skipping.`); return null; }
                let file = asset.file;
                if (!file) {
                    try {
                        const response = await fetch(asset.uri); if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
                        const blob = await response.blob();
                        file = new File([blob], asset.fileName || `web_asset_${Crypto.randomUUID()}`, { type: asset.mimeType || blob.type || 'application/octet-stream' });
                    } catch (e) { console.error(`Error fetching File from asset URI ${asset.uri}:`, e); return null; }
                }
                if (!file) { console.error(`Could not obtain File for asset URI ${asset.uri}. Skipping.`); return null; }

                const finalFile = file;
                const objectURL = URL.createObjectURL(finalFile);
                const finalContentType = finalFile.type || mime.getType(finalFile.name) || 'application/octet-stream';
                const mediaType = finalContentType.startsWith('video/') ? 'video' : 'image';
                let thumbnail = mediaType === 'video' ? await generateVideoThumbnailWeb(finalFile) : objectURL;
                let W_orig = asset.width, H_orig = asset.height;
                if ((!W_orig || !H_orig) && objectURL && mediaType === 'image') {
                    try {
                        const img = await new Promise((resolve, reject) => {
                            const imageElement = new window.Image();
                            imageElement.onload = () => resolve(imageElement);
                            imageElement.onerror = reject; imageElement.src = objectURL;
                        });
                        W_orig = img.naturalWidth; H_orig = img.naturalHeight;
                    } catch (dimError) { console.error("Could not get image dimensions for:", finalFile.name, dimError); W_orig=0; H_orig=0; }
                }
                return {
                    id: asset.assetId || Crypto.randomUUID(), uri: objectURL, filename: finalFile.name,
                    mediaType, contentType: finalContentType, width: W_orig, height: H_orig,
                    duration: asset.duration, thumbnail, mediaId: Crypto.randomUUID(), file: finalFile,
                    scale: 1, offset: { x: 0, y: 0 }, W_orig, H_orig
                };
            });
            const processedNewItems = (await Promise.all(newItemsProcessingPromises)).filter(item => item !== null);
            setSelectedPreviewItems(prevItems => {
                const currentUris = new Set(prevItems.map(item => item.uri));
                const newUniqueItems = processedNewItems.filter(newItem => !currentUris.has(newItem.uri));
                return [...prevItems, ...newUniqueItems];
            });
        } catch (error) { console.error("Error picking media:", error); Alert.alert("Error", "Could not select media."); }
        finally { setIsLoadingMedia(false); }
    }, [imagePickerPermissionStatus, requestImagePickerPermission]);

    const openImageCropperForItemCallback = useCallback((item) => {
        if (item.mediaType !== 'image') { Alert.alert("Not an image", "Only images can be cropped."); return; }
        const w = Number(item.W_orig); const h = Number(item.H_orig);
        if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
            const imageElement = new window.Image();
            imageElement.onload = () => {
                const naturalW = imageElement.naturalWidth; const naturalH = imageElement.naturalHeight;
                const updatedItemForCrop = { ...item, W_orig: naturalW, H_orig: naturalH };
                if (naturalW < MIN_CROP_DIMENSION_PX_ON_ORIGINAL || naturalH < MIN_CROP_DIMENSION_PX_ON_ORIGINAL / CROP_ASPECT_RATIO) {
                    Alert.alert("Image Too Small", `Images must be larger for a 4:3 crop (min width ${MIN_CROP_DIMENSION_PX_ON_ORIGINAL}px).`); return;
                }
                setCurrentItemToCrop(updatedItemForCrop); setIsCropping(true);
            };
            imageElement.onerror = () => Alert.alert("Error", "Could not load image details for cropping.");
            imageElement.src = item.uri; return;
        }
        if (w < MIN_CROP_DIMENSION_PX_ON_ORIGINAL || h < MIN_CROP_DIMENSION_PX_ON_ORIGINAL / CROP_ASPECT_RATIO) {
            Alert.alert("Image Too Small", `Images must be larger for a 4:3 crop (min width ${MIN_CROP_DIMENSION_PX_ON_ORIGINAL}px).`); return;
        }
        setCurrentItemToCrop(item); setIsCropping(true);
    }, []);

    const handleActualCropSaveCallback = useCallback((cropOnOriginalImagePx) => {
        if (!currentItemToCrop || !cropOnOriginalImagePx || !cropOnOriginalImagePx.width || !cropOnOriginalImagePx.height) {
            setIsCropping(false); setCurrentItemToCrop(null); return;
        }
        const { W_orig, H_orig, mediaId } = currentItemToCrop;
        const VIEWPORT_WIDTH = PREVIEW_VIEWPORT_WIDTH;
        const VIEWPORT_HEIGHT = PREVIEW_VIEWPORT_HEIGHT;

        if (cropOnOriginalImagePx.width <= 0 || cropOnOriginalImagePx.height <= 0) {
            Alert.alert("Invalid Crop", "Crop area dimensions must be positive."); return;
        }

        // 1. S_target_cover: True magnification needed for the crop to cover the viewport
        const S_target_cover = Math.max(
            VIEWPORT_WIDTH / cropOnOriginalImagePx.width,
            VIEWPORT_HEIGHT / cropOnOriginalImagePx.height
        );

        // 2. item.scale (s_user in discussion or `s` in style formula)
        // (Vw * s) / W_orig = S_target_cover  => s = (S_target_cover * W_orig) / Vw
        const calculatedItemScale = (S_target_cover * W_orig) / VIEWPORT_WIDTH;

        // 3. item.offset (ox, oy)
        // ox = (Vw * s)/2 - (crop_center_x_orig * S_target_cover)
        // oy = (H_render_at_Vw*s / 2) - (crop_center_y_orig * S_target_cover)
        // where H_render_at_Vw*s = H_orig * S_target_cover
        const finalCalculatedOffsetX = (VIEWPORT_WIDTH * calculatedItemScale) / 2 - (cropOnOriginalImagePx.x + cropOnOriginalImagePx.width / 2) * S_target_cover;
        const finalCalculatedOffsetY = (H_orig * S_target_cover) / 2 - (cropOnOriginalImagePx.y + cropOnOriginalImagePx.height / 2) * S_target_cover;

        setSelectedPreviewItems(prevItems =>
            prevItems.map(item =>
                item.mediaId === mediaId
                    ? { ...item, scale: calculatedItemScale, offset: { x: finalCalculatedOffsetX, y: finalCalculatedOffsetY } }
                    : item
            )
        );
        setIsCropping(false); setCurrentItemToCrop(null);
    }, [currentItemToCrop]);

    const handleRemoveItemCallback = useCallback((mediaIdToRemove) => {
        setSelectedPreviewItems(prevItems => {
            const itemToRemove = prevItems.find(item => item.mediaId === mediaIdToRemove);
            if (itemToRemove) {
                if (itemToRemove.uri && itemToRemove.uri.startsWith('blob:')) URL.revokeObjectURL(itemToRemove.uri);
                if (itemToRemove.thumbnail && itemToRemove.thumbnail.startsWith('blob:')) URL.revokeObjectURL(itemToRemove.thumbnail);
            }
            return prevItems.filter(item => item.mediaId !== mediaIdToRemove);
        });
    }, []);

    return (
        <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
            {selectedPreviewItems.length > 0 ? (
                <View style={styles.previewSliderArea}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={styles.previewListContentContainer}>
                        {selectedPreviewItems.map((item, index) => (
                            <MediaPreviewCardWeb key={item.mediaId} item={item} onRemove={handleRemoveItemCallback} onCrop={openImageCropperForItemCallback} theme={theme} index={index} numberOfItems={selectedPreviewItems.length} />
                        ))}
                    </ScrollView>
                </View>
            ) : (
                <View style={[styles.previewSliderArea, styles.previewEmptyContainer, {borderColor: theme.colors.outline}]}>
                    <IconButton icon="image-multiple-outline" size={48} iconColor={theme.colors.onSurfaceVariant} />
                    <Text style={{color: theme.colors.onSurfaceVariant, marginTop: 8}}>No media selected.</Text>
                </View>
            )}
            <View style={styles.controlsContainer}>
                <Button icon="folder-multiple-image" mode="contained" onPress={pickMediaCallback} disabled={isLoadingMedia} style={styles.button} labelStyle={styles.buttonLabel} contentStyle={styles.buttonContent}>
                    {isLoadingMedia ? "Processing..." : "Select Files"}
                </Button>
                {isLoadingMedia && <ActivityIndicator animating={true} style={{marginTop: 15}} size="large"/>}
                {selectedPreviewItems.length === 0 && !isLoadingMedia && ( <Text style={[styles.emptyText, {color: theme.colors.onSurfaceDisabled}]}> Click to add product images or videos. </Text> )}
                {selectedPreviewItems.length > 0 && !isLoadingMedia && ( <Text style={[styles.hintText, {color: theme.colors.onSurfaceVariant}]}> First item is main display</Text> )}
            </View>
            <Portal>
                <Modal visible={isCropping} onDismiss={() => { setIsCropping(false); setCurrentItemToCrop(null); }} contentContainerStyle={styles.modalContentContainer} dismissable={false}>
                    {currentItemToCrop && (
                        <WebImageCropper
                            imageSrc={currentItemToCrop.uri}
                            onCropComplete={handleActualCropSaveCallback}
                            onCancel={() => { setIsCropping(false); setCurrentItemToCrop(null); }}
                        />
                    )}
                </Modal>
            </Portal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, },
    previewSliderArea: { minHeight: TOTAL_ITEM_HEIGHT + 20, maxHeight: TOTAL_ITEM_HEIGHT + 30, marginBottom: 20, justifyContent: 'center', },
    previewListContentContainer: { paddingVertical: 10, alignItems:'flex-start', minHeight: TOTAL_ITEM_HEIGHT + 10 },
    previewEmptyContainer: { height: TOTAL_ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderStyle: 'dashed', borderRadius: 8, padding: 16, width: TOTAL_ITEM_WIDTH, alignSelf:'center'},
    previewItemContainer: { width: TOTAL_ITEM_WIDTH, height: TOTAL_ITEM_HEIGHT, marginHorizontal: 8, borderRadius: 8, borderWidth: 1, overflow: 'hidden', flexDirection: 'column', },
    mediaItemViewport: { width: PREVIEW_VIEWPORT_WIDTH, height: PREVIEW_VIEWPORT_HEIGHT, overflow: 'hidden', position: 'relative', backgroundColor: '#000000', borderTopLeftRadius: 7, borderTopRightRadius: 7, },
    previewItemInfoBar: { height: INFO_BAR_HEIGHT, width: '100%', paddingHorizontal: 6, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderTopWidth: 1, },
    previewItemFilenameText: { fontSize: 11, textAlign: 'center', lineHeight: 14, width: '100%', marginBottom: 2, },
    previewItemActionsRow: { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', width: '100%', height: 26, },
    previewItemActionButton: { margin: 0, height: 24, width: 36, },
    controlsContainer: { alignItems: 'center', marginVertical: 20, paddingHorizontal: 16, },
    button: { marginVertical: 8, width: '100%', maxWidth: IS_WEB ? 400 : 'auto', },
    buttonLabel: { fontSize:16, letterSpacing:0.5 },
    buttonContent: { paddingVertical:8 },
    emptyText: { marginTop: 25, fontSize: 16, textAlign: 'center', paddingHorizontal: 20, },
    hintText: { marginTop: 25, fontSize: 14, textAlign: 'center', paddingHorizontal: 20, },
    modalContentContainer: { alignSelf: 'center', width: 'auto', maxWidth: '95%', maxHeight: '95%', borderRadius: 8, overflow: 'hidden', },
    cropperCard: { width: 'auto', minWidth: 320, maxWidth: '90vw', maxHeight: '80vh', display:'flex', flexDirection:'column', elevation: 5, },
    cropperContent: { alignItems: 'center', flexShrink:1, overflowY: 'auto', paddingVertical:10 },
    cropperErrorText: { marginBottom: 10, textAlign:'center', fontWeight: 'bold' },
    cropperActions: { justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, borderTopWidth:1, },
});

export default MediaGalleryWeb;