import { Camera, CameraType } from 'expo-camera';
import { useFocusEffect } from 'expo-router';
import { Text } from 'native-base';
import React, { ReactNode, useCallback, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';

import { EMPTY_STRING } from '@/constants/general';
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
  onResetPress?: () => void;
  onScanned?: (
    upc: string,
    scanningMode: ScanningMode,
    isItemInList: boolean,
  ) => void;
  scanButton?: ReactNode | ReactNode[];
};

export function BarcodeScanner(props: BarcodeScannerProps) {
  const itemsList = useSelector(
    listToDisplaySelector(ListName.ItemsList),
  ) as Item[];
  const scanningMode = useSelector(scanningModeSelector);
  const {
    isEnabled = true,
    cameraType = CameraType.back,
    onResetPress,
    onScanned,
    scanButton,
  } = props;
  const [shouldRenderCamera, setShouldRenderCamera] = useState(true);

  const handleBarCodeScanned = useCallback(
    (scannedObj: ScannedObj) => {
      const upc = scannedObj.data;
      const isItemInList = !!getItemFromList(itemsList, upc);
      onScanned && onScanned(upc || EMPTY_STRING, scanningMode, isItemInList);
    },
    [scanningMode, itemsList],
  );

  useFocusEffect(
    useCallback(() => {
      setShouldRenderCamera(true);
      return () => {
        setShouldRenderCamera(false);
      };
    }, []),
  );

  function renderScanButton() {
    if (isEnabled) return null;
    if (scanButton)
      return React.cloneElement(scanButton as React.ReactElement, {
        onPress: onResetPress,
      });
    return (
      <TouchableOpacity style={[styles.scanAgainButton]} onPress={onResetPress}>
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
      {renderScanButton()}
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
