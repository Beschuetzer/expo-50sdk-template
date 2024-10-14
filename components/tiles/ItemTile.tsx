import { useNavigation } from 'expo-router';
import { Row, Column, Text } from 'native-base';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { RectButton, RectButtonProps } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';

import { ItemTileBasicContent } from './ItemTileBasicContent';
import { ItemTileIsSelectedColumn } from './ItemTileIsSelectedColumn';
import { ItemTileNameAndUpcColumn } from './ItemTileNameAndUpcColumn';
import { ImageRenderer } from '../ImageRenderer';

import { ITEM_UNIT_INITIAL } from '@/constants/general';
import { Routes } from '@/constants/navigation';
import { tileContainerStyles } from '@/constants/styles';
import { lastPurchasedSelector } from '@/state/slices/listsSlice';
import { Item } from '@/types/Item';
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
                useMarginRight
              />
            </Column>
            <ItemTileNameAndUpcColumn item={item}>
              <Text>
                1 {item.unit || ITEM_UNIT_INITIAL} every{' '}
                {frequencyObj.number > 1
                  ? `${frequencyObj.number} ${frequencyObj.timeSpan}s`
                  : `${frequencyObj.timeSpan}`}
              </Text>
              <Text>
                Last Purchased:{' '}
                {lastPurchased
                  ? new Date(lastPurchased).toLocaleString()
                  : 'N/A'}
              </Text>
              <Text>Db Id: {item._id}</Text>
              <Text>
                Needs Saving: {item.needsSaving === false ? 'false' : 'true'}
              </Text>
              <Text>
                Has been Saved: {item.hasBeenSaved === true ? 'true' : 'false'}
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
            key: item,
            showOverrideMsg: false,
            callerList: listName,
          });
        }
      }}
    >
      <Row>{renderContent()}</Row>
    </RectButton>
  );
}

const styles = StyleSheet.create({
  rectButton: tileContainerStyles,
});
