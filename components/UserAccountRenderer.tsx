import { Heading, Stack, Text } from 'native-base';

import { accountSelector } from '@/state/slices/generalSlice';
import { useAppSelector } from '@/state/store';
import { getIsDevelopmentMode } from '@/utils/helpers';

type UserAccountRendererProps = object;
export function UserAccountRenderer(props: UserAccountRendererProps) {
  const userAccount = useAppSelector(accountSelector);

  if (!userAccount._id || !getIsDevelopmentMode()) return null;
  return (
    <Stack>
      <Heading size="md">User Account:</Heading>
      <Text>id: '{userAccount._id}'</Text>
      <Text>email: '{userAccount.email}'</Text>
      <Text>password: '{userAccount.password}'</Text>
    </Stack>
  );
}
