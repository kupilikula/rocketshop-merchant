import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput as PaperTextInput } from 'react-native-paper';

const PhoneInput = ({  setPhone }) => {
    return (<PaperTextInput
                label="Phone Number With Country Code"
                mode="outlined"
                // dense
                defaultValue={'91'}
                // value={phone}
                onChangeText={setPhone}
                inputMode="numeric"
                style={styles.input}
                left={<PaperTextInput.Affix text="+" style={{ padding: 0, margin: 0 }}/>}
            />
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
        flex: 1
    },
    input: {
        // flex: 1,
        backgroundColor: 'white',
        // marginLeft: 8,
        flex: 1,
        marginRight: 10,
    },
});

export default PhoneInput;