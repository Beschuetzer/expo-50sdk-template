import { useNavigation } from 'expo-router';
import { Row, Column, Text, useTheme } from 'native-base';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { RectButton, RectButtonProps } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';

import { ItemTileIsSelectedColumn } from './ItemTileIsSelectedColumn';
import { ItemTileNameAndUpcColumn } from './ItemTileNameAndUpcColumn';
import { ImageRenderer } from '../ImageRenderer';

import { FORM_INTER_ITEM_SPACING } from '@/constants/general';
import { Routes } from '@/constants/navigation';
import { tileContainerStyles } from '@/constants/styles';
import { lastPurchasedSelector } from '@/state/slices/listsSlice';
import { Item, ItemUnit } from '@/types/Item';
import { ItemProp, ListNameProp } from '@/types/general';
import { getFrequencyValue } from '@/utils/helpers';

export type ItemTileProps<T> = {
  buttonProps?: RectButtonProps;
  isMultiSelectMode?: boolean;
  isSelected?: boolean;
  onSelect?: (item: T) => void;
} & ItemProp<T> &
  ListNameProp;

export function ItemTile(props: ItemTileProps<Item>) {
  const theme = useTheme();
  const navigation = useNavigation();
  const {
    isSelected = false,
    isMultiSelectMode = false,
    buttonProps,
    listName,
    item,
    onSelect,
  } = props;
  const lastPurchased = useSelector(lastPurchasedSelector(item)) || 0;
  const frequencyObj = useMemo(
    () => getFrequencyValue(item?.frequency),
    [item],
  );

  return (
    <RectButton
      {...buttonProps}
      style={styles.rectButton}
      onPress={() => {
        if (isMultiSelectMode) {
          onSelect && onSelect(item);
        } else {
          navigation.navigate(Routes.ItemModal, {
            key: item.upc || item.name,
            showOverrideMsg: false,
            callerList: listName,
          });
        }
      }}
    >
      <Row space={theme.space[FORM_INTER_ITEM_SPACING]}>
        <Column flex={0}>
          <ImageRenderer source={item.images[item.imageToUseIndex]} />
        </Column>
        <ItemTileNameAndUpcColumn item={item}>
          <Text>
            1 {item.unit || ItemUnit.Package} every {frequencyObj?.number}{' '}
            {frequencyObj?.timeSpan}
            {frequencyObj?.number > 1 ? 's' : ''}
          </Text>
          {lastPurchased ? (
            <Text>
              Last Purchased: {new Date(lastPurchased).toLocaleString()}
            </Text>
          ) : null}
        </ItemTileNameAndUpcColumn>
        <ItemTileIsSelectedColumn
          isMultiSelectMode={isMultiSelectMode}
          isSelected={isSelected}
        />
      </Row>
    </RectButton>
  );
}

const styles = StyleSheet.create({
  rectButton: tileContainerStyles,
});
