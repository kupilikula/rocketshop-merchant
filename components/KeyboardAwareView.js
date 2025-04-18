// components/KeyboardAwareView.js
import React from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    View,
} from 'react-native';

const KeyboardAwareView = ({
                               children,
                               keyboardVerticalOffset = 0,
                               backgroundColor = 'white',
                               containerStyle = {},
                               innerViewStyle = {},
                           }) => {
    return (
        <KeyboardAvoidingView
            style={[{ flex: 1, backgroundColor }, containerStyle]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS ==='ios' ? keyboardVerticalOffset : 0}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={[{ flex: 1 }, innerViewStyle]}>
                    {children}
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

export default KeyboardAwareView;