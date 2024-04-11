import { useNavigation } from 'expo-router';
import { Row, Column, Text, useTheme } from 'native-base';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { RectButton, RectButtonProps } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';

import { ItemTileBasicContent } from './ItemTileBasicContent';
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

export enum ItemTileViewingMode {
  Basic = 'Basic',
  Full = 'Full',
}
export type ItemTileProps<T> = {
  buttonProps?: RectButtonProps;
  isMultiSelectMode?: boolean;
  isSelected?: boolean;
  onSelect?: (item: T) => void;
  viewingMode?: ItemTileViewingMode;
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
    viewingMode = ItemTileViewingMode.Basic,
  } = props;
  const lastPurchased = useSelector(lastPurchasedSelector(item)) || 0;
  const frequencyObj = useMemo(
    () => getFrequencyValue(item?.frequency),
    [item],
  );

  function renderContent() {
    switch (viewingMode) {
      case ItemTileViewingMode.Basic:
        return (
          <ItemTileBasicContent
            item={item}
            isMultiSelectMode={isMultiSelectMode}
            isSelected={isSelected}
          />
        );
      default:
        return (
          <>
            <Column flex={0}>
              <ImageRenderer
                item={item}
                source={item.images[item.imageToUseIndex]}
              />
            </Column>
            <ItemTileNameAndUpcColumn item={item}>
              <Text>
                1 {item.unit || ItemUnit.Package} every {frequencyObj?.number}{' '}
                {frequencyObj?.timeSpan}
                {frequencyObj?.number > 1 ? 's' : ''}
              </Text>
              <Text>
                Last Purchased:{' '}
                {lastPurchased
                  ? new Date(lastPurchased).toLocaleString()
                  : 'N/A'}
              </Text>
            </ItemTileNameAndUpcColumn>
            <ItemTileIsSelectedColumn
              isMultiSelectMode={isMultiSelectMode}
              isSelected={isSelected}
            />
          </>
        );
    }
  }

  return (
    <RectButton
      {...buttonProps}
      style={styles.rectButton}
      onPress={() => {
        if (isMultiSelectMode) {
          onSelect && onSelect(item);
        } else {
          navigation.navigate(Routes.ItemModal, {
            key: { upc: item.upc, name: item.name },
            showOverrideMsg: false,
            callerList: listName,
          });
        }
      }}
    >
      <Row space={theme.space[FORM_INTER_ITEM_SPACING]}>{renderContent()}</Row>
    </RectButton>
  );
}

const styles = StyleSheet.create({
  rectButton: tileContainerStyles,
});
