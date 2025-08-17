import { ActionCreatorWithPayload } from '@reduxjs/toolkit';
import * as Notifications from 'expo-notifications';
import { useNavigation } from 'expo-router';
import { Button, Row, FormControl, Input, useTheme, Stack } from 'native-base';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Dimensions } from 'react-native';

import { AbsolutePositionedScreen } from '@/components/AbsolutelyPositionedScreen';
import { InputValidationMessage } from '@/components/InputValidationMessage';
import { AutoSaveItemsToggle } from '@/components/options/AutoSaveItemsToggle';
import { AutoSaveStoresToggle } from '@/components/options/AutoSaveStoresToggle';
import { AutoSetStoreToggle } from '@/components/options/AutoSetStoreToggle';
import { CanCreateMultipleItemsWithSameUpcToggle } from '@/components/options/CanCreateMultipleItemsWithSameUpcToggle';
import { NameOrderSpecifier } from '@/components/options/NameOrderSpecifier';
import { SaveImagesToGallerySlider } from '@/components/options/SaveImagesToGallerySlider';
import { SaveLoadState } from '@/components/options/SaveLoadState';
import { SaveLoadStateViaDb } from '@/components/options/SaveLoadStateFromDb';
import { ShouldSaveOnLoginToggle } from '@/components/options/ShouldSaveOnLoginToggle';
import { BFF_SERVICE } from '@/components/services/BffService';
import {
  FORM_INTER_ITEM_SPACING,
  SWIPEABLE_ROW_OPEN_THRESHOLD_DEFAULT,
} from '@/constants/general';
import { Routes } from '@/constants/navigation';
import { setError, setLoading } from '@/state/slices/generalSlice';
import { setCurrentLocation } from '@/state/slices/listsSlice';
import {
  setSwipeableRowOpenThreshold,
  swipeableRowOpenThresholdSelector,
} from '@/state/slices/optionsSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';
import { getCurrentState } from '@/state/thunks';
import {
  displayAlert,
  getGpsCoordinate,
  getIsDevelopmentMode,
  scheduleNotification,
} from '@/utils/helpers';

const DEBOUNCE_TIMEOUT = 500;

export default function OptionsScreen() {
  const openThreshhold = useAppSelector(swipeableRowOpenThresholdSelector);
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const windowDimensions = Dimensions.get('window');
  const debounceHandlerRef = useRef<{ [key: string]: any }>({});

  const maxAllowableSwipeThreshold = Math.round(
    (windowDimensions.width * 47.5) / 100,
  );

  const [isPinging, setIsPinging] = useState(false);
  //any new state should be updated in useEffect below when it changes, due to how values are being updated in redux
  const [swipeableRowOpenThresholdValue, setSwipeableRowOpenThresholdValue] =
    useState(openThreshhold.toString());

  const onPingBffPress = useCallback(async () => {
    try {
      setIsPinging(true);
      const response = await BFF_SERVICE.ping(dispatch);
      if (response?.isAwake) {
        displayAlert({ message: 'Bff service is running.' });
      } else {
        dispatch(setError({ message: 'Bff server is not running.' }));
      }
    } catch (error) {
      dispatch(setError({ message: 'Bff server is not running.' }));
    } finally {
      setIsPinging(false);
    }
  }, [BFF_SERVICE]);

  const onDonePress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const onTestNotificationLocalPress = useCallback(async () => {
    displayAlert({
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
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 3,
      },
    });
  }, []);

  const onTestNotificationRemotePress = useCallback(() => {
    (async () => {
      displayAlert({
        message: 'Need to implement remote notification!',
      });
    })();
  }, []);

  function handleReduxUpdate(
    key: string,
    text: string,
    toDispatch: ActionCreatorWithPayload<any>,
    textTransformer: (text: string) => void,
  ) {
    clearTimeout(debounceHandlerRef.current[key]);
    debounceHandlerRef.current[key] = setTimeout(() => {
      const transformed = textTransformer ? textTransformer(text) : text;
      dispatch(toDispatch(transformed));
    }, DEBOUNCE_TIMEOUT);
  }

  useEffect(() => {
    setSwipeableRowOpenThresholdValue(openThreshhold.toString());
  }, [openThreshhold]);

  return (
    <AbsolutePositionedScreen
      absolutelyPositionedJsx={
        <>
          <Row space={3}>
            <Button flex={1} onPress={onDonePress}>
              Done
            </Button>
          </Row>
        </>
      }
    >
      <Stack space={theme.space[FORM_INTER_ITEM_SPACING]}>
        <NameOrderSpecifier />
        <SaveLoadState />
        <SaveLoadStateViaDb />
        <ShouldSaveOnLoginToggle />
        <SaveImagesToGallerySlider />
        <AutoSetStoreToggle />
        <AutoSaveItemsToggle />
        <CanCreateMultipleItemsWithSameUpcToggle />
        <AutoSaveStoresToggle />
        <FormControl.Label>
          Item Row Open Threshold (default ={' '}
          {SWIPEABLE_ROW_OPEN_THRESHOLD_DEFAULT}):
        </FormControl.Label>
        <Row space={theme.space[FORM_INTER_ITEM_SPACING]} alignItems="center">
          <Input
            flex={1}
            variant="outline"
            keyboardType="numeric"
            p={theme.space[1]}
            placeholder="Value in pixels"
            value={swipeableRowOpenThresholdValue}
            onChangeText={(text) => {
              handleReduxUpdate(
                'swipeOpenThreshold',
                text,
                setSwipeableRowOpenThreshold,
                (text) => {
                  const parsedInt = parseInt(text, 10);
                  const toReturn = Math.max(
                    0,
                    Math.min(parsedInt, maxAllowableSwipeThreshold),
                  );
                  return toReturn;
                },
              );
              setSwipeableRowOpenThresholdValue(text);
            }}
          />
          <FormControl.Label>px</FormControl.Label>
        </Row>
        <InputValidationMessage
          isValid={Math.round(openThreshhold) < maxAllowableSwipeThreshold}
          message={`The current value will be set to ${maxAllowableSwipeThreshold}, since that is the max allowed for this device.`}
        />
      </Stack>
      <Stack space={theme.space[FORM_INTER_ITEM_SPACING]}>
        <Button
          onPress={async () => {
            dispatch(setLoading('Obtaining current gps coordinate...'));
            const currentGpsCoordinate = await getGpsCoordinate();
            dispatch(setCurrentLocation(currentGpsCoordinate));
            dispatch(getCurrentState({ gpsCoordinate: currentGpsCoordinate }));
          }}
        >
          Update Current Location
        </Button>
        {getIsDevelopmentMode() ? (
          <Button
            onPress={() => {
              // @ts-ignore
              navigation.navigate(Routes.DevOptionsScreen);
            }}
          >
            Developer Options
          </Button>
        ) : null}
        <Button isDisabled={isPinging} onPress={onPingBffPress}>
          Ping Bff
        </Button>
        <Button onPress={onTestNotificationLocalPress}>
          Test Local Notification (3sec)
        </Button>
        <Button onPress={onTestNotificationRemotePress}>
          Test Remote Notification (30sec)
        </Button>
      </Stack>
    </AbsolutePositionedScreen>
  );
}
