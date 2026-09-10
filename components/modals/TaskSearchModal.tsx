import { FontAwesome } from '@expo/vector-icons';
import {
  Box,
  Button,
  ButtonText,
  Center,
  Heading,
  Input,
  InputField,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import { FlashList } from '@shopify/flash-list';
import _ from 'lodash';
import React, {
  JSXElementConstructor,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Dimensions } from 'react-native';
import { XOR } from 'ts-xor';

import { ModalWithBlur, ModalWithBlurProps } from './ModalWithBlur';

import {
  EMPTY_STRING,
  ESTIMATED_SIZE_FOR_TASK_SEARCH_MODAL_LIST,
  LIST_HAPTICS,
} from '@/constants/general';
import { tasksSelector } from '@/state/slices/tasksSlice';
import { useAppSelector } from '@/state/store';
import { Task } from '@/types/Task';
import { ListRow } from '@/types/general';

export type TaskSearchModalSelectedItem<T> = T | null;
type TaskSearchModalProps<T> = {
  onConfirm: (selectedItem: TaskSearchModalSelectedItem<T>) => void;
  onGetValuesList: (tasks: Task[]) => T[];
  onGetFilteredValues: (values: T[], filterValue: string) => T[];
  onRenderChildren: (
    item: ListRow<T>,
  ) => ReactElement<any, string | JSXElementConstructor<any>> | null;
  isVisible: boolean;
} & Omit<ModalWithBlurProps, 'children' | 'onConfirm' | 'title'> &
  XOR<
    { title: string },
    { onGetTitle: (selectedItem: TaskSearchModalSelectedItem<T>) => string }
  >;

export function TaskSearchModal<T>(props: TaskSearchModalProps<T>) {
  const {
    isVisible,
    onConfirm,
    onCancel,
    onGetFilteredValues,
    onGetTitle,
    onGetValuesList,
    title,
  } = props;
  const tasks = useAppSelector(tasksSelector);
  const [filterValue, setFilterValue] = useState(EMPTY_STRING);
  const flashListRef = useRef<FlashList<T>>(null);
  const valuesList = useMemo(
    () => onGetValuesList(tasks),
    [onGetValuesList, tasks],
  );
  const windowDimensions = useMemo(() => Dimensions.get('window'), []);
  const [valuesToShow, setValuesToShow] = useState(valuesList);
  const [selectedItem, setSelectedItem] =
    useState<TaskSearchModalSelectedItem<T>>(null);

  const getTitle = useCallback(() => {
    if (onGetTitle) {
      return onGetTitle(selectedItem);
    }
    return title;
  }, [title, onGetTitle, selectedItem]);

  const reset = useCallback(() => {
    setSelectedItem(null);
  }, []);

  const onConfirmPress = useCallback(() => {
    onConfirm && onConfirm(selectedItem);
    reset();
  }, [onConfirm, reset, selectedItem]);

  const onCancelPress = useCallback(() => {
    onCancel && onCancel();
    reset();
  }, [onCancel, reset]);

  useEffect(() => {
    if (!filterValue) {
      setValuesToShow(valuesList);
      return;
    }

    setValuesToShow(onGetFilteredValues(valuesList, filterValue));
  }, [filterValue, valuesList, onGetFilteredValues]);

  return (
    <ModalWithBlur
      {...props}
      containerStyles={{ borderRadius: 0 }}
      isVisible={isVisible}
      confirmButton={{ isEnabled: !!selectedItem }}
      onConfirm={onConfirmPress}
      onCancel={onCancelPress}
      title={
        <VStack pb="$2" px="$2">
          <Heading textAlign="center" size="sm">
            {getTitle()}
          </Heading>
          <Input>
            <InputField
              value={filterValue}
              onChangeText={(newValue) => setFilterValue(newValue)}
              placeholder="Filter"
            />
          </Input>
        </VStack>
      }
    >
      {tasks.length <= 0 ? (
        <Center width={windowDimensions.width} flex={1}>
          <Text>No tasks to show...</Text>
        </Center>
      ) : (
        <Box width={windowDimensions.width} flex={1}>
          <FlashList
            keyboardShouldPersistTaps="always"
            extraData={selectedItem}
            ref={flashListRef}
            renderItem={(item: ListRow<T>) => {
              const { item: itemToRender, index } = item;
              return (
                <Button
                  key={index}
                  variant="outline"
                  isDisabled={_.isEqual(selectedItem, itemToRender)}
                  onPress={() => {
                    setSelectedItem(itemToRender);
                    LIST_HAPTICS.handleSelection();
                  }}
                  justifyContent="space-between"
                >
                  <ButtonText>{String(itemToRender)}</ButtonText>
                  {_.isEqual(selectedItem, itemToRender) ? (
                    <FontAwesome name="check" />
                  ) : null}
                </Button>
              );
            }}
            data={valuesToShow}
            estimatedItemSize={ESTIMATED_SIZE_FOR_TASK_SEARCH_MODAL_LIST}
          />
        </Box>
      )}
    </ModalWithBlur>
  );
}
