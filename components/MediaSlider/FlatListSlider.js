import React, {
    Component,
    createRef,
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
    useState
} from 'react';
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



const FlatListSlider = forwardRef( ( props, ref) =>{
    const slider = useRef();
    // const [isReady, setIsReady] = useState(false); // Track if the FlatList is ready
    const [size, setSize] = useState({width: 400, height:300});

    const onLayout = (event) => {
        const { layout } = event.nativeEvent;

        if (layout.width > 0 && layout.height > 0) {
            setSize({ width: layout.width, height: layout.height });
        }
    };

    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (Platform.OS === 'android') {
            UIManager.setLayoutAnimationEnabledExperimental(true);
        }
    }, [])

    const scrollToIndex = (index) => {
        if (slider.current) {
            slider?.current.scrollToIndex({ index: index, animated: true });
        }
    };

    useImperativeHandle(ref, () =>{
        return {
            scrollToIndex
        };
    });

    // useEffect(() => {
    //         scrollToIndex(props.data.length-1);
    //     }, [props.data])

    // useEffect(() => {
    //     // Use scrollToEnd to scroll to the last item
    //     if (slider.current && props.data.length > 0) {
    //         setTimeout(() => {slider.current.scrollToEnd({ animated: true })}, 100 );
    //     }
    // }, [props.data]);

    // Use effect to listen to data changes and trigger scroll
    // useEffect(() => {
    //     if (isReady && props.data.length > 0) {
    //         // After content size change, scroll to the last item
    //         const lastIndex = props.data.length - 1;
    //         console.log('lastIndex:', lastIndex);
    //         scrollToIndex(lastIndex);
    //     }
    // }, [props.data, isReady]);

    // Handle onLayout and content size changes
    // const handleContentSizeChange = (_) => {
    //     // setSize({ width: contentSize.width, height: contentSize.height });
    //     setTimeout(() =>
    //             slider?.current.scrollToEnd({animated: true})
    //         , 100)
    // };

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
                            height: size.height,
                            item: item,
                            orientation: props.orientation,
                            // onPress: props.onPress,
                            index: i % props.data.length,
                            active: i === index,
                            local: props.local,
                            allowPanZoom: props.allowPanZoom
                        });
                    }}
                    ItemSeparatorComponent={() => (
                        <></>
                    )}
                    keyExtractor={(item, index) => item.toString() + index}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={viewabilityConfig}
                    getItemLayout={(_, index) => {
                        const { width, height } = size;

                        // Handle initial state where size might be empty
                        if (!width || !height) {
                            return { length: 0, offset: 0, index };
                        }

                        return {
                            length: width,
                            offset: width * index,
                            index,
                        };
                        }}
                    windowSize={1}
                    initialNumToRender={1}
                    maxToRenderPerBatch={1}
                    removeClippedSubviews={true}
                    // onContentSizeChange={handleContentSizeChange}
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

})

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

export default FlatListSlider;