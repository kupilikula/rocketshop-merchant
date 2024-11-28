import React, {Component, createRef, useCallback, useEffect, useState} from 'react';
import {
    FlatList,
    View,
    StyleSheet,
    LayoutAnimation,
    Platform,
    UIManager,
    Dimensions,
    Text
} from 'react-native';
import Indicator from './Indicator';
import MediaItem from './MediaItem';



export default function FlatListSlider (props) {
    const slider = createRef();
    const useComponentSize = () => {
        const [size, setSize] = useState({width: 400, height:300});

        const onLayout = useCallback(event => {
            const { width, height } = event.nativeEvent.layout;
            setSize({ width, height });
        }, []);

        return [size, onLayout];
    };

    const [data, setData] = useState(props.data);
    const [size, onLayout] = useComponentSize();
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (Platform.OS === 'android') {
            UIManager.setLayoutAnimationEnabledExperimental(true);
        }
    }, [])

    const onViewableItemsChanged = ({viewableItems, changed}) => {
        if (viewableItems.length > 0) {
            let currentIndex = viewableItems[0].index;
            setIndex(currentIndex);
            if (props.currentIndexCallback) {
                props.currentIndexCallback(currentIndex);
            }
        }
    };

    const viewabilityConfig = {
        itemVisiblePercentThreshold: 50,
    };

    return (
            <View onLayout={onLayout} style={{position: 'relative'}}>
                <FlatList
                    ref={slider}
                    horizontal={true}
                    pagingEnabled={true}
                    snapToAlignment={'center'}
                    decelerationRate={0.99}
                    bounces={false}
                    contentContainerStyle={props.contentContainerStyle}
                    data={props.data}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({item, i}) => {
                        return React.cloneElement(props.component, {
                            width: size.width,
                            item: item,
                            // onPress: props.onPress,
                            index: i % props.data.length,
                            active: i === index,
                            local: props.local,
                        });
                    }}
                    ItemSeparatorComponent={() => (
                        <></>
                    )}
                    keyExtractor={(item, index) => item.toString() + index}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={viewabilityConfig}
                    getItemLayout={(_, index) => ({
                        length: size.width,
                        offset: size.width * index,
                        index,
                    })}
                    windowSize={1}
                    initialNumToRender={1}
                    maxToRenderPerBatch={1}
                    removeClippedSubviews={true}
                />
                {props.indicator && (props.data.length > 1) && (
                    <Indicator
                        itemCount={props.data.length}
                        currentIndex={index % props.data.length}
                        indicatorStyle={props.indicatorStyle}
                        indicatorContainerStyle={[
                            styles.indicatorContainerStyle,
                            props.indicatorContainerStyle,
                        ]}
                        indicatorActiveColor={props.indicatorActiveColor}
                        indicatorInActiveColor={props.indicatorInActiveColor}
                        indicatorActiveWidth={props.indicatorActiveWidth}
                        style={{...styles.indicator, ...props.indicatorStyle}}
                    />
                )}
            </View>
        );

}

const styles = StyleSheet.create({
    image: {
        height: 230,
    },
    indicatorContainerStyle: {
        marginTop: 18,
    },
    shadow: {
        ...Platform.select({
            ios: {
                shadowColor: 'black',
                shadowOffset: {width: 3, height: 3},
                shadowOpacity: 0.4,
                shadowRadius: 10,
            },
            android: {
                elevation: 5,
            },
        }),
    },
});