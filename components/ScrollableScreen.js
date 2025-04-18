// components/ScrollScreenWrapper.js
import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';

const ScrollableScreen = ({
                                 children,
                                 backgroundColor = 'white',
                                 containerStyle = {},
                                 contentContainerStyle = {},
                                 innerStyle = {},
                             }) => {
    return (
        <ScrollView
            style={[styles.scrollView, { backgroundColor }, containerStyle]}
            contentContainerStyle={[styles.contentContainer, { backgroundColor }, contentContainerStyle]}
        >
            <View style={[styles.inner, innerStyle]}>
                {children}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
    },
    inner: {
        flex: 1,
        width: '100%',
    },
});

export default ScrollableScreen;