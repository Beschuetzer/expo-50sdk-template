import { FontAwesome } from '@expo/vector-icons';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { Heading, View, useTheme } from 'native-base';
import React, { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { ViewStyle } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { BarcodeScanner } from './BarcodeScanner';

import { getButtonHitSlop } from '@/utils/helpers';

type BarcodeProps = {
  hitSlopFactor?: number;
  size?: number;
  onPress: () => void;
  /**
   *This is called when the {@link BarcodeScanner} returns a value
   **/
  onScannedValue: (upc: string) => void;
  style?: ViewStyle;
};

export const Barcode = forwardRef<BottomSheetModalMethods, BarcodeProps>(
  (props, ref) => {
    const theme = useTheme();
    const innerRef = useRef<BottomSheetModalMethods>(null);
    useImperativeHandle(ref, () => innerRef.current as BottomSheetModalMethods);
    const {
      hitSlopFactor = 2,
      onPress,
      onScannedValue,
      size = 20,
      style,
    } = props;
    const snapPoints = useMemo(() => ['50%', '75%', '100%'], []);

    return (
      <View style={style}>
        <TouchableOpacity
          onPress={onPress}
          hitSlop={getButtonHitSlop(hitSlopFactor)}
        >
          <FontAwesome name="barcode" size={size} />
        </TouchableOpacity>
        <BottomSheetModal ref={innerRef} index={1} snapPoints={snapPoints}>
          <BottomSheetView style={{ flex: 1 }}>
            <Heading my={theme.space[1]} textAlign="center" size="lg">
              Scan Upc
            </Heading>
            <BarcodeScanner
              onScanned={(upc) => {
                onScannedValue(upc);
                innerRef.current?.close();
              }}
            />
          </BottomSheetView>
        </BottomSheetModal>
      </View>
    );
  },
);
