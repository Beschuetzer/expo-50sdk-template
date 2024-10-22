import { Text } from 'native-base';
import React from 'react';

import { DatabaseItem } from '@/types/Item';
import { getIsDevelopmentMode } from '@/utils/helpers';

type DeveloperInfoProps = DatabaseItem;

export function DeveloperInfo(props: DeveloperInfoProps) {
  const { _id, hasBeenSaved, needsSaving } = props;

  if (!getIsDevelopmentMode()) return null;
  return (
    <>
      <Text>_id: {_id}</Text>
      <Text>needsSaving: {needsSaving === false ? 'false' : 'true'}</Text>
      <Text>hasBeenSaved: {hasBeenSaved === true ? 'true' : 'false'}</Text>
    </>
  );
}
