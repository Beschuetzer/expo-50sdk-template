import { Camera, CameraType } from 'expo-camera';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';

import { EMPTY_STRING } from '@/constants/general';
import { scanningModeSelector } from '@/state/slices/optionsSlice';
import { ScanningMode } from '@/types/general';

type ScannedObj = { data: string };
export type BarcodeScannerProps = {
  cameraType?: CameraType;
  onScanned?: (upc: string, scanningMode: ScanningMode) => void;
};

export function BarcodeScanner(props: BarcodeScannerProps) {
  const scanningMode = useSelector(scanningModeSelector);
  const { cameraType = CameraType.back, onScanned } = props;
  const [shouldRenderCamera, setShouldRenderCamera] = useState(true);

  const handleBarCodeScanned = useCallback(
    (scannedObj: ScannedObj) => {
      onScanned && onScanned(scannedObj.data || EMPTY_STRING, scanningMode);
    },
    [scanningMode],
  );

  useFocusEffect(
    useCallback(() => {
      setShouldRenderCamera(true);
      return () => {
        setShouldRenderCamera(false);
      };
    }, []),
  );

  return shouldRenderCamera ? (
    <>
      <Camera
        style={styles.camera}
        type={cameraType}
        onBarCodeScanned={handleBarCodeScanned}
      />
      {/* <TouchableOpacity style={styles.scanAgainButton}>
        <Text style={styles.scanAgainText}>Tap to Scan Again</Text>
      </TouchableOpacity> */}
    </>
  ) : null;
}

const styles = StyleSheet.create({
  camera: {
    flex: 1,
  },
  //   scanAgainButton: {
  //     position: 'absolute',
  //     top: '50%',
  //     left: '25%',
  //     padding: 15,
  //     backgroundColor: 'rgba(0, 0, 0, 0.5)',
  //     borderRadius: 10,
  //   },
  //   scanAgainText: {
  //     color: 'white',
  //     fontSize: 18,
  //   },
});
