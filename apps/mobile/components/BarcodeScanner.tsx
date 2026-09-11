import { FontAwesome6 } from '@expo/vector-icons';
import { Center, Text } from '@gluestack-ui/themed';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useFocusEffect } from 'expo-router';
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

import { useKeyboard } from './hooks/useKeyboard';

import { EMPTY_NUMBER, EMPTY_STRING, LIST_HAPTICS } from '@/constants/general';

type ScannedObj = { data: string };
export type BarcodeScannerProps = {
  isEnabled?: boolean;
  onButtonPress?: () => void;
  onScanned?: (code: string) => void;

  /**
   *   * The time in milliseconds to wait before allowing another scan after a successful scan.
   *   * This is useful to prevent multiple scans in quick succession.
   **/
  resetPeriod?: number;
  scanButton?: ReactNode | ReactNode[];
};

export function BarcodeScanner(props: BarcodeScannerProps) {
  const isKeyboardVisible = useKeyboard();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const {
    isEnabled = true,
    onButtonPress,
    onScanned,
    resetPeriod = 1000,
    scanButton,
  } = props;
  const [shouldRenderCamera, setShouldRenderCamera] = useState(true);
  const lastScanTimeRef = useRef(EMPTY_NUMBER);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = useCallback(
    (scannedObj: ScannedObj) => {
      const code = scannedObj.data;

      if (
        lastScanTimeRef.current &&
        lastScanTimeRef.current + resetPeriod > Date.now()
      ) {
        return;
      }
      onScanned && onScanned(code || EMPTY_STRING);
      lastScanTimeRef.current = Date.now();
      LIST_HAPTICS.handleSelection();
    },
    [resetPeriod, onScanned],
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

  if (hasPermission === null) {
    return null;
  }

  if (!hasPermission) {
    return (
      <Center flex={1}>
        <Text textAlign="center" mb="$2">
          We need your permission to use the camera to scan codes.
        </Text>
      </Center>
    );
  }

  return shouldRenderCamera ? (
    <>
      <BarCodeScanner
        style={styles.camera}
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
    bottom: 32,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  scanAgainText: {
    color: 'white',
    fontWeight: '600',
  },
});
