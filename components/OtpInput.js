// components/OtpInput.js
import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, Keyboard, TextInput } from 'react-native';

const OtpInput = ({ otpLength = 6, onSubmit }) => {
    const [otp, setOtp] = useState(Array(otpLength).fill(''));
    const inputs = useRef([]);

    useEffect(() => {
        const joinedOtp = otp.join('');
        if (joinedOtp.length === otpLength && !otp.includes('')) {
            onSubmit?.(joinedOtp);
        }
    }, [otp]);

    const handleChange = (text, index) => {
        if (text.length > 1) {
            const chars = text.trim().slice(0, otpLength).split('');
            const newOtp = [...otp];
            chars.forEach((char, i) => {
                if (/^\d$/.test(char)) newOtp[i] = char;
            });
            setOtp(newOtp);
            const nextIndex = Math.min(chars.length, otpLength - 1);
            inputs.current[nextIndex]?.focus();
        } else {
            const newOtp = [...otp];
            newOtp[index] = text;
            setOtp(newOtp);
            if (text && index < otpLength - 1) {
                inputs.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && otp[index] === '') {
            if (index > 0) {
                const newOtp = [...otp];
                newOtp[index - 1] = '';
                setOtp(newOtp);
                inputs.current[index - 1]?.focus();
            }
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                {Array(otpLength).fill(0).map((_, index) => (
                    <TextInput
                        key={index}
                        style={styles.input}
                        value={otp[index]}
                        onChangeText={(text) => handleChange(text, index)}
                        onKeyPress={(e) => handleKeyPress(e, index)}
                        keyboardType="number-pad"
                        maxLength={1}
                        ref={(ref) => {
                            if (ref) inputs.current[index] = ref;
                        }}
                        autoFocus={index === 0}
                        caretHidden={true}
                        textAlign="center"
                    />
                ))}
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 16,
    },
    input: {
        width: 40,
        height: 40,
        fontSize: 24,
        borderWidth: 1,
        // marginHorizontal: 4,
        borderColor: '#000',
        borderRadius: 0,
        backgroundColor: 'white',
        textAlign: 'center',
    },
});

export default OtpInput;