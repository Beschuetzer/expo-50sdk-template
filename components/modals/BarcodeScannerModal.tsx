import { FontAwesome } from '@expo/vector-icons';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { Heading, View, useTheme } from 'native-base';
import React, { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { ViewStyle } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { BarcodeScanner } from '../BarcodeScanner';

import { getButtonHitSlop } from '@/utils/helpers';

type BarcodeProps = {
  /**
   *If this is set to true, the UPC icon will be visible and the modal will open when it is pressed.
   **/
  isUpcIconVisible?: boolean;
  hitSlopFactor?: number;
  onPress: () => void;
  /**
   *This is called when the {@link BarcodeScanner} returns a value
   **/
  onScannedValue: (upc: string) => void;
  size?: number;
  style?: ViewStyle;
  title?: string;
};

export const BarcodeScannerModal = forwardRef<
  BottomSheetModalMethods,
  BarcodeProps
>((props, ref) => {
  const theme = useTheme();
  const innerRef = useRef<BottomSheetModalMethods>(null);
  useImperativeHandle(ref, () => innerRef.current as BottomSheetModalMethods);
  const {
    hitSlopFactor = 2,
    isUpcIconVisible = true,
    onPress,
    onScannedValue,
    size = 20,
    style,
    title = 'Scan Upc',
  } = props;
  const snapPoints = useMemo(() => ['50%', '75%', '100%'], []);

  const modalJSX = useMemo(() => {
    return (
      <BottomSheetModal ref={innerRef} index={1} snapPoints={snapPoints}>
        <BottomSheetView style={{ flex: 1 }}>
          <Heading my={theme.space[1]} textAlign="center" size="lg">
            {title}
          </Heading>
          <BarcodeScanner
            resetPeriod={Infinity}
            onScanned={(upc) => {
              onScannedValue(upc);
              innerRef.current?.close();
            }}
          />
        </BottomSheetView>
      </BottomSheetModal>
    );
  }, [onScannedValue, snapPoints, title, theme.space, innerRef]);

  if (!isUpcIconVisible) {
    return modalJSX;
  }
  return (
    <View style={style}>
      {isUpcIconVisible ? (
        <TouchableOpacity
          onPress={onPress}
          hitSlop={getButtonHitSlop(hitSlopFactor)}
        >
          <FontAwesome name="barcode" size={size} />
        </TouchableOpacity>
      ) : null}
      {modalJSX}
    </View>
  );
});
