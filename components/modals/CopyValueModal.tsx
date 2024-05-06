import { FontAwesome } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import {
  theme,
  Button,
  View,
  Column,
  Heading,
  Input,
  Text,
  Center,
} from 'native-base';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions } from 'react-native';
import { useSelector } from 'react-redux';

import { ModalWithBlur, ModalWithBlurProps } from './ModalWithBlur';
import { useRenderCount } from '../hooks/useRenderCount';
import { ItemTileCopyModal } from '../tiles/ItemTileCopyModal';

import { EMPTY_STRING, FORM_INTER_ITEM_SPACING } from '@/constants/general';
import { itemsListSelector } from '@/state/slices/listsSlice';
import { Item } from '@/types/Item';
import { getItemFromList } from '@/utils/helpers';

export type CopyModalValues = { [key: string]: unknown };

type CopyValueModalProps = {
  fieldName: string;
  onConfirm: (selectedValue: unknown) => void;
  values: CopyModalValues;
} & Omit<ModalWithBlurProps, 'children' | 'onConfirm' | 'title'>;

export default function CopyValueModal(props: CopyValueModalProps) {
  const { fieldName, onConfirm, onCancel, values } = props;
  const itemsList = useSelector(itemsListSelector);
  const [currentlySelectedKey, setCurrentlySelectedKey] =
    useState<string>(EMPTY_STRING);
  const [filterValue, setFilterValue] = useState(EMPTY_STRING);

  const valuesList = useMemo(() => {
    const entries: [string, unknown, Item | null][] = [];
    let i = 0;
    for (const [key, value] of Object.entries(values || {})) {
      const item = getItemFromList(itemsList.data, key);
      entries[i] = [key, value, item];
      i++;
    }
    return entries;
  }, [values, itemsList?.data?.length]);
  const windowDimensions = useMemo(() => Dimensions.get('window'), []);
  const valueToUse = useMemo(
    () => values[currentlySelectedKey],
    [values, currentlySelectedKey],
  );
  const renderCountRef = useRenderCount();

  const [valuesToShow, setValuesToShow] = useState(valuesList);

  const reset = useCallback(() => {
    setCurrentlySelectedKey(EMPTY_STRING);
  }, []);

  const onConfirmPress = useCallback(() => {
    onConfirm && onConfirm(valueToUse);
    reset();
  }, [onConfirm, reset, valueToUse]);

  const onCancelPress = useCallback(() => {
    onCancel && onCancel();
    reset();
  }, [onCancel, reset]);

  useEffect(() => {
    if (!filterValue) {
      setValuesToShow(valuesList);
      return;
    }

    const filteredValues = valuesList.filter(([key, value, item]) => {
      if (key?.match(filterValue) || item?.name?.match(filterValue)) {
        return [key, value];
      }
    });

    setValuesToShow(filteredValues);
  }, [filterValue, valuesList]);

  return (
    <ModalWithBlur
      {...props}
      isVisible={valuesList.length > 0}
      confirmButton={{
        isEnabled: !!currentlySelectedKey,
      }}
      onConfirm={onConfirmPress}
      onCancel={onCancelPress}
      title={
        <Column
          pb={theme.space[FORM_INTER_ITEM_SPACING]}
          px={theme.space[FORM_INTER_ITEM_SPACING]}
        >
          <Heading textAlign="center" size="sm">
            Copy {fieldName} {currentlySelectedKey ? `(${valueToUse})` : ''}
          </Heading>
          <Input
            value={filterValue}
            onChangeText={(newValue) => setFilterValue(newValue)}
            placeholder="Filter"
            InputRightElement={
              <View pr={theme.space[FORM_INTER_ITEM_SPACING]}>
                <FontAwesome name="search" />
              </View>
            }
          />
        </Column>
      }
    >
      {valuesToShow.length <= 0 ? (
        <Center width={windowDimensions.width} flex={1}>
          <Text>No values to show...</Text>
        </Center>
      ) : (
        <View width={windowDimensions.width} flex={1}>
          <FlashList
            renderItem={(item) => {
              const { item: itemToRender } = item;
              const [key, value] = itemToRender;
              return (
                <Button
                  key={key}
                  variant="outline"
                  isDisabled={currentlySelectedKey === key}
                  onPress={() => setCurrentlySelectedKey(key)}
                  justifyContent="space-between"
                >
                  <ItemTileCopyModal itemKey={key} value={String(value)} />
                </Button>
              );
            }}
            estimatedItemSize={117}
            data={valuesToShow}
          />
        </View>
      )}
    </ModalWithBlur>
  );
}
