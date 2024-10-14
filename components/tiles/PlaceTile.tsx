import { Column, Heading, Text } from 'native-base';
import React, { useMemo } from 'react';

import { ForwardGeocodingPlaceWithDistance } from '../modals/ForwardGeoCodingModal';

import { parseAddress } from '@/utils/parseAddress';

type PlaceTileProps = {
  place: ForwardGeocodingPlaceWithDistance;
};

export default function PlaceTile(props: PlaceTileProps) {
  const { place } = props;
  const address = useMemo(
    () => parseAddress(place?.display_name),
    [place?.display_name],
  );

  return (
    <Column>
      {address.addressLineOne ? <Text>{address.addressLineOne}</Text> : null}
      {address.addressLineTwo ? <Text>{address.addressLineTwo}</Text> : null}
      <Text>
        {address.city}, {address.state} {address.zipCode}
      </Text>
      {address.country ? <Text>{address.country}</Text> : null}
      {place?.calculatedDistance ? (
        <Heading size="xs">{place.calculatedDistance} mi.</Heading>
      ) : null}
      <Text />
    </Column>
  );
}
