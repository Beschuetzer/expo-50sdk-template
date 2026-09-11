import {
  Button,
  ButtonText,
  HStack,
  ScrollView,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import React, { useCallback, useMemo, useState } from 'react';

import { ModalWithBlur, ModalWithBlurProps } from './ModalWithBlur';
import { useGpsCoordinate } from '../hooks/useGeoLocation';
import { SortType, getSorter } from '../lists/sorters';

import {
  ForwardGeocodingResponse,
  ForwardGeocodingPlace,
} from '@/components/services/GeoCodingService';
import { calculateDistance } from '@/utils/helpers';

export type ForwardGeocodingPlaceWithDistance =
  | (ForwardGeocodingPlace & { calculatedDistance: number })
  | null;

type ForwardGeocodingModalProps = {
  places: ForwardGeocodingResponse;
  onConfirm: (place: ForwardGeocodingPlaceWithDistance) => void;
} & Omit<ModalWithBlurProps, 'title' | 'onConfirm'>;

/**
 *Given a list of geocoded places (see `GeoCodingService.doForwardGeocoding`), lets the user pick
 *one - sorted by distance from their current GPS location.
 **/
export function ForwardGeoCodingModal(props: ForwardGeocodingModalProps) {
  const { places, ...restProps } = props;
  const { gpsCoordinates: currentLocation } = useGpsCoordinate();
  const sortedPlaces = useMemo(() => {
    if (!places) return [];
    return places
      .map((place) => ({
        ...place,
        calculatedDistance: calculateDistance(currentLocation, place),
      }))
      .sort(getSorter({ sortType: SortType.None }));
  }, [places, currentLocation]) as ForwardGeocodingPlaceWithDistance[];

  const [currentlySelectedPlace, setCurrentlySelectedPlace] =
    useState<ForwardGeocodingPlaceWithDistance>(null);

  const onCancelPress = useCallback(() => {
    restProps.onCancel && restProps.onCancel();
    setCurrentlySelectedPlace(null);
  }, [restProps]);

  const onConfirmPress = useCallback(() => {
    restProps.onConfirm && restProps.onConfirm(currentlySelectedPlace);
  }, [restProps, currentlySelectedPlace]);

  return (
    <ModalWithBlur
      {...restProps}
      title="Select a Place"
      onCancel={onCancelPress}
      onConfirm={onConfirmPress}
    >
      <ScrollView keyboardShouldPersistTaps="always">
        {sortedPlaces.map((place) => (
          <Button
            key={place?.place_id}
            mt="$2"
            variant="outline"
            isDisabled={currentlySelectedPlace?.place_id === place?.place_id}
            onPress={() => setCurrentlySelectedPlace(place)}
          >
            <VStack>
              <ButtonText>{place?.display_name}</ButtonText>
              {place?.calculatedDistance != null &&
              place.calculatedDistance >= 0 ? (
                <HStack>
                  <Text size="xs">
                    {place.calculatedDistance.toFixed(1)} km away
                  </Text>
                </HStack>
              ) : null}
            </VStack>
          </Button>
        ))}
      </ScrollView>
    </ModalWithBlur>
  );
}
