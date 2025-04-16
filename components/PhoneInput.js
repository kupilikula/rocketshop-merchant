import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput as PaperTextInput } from 'react-native-paper';

const PhoneInput = ({  setPhone, style ={}}) => {
    return (<PaperTextInput
                label="Phone Number With Country Code"
                mode="outlined"
                // dense
                defaultValue={'91'}
                // value={phone}
                onChangeText={setPhone}
                inputMode="numeric"
                style={[styles.input, style]}
                left={<PaperTextInput.Affix text="+" style={{ padding: 0, margin: 0 }}/>}
            />
    );
};

const styles = StyleSheet.create({
    input: {
        backgroundColor: 'white',
    },
});

export default PhoneInput;