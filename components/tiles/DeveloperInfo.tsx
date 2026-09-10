import { Text } from '@gluestack-ui/themed';

import { getIsDevelopmentMode } from '@/utils/helpers';

type DeveloperInfoProps = {
  _id: string;
  hasBeenSaved: boolean;
  needsSaving: boolean;
};

/**
 *Dev-only debug overlay shown on tiles/forms so it's obvious in development whether a record has
 *synced with the backend yet. Renders nothing outside of development mode (see `getIsDevelopmentMode`).
 **/
export function DeveloperInfo(props: DeveloperInfoProps) {
  const { _id, hasBeenSaved, needsSaving } = props;

  if (!getIsDevelopmentMode()) return null;
  return (
    <>
      <Text size="xs">_id: {_id}</Text>
      <Text size="xs">
        needsSaving: {needsSaving === false ? 'false' : 'true'}
      </Text>
      <Text size="xs">
        hasBeenSaved: {hasBeenSaved === true ? 'true' : 'false'}
      </Text>
    </>
  );
}
