import { useNavigation } from 'expo-router';
import { Row, Column, Text, theme } from 'native-base';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { RectButton, RectButtonProps } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';

import { DeveloperInfo } from './DeveloperInfo';
import { ItemTileBasicContent } from './ItemTileBasicContent';
import { TileIsSelectedBackground } from './ItemTileIsSelectedColumn';
import { ItemTileNameAndUpcColumn } from './ItemTileNameAndUpcColumn';
import { ImageRenderer } from '../ImageRenderer';

import {
  FORM_INTER_ITEM_SPACING,
  ITEM_UNIT_INITIAL,
} from '@/constants/general';
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
  onPress?: (item: T) => void;
  onSelect?: (item: T) => void;
  onTransferPress?: (item: T) => void;
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
    onPress,
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
              <DeveloperInfo {...item} />
            </ItemTileNameAndUpcColumn>
            <TileIsSelectedBackground
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
        onPress && onPress(item);
        if (isMultiSelectMode) {
          onSelect && onSelect(item);
        } else {
          // @ts-ignore
          navigation.navigate(Routes.ItemModal, {
            key: item,
            showOverrideMsg: false,
            callerList: listName,
          });
        }
      }}
    >
      <Row padding={theme.space[FORM_INTER_ITEM_SPACING]}>
        {renderContent()}
      </Row>
    </RectButton>
  );
}

const styles = StyleSheet.create({
  rectButton: {
    ...tileContainerStyles,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
});
