import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  useCallback, // Imported
  useMemo,     // Imported
} from "react";
import { View, StyleSheet, Platform, UIManager, Text } from "react-native"; // Added Text for potential debugging
import { FlatList } from "react-native"; // Using standard react-native FlatList
import Indicator from "./Indicator";
import MediaItem from "./MediaItem";

const FlatListSlider = forwardRef((props, ref) => {
  const slider = useRef(null);
  const [size, setSize] = useState({
    width: typeof props.width === 'number' ? props.width : 400,
    height: typeof props.height === 'number' ? props.height : 300
  });
  const [currentIndex, setCurrentIndex] = useState(0);

  // Destructure props for stable references in dependency arrays where appropriate
  const {
    data,
    currentIndexCallback,
    keyExtractor: propsKeyExtractor,
    orientation,
    local,
    allowPanZoom,
    onZoomAndPanEnd,
    showScrollButtons,
    simultaneousHandlers: propsSimultaneousHandlers,
    indicator,
    indicatorStyle,
    indicatorContainerStyle: propsIndicatorContainerStyle,
    indicatorActiveColor,
    indicatorInActiveColor,
    indicatorActiveWidth,
    flatListWrapperStyle,
  } = props;

  const onLayout = useCallback((event) => {
    const { layout } = event.nativeEvent;
    if (layout.width > 0 && layout.height > 0) {
      if (layout.width !== size.width || layout.height !== size.height) {
        setSize({ width: layout.width, height: layout.height });
      }
    }
  }, [size.width, size.height]);

  useEffect(() => {
    if (Platform.OS === "android") {
      if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
      }
    }
  }, []);

  console.log('line60, size:', size.width, size.height);

  const scrollToIndex = useCallback((index, animated = true) => {
    if (slider.current && data && data.length > 0 && index >= 0 && index < data.length) {
      slider.current.scrollToIndex({ index, animated });
    }
  }, [data]); // Depends on the stability of the `data` prop

  useImperativeHandle(ref, () => ({
    scrollToIndex,
  }), [scrollToIndex]);

  const onViewableItemsChangedInternal = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      if (newIndex !== null && newIndex !== undefined) {
        setCurrentIndex(prevCurrentIndex => {
          if (newIndex !== prevCurrentIndex) {
            if (currentIndexCallback) {
              currentIndexCallback(newIndex);
            }
            return newIndex;
          }
          return prevCurrentIndex;
        });
      }
    }
  }, [currentIndexCallback]); // Dependency is ONLY `currentIndexCallback`

  const viewabilityConfig = useMemo(() => ({
    itemVisiblePercentThreshold: 50,
    // waitForInteraction: true, // Experiment if needed
  }), []);

  const viewabilityConfigCallbackPairs = useRef([{ viewabilityConfig, onViewableItemsChangedInternal }])

  const renderItemInternal = useCallback(({ item, index: i }) => (
      <MediaItem
          width={size.width}
          height={size.height}
          item={item}
          orientation={orientation}
          index={i}
          numberOfItems={data.length}
          scrollToIndex={scrollToIndex}
          active={i === currentIndex}
          local={local}
          allowPanZoom={allowPanZoom}
          onZoomAndPanEnd={onZoomAndPanEnd}
          showScrollButtons={showScrollButtons}
          simultaneousHandlers={
            propsSimultaneousHandlers
                ? [slider, ...propsSimultaneousHandlers]
                : [slider]
          }
      />
  ), [
    size.width,
    size.height,
    orientation,
    data?.length,
    scrollToIndex,
    currentIndex,
    local,
    allowPanZoom,
    onZoomAndPanEnd,
    showScrollButtons,
    propsSimultaneousHandlers,
  ]);

  const ItemSeparatorComponentInternal = useCallback(() => <View />, []);

  const getItemLayoutInternal = useCallback((itemData, index) => {
    const { width } = size;
    if (!width || width <= 0) {
      return { length: 0, offset: 0, index };
    }
    return {
      length: width,
      offset: width * index,
      index,
    };
  }, [size.width]);

  if (!data || data.length === 0) {
    return null; // Render nothing if no data
  }

  return (
      <View
          onLayout={onLayout}
          style={[{ position: "relative" }, flatListWrapperStyle || {}]}
      >
        <FlatList
            ref={slider}
            horizontal={true}
            pagingEnabled={true}
            snapToAlignment={"center"}
            decelerationRate={Platform.OS === 'ios' ? 0.99 : 'fast'}
            bounces={false}
            data={data}
            showsHorizontalScrollIndicator={false}
            renderItem={renderItemInternal}
            ItemSeparatorComponent={ItemSeparatorComponentInternal}
            keyExtractor={propsKeyExtractor} // This prop comes from the parent
            // onViewableItemsChanged={onViewableItemsChangedInternal}
            // viewabilityConfig={viewabilityConfig}
            viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
            getItemLayout={getItemLayoutInternal}
            initialNumToRender={1}
            maxToRenderPerBatch={1}
            windowSize={3}
            removeClippedSubviews={Platform.OS !== 'web'} // Important for web
            updateCellsBatchingPeriod={50}
            // extraData={currentIndex} // Consider adding if 'active' prop in MediaItem needs to force re-render
        />
        {indicator && data.length > 1 && (
            <Indicator
                itemCount={data.length}
                currentIndex={currentIndex % data.length} // Ensure currentIndex is within bounds
                indicatorStyle={indicatorStyle}
                indicatorContainerStyle={[
                  styles.indicatorContainerStyle, // Default styles
                  propsIndicatorContainerStyle,    // Prop-provided styles
                ]}
                indicatorActiveColor={indicatorActiveColor}
                indicatorInActiveColor={indicatorInActiveColor}
                indicatorActiveWidth={indicatorActiveWidth}
                style={{ ...styles.indicator, ...props.indicatorStyle }} // Merging styles
            />
        )}
      </View>
  );
});

const styles = StyleSheet.create({
  indicatorContainerStyle: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
  },
  indicator: { // Style for the Indicator component itself if needed
    // e.g. paddingVertical: 5,
  },
  // Removed unused styles 'image' and 'shadow'
});

export default FlatListSlider;
