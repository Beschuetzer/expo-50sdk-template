import { theme, Row, Input, Stack } from 'native-base';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

import { InputText } from './InputText';
import { FontAwesomeButton } from '../FontAwesomeButton';

import { EMPTY_STRING, FORM_INTER_ITEM_SPACING } from '@/constants/general';
import { setLoading } from '@/state/slices/generalSlice';
import { useAppDispatch } from '@/state/store';
import { GpsCoordinate } from '@/types/Store';
import { displayAlert, getGpsCoordinate } from '@/utils/helpers';
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
  const debounceTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const onGetCurrentCoordinatesPress = useCallback(async () => {
    try {
      setIsLoadingGpscoords(true);
      dispatch(setLoading('Fetching current coordinates...'));
      const gpsCoordinate = await getGpsCoordinate();
      setCoordinates(gpsCoordinate);
    } catch (error: any) {
      displayAlert(error);
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
    clearTimeout(debounceTimeoutRef.current as NodeJS.Timeout);
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
  }, [coordinates, debounceAmount, debounceTimeoutRef, onChange]);

  useEffect(() => {
    setCoordinates((current) => initialCoordinates || current);
  }, [initialCoordinates]);

  return (
    <Stack mt={theme.space[FORM_INTER_ITEM_SPACING]}>
      <Row alignItems="center" space={theme.space[FORM_INTER_ITEM_SPACING]}>
        <InputText>Lat:&nbsp;</InputText>
        <Input
          variant="outline"
          keyboardType="numeric"
          p={theme.space[1]}
          flex={1}
          placeholder="Latitude"
          value={coordinates?.lat.toString()}
          onChangeText={(newLat) => {
            setCoordinates(
              (current) =>
                ({
                  ...current,
                  lat: newLat,
                }) as any,
            );
          }}
        />
        <InputText>Lon:&nbsp;</InputText>
        <Input
          variant="outline"
          keyboardType="numeric"
          p={theme.space[1]}
          flex={1}
          placeholder="Longitude"
          value={coordinates?.lon.toString()}
          onChangeText={(newLon) => {
            setCoordinates(
              (current) =>
                ({
                  ...current,
                  lon: newLon,
                }) as any,
            );
          }}
        />
        {!coordinates.lat || !coordinates.lon ? null : (
          <FontAwesomeButton
            size={theme.sizes[8]}
            style={{
              paddingHorizontal: theme.space[FORM_INTER_ITEM_SPACING] * 2,
            }}
            name="map-marker"
            onPress={onMapPress}
          />
        )}
      </Row>
      <Row
        pt={theme.space[FORM_INTER_ITEM_SPACING]}
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
      </Row>
    </Stack>
  );
}
