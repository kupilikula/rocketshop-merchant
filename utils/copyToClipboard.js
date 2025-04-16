
import * as Clipboard from 'expo-clipboard'; // If using Expo
export const copyContent = async (content) => {
    await Clipboard.setStringAsync(content); // Copies the message to clipboard
    console.log('Content copied:', content);
    // Optionally show a toast/snackbar to inform the user that the message has been copied
};