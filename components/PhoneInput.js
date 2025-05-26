import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput as PaperTextInput } from 'react-native-paper';

const PhoneInput = ({ initialValue, value, setPhone, style }) => {
    return (<PaperTextInput
            label="Phone Number With Country Code"
            mode="outlined"
            // dense
            defaultValue={initialValue}
            value={undefined}
            onChangeText={setPhone}
            inputMode="numeric"
            style={[styles.input, style]}
            left={<PaperTextInput.Affix text="+" style={{ padding: 0, margin: 0 }}/>}
        />
    );
};

const styles = StyleSheet.create({
    input: {
        // flex: 1,
        backgroundColor: 'white',
        // marginLeft: 8,
        flex: 1,
        // marginRight: 10,
    },
});

export default PhoneInput;