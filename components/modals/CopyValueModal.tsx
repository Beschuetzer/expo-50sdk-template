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
import { ItemTileCopyModal } from '../tiles/ItemTileCopyModal';

import { EMPTY_STRING, FORM_INTER_ITEM_SPACING } from '@/constants/general';
import { itemsListSelector } from '@/state/slices/listsSlice';
import { Item } from '@/types/Item';
import { getItemFromList } from '@/utils/helpers';

type CopyModalValueType = string;
export type CopyModalValues = { [key: string]: CopyModalValueType };

type CopyValueModalProps = {
  fieldName: string;
  onConfirm: (selectedValue: CopyModalValueType) => void;
  values: CopyModalValues;
} & Omit<ModalWithBlurProps, 'children' | 'onConfirm' | 'title'>;

export default function CopyValueModal(props: CopyValueModalProps) {
  const { fieldName, onConfirm, onCancel, values } = props;
  const itemsList = useSelector(itemsListSelector);
  const [currentlySelectedKey, setCurrentlySelectedKey] =
    useState<string>(EMPTY_STRING);
  const [filterValue, setFilterValue] = useState(EMPTY_STRING);

  const valuesList = useMemo(() => {
    const entries: [string, CopyModalValueType, Item | null][] = [];
    let i = 0;
    for (const [key, value] of Object.entries(values || {})) {
      const item = getItemFromList(itemsList.data, key);
      entries[i] = [key, value, item];
      i++;
    }

    //sort entries by name if available otherwise by store specific value
    entries.sort((a, b) => {
      let valueA = a[1];
      let valueB = b[1];
      if (a[2]?.name && b[2]?.name) {
        valueA = a[2]?.name;
        valueB = b[2]?.name;
      }
      if (valueA === valueB) return 0;
      return valueA > valueB ? 1 : -1;
    });
    return entries;
  }, [values, itemsList?.data?.length]);
  const windowDimensions = useMemo(() => Dimensions.get('window'), []);
  const valueToUse = useMemo(
    () => values[currentlySelectedKey],
    [values, currentlySelectedKey],
  );
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

    const isNumbersOnly = filterValue.match(/^\s*\d+\s*$/);

    const filteredValues = valuesList.filter(([key, value, item]) => {
      const valueToMatch = isNumbersOnly
        ? item?.upc || EMPTY_STRING
        : item?.name || EMPTY_STRING;

      if (valueToMatch?.match(filterValue)) {
        return [key, value];
      }
    });

    setValuesToShow(filteredValues);
  }, [filterValue, valuesList]);

  return (
    <ModalWithBlur
      {...props}
      containerStyles={{
        borderRadius: 0,
      }}
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
            contentContainerStyle={{ paddingRight: theme.space[10] }}
            renderItem={(item) => {
              const { item: itemToRender } = item;
              const [key, value] = itemToRender;
              return (
                <Button
                  key={key}
                  variant="outline"
                  isDisabled={currentlySelectedKey === key}
                  paddingRight={theme.space[FORM_INTER_ITEM_SPACING] * 2}
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
