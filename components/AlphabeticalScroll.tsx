import { Text, Center, theme } from 'native-base';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { SortType } from './lists/sorters';

import { EMPTY_NUMBER } from '@/constants/general';
import { SortOrderValue } from '@/state/slices/listsSlice';
import { Key } from '@/types/Item';
import { getAlphabeticalCharToIndexMapping } from '@/utils/getAlphabeticalCharToIndexMapping';

type AlphabeticalScrollProps<T> = {
  onCharPress: (index: number, char: string) => void;
  items: T[];
  sortOrderValue: SortOrderValue;
};

export function AlphabeticalScroll<T extends Key>(
  props: AlphabeticalScrollProps<T>,
) {
  const { items, onCharPress, sortOrderValue } = props;  
  const alphabeticalCharToIndexMapping = useMemo(
    () =>
      getAlphabeticalCharToIndexMapping(items, sortOrderValue.sortOrder as any),
    [items],
  );
  const containerRef = useRef(null);
  const { height: windowHeight } = useWindowDimensions();

  const [currentScrollHeight, setCurrentScrollHeight] = useState(EMPTY_NUMBER);
  const containerHeightRef = useRef({ top: 0, bottom: 0 });
  const currentScrollHeightToUse = useMemo(() => {
    return currentScrollHeight
      ? Math.abs(currentScrollHeight - containerHeightRef.current.top)
      : '0';
  }, [currentScrollHeight]);
  const numberOfCharsToRender =
    Object.keys(alphabeticalCharToIndexMapping || {}).length || 26;

  const bottomBarHeight = 130;

  const buttonHeight = useMemo(() => {
    return (windowHeight - bottomBarHeight) / numberOfCharsToRender;
  }, [numberOfCharsToRender, windowHeight, bottomBarHeight]);

  const onButtonPress = useCallback(
    (index: number, char: string) => {
      onCharPress && onCharPress(index, char);
    },
    [onCharPress],
  );

  useEffect(() => {
    if (containerRef.current) {
      (containerRef.current as any).measure(
        (
          fx: number,
          fy: number,
          width: number,
          height: number,
          px: number,
          py: number,
        ) => {
          containerHeightRef.current = { top: py, bottom: py + height };
        },
      );
    }
  }, [containerRef.current]);

  if (sortOrderValue.sortBy !== SortType.Name) return null;
  return (
    <Center
      ref={containerRef}
      //   onTouchMove={(event) => {
      //     const { nativeEvent } = event;
      //     const { pageY } = nativeEvent;
      //     setCurrentScrollHeight(pageY);
      //   }}
      //   onTouchEnd={(event) => {
      //     const { nativeEvent } = event;
      //     const { pageY } = nativeEvent;
      //     console.log(`final pageY: ${pageY}`);
      //     setCurrentScrollHeight(EMPTY_NUMBER);
      //   }}
      position="absolute"
      right={0}
      style={styles.container}
    >
      {/* <View
        style={[
          styles.currentScrollAmount,
          {
            height: currentScrollHeightToUse as any,
          },
        ]}
      /> */}
      {Object.entries(alphabeticalCharToIndexMapping).map(([char, index]) => {
        return (
          <TouchableOpacity
            key={char}
            onPress={() => onButtonPress(index, char)}
            style={{
              height: buttonHeight,
              paddingHorizontal: theme.sizes[2],
            }}
          >
            <Text color={theme.colors.primary[900]}>{char}</Text>
          </TouchableOpacity>
        );
      })}
    </Center>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    opacity: 0.9,
  },
  currentScrollAmount: {
    backgroundColor: theme.colors.gray[500],
    position: 'absolute',
    zIndex: 1000000,
    width: '100%',
    top: 0,
    opacity: 0.25,
  },
});
