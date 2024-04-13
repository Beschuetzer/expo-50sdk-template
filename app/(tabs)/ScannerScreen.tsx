import { Picker } from '@react-native-picker/picker';
import { CameraType } from 'expo-camera';
import { useNavigation } from 'expo-router';
import { Button, View, Row, Text, Heading, useTheme } from 'native-base';
import React, { useState, useCallback } from 'react';
import { StyleSheet } from 'react-native';
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
  itemsListSelector,
  updateStoreSpecificValues,
} from '@/state/slices/listsSlice';
import {
  getIsValidUpcValue,
  getItemFromList,
  getStandardizedUpcValue,
} from '@/utils/helpers';

enum ScannerScreenMode {
  AddToCart = 'Add to Cart',
  ItemLookup = 'Item Lookup',
}
export default function ScannerScreen() {
  const itemsList = useSelector(itemsListSelector);
  const [type, setType] = useState(CameraType.back);
  const [isManuallyEntering, setIsManuallyEntering] = useState(false);
  const hasPermission = useRequestCameraPermissions();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const [mode, setMode] = useState(ScannerScreenMode.ItemLookup);

  console.log({mode});
  
  const handleUpcNavigation = useCallback(
    (value: string) => {
      if (getIsValidUpcValue(value)) {
        const upc = getStandardizedUpcValue(value);
        const itemInList = getItemFromList(itemsList.data, value);
        console.log({ mode, isItemInList: !!itemInList, value, upc });

        if (mode === ScannerScreenMode.AddToCart) {
          if (itemInList) {
            console.log('use a snackbar to display a message after adding to cart ');
            dispatch(
              updateStoreSpecificValues({
                key: { upc },
                storeSpecificValuesToUpdate: {
                  quantity: (currentQuantity: number) =>
                    currentQuantity > 0 ? currentQuantity + 1 : 1,
                },
              }),
            );
            return;
          }
        }
        navigation.navigate(Routes.ItemModal, {
          key: { upc, name: EMPTY_STRING },
          showOverrideMsg: false,
        });
      }
    },
    [itemsList, mode],
  );

  const onSwitchCameraPress = useCallback(() => {
    setType((current) =>
      current === CameraType.back ? CameraType.front : CameraType.back,
    );
  }, []);

  const onManuallyEnter = useCallback(() => {
    setIsManuallyEntering((current) => !current);
  }, []);

  const onModeChange = useCallback((newValue: ScannerScreenMode) => {
    setMode(newValue);
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
          selectedValue={mode}
          onValueChange={onModeChange}
        >
          {Object.values(ScannerScreenMode).map((modeName) => (
            <Picker.Item key={modeName} label={modeName} value={modeName} />
          ))}
        </Picker>
        {mode === ScannerScreenMode.AddToCart ? (
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
      <BarcodeScanner cameraType={type} onScanned={handleUpcNavigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
