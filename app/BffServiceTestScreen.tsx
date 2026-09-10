import { Button, ButtonText, VStack } from '@gluestack-ui/themed';
import { useCallback } from 'react';

import { AbsolutePositionedScreen } from '@/components/AbsolutelyPositionedScreen';
import { UserAccountRenderer } from '@/components/UserAccountRenderer';
import { getRandomInt, getRandomTask } from '@/components/mocks/helpers';
import { UserTasks } from '@/components/services/manual-testing/UserTasks';
import { useAppDispatch } from '@/state/store';
import { saveTask } from '@/state/thunks';

export default function BffServiceTestScreen() {
  const dispatch = useAppDispatch();

  const saveTaskWithNoIdPress = useCallback(async () => {
    dispatch(
      saveTask(getRandomTask(`Manual Test Task ${getRandomInt(1, 999999)}`)),
    );
  }, [dispatch]);

  return (
    <AbsolutePositionedScreen
      absolutelyPositionedJsx={
        <VStack>
          <UserAccountRenderer />
          <Button onPress={saveTaskWithNoIdPress}>
            <ButtonText>Save Task with No Id</ButtonText>
          </Button>
        </VStack>
      }
    >
      <UserTasks />
    </AbsolutePositionedScreen>
  );
}
