import { useIsFocused } from '@react-navigation/native';
import { useFocusEffect, useNavigation } from 'expo-router';
import { Button, Input, Row, Stack, useTheme } from 'native-base';
import { useCallback, useMemo, useRef, useState } from 'react';
import { TextInput } from 'react-native';

import { AbsolutePositionedScreen } from '@/components/AbsolutelyPositionedScreen';
import GeolocationInput from '@/components/forms/GeolocationInput';
import { InputText } from '@/components/forms/InputText';
import { EMPTY_STRING, FORM_INTER_ITEM_SPACING } from '@/constants/general';
import { useAppDispatch } from '@/state/store';
import { addInventoryLocationsThunk } from '@/state/thunks';
import { GpsCoordinate } from '@/types/Store';
import { InventoryLocation } from '@/types/inventory';
import { getId } from '@/utils/helpers';

export default function InventoryLocationModal() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const [formData, setFormData] = useState<InventoryLocation>({
    _id: getId(),
    name: '',
    description: '',
    gpsCoordinates: {
      lat: EMPTY_STRING,
      lon: EMPTY_STRING,
    },
  });
  const nameInputRef = useRef<TextInput>(null);
  const isFocused = useIsFocused();

  const isFormDataValid = useMemo(() => {
    return formData.name.length > 0;
  }, [formData]);

  const onGeoLocationChange = useCallback((gpsCoordinates: GpsCoordinate) => {
    setFormData((current) => {
      return {
        ...current,
        gpsCoordinates,
      };
    });
  }, []);

  const onSavePress = useCallback(() => {
    if (isFormDataValid) {
      dispatch(addInventoryLocationsThunk({ locations: [formData] }));
    }
    navigation.canGoBack() && navigation.goBack();
  }, [formData, isFormDataValid, navigation]);

  useFocusEffect(() => {
    if (isFocused && formData.name.length === 0) {
      nameInputRef.current?.focus();
    }
  });

  return (
    <AbsolutePositionedScreen
      absolutelyPositionedJsx={
        <>
          <Row space={3}>
            <Button
              isDisabled={!isFormDataValid}
              flex={1}
              onPress={onSavePress}
            >
              Save
            </Button>
            <Button
              flex={1}
              onPress={() => navigation.canGoBack() && navigation.goBack()}
            >
              Close
            </Button>
          </Row>
        </>
      }
    >
      <Stack
        space={theme.space[FORM_INTER_ITEM_SPACING]}
        mt={theme.space[FORM_INTER_ITEM_SPACING]}
      >
        <Stack>
          <InputText>Name</InputText>
          <Input
            ref={nameInputRef}
            variant="outline"
            p={theme.space[1]}
            flex={1}
            placeholder="Inventory Location Name"
            value={formData.name}
            onChangeText={(name) => {
              setFormData((current) => ({
                ...current,
                name,
              }));
            }}
          />
        </Stack>
        <Stack>
          <InputText>Description</InputText>
          <Input
            multiline
            numberOfLines={4}
            variant="outline"
            p={theme.space[1]}
            flex={1}
            placeholder="Inventory Location Description"
            value={formData.description}
            onChangeText={(description) => {
              setFormData((current) => ({
                ...current,
                description,
              }));
            }}
          />
        </Stack>
        <GeolocationInput
          onChange={onGeoLocationChange}
          initialCoordinates={formData.gpsCoordinates}
        />
      </Stack>
    </AbsolutePositionedScreen>
  );
}
