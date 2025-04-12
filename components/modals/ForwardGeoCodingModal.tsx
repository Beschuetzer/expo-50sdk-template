import { Button, ScrollView, useTheme } from 'native-base';
import React, { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { ModalWithBlur, ModalWithBlurProps } from './ModalWithBlur';
import { SortType, getSorter } from '../lists/sorters';
import PlaceTile from '../tiles/PlaceTile';

import {
  ForwardGeocodingResponse,
  ForwardGeocodingPlace,
} from '@/components/services/GeoCodingService';
import { FORM_INTER_ITEM_SPACING } from '@/constants/general';
import { currentLocationSelector } from '@/state/slices/listsSlice';
import { Store } from '@/types/Store';
import { calculateDistance } from '@/utils/helpers';

export type ForwardGeocodingPlaceWithDistance =
  | (ForwardGeocodingPlace & Required<Pick<Store, 'calculatedDistance'>>)
  | null;

type FowardGeocodingModalProps = {
  places: ForwardGeocodingResponse;
  onConfirm: (place: ForwardGeocodingPlaceWithDistance) => void;
} & Omit<ModalWithBlurProps, 'title' | 'onConfirm'>;

export function ForwardGeoCodingModal(props: FowardGeocodingModalProps) {
  const { places, ...restProps } = props;
  const currentLocation = useSelector(currentLocationSelector);
  const theme = useTheme();
  const sortedPlaces = useMemo(() => {
    if (!places) return [];
    return places
      .map((place) => ({
        ...place,
        calculatedDistance: calculateDistance(currentLocation, place),
      }))
      .sort(getSorter(SortType.Distance));
  }, [places]) as ForwardGeocodingPlaceWithDistance[];

  const [currentlySelectedPlace, setCurrentlySelectedPlace] =
    useState<ForwardGeocodingPlaceWithDistance>(null);

  const onCancelPress = useCallback(() => {
    restProps.onCancel && restProps.onCancel();
    setCurrentlySelectedPlace(null);
  }, [restProps.onCancel]);

  const onConfirmPress = useCallback(() => {
    restProps.onConfirm && restProps.onConfirm(currentlySelectedPlace);
  }, [restProps.onConfirm, currentlySelectedPlace]);

  return (
    <ModalWithBlur
      {...restProps}
      title="Select a Place"
      confirmButton={{
        isEnabled: !!currentlySelectedPlace,
      }}
      onCancel={onCancelPress}
      onConfirm={onConfirmPress}
    >
      <ScrollView keyboardShouldPersistTaps="always">
        {Array.from(sortedPlaces).map((place) => {
          return (
            <Button
              key={place?.place_id}
              mt={theme.space[FORM_INTER_ITEM_SPACING]}
              variant="subtle"
              isDisabled={currentlySelectedPlace?.place_id === place?.place_id}
              onPress={() => setCurrentlySelectedPlace(place)}
            >
              <PlaceTile place={place} />
            </Button>
          );
        })}
      </ScrollView>
    </ModalWithBlur>
  );
}
