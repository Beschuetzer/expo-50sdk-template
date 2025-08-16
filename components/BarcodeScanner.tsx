import { FontAwesome6 } from '@expo/vector-icons';
import { Camera, CameraType } from 'expo-camera/legacy';
import { useFocusEffect } from 'expo-router';
import { Center, Text } from 'native-base';
import React, { ReactNode, useCallback, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useSelector } from 'react-redux';

import { useKeyboard } from './hooks/useKeyboard';

import { EMPTY_NUMBER, EMPTY_STRING, LIST_HAPTICS } from '@/constants/general';
import { listToDisplaySelector } from '@/state/slices/listsSlice';
import { scanningModeSelector } from '@/state/slices/optionsSlice';
import { Item } from '@/types/Item';
import { ScanningMode } from '@/types/general';
import { ListName } from '@/types/listSlice';
import { getItemFromList } from '@/utils/helpers';

type ScannedObj = { data: string };
export type BarcodeScannerProps = {
  cameraType?: CameraType;
  isEnabled?: boolean;
  onButtonPress?: () => void;
  onScanned?: (
    upc: string,
    scanningMode: ScanningMode,
    isItemInList: boolean,
  ) => void;

  /**
   *   * The time in milliseconds to wait before allowing another scan after a successful scan.
   *   * This is useful to prevent multiple scans in quick succession.
   **/
  resetPeriod?: number;
  scanButton?: ReactNode | ReactNode[];
};

export function BarcodeScanner(props: BarcodeScannerProps) {
  const isKeyboardVisible = useKeyboard();
  const itemsList = useSelector(
    listToDisplaySelector(ListName.ItemsList),
  ) as Item[];
  const scanningMode = useSelector(scanningModeSelector);
  const {
    isEnabled = true,
    cameraType = CameraType.back,
    onButtonPress,
    onScanned,
    resetPeriod = 1000,
    scanButton,
  } = props;
  const [shouldRenderCamera, setShouldRenderCamera] = useState(true);
  const lastScanTimeRef = useRef(EMPTY_NUMBER);

  const handleBarCodeScanned = useCallback(
    (scannedObj: ScannedObj) => {
      const upc = scannedObj.data;
      const isItemInList = !!getItemFromList(itemsList, upc);

      if (
        lastScanTimeRef.current &&
        lastScanTimeRef.current + resetPeriod > Date.now()
      ) {
        return;
      }
      onScanned && onScanned(upc || EMPTY_STRING, scanningMode, isItemInList);
      lastScanTimeRef.current = Date.now();
      LIST_HAPTICS.handleSelection();
    },
    [scanningMode, itemsList, resetPeriod, onScanned, lastScanTimeRef],
  );

  useFocusEffect(
    useCallback(() => {
      setShouldRenderCamera(true);
      return () => {
        setShouldRenderCamera(false);
      };
    }, []),
  );

  function renderButton() {
    const visibleStyle = {
      display: isKeyboardVisible ? 'none' : 'flex',
    } as ViewStyle;
    const stylesToUse = [styles.scanAgainButton, visibleStyle];
    if (isEnabled)
      return (
        <TouchableOpacity style={stylesToUse} onPress={onButtonPress}>
          <Text style={styles.scanAgainText}>Hide</Text>
        </TouchableOpacity>
      );
    if (scanButton)
      return React.cloneElement(scanButton as React.ReactElement, {
        onPress: onButtonPress,
      });
    return (
      <TouchableOpacity style={stylesToUse} onPress={onButtonPress}>
        <Text style={styles.scanAgainText}>Tap to Scan</Text>
      </TouchableOpacity>
    );
  }

  return shouldRenderCamera ? (
    <>
      <Camera
        style={styles.camera}
        type={cameraType}
        onBarCodeScanned={handleBarCodeScanned}
      />
      {isEnabled ? (
        <Center position="absolute" top={0} bottom={0} left={0} right={0}>
          <FontAwesome6 name="expand" size={300} color="white" />
        </Center>
      ) : null}
      {renderButton()}
    </>
  ) : null;
}

const styles = StyleSheet.create({
  camera: {
    flex: 1,
  },
  scanAgainButton: {
    position: 'absolute',
    bottom: '0%',
    left: '0%',
    padding: 15,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
  },
  scanAgainText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
});
