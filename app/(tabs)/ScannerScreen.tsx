import {
  Box,
  Button,
  ButtonText,
  Center,
  Heading,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import { type NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';

import { BarcodeScanner } from '@/components/BarcodeScanner';
import { FullscreenSpinner } from '@/components/FullscreenSpinner';
import { useRequestCameraPermissions } from '@/components/hooks/useRequestCameraPermissions';
import { type AppParamList, Routes } from '@/constants/navigation';
import { tasksSelector } from '@/state/slices/tasksSlice';
import { useAppSelector } from '@/state/store';
import { getTaskFromList } from '@/utils/helpers';

/**
 *A generic demo of `expo-camera`'s barcode/QR scanning. Scanning a code either finds a matching
 *task (by its `code` field) or offers to create a new task pre-filled with the scanned value.
 **/
export default function ScannerScreen() {
  const hasPermission = useRequestCameraPermissions();
  const navigation = useNavigation<NavigationProp<AppParamList>>();
  const tasks = useAppSelector(tasksSelector);
  const [lastScannedCode, setLastScannedCode] = useState('');
  const [isScannerEnabled, setIsScannerEnabled] = useState(true);

  const handleScanned = useCallback((code: string) => {
    setLastScannedCode(code);
    setIsScannerEnabled(false);
  }, []);

  const matchingTask = getTaskFromList(tasks, lastScannedCode);

  const onOpenTaskPress = useCallback(() => {
    if (!matchingTask) return;
    navigation.navigate(Routes.TaskModal, { key: matchingTask });
  }, [matchingTask, navigation]);

  const onCreateTaskPress = useCallback(() => {
    navigation.navigate(Routes.TaskModal, {
      key: { _id: '', code: lastScannedCode },
    });
  }, [lastScannedCode, navigation]);

  if (hasPermission === null) {
    return <FullscreenSpinner text="Requesting camera permission..." />;
  }

  if (!hasPermission) {
    return (
      <Center flex={1} p="$4">
        <Heading size="sm" textAlign="center">
          Camera access is required to scan codes.
        </Heading>
      </Center>
    );
  }

  return (
    <Box flex={1}>
      {isScannerEnabled ? (
        <BarcodeScanner onScanned={handleScanned} />
      ) : (
        <Center flex={1} p="$4">
          <VStack space="sm" alignItems="center">
            <Text>Scanned: {lastScannedCode}</Text>
            {matchingTask ? (
              <Button onPress={onOpenTaskPress}>
                <ButtonText>Open '{matchingTask.title}'</ButtonText>
              </Button>
            ) : (
              <Button onPress={onCreateTaskPress}>
                <ButtonText>Create Task with this Code</ButtonText>
              </Button>
            )}
            <Button variant="outline" onPress={() => setIsScannerEnabled(true)}>
              <ButtonText>Scan Again</ButtonText>
            </Button>
          </VStack>
        </Center>
      )}
    </Box>
  );
}
