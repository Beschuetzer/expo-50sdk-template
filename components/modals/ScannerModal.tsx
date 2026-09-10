import { FontAwesome } from '@expo/vector-icons';
import { Box, Heading } from '@gluestack-ui/themed';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import React, { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { ViewStyle } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { BarcodeScanner } from '../BarcodeScanner';

import { getButtonHitSlop } from '@/utils/helpers';

type ScannerModalProps = {
  /**
   *If `false`, the scan icon is hidden and only the bottom sheet itself is rendered - useful
   *when a parent component wants to control opening the sheet via a `ref`.
   **/
  isIconVisible?: boolean;
  hitSlopFactor?: number;
  onPress?: () => void;
  /**
   *This is called when the {@link BarcodeScanner} returns a value
   **/
  onScannedValue: (code: string) => void;
  size?: number;
  style?: ViewStyle;
  title?: string;
};

export const ScannerModal = forwardRef<
  BottomSheetModalMethods,
  ScannerModalProps
>((props, ref) => {
  const innerRef = useRef<BottomSheetModalMethods>(null);
  useImperativeHandle(ref, () => innerRef.current as BottomSheetModalMethods);
  const {
    hitSlopFactor = 2,
    isIconVisible = true,
    onPress,
    onScannedValue,
    size = 20,
    style,
    title = 'Scan Code',
  } = props;
  const snapPoints = useMemo(() => ['50%', '75%', '100%'], []);

  const modalJSX = useMemo(() => {
    return (
      <BottomSheetModal ref={innerRef} index={1} snapPoints={snapPoints}>
        <BottomSheetView style={{ flex: 1 }}>
          <Heading my="$2" textAlign="center" size="lg">
            {title}
          </Heading>
          <BarcodeScanner
            resetPeriod={Infinity}
            onScanned={(code) => {
              onScannedValue(code);
              innerRef.current?.close();
            }}
          />
        </BottomSheetView>
      </BottomSheetModal>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onScannedValue, snapPoints, title]);

  if (!isIconVisible) {
    return modalJSX;
  }
  return (
    <Box style={style}>
      <TouchableOpacity
        onPress={onPress ?? (() => innerRef.current?.present())}
        hitSlop={getButtonHitSlop(hitSlopFactor)}
      >
        <FontAwesome name="barcode" size={size} />
      </TouchableOpacity>
      {modalJSX}
    </Box>
  );
});
ScannerModal.displayName = 'ScannerModal';
