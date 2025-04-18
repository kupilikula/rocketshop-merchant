// components/KeyboardAwareScreen.js
import React from 'react';
import {
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    StyleSheet,
    View,
    Keyboard,
    TouchableWithoutFeedback,
} from 'react-native';

const KeyboardAwareScrollableScreen = ({
                                 children,
                                 backgroundColor = 'white',
                                 keyboardVerticalOffset = 0,
                                 scrollEnabled = true,
                                 style = {},
                                 contentContainerStyle = {},
                                 innerStyle = {},
                             }) => {
    return (
        <KeyboardAvoidingView
            style={[{ backgroundColor }, style]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? keyboardVerticalOffset : 0}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    scrollEnabled={scrollEnabled}
                    contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
                >
                    <View style={innerStyle}>
                        {children}
                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        flexGrow: 1,
    },
});

export default KeyboardAwareScrollableScreen;