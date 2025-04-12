import { FontAwesome } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import _ from 'lodash';
import {
  theme,
  View,
  Column,
  Heading,
  Input,
  Text,
  Center,
  Button,
} from 'native-base';
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
  ESTIMATED_SIZE_FOR_QUICK_ADD_MODAL_SEARCH_LIST as ESTIMATED_SIZE_FOR_MODAL_SEARCH_LIST,
  FORM_INTER_ITEM_SPACING,
  LIST_HAPTICS,
} from '@/constants/general';
import { itemsListSelector } from '@/state/slices/listsSlice';
import { useAppSelector } from '@/state/store';
import { Item } from '@/types/Item';
import { ListRow } from '@/types/general';

export type ItemSearchModalSelectedItem<T> = T | null;
type ItemSearchModalProps<T> = {
  onConfirm: (selectedItem: ItemSearchModalSelectedItem<T>) => void;
  onGetValuesList: (items: Item[]) => T[];
  onGetFilteredValues: (items: T[], filterValue: string) => T[];
  onRenderChildren: (
    item: ListRow<T>,
  ) => ReactElement<any, string | JSXElementConstructor<any>> | null;
  isVisible: boolean;
} & Omit<ModalWithBlurProps, 'children' | 'onConfirm' | 'title'> &
  XOR<
    {
      title: string;
    },
    {
      onGetTitle: (selectedItem: ItemSearchModalSelectedItem<T>) => string;
    }
  >;

export function ItemSearchModal<T>(props: ItemSearchModalProps<T>) {
  const {
    isVisible,
    onConfirm,
    onCancel,
    onGetFilteredValues,
    onGetTitle,
    onGetValuesList,
    onRenderChildren: onRenderItem,
    title,
  } = props;
  const itemsList = useAppSelector(itemsListSelector);
  const [filterValue, setFilterValue] = useState(EMPTY_STRING);
  const flashListRef = useRef<FlashList<T>>(null);
  const valuesList = useMemo(() => {
    return onGetValuesList(itemsList.data);
  }, [onGetValuesList, itemsList.data]);
  const windowDimensions = useMemo(() => Dimensions.get('window'), []);
  const [valuesToShow, setValuesToShow] = useState(valuesList);
  const [selectedItem, setSelectedItem] =
    useState<ItemSearchModalSelectedItem<T>>(null);

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

    const filteredValues = onGetFilteredValues(valuesList, filterValue);
    setValuesToShow(filteredValues);
  }, [filterValue, valuesList]);

  // useEffect(() => {
  //   flashListRef.current?.forceUpdate();
  // }, [selectedItem]);

  return (
    <ModalWithBlur
      {...props}
      containerStyles={{
        borderRadius: 0,
      }}
      isVisible={isVisible}
      confirmButton={{
        isEnabled: !!selectedItem,
      }}
      onConfirm={onConfirmPress}
      onCancel={onCancelPress}
      title={
        <Column
          pb={theme.space[FORM_INTER_ITEM_SPACING]}
          px={theme.space[FORM_INTER_ITEM_SPACING]}
        >
          <Heading textAlign="center" size="sm">
            {getTitle()}
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
      {itemsList.data.length <= 0 ? (
        <Center width={windowDimensions.width} flex={1}>
          <Text>No items to show...</Text>
        </Center>
      ) : (
        <View width={windowDimensions.width} flex={1}>
          <FlashList
            keyboardShouldPersistTaps="always"
            extraData={selectedItem}
            ref={flashListRef}
            contentContainerStyle={{ paddingRight: theme.space[10] }}
            renderItem={(item: ListRow<T>) => {
              const { item: itemToRender, index } = item;
              return (
                <Button
                  key={index}
                  variant="outline"
                  isDisabled={_.isEqual(selectedItem, itemToRender)}
                  paddingRight={theme.space[FORM_INTER_ITEM_SPACING] * 2}
                  onPress={() => {
                    setSelectedItem(itemToRender);
                    LIST_HAPTICS.handleSelection();
                  }}
                  justifyContent="space-between"
                >
                  {onRenderItem(item)}
                </Button>
              );
            }}
            estimatedItemSize={ESTIMATED_SIZE_FOR_MODAL_SEARCH_LIST}
            data={valuesToShow}
          />
        </View>
      )}
    </ModalWithBlur>
  );
}
