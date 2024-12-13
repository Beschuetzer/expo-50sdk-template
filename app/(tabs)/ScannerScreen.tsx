import { Picker } from '@react-native-picker/picker';
import { CameraType } from 'expo-camera';
import { useNavigation } from 'expo-router';
import { Button, View, Row, Text, Heading, useTheme } from 'native-base';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Snackbar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { BarcodeScanner } from '@/components/BarcodeScanner';
import { FullscreenSpinner } from '@/components/FullscreenSpinner';
import { StoreManager } from '@/components/StoreManager';
import { ManualUpcInput } from '@/components/forms/ManualUpcInput';
import { useRequestCameraPermissions } from '@/components/hooks/useRequestCameraPermissions';
import {
  ConfirmModal,
  ConfirmModalProps,
} from '@/components/modals/ConfirmModal';
import {
  EMPTY_STRING,
  FORM_INTER_ITEM_SPACING,
  NOT_APPLICABLE_STRING,
} from '@/constants/general';
import { Routes } from '@/constants/navigation';
import { maxWidth } from '@/constants/styles';
import {
  currentStoreIdSelector,
  currentStoreSelector,
  itemsListSelector,
  lastPurchasedMapSelector,
  storesListSelector,
  updateStoreSpecificValues,
} from '@/state/slices/listsSlice';
import {
  scanningModeSelector,
  setScanningMode,
} from '@/state/slices/optionsSlice';
import { Item } from '@/types/Item';
import { ScanningMode } from '@/types/general';
import {
  getIsValidUpcValue,
  getKeyToUse,
  getStandardizedUpcValue,
  resetConfirmModalProps,
} from '@/utils/helpers';

const SNACKBAR_VISIBILITY_DURATION = 2500;
export default function ScannerScreen() {
  const currentStore = useSelector(currentStoreSelector);
  const currentStoreId = useSelector(currentStoreIdSelector);
  const scanningMode = useSelector(scanningModeSelector);
  const lastPurchasedMap = useSelector(lastPurchasedMapSelector);
  const itemsList = useSelector(itemsListSelector);
  const storesList = useSelector(storesListSelector);
  const [type, setType] = useState(CameraType.back);
  const [isManuallyEntering, setIsManuallyEntering] = useState(false);
  const hasPermission = useRequestCameraPermissions();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const lastScanTimeRef = useRef(-1);
  const [isSnackbarVisible, setIsSnackbarVisible] = useState(false);
  const lastItemScannedRef = useRef<Item | undefined>(undefined);
  const [confirmModalProps, setConfirmModalProps] = useState<ConfirmModalProps>(
    {},
  );
  const storeNameToAddToListRef = useRef<string>(currentStore.name);

  const handleAddToList = useCallback(
    (itemId: string, storeId?: string) => {
      dispatch(
        updateStoreSpecificValues({
          key: { _id: itemId, upc: EMPTY_STRING },
          storeSpecificValuesToUpdate: {
            quantity: (currentQuantity: number) =>
              currentQuantity > 0 ? currentQuantity + 1 : 1,
          },
          storeId,
        }),
      );
      setIsSnackbarVisible(true);
    },
    [storeNameToAddToListRef],
  );

  const handleUpcNavigation = useCallback(
    (value: string, mode: ScanningMode, isItemInList: boolean) => {
      const modeToUse = mode || scanningMode;
      if (getIsValidUpcValue(value)) {
        const upc = getStandardizedUpcValue(value);

        if (modeToUse === ScanningMode.AddToCart) {
          if (isItemInList) {
            const itemToUse = itemsList.data.find((item) => item.upc === upc);
            lastItemScannedRef.current = itemToUse;

            const itemKeyToUse = getKeyToUse(itemToUse || EMPTY_STRING);
            const previouslyPurchasedItem = Object.entries(
              lastPurchasedMap,
            ).find(([key, value]) => {
              return key === itemKeyToUse;
            });
            const storesPurchasedAt = Object.keys(
              previouslyPurchasedItem?.[1] || {},
            );

            const storeId = Object.keys(previouslyPurchasedItem?.[1] || {})[0];
            const storeToUse = storesList.data.find(
              (store) => getKeyToUse(store) === storeId,
            );

            if (storesPurchasedAt.length >= 1) {
              if (!storesPurchasedAt.includes(currentStoreId)) {
                const storeName = storeToUse?.name || NOT_APPLICABLE_STRING;
                const message =
                  storesPurchasedAt.length === 1
                    ? `The item with upc of '${upc}' has only ever been purchased at '${storeName}'.  Would you like to add it to '${storeName}' instead of '${currentStore.name}'?`
                    : `The upc '${upc}' has never been purchased at '${currentStore.name}'.  Would you like to add it to one of these stores instead?`;
                const textYes =
                  storesPurchasedAt.length === 1 ? 'Yes' : `Add to Selected`;
                const textNo =
                  storesPurchasedAt.length === 1 ? 'No' : `Add to Current`;

                setConfirmModalProps({
                  isVisible: true,
                  title: 'Add to a Different Store',
                  message,
                  confirmButton: {
                    text: textYes,
                  },
                  cancelButton: {
                    text: textNo,
                  },
                  items: storesPurchasedAt,
                  onCancel: () => {
                    handleAddToList(
                      itemToUse?._id || EMPTY_STRING,
                      currentStoreId,
                    );
                    storeNameToAddToListRef.current = currentStore.name;
                    resetConfirmModalProps(setConfirmModalProps);
                  },
                  onConfirm: (selectedStore?: string) => {
                    resetConfirmModalProps(setConfirmModalProps);
                    if (!selectedStore && storesPurchasedAt.length > 1) {
                      return;
                    }
                    handleAddToList(
                      itemToUse?._id || EMPTY_STRING,
                      selectedStore || getKeyToUse(storeToUse || EMPTY_STRING),
                    );
                    storeNameToAddToListRef.current =
                      storeToUse?.name || EMPTY_STRING;
                  },
                });
                return;
              }
            }

            storeNameToAddToListRef.current = currentStore.name;
            handleAddToList(itemToUse?._id || EMPTY_STRING, currentStoreId);
            return;
          }
        }
        // @ts-ignore
        navigation.navigate(Routes.ItemModal, {
          key: { upc, name: EMPTY_STRING },
          showOverrideMsg: false,
          callerList: EMPTY_STRING,
        });
      }
    },
    [
      handleAddToList,
      scanningMode,
      lastPurchasedMap,
      itemsList,
      storesList,
      lastItemScannedRef,
      storeNameToAddToListRef,
      currentStore,
    ],
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

  useEffect(() => {
    storeNameToAddToListRef.current = currentStore.name;
  }, [currentStore.name]);

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
          Added '
          {lastItemScannedRef.current?.name ||
            lastItemScannedRef.current?.upc ||
            lastItemScannedRef.current?._id}
          ' to shopping list for '{storeNameToAddToListRef.current}'.
        </Text>
      </Snackbar>
      <ConfirmModal {...confirmModalProps} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
