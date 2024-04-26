import { Button, ScrollView, useTheme } from 'native-base';
import React, { useCallback, useState } from 'react';

import { ModalWithBlur, ModalWithBlurProps } from './ModalWithBlur';
import PlaceTile from '../tiles/PlaceTile';

import {
  DoForwardGeocodingResponse,
  ForwardGeocodingPlace,
} from '@/api/geofencing';
import { FORM_INTER_ITEM_SPACING } from '@/constants/general';

type FowardGeocodingModalProps = {
  places: DoForwardGeocodingResponse;
  onConfirm: (place: ForwardGeocodingPlace) => void;
} & Omit<ModalWithBlurProps, 'title' | 'onConfirm'>;

export function ForwardGeoCodingModal(props: FowardGeocodingModalProps) {
  const { places, ...restProps } = props;
  const theme = useTheme();

  const [currentlySelectedPlace, setCurrentlySelectedPlace] =
    useState<ForwardGeocodingPlace>(null);

  console.log({ currentlySelectedPlace });

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
      <ScrollView>
        {Array.from(places).map((place) => {
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
