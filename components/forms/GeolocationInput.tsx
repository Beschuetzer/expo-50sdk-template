import { HStack, Input, InputField, VStack } from '@gluestack-ui/themed';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

import { InputText } from './InputText';
import { FontAwesomeButton } from '../FontAwesomeButton';

import { EMPTY_STRING, FORM_INTER_ITEM_SPACING } from '@/constants/general';
import { setError, setLoading } from '@/state/slices/generalSlice';
import { useAppDispatch } from '@/state/store';
import { GpsCoordinate } from '@/types/general';
import { getGpsCoordinate } from '@/utils/helpers';
import { openMap } from '@/utils/openMap';

type GeolocationInputProps = {
  children?: React.ReactNode | React.ReactNode[];
  childrenRowStyles?: StyleProp<ViewStyle>;
  debounceAmount?: number;
  initialCoordinates?: GpsCoordinate;
  onChange: (gpsCoordinates: GpsCoordinate) => void;
};

const DEBOUNCE_AMOUNT_DEFAULT = 0;

export default function GeolocationInput(props: GeolocationInputProps) {
  const {
    children,
    childrenRowStyles,
    debounceAmount = DEBOUNCE_AMOUNT_DEFAULT,
    initialCoordinates,
    onChange,
  } = props;
  const dispatch = useAppDispatch();
  const [coordinates, setCoordinates] = useState<GpsCoordinate>(
    initialCoordinates || {
      lat: EMPTY_STRING,
      lon: EMPTY_STRING,
    },
  );
  const [isLoadingGpscoords, setIsLoadingGpscoords] = useState(false);
  const debounceTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const onGetCurrentCoordinatesPress = useCallback(async () => {
    try {
      setIsLoadingGpscoords(true);
      dispatch(setLoading('Fetching current coordinates...'));
      const gpsCoordinate = await getGpsCoordinate();
      setCoordinates(gpsCoordinate);
    } catch (error: any) {
      dispatch(
        setError({
          message: 'Unable to fetch the current location.',
          error: {
            message: error?.message,
            stack: error?.stack,
            name: error?.name,
          },
        }),
      );
    } finally {
      setIsLoadingGpscoords(false);
      dispatch(setLoading(EMPTY_STRING));
    }
  }, []);

  const onMapPress = useCallback(() => {
    openMap({
      dispatch,
      ...coordinates,
      label: `Lat: ${coordinates.lat}, Long: ${coordinates.lon}`,
    });
  }, [coordinates, dispatch]);

  useEffect(() => {
    clearTimeout(debounceTimeoutRef.current as ReturnType<typeof setTimeout>);
    if (
      onChange &&
      coordinates.lat !== EMPTY_STRING &&
      coordinates.lon !== EMPTY_STRING &&
      coordinates.lat !== '-1' &&
      coordinates.lon !== '-1'
    ) {
      if (!debounceAmount) {
        onChange(coordinates);
      } else {
        debounceTimeoutRef.current = setTimeout(() => {
          onChange(coordinates);
        }, debounceAmount);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coordinates, debounceAmount, onChange]);

  useEffect(() => {
    setCoordinates((current) => initialCoordinates || current);
  }, [initialCoordinates]);

  return (
    <VStack mt={FORM_INTER_ITEM_SPACING}>
      <HStack alignItems="center" space="sm">
        <InputText>Lat:&nbsp;</InputText>
        <Input flex={1} variant="outline">
          <InputField
            keyboardType="numeric"
            placeholder="Latitude"
            value={coordinates?.lat.toString()}
            onChangeText={(newLat) => {
              setCoordinates((current) => ({ ...current, lat: newLat }));
            }}
          />
        </Input>
        <InputText>Lon:&nbsp;</InputText>
        <Input flex={1} variant="outline">
          <InputField
            keyboardType="numeric"
            placeholder="Longitude"
            value={coordinates?.lon.toString()}
            onChangeText={(newLon) => {
              setCoordinates((current) => ({ ...current, lon: newLon }));
            }}
          />
        </Input>
        {!coordinates.lat || !coordinates.lon ? null : (
          <FontAwesomeButton
            size={32}
            style={{ paddingHorizontal: FORM_INTER_ITEM_SPACING * 8 }}
            name="map-marker"
            onPress={onMapPress}
          />
        )}
      </HStack>
      <HStack
        pt={FORM_INTER_ITEM_SPACING}
        alignItems="center"
        justifyContent="space-between"
        style={childrenRowStyles}
      >
        <FontAwesomeButton
          name="globe"
          buttonProps={{ disabled: isLoadingGpscoords }}
          onPress={onGetCurrentCoordinatesPress}
        />
        {children}
      </HStack>
    </VStack>
  );
}
