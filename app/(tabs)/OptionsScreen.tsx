import { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import { useNavigation } from "expo-router";
import {
  Button,
  Row,
  View,
  Text,
  FormControl,
  Input,
  theme,
  useTheme,
  Stack,
} from "native-base";
import { useEffect, useState, useRef } from "react";
import { Dimensions } from "react-native";
import { useDispatch, useSelector } from "react-redux";

import { AbsolutePositionedScreen } from "@/components/AbsolutelyPositionedScreen";
import {
  FORM_INTER_ITEM_SPACING,
  SWIPEABLE_ROW_OPEN_THRESHOLD,
} from "@/constants/general";
import {
  setSwipeableRowOpenThreshold,
  swipeableRowOpenThresholdSelector,
} from "@/state/slices/optionsSlice";
import { InputValidationMessage } from "@/components/InputValidationMessage";

const DEBOUNCE_TIMEOUT = 250;

export default function OptionsScreen() {
  const openThreshhold = useSelector(swipeableRowOpenThresholdSelector);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const windowDimensions = Dimensions.get("window");
  const debounceHandlerRef = useRef<{ [key: string]: any }>({});
  
  const maxAllowableSwipeThreshold = Math.round(windowDimensions.width - 25);

  //any new state should be updated in useEffect below when it changes, due to how values are being updated in redux
  const [swipeableRowOpenThresholdValue, setSwipeableRowOpenThresholdValue] =
    useState(openThreshhold);

  function onDonePress() {
    navigation.goBack();
  }

  function handleDebounce(
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
    setSwipeableRowOpenThresholdValue(openThreshhold);
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
        <FormControl.Label>
          Item Row Open Threshold (default = {SWIPEABLE_ROW_OPEN_THRESHOLD}):
        </FormControl.Label>
        <Row>
          <Input
            flex={1}
            variant="outline"
            keyboardType="numeric"
            p={theme.space[1]}
            placeholder="Value in pixels"
            value={swipeableRowOpenThresholdValue as any}
            onChangeText={(text) =>
              handleDebounce(
                'swipeOpenThreshold',
                text,
                setSwipeableRowOpenThreshold,
                (text) => {
                  const parsedInt = parseInt(text, 10)
                  const toReturn = Math.max(
                    0,
                    Math.min(parsedInt, maxAllowableSwipeThreshold),
                  )
                  return toReturn
                },
              )
            }
          />
          <FormControl.Label>px</FormControl.Label>
        </Row>
        <InputValidationMessage
          isValid={Math.round(openThreshhold) < maxAllowableSwipeThreshold}
          message={`The current value will be set to ${maxAllowableSwipeThreshold}, since that is the max allowed for this device.`}
        />
      </Stack>
    </AbsolutePositionedScreen>
  )
}
