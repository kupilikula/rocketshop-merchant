import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Portal, Modal, Text, Button } from 'react-native-paper';
import DatePicker from 'react-native-date-picker';
import { MaterialCommunityIcons } from "@expo/vector-icons";

const CrossPlatformDatePicker = ({
                                     label = 'Select Date',
                                     initialDate = new Date(),
                                     onDateChange,
                                     theme,
                                 }) => {
    const [visible, setVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState(initialDate);

    const openModal = () => setVisible(true);
    const closeModal = () => setVisible(false);

    const handleConfirm = (date) => {
        setSelectedDate(date);
        onDateChange && onDateChange(date);
        closeModal();
    };

    return (
        <View>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity onPress={openModal} style={styles.dateInput}>
                <MaterialCommunityIcons
                    name="calendar"
                    size={20}
                    color={theme?.colors?.primary || '#6200ee'}
                />
                <Text style={styles.dateText}>
                    {selectedDate ? selectedDate.toLocaleDateString() : 'Pick a date'}
                </Text>
            </TouchableOpacity>

            <Portal>
                <Modal
                    visible={visible}
                    onDismiss={closeModal}
                    contentContainerStyle={styles.modalContainer}
                >
                    <View style={styles.pickerWrapper}>
                        <DatePicker
                            date={selectedDate}
                            mode="date"
                            onDateChange={setSelectedDate} // Temporarily update the date as the user scrolls
                            theme="light" // Options: 'light', 'dark', or 'auto'
                        />
                        <View style={styles.buttonRow}>
                            <Button
                                mode="text"
                                onPress={closeModal}
                                style={styles.cancelButton}
                            >
                                Cancel
                            </Button>
                            <Button
                                mode="contained"
                                onPress={() => handleConfirm(selectedDate)}
                                style={styles.confirmButton}
                            >
                                Confirm
                            </Button>
                        </View>
                    </View>
                </Modal>
            </Portal>
        </View>
    );
};

const styles = StyleSheet.create({
    label: {
        marginBottom: 8,
        fontSize: 14,
        fontWeight: 'bold',
    },
    dateInput: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 8,
    },
    dateText: {
        marginLeft: 8,
        fontSize: 16,
    },
    modalContainer: {
        backgroundColor: 'white',
        marginHorizontal: 20,
        padding: 16,
        borderRadius: 8,
    },
    pickerWrapper: {
        alignItems: 'center',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    cancelButton: {
        marginHorizontal: 8,
    },
    confirmButton: {
        marginHorizontal: 8,
    },
});

export default CrossPlatformDatePicker;