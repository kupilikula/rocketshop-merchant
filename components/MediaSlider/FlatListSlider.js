import React, {
  Component,
  createRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  View,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  Dimensions,
  Text,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import Indicator from "./Indicator";
import MediaItem from "./MediaItem";

const FlatListSlider = forwardRef((props, ref) => {
  const slider = useRef();
  // const [isReady, setIsReady] = useState(false); // Track if the FlatList is ready
  const [size, setSize] = useState({ width: 400, height: 300 });

  const onLayout = (event) => {
    const { layout } = event.nativeEvent;

    if (layout.width > 0 && layout.height > 0) {
      setSize({ width: layout.width, height: layout.height });
    }
  };

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (Platform.OS === "android") {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const scrollToIndex = (index) => {
    console.log("line48, index:", index);
    if (slider.current) {
      slider?.current.scrollToIndex({ index: index, animated: true });
    }
  };

  useImperativeHandle(ref, () => {
    return {
      scrollToIndex,
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

  const onViewableItemsChanged = ({ viewableItems, changed }) => {
    if (viewableItems.length > 0) {
      let currentIndex = viewableItems[0].index;
      setCurrentIndex(currentIndex);
      if (props.currentIndexCallback) {
        props.currentIndexCallback(currentIndex);
      }
    }
  };

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  // useEffect(() => {
  //     console.log("props.data updated:", props.data);
  // }, [props.data]);

  return (
    props.data.length > 0 && (
      <View
        onLayout={onLayout}
        style={[{ position: "relative" }, props.flatListWrapperStyle || {}]}
      >
        <FlatList
          ref={slider}
          simultaneousHandlers={props.simultaneousHandlers || []}
          horizontal={true}
          pagingEnabled={true}
          snapToAlignment={"center"}
          decelerationRate={0.99}
          bounces={false}
          // contentContainerStyle={props.contentContainerStyle}
          data={props.data}
          extraData={props.data}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item, index: i }) => {
            // return <View>
            //     <Text style={{color: 'white'}}>{item.id}</Text>
            // </View>
            return (
              <MediaItem
                width={size.width}
                height={size.height}
                item={item}
                orientation={props.orientation}
                // onPress: props.onPress,
                index={i}
                numberOfItems={props.data.length}
                scrollToIndex={scrollToIndex}
                active={i === currentIndex}
                local={props.local}
                allowPanZoom={props.allowPanZoom}
                showScrollButtons={props.showScrollButtons}
                simultaneousHandlers={
                  props.simultaneousHandlers
                    ? [slider, ...props.simultaneousHandlers]
                    : [slider]
                }
              />
            );
          }}
          ItemSeparatorComponent={() => <></>}
          keyExtractor={props.keyExtractor}
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
          windowSize={50}
          initialNumToRender={50}
          maxToRenderPerBatch={50}
          removeClippedSubviews={false}
          scrollEnabled={true}
          // onContentSizeChange={handleContentSizeChange}
        />
        {props.indicator && props.data.length > 1 && (
          <Indicator
            itemCount={props.data.length}
            currentIndex={currentIndex % props.data.length}
            indicatorStyle={props.indicatorStyle}
            indicatorContainerStyle={[
              styles.indicatorContainerStyle,
              props.indicatorContainerStyle,
            ]}
            indicatorActiveColor={props.indicatorActiveColor}
            indicatorInActiveColor={props.indicatorInActiveColor}
            indicatorActiveWidth={props.indicatorActiveWidth}
            style={{ ...styles.indicator, ...props.indicatorStyle }}
          />
        )}
      </View>
    )
  );
});

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
        shadowColor: "black",
        shadowOffset: { width: 3, height: 3 },
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
