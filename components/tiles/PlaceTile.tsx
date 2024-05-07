import { Column, Row, Text } from 'native-base';
import React from 'react';

import { ForwardGeocodingPlace } from '@/api/geofencing';

type PlaceTileProps = {
  place: ForwardGeocodingPlace;
};

export default function PlaceTile(props: PlaceTileProps) {
  const { place } = props;
  return (
    <Column>
      <Row>
        <Text>{place?.display_name}</Text>
      </Row>
    </Column>
  );
}
