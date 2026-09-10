import {
  Button,
  ButtonText,
  Heading,
  HStack,
  VStack,
} from '@gluestack-ui/themed';
import Slider from '@react-native-community/slider';
import * as Notifications from 'expo-notifications';
import { useNavigation } from 'expo-router';
import { useCallback, useState } from 'react';
import { Dimensions } from 'react-native';

import { AbsolutePositionedScreen } from '@/components/AbsolutelyPositionedScreen';
import { AutoSaveToggle } from '@/components/options/AutoSaveToggle';
import { SaveImagesToGalleryToggle } from '@/components/options/SaveImagesToGalleryToggle';
import { SaveLoadState } from '@/components/options/SaveLoadState';
import { SaveLoadStateFromDb } from '@/components/options/SaveLoadStateFromDb';
import { ShouldSaveOnLoginToggle } from '@/components/options/ShouldSaveOnLoginToggle';
import { BFF_SERVICE } from '@/components/services/BffService';
import { SWIPEABLE_ROW_OPEN_THRESHOLD_DEFAULT } from '@/constants/general';
import { Routes } from '@/constants/navigation';
import { setError } from '@/state/slices/generalSlice';
import {
  setSwipeableRowOpenThreshold,
  swipeableRowOpenThresholdSelector,
} from '@/state/slices/optionsSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';
import { getIsDevelopmentMode, scheduleNotification } from '@/utils/helpers';
import { logWhenDevelopmentMode } from '@/utils/logging';

const MOCK_SHARE_TEXT = 'Pick up dry cleaning';

export default function OptionsScreen() {
  const openThreshold = useAppSelector(swipeableRowOpenThresholdSelector);
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const windowDimensions = Dimensions.get('window');
  const maxAllowableSwipeThreshold = Math.round(
    (windowDimensions.width * 47.5) / 100,
  );

  const [isPinging, setIsPinging] = useState(false);

  const onPingBffPress = useCallback(async () => {
    try {
      setIsPinging(true);
      const response = await BFF_SERVICE.ping({ dispatch });
      if (response?.success) {
        logWhenDevelopmentMode({ message: 'Bff service is running.' });
      } else {
        dispatch(setError({ message: 'Bff server is not running.' }));
      }
    } catch {
      dispatch(setError({ message: 'Bff server is not running.' }));
    } finally {
      setIsPinging(false);
    }
  }, [dispatch]);

  const onDonePress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const onTestNotificationLocalPress = useCallback(async () => {
    logWhenDevelopmentMode({
      message: 'Local notification scheduled for 3 seconds.',
    });
    await scheduleNotification({
      content: {
        title: 'Local Notification',
        body: 'This is a test local high priority notification.',
        data: { test: 'test' },
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        seconds: 3,
        repeats: false,
      },
    });
  }, []);

  return (
    <AbsolutePositionedScreen
      absolutelyPositionedJsx={
        <HStack space="sm">
          <Button flex={1} onPress={onDonePress}>
            <ButtonText>Done</ButtonText>
          </Button>
        </HStack>
      }
    >
      <VStack space="sm">
        <SaveLoadState />
        <SaveLoadStateFromDb />
        <ShouldSaveOnLoginToggle />
        <SaveImagesToGalleryToggle />
        <AutoSaveToggle />
        <Heading size="xs">
          Swipe Row Open Threshold (default ={' '}
          {SWIPEABLE_ROW_OPEN_THRESHOLD_DEFAULT}px):
        </Heading>
        <Slider
          minimumValue={0}
          maximumValue={maxAllowableSwipeThreshold}
          step={5}
          value={openThreshold}
          onSlidingComplete={(value) =>
            dispatch(setSwipeableRowOpenThreshold(Math.round(value)))
          }
        />
      </VStack>
      <VStack space="sm">
        {getIsDevelopmentMode() ? (
          <Button
            onPress={() => {
              // @ts-ignore -- expo-router v3 typed params
              navigation.navigate(Routes.DevOptionsScreen);
            }}
          >
            <ButtonText>Developer Options</ButtonText>
          </Button>
        ) : null}
        {getIsDevelopmentMode() ? (
          <Button
            onPress={() => {
              // @ts-ignore -- expo-router v3 typed params
              navigation.navigate(Routes.ShareIntentScreen, {
                mockUrl: MOCK_SHARE_TEXT,
              });
            }}
          >
            <ButtonText>Test Share Intent Screen</ButtonText>
          </Button>
        ) : null}
        <Button isDisabled={isPinging} onPress={onPingBffPress}>
          <ButtonText>Ping Bff</ButtonText>
        </Button>
        <Button onPress={onTestNotificationLocalPress}>
          <ButtonText>Test Local Notification (3sec)</ButtonText>
        </Button>
      </VStack>
    </AbsolutePositionedScreen>
  );
}
