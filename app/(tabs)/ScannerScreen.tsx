import { Picker } from '@react-native-picker/picker';
import { CameraType } from 'expo-camera';
import { useNavigation } from 'expo-router';
import { Button, View, Row, Text, Heading, useTheme } from 'native-base';
import React, { useState, useCallback } from 'react';
import { StyleSheet } from 'react-native';

import { BarcodeScanner } from '@/components/BarcodeScanner';
import { FullscreenSpinner } from '@/components/FullscreenSpinner';
import { StoreManager } from '@/components/StoreManager';
import { ManualUpcInput } from '@/components/forms/ManualUpcInput';
import { useRequestCameraPermissions } from '@/components/hooks/useRequestCameraPermissions';
import { EMPTY_STRING, FORM_INTER_ITEM_SPACING } from '@/constants/general';
import { Routes } from '@/constants/navigation';
import { maxWidth } from '@/constants/styles';
import { getIsValidUpcValue, getStandardizedUpcValue } from '@/utils/helpers';

enum ScannerScreenMode {
  AddToCart = 'AddToCart',
  ItemLookup = 'ItemLookup',
}
const ScannerScreen = () => {
  const [type, setType] = useState(CameraType.back);
  const [isManuallyEntering, setIsManuallyEntering] = useState(false);
  const hasPermission = useRequestCameraPermissions();
  const navigation = useNavigation();
  const theme = useTheme();
  const [mode, setMode] = useState(ScannerScreenMode.ItemLookup);

  const onSearchPress = useCallback((value: string) => {
    if (getIsValidUpcValue(value)) {
      const upc = getStandardizedUpcValue(value);
      navigation.navigate(Routes.ItemModal, {
        key: { upc, name: EMPTY_STRING },
        showOverrideMsg: false,
      });
    }
  }, []);

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
        <Heading size="sm">Mode:</Heading>
        <Picker
          style={{ flex: 1 }}
          selectedValue={mode}
          onValueChange={onModeChange}
        >
          {Object.keys(ScannerScreenMode).map((modeName) => (
            <Picker.Item key={modeName} label={modeName} value={modeName} />
          ))}
        </Picker>
        {mode === ScannerScreenMode.AddToCart ? (
          <>
            <Heading size="sm">Store:</Heading>
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
      <ManualUpcInput isVisible={isManuallyEntering} onPress={onSearchPress} />
      <BarcodeScanner
        cameraType={type}
        onScanned={(upc) => {
          navigation.navigate(Routes.ItemModal, {
            key: { upc, name: EMPTY_STRING },
            showOverrideMsg: false,
          });
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ScannerScreen;
