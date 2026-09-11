import {
  Box,
  Button,
  ButtonText,
  Heading,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import {
  type NavigationProp,
  type RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import Constants from 'expo-constants';
import React from 'react';

import { CloseButton } from '@/components/header/CloseButton';
import { useSharedUrl } from '@/components/hooks/useSharedUrl';
import { type AppParamList, Routes } from '@/constants/navigation';

// Conditional require — module factory never runs in Expo Go
const { useShareIntentContext } =
  Constants.appOwnership === 'expo'
    ? {
        useShareIntentContext: () =>
          ({ shareIntent: null, resetShareIntent: () => {} }) as any,
      }
    : (require('expo-share-intent') as typeof import('expo-share-intent'));

/**
 *Demonstrates handling an incoming OS "share" intent (see `expo-share-intent` +
 *`ShareIntentHandler`): the shared text/URL is used to pre-fill a new task's notes field.
 **/
export default function ShareIntentScreen() {
  const { shareIntent, resetShareIntent } = useShareIntentContext();
  const navigation = useNavigation<NavigationProp<AppParamList>>();
  const route =
    useRoute<RouteProp<AppParamList, typeof Routes.ShareIntentScreen>>();
  const { mockUrl } = route.params ?? {};

  const contextUrl = useSharedUrl(shareIntent);
  const sharedText = mockUrl || contextUrl;

  function tryReset() {
    try {
      resetShareIntent();
    } catch {
      // clearShareIntent native method may be absent in older dev builds
    }
  }

  function handleCreateTask() {
    tryReset();
    navigation.navigate(Routes.TaskModal, {
      key: { _id: '', title: sharedText, notes: sharedText },
    });
  }

  return (
    <VStack flex={1} p="$4" space="sm">
      <Heading size="md">Create a Task from Shared Content</Heading>
      <Box
        borderWidth={1}
        borderColor="$backgroundLight300"
        borderRadius="$md"
        p="$3"
      >
        <Text>{sharedText || 'Nothing was shared.'}</Text>
      </Box>
      <Button isDisabled={!sharedText} onPress={handleCreateTask}>
        <ButtonText>Create Task</ButtonText>
      </Button>
      <CloseButton />
    </VStack>
  );
}
