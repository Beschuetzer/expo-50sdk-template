import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { Text, useTheme } from 'native-base';
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { LayoutChangeEvent } from 'react-native';

import { FORM_INTER_ITEM_SPACING } from '@/constants/general';

type RecommendedItemsSheetProps = object;

const BOTTOM_SHEET_TAB_HEIGHT = 24;
export const RecommendedItemsSheet = forwardRef<
  BottomSheetMethods,
  RecommendedItemsSheetProps
>((props, ref) => {
  const theme = useTheme();
  const {} = props;
  const innerRef = useRef<BottomSheetMethods>(null);
  useImperativeHandle(ref, () => innerRef.current as BottomSheetMethods);
  const [viewHeight, setViewHeight] = useState(10);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

  const onViewLayout = useCallback((event: LayoutChangeEvent) => {
    const textHeight = Math.ceil(event?.nativeEvent.layout.height);
    alert(textHeight);
    if (!textHeight) return;
    setViewHeight(textHeight);
  }, []);

  return (
    <BottomSheet
      ref={innerRef}
      snapPoints={[
        viewHeight +
          BOTTOM_SHEET_TAB_HEIGHT +
          theme.space[FORM_INTER_ITEM_SPACING],
        '50%',
        '75%',
      ]}
      onChange={handleSheetChanges}
    >
      <BottomSheetScrollView>
        <BottomSheetView onLayout={onViewLayout}>
          <Text>Recommended Items</Text>
        </BottomSheetView>
      </BottomSheetScrollView>
    </BottomSheet>
  );
});
