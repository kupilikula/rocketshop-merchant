import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput as PaperTextInput } from 'react-native-paper';

const PhoneInput = ({ label, initialValue, value, setPhone, style, error }) => {
    return (<PaperTextInput
            label={label || "Phone Number"}
            mode="outlined"
            // dense
            defaultValue={initialValue}
            value={undefined}
            onChangeText={setPhone}
            inputMode="numeric"
            style={[styles.input, style]}
            left={<PaperTextInput.Affix text="+91-" style={{ padding: 0, margin: 0 }}/>}
            error={error || null}
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