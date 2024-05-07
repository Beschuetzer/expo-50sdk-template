import { Picker } from '@react-native-picker/picker';
import { CameraType } from 'expo-camera';
import { useNavigation } from 'expo-router';
import { Button, View, Row, Text, Heading, useTheme } from 'native-base';
import React, { useState, useCallback, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { Snackbar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { BarcodeScanner } from '@/components/BarcodeScanner';
import { FullscreenSpinner } from '@/components/FullscreenSpinner';
import { StoreManager } from '@/components/StoreManager';
import { ManualUpcInput } from '@/components/forms/ManualUpcInput';
import { useRequestCameraPermissions } from '@/components/hooks/useRequestCameraPermissions';
import { EMPTY_STRING, FORM_INTER_ITEM_SPACING } from '@/constants/general';
import { Routes } from '@/constants/navigation';
import { maxWidth } from '@/constants/styles';
import {
  currentStoreSelector,
  updateStoreSpecificValues,
} from '@/state/slices/listsSlice';
import {
  scanningModeSelector,
  setScanningMode,
} from '@/state/slices/optionsSlice';
import { ScanningMode } from '@/types/general';
import { getIsValidUpcValue, getStandardizedUpcValue } from '@/utils/helpers';

const SNACKBAR_VISIBILITY_DURATION = 2500;
export default function ScannerScreen() {
  const currentStore = useSelector(currentStoreSelector);
  const scanningMode = useSelector(scanningModeSelector);
  const [type, setType] = useState(CameraType.back);
  const [isManuallyEntering, setIsManuallyEntering] = useState(false);
  const hasPermission = useRequestCameraPermissions();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const lastScanTimeRef = useRef(-1);
  const [isSnackbarVisible, setIsSnackbarVisible] = useState(false);
  const [lastUpcScanned, setLastUpcScanned] = useState(EMPTY_STRING);

  const handleUpcNavigation = useCallback(
    (value: string, mode: ScanningMode, isItemInList: boolean) => {
      const modeToUse = mode || scanningMode;
      if (getIsValidUpcValue(value)) {
        const upc = getStandardizedUpcValue(value);
        setLastUpcScanned(upc);

        if (modeToUse === ScanningMode.AddToCart) {
          if (isItemInList) {
            dispatch(
              updateStoreSpecificValues({
                key: { upc },
                storeSpecificValuesToUpdate: {
                  quantity: (currentQuantity: number) =>
                    currentQuantity > 0 ? currentQuantity + 1 : 1,
                },
              }),
            );
            setIsSnackbarVisible(true);
            return;
          }
        }
        navigation.navigate(Routes.ItemModal, {
          key: { upc, name: EMPTY_STRING },
          showOverrideMsg: false,
          callerList: EMPTY_STRING,
        });
      }
    },
    [scanningMode],
  );

  const onBarcodeScanned = useCallback(
    (upc: string, scanningMode: ScanningMode, isItemInList: boolean) => {
      const now = Date.now();
      const diff = now - lastScanTimeRef.current;
      if (diff <= SNACKBAR_VISIBILITY_DURATION) return;
      handleUpcNavigation(upc, scanningMode, isItemInList);
      lastScanTimeRef.current = now;
    },
    [lastScanTimeRef.current, handleUpcNavigation],
  );

  const onSwitchCameraPress = useCallback(() => {
    setType((current) =>
      current === CameraType.back ? CameraType.front : CameraType.back,
    );
  }, []);

  const onManuallyEnter = useCallback(() => {
    setIsManuallyEntering((current) => !current);
  }, []);

  const onModeChange = useCallback((newValue: ScanningMode) => {
    dispatch(setScanningMode(newValue));
  }, []);

  if (hasPermission === null) {
    return <FullscreenSpinner />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }
  return (
    <View style={styles.container}>
      <Row
        pl={theme.sizes[FORM_INTER_ITEM_SPACING]}
        alignItems="center"
        {...maxWidth}
      >
        <Heading size="xs">Mode:</Heading>
        <Picker
          style={{ flex: 1 }}
          selectedValue={scanningMode}
          onValueChange={onModeChange}
        >
          {Object.values(ScanningMode).map((modeName) => (
            <Picker.Item key={modeName} label={modeName} value={modeName} />
          ))}
        </Picker>
        {scanningMode === ScanningMode.AddToCart ? (
          <>
            <Heading size="xs">Store:</Heading>
            <StoreManager showTag={false} showStoreList style={{ flex: 1 }} />
          </>
        ) : (
          <View flex={1} />
        )}
      </Row>
      <Row space={1} {...maxWidth}>
        <Button flex={1} borderRadius={0} onPress={onSwitchCameraPress}>
          Switch Camera
        </Button>
        <Button flex={1} borderRadius={0} onPress={onManuallyEnter}>
          {isManuallyEntering ? 'Close' : 'Enter 13 digit Upc'}
        </Button>
      </Row>
      <ManualUpcInput
        isVisible={isManuallyEntering}
        onPress={handleUpcNavigation}
      />
      <BarcodeScanner cameraType={type} onScanned={onBarcodeScanned} />
      <Snackbar
        style={{ backgroundColor: theme.colors.white }}
        visible={isSnackbarVisible}
        onDismiss={() => setIsSnackbarVisible(false)}
        action={{
          label: 'Close',
          buttonColor: theme.colors.black,
          textColor: theme.colors.white,
          onPress: () => {
            setIsSnackbarVisible(false);
            lastScanTimeRef.current = -1;
          },
        }}
        duration={SNACKBAR_VISIBILITY_DURATION}
      >
        <Text>
          Added {lastUpcScanned} to shopping list for '{currentStore.name}'.
        </Text>
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
