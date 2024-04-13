import { CameraType } from 'expo-camera';
import { useNavigation } from 'expo-router';
import { Button, View, Row, Text } from 'native-base';
import React, { useState, useCallback } from 'react';
import { StyleSheet } from 'react-native';

import { BarcodeScanner } from '@/components/BarcodeScanner';
import { FullscreenSpinner } from '@/components/FullscreenSpinner';
import { ManualUpcInput } from '@/components/forms/ManualUpcInput';
import { useRequestCameraPermissions } from '@/components/hooks/useRequestCameraPermissions';
import { EMPTY_STRING } from '@/constants/general';
import { Routes } from '@/constants/navigation';
import { getIsValidUpcValue, getStandardizedUpcValue } from '@/utils/helpers';

const BarcodeScannerScreen = () => {
  const [type, setType] = useState(CameraType.back);
  const [isManuallyEntering, setIsManuallyEntering] = useState(false);
  const hasPermission = useRequestCameraPermissions();
  const navigation = useNavigation();

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

  if (hasPermission === null) {
    return <FullscreenSpinner />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Row space={1}>
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

export default BarcodeScannerScreen;
