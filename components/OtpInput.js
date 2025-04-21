// components/OtpInput.js
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TextInput, Text, Keyboard, Pressable, Platform } from 'react-native';
import {useTheme} from "react-native-paper";

const OtpInput = ({ otpLength = 6, onSubmit }) => {

    const theme = useTheme();
    const styles = makeStyles(theme);
    const [otp, setOtp] = useState(Array(otpLength).fill(''));
    const [isFocused, setIsFocused] = useState(false);
    const hiddenInputRef = useRef(null);
    const fillTimeoutsRef = useRef([]);
    const hasSubmittedRef = useRef(false);

    // --- Callbacks and Effects ---
    const clearFillTimeouts = useCallback(() => {
        fillTimeoutsRef.current.forEach(clearTimeout);
        fillTimeoutsRef.current = [];
    }, []);

    const isFilledIndex = (i) => !!otp[i];

    useEffect(() => {
        return () => {
            clearFillTimeouts(); // Cleanup on unmount
        };
    }, [clearFillTimeouts]);

    // --- Derived State ---
    const validOtpEntered = otp.join('').length === otpLength && !otp.includes('');
    const filledCount = otp.filter(d => d !== '').length;
    const currentVisualFocusIndex = isFocused ? Math.min(filledCount, otpLength - 1) : -1;

    // --- Effect for Submission ---
    useEffect(() => {
        console.log('line 35 useEffect, validOtpEntered: ', validOtpEntered);
        if (validOtpEntered && !hasSubmittedRef.current) {
            hasSubmittedRef.current = true;
            console.log('line 37 useEffect, validOtpEntered: ', validOtpEntered);
            setTimeout(() => {
                Keyboard.dismiss();
                onSubmit?.(otp.join(''));
            }, 75);
        }
    }, [otp, otpLength, onSubmit, validOtpEntered]); // Keep otp dependency

    // --- Handlers ---
    const handlePress = () => {
        setIsFocused(true);
        hiddenInputRef.current?.focus();
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    const handleHiddenInputChange = (text) => {
        // 1. Clear any pending sequential fills from previous events
        clearFillTimeouts();

        // 2. Get previous state info BEFORE processing new text
        const prevFilledCount = otp.filter(d => d !== '').length;

        // 3. Process the current input text
        const digits = text.match(/^\d+/);
        const enteredDigits = digits ? digits[0].slice(0, otpLength).split('') : [];
        const currentNumEntered = enteredDigits.length;

        // 4. Determine if this change looks like a paste vs. single typing
        // Criteria for paste: More than 1 digit entered now, AND significantly more than before (more than 1 added) OR pasting into empty field.
        const isLikelyPaste = currentNumEntered > 1 &&
            (currentNumEntered - prevFilledCount > 1 || (prevFilledCount === 0 && currentNumEntered > 1));

        // 5. Apply logic based on detection
        if (isLikelyPaste) {
            // --- PASTE PATH: Apply sequential rendering with delays ---
            // console.log("Paste detected, applying sequential fill."); // For debugging

            // a. Immediately clear the visual state to start the effect
            setOtp(Array(otpLength).fill(''));

            // b. Schedule sequential updates for each digit from the paste
            enteredDigits.forEach((digit, index) => {
                const timeoutId = setTimeout(() => {
                    // Use functional update to avoid stale state issues in closures
                    setOtp(prevOtp => {
                        const newOtp = [...prevOtp];
                        if (index < otpLength) {
                            newOtp[index] = digit;
                        }
                        return newOtp;
                    });
                    hasSubmittedRef.current = false;
                }, (index + 1) * 75); // Stagger delays (e.g., 75ms, 150ms...). Adjust 75ms speed as needed.

                fillTimeoutsRef.current.push(timeoutId); // Store timeout ID for potential clearing
            });

        } else {
            // --- MANUAL TYPING PATH (or deletion/minor change): Update directly ---
            // console.log("Manual input detected, updating directly."); // For debugging

            // Create the new state based *only* on the current input text
            const newOtp = Array(otpLength).fill('');
            enteredDigits.forEach((digit, i) => {
                newOtp[i] = digit;
            });
            setOtp(newOtp); // Direct state update, no sequential delay
            hasSubmittedRef.current = false;
        }

        // Ensure hidden input remains focused if the component wrapper has focus
        if (isFocused) {
            hiddenInputRef.current?.focus();
        }
    };

    // --- Rendering ---
    const renderBoxes = () => {
        return Array(otpLength).fill(0).map((_, index) => (
            <Pressable // Make individual boxes pressable to focus hidden input too
                key={index}
                style={[
                    styles.visibleInput,
                    isFocused && index === currentVisualFocusIndex && styles.inputFocused,
                    isFilledIndex(index) && styles.filledInput
                ]}
                onPress={handlePress} // Focus hidden input when tapping a box
            >
                <Text style={styles.inputText}>{otp[index] || ''}</Text>
            </Pressable>
        ));
    };

    return (
        <Pressable style={styles.container} onPress={handlePress}>
            {/* Render the visible boxes */}
            {renderBoxes()}

            {/* Hidden TextInput */}
            <TextInput
                ref={hiddenInputRef}
                style={styles.hiddenInput}
                value={otp.join('')} // Keep value bound
                onChangeText={handleHiddenInputChange}
                onBlur={handleBlur}
                maxLength={otpLength}
                keyboardType="number-pad"
                textContentType={Platform.OS === 'ios' ? 'oneTimeCode' : 'sms-otp'}
                autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
                caretHidden={true}
                autoFocus={false}
                // Add onKeyPress if specific backspace handling is needed later
                // onKeyPress={handleHiddenInputKeyPress}
            />
        </Pressable>
    );
};

// --- Styles --- (Same as previous example)
const makeStyles = (theme) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 16,
        position: 'relative',
    },
    visibleInput: {
        width: 50,
        height: 50,
        borderRadius: 25,
        // borderWidth: 1,
        // borderColor: '#000000',
        backgroundColor: theme.colors.softPrimary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filledInput: {
      backgroundColor: theme.colors.primary,
        color: 'white',
    },
    inputText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white'
    },
    inputFocused: {
        borderColor: theme.colors.primary,
        borderWidth: 1,
    },
    hiddenInput: {
        position: 'absolute',
        top: 0,
        left: -99,
        width: 1,
        height: 1,
        opacity: 0,
        pointerEvents: 'none', // Prevent direct interaction
    },
});

export default OtpInput;