import {
  Box,
  Button,
  ButtonText,
  HStack,
  Heading,
  Input,
  InputField,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import { useNavigation } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList } from 'react-native-gesture-handler';

import { CloseButton } from '@/components/header/CloseButton';
import { RemoveButton } from '@/components/header/RemoveButton';
import {
  bulkAddGuessesSelector,
  bulkAddListSelector,
  bulkAddModeSelector,
  clearBulkAddList,
  removeBulkAddDraft,
  setBulkAddDrafts,
  toggleBulkAddMode,
} from '@/state/slices/quickAddSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';
import { saveTasks } from '@/state/thunks';
import { getEmptyTask } from '@/utils/helpers';

/**
 *Demonstrates a "paste a blob of text, get back structured records" flow: the user pastes one
 *task title per line, this screen parses it into draft rows (fuzzy-matching against existing
 *tasks via `fuzzball` so likely duplicates are flagged), and confirming creates real `Task`s in
 *bulk via the `saveTasks` thunk.
 **/
export default function BulkAddTasksModal() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const bulkAddList = useAppSelector(bulkAddListSelector);
  const mode = useAppSelector(bulkAddModeSelector);
  const guesses = useAppSelector(bulkAddGuessesSelector);
  const [pastedText, setPastedText] = useState('');

  const hasDrafts = bulkAddList.drafts.length > 0;

  const onParsePress = useCallback(() => {
    const lines = Array.from(
      new Set(
        pastedText
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean),
      ),
    );
    setBulkAddDraftsFromLines(lines);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pastedText, mode]);

  function setBulkAddDraftsFromLines(lines: string[]) {
    const newDrafts = lines.map((title) => ({ title }));
    dispatch(
      setBulkAddDrafts(
        mode === 'append' ? [...bulkAddList.drafts, ...newDrafts] : newDrafts,
      ),
    );
  }

  const onAddAllPress = useCallback(() => {
    const tasksToSave = bulkAddList.drafts.map((draft) => ({
      ...getEmptyTask(),
      ...draft,
      title: draft.title,
    }));
    dispatch(saveTasks(tasksToSave));
    dispatch(clearBulkAddList());
    navigation.canGoBack() && navigation.goBack();
  }, [bulkAddList.drafts, dispatch, navigation]);

  const draftRows = useMemo(() => bulkAddList.drafts, [bulkAddList.drafts]);

  return (
    <VStack flex={1} p="$3" space="sm">
      <Heading size="md">Bulk Add Tasks</Heading>
      <Text size="sm">
        Paste one task title per line, then tap Parse to review before adding.
      </Text>
      <Input>
        <InputField
          multiline
          numberOfLines={4}
          placeholder={'Buy groceries\nWrite report\nCall dentist'}
          value={pastedText}
          onChangeText={setPastedText}
        />
      </Input>
      <HStack space="sm">
        <Button flex={1} onPress={onParsePress} isDisabled={!pastedText.trim()}>
          <ButtonText>Parse</ButtonText>
        </Button>
        <Button
          flex={1}
          variant="outline"
          onPress={() => dispatch(toggleBulkAddMode())}
        >
          <ButtonText>Mode: {mode}</ButtonText>
        </Button>
      </HStack>
      <FlatList
        data={draftRows}
        keyExtractor={(draft, index) => `${draft.title}-${index}`}
        renderItem={({ item, index }) => {
          const matches = guesses[item.title] || [];
          return (
            <HStack
              justifyContent="space-between"
              alignItems="center"
              py="$2"
              borderBottomWidth={1}
              borderColor="$backgroundLight200"
            >
              <Box flex={1}>
                <Text bold>{item.title}</Text>
                {matches.length > 0 ? (
                  <Text size="xs" color="$amber600">
                    Possible match: {matches[0][0].title}
                  </Text>
                ) : null}
              </Box>
              <RemoveButton
                onPress={() => dispatch(removeBulkAddDraft(index))}
              />
            </HStack>
          );
        }}
      />
      <HStack space="sm">
        <Button flex={1} isDisabled={!hasDrafts} onPress={onAddAllPress}>
          <ButtonText>
            Add {draftRows.length || ''} Task{draftRows.length === 1 ? '' : 's'}
          </ButtonText>
        </Button>
        <CloseButton />
      </HStack>
    </VStack>
  );
}
