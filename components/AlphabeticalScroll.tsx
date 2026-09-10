import { Center, Text } from '@gluestack-ui/themed';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { SortType } from './lists/sorters';

import { Key } from '@/types/Task';
import { getAlphabeticalCharToIndexMapping } from '@/utils/getAlphabeticalCharToIndexMapping';

type AlphabeticalScrollProps<T> = {
  onCharPress: (index: number, char: string) => void;
  items: T[];
  sortOrderValue: { sortBy: SortType; sortOrder: string };
};

export function AlphabeticalScroll<T extends Key>(
  props: AlphabeticalScrollProps<T>,
) {
  const { items, onCharPress, sortOrderValue } = props;
  const alphabeticalCharToIndexMapping = useMemo(
    () =>
      getAlphabeticalCharToIndexMapping(items, sortOrderValue.sortOrder as any),
    [items, sortOrderValue.sortOrder],
  );
  const containerRef = useRef(null);
  const { height: windowHeight } = useWindowDimensions();

  const containerHeightRef = useRef({ top: 0, bottom: 0 });
  const numberOfCharsToRender =
    Object.keys(alphabeticalCharToIndexMapping || {}).length || 26;

  const bottomBarHeight = 130;

  const buttonHeight = useMemo(() => {
    return (windowHeight - bottomBarHeight) / numberOfCharsToRender;
  }, [numberOfCharsToRender, windowHeight]);

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
  }, [containerRef]);

  if (sortOrderValue.sortBy !== SortType.Title) return null;
  return (
    <Center
      ref={containerRef}
      position="absolute"
      right={0}
      style={styles.container}
    >
      {Object.entries(alphabeticalCharToIndexMapping).map(([char, index]) => {
        return (
          <TouchableOpacity
            key={char}
            onPress={() => onButtonPress(index, char)}
            style={{
              height: buttonHeight,
              paddingHorizontal: 8,
            }}
          >
            <Text color="$primary900">{char}</Text>
          </TouchableOpacity>
        );
      })}
    </Center>
  );
}

const styles = StyleSheet.create({
  container: {
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
});
