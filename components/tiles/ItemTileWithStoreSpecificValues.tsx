import { useNavigation } from 'expo-router';
import { Row, Column, Text, useTheme, theme } from 'native-base';
import { useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { RectButton, TouchableOpacity } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';

import { ItemTileProps, ItemTileViewingMode } from './ItemTile';
import { ItemTileBasicContent } from './ItemTileBasicContent';
import { ItemTileIsSelectedColumn } from './ItemTileIsSelectedColumn';
import { ItemTileNameAndUpcColumn } from './ItemTileNameAndUpcColumn';
import { ImageRenderer } from '../ImageRenderer';

import {
  FORM_INTER_ITEM_SPACING,
  ITEM_UNIT_INITIAL,
} from '@/constants/general';
import { Routes } from '@/constants/navigation';
import { tileContainerStyles } from '@/constants/styles';
import {
  storeSpecificValuesSelector,
  updateStoreSpecificValues,
} from '@/state/slices/listsSlice';
import {
  ItemWithStoreSpecificValues,
  StoreSpecificValueKey,
} from '@/types/Item';
import { getButtonHitSlop } from '@/utils/helpers';

export type ItemTileWithStoreSpecificValuesProps =
  ItemTileProps<ItemWithStoreSpecificValues>;

export function ItemTileWithStoreSpecificValues(
  props: ItemTileWithStoreSpecificValuesProps,
) {
  const {
    isSelected = false,
    isMultiSelectMode = false,
    listName,
    buttonProps,
    item,
    onSelect,
    viewingMode = ItemTileViewingMode.Full,
  } = props;
  const dispatch = useDispatch();
  const theme = useTheme();
  const navigation = useNavigation();

  const quantityAtStore = useSelector(
    storeSpecificValuesSelector(item, StoreSpecificValueKey.Quantity),
  );
  const priceAtStore = useSelector(
    storeSpecificValuesSelector(item, StoreSpecificValueKey.Price),
  );
  const aisleNumberAtStore = useSelector(
    storeSpecificValuesSelector(item, StoreSpecificValueKey.AisleNumber),
  );
  const noteAtStore = useSelector(
    storeSpecificValuesSelector(item, StoreSpecificValueKey.Note),
  );

  const decrementQuantity = useCallback(() => {
    dispatch(
      updateStoreSpecificValues({
        key: item,
        storeSpecificValuesToUpdate: {
          quantity: (current) => current - 1,
        },
      }),
    );
  }, [item]);

  const incrementQuantity = useCallback(() => {
    dispatch(
      updateStoreSpecificValues({
        key: item,
        storeSpecificValuesToUpdate: {
          quantity: (current) => current + 1,
        },
      }),
    );
  }, [item]);

  const isBasicViewingMode = useMemo(
    () => viewingMode === ItemTileViewingMode.Basic,
    [viewingMode],
  );
  const basicContentJsx = useMemo(() => {
    const TagToUse = isBasicViewingMode ? Row : Column;
    return (
      <TagToUse>
        <TouchableOpacity
          hitSlop={getButtonHitSlop()}
          onPress={incrementQuantity}
          onLongPress={decrementQuantity}
        >
          <Text style={{ color: theme.colors.info[900] }}>
            {quantityAtStore} {item.unit || ITEM_UNIT_INITIAL}
            {quantityAtStore && parseInt(quantityAtStore as any, 10) > 1
              ? 's'
              : ''}
          </Text>
        </TouchableOpacity>
        {priceAtStore ? <Text> at ${priceAtStore}</Text> : null}
        {isBasicViewingMode && aisleNumberAtStore ? (
          <Text> (aisle {aisleNumberAtStore})</Text>
        ) : null}
      </TagToUse>
    );
  }, [
    decrementQuantity,
    incrementQuantity,
    item,
    priceAtStore,
    quantityAtStore,
  ]);

  const mainContentJsx = useMemo(() => {
    return (
      <>
        {aisleNumberAtStore ? <Text>Aisle #: {aisleNumberAtStore}</Text> : null}
        {noteAtStore ? (
          <Text fontStyle="italic" fontSize={theme.fontSizes.xs}>
            {noteAtStore}
          </Text>
        ) : null}
      </>
    );
  }, [noteAtStore, priceAtStore, aisleNumberAtStore]);

  function renderContent() {
    switch (viewingMode) {
      case ItemTileViewingMode.Basic:
        return (
          <ItemTileBasicContent
            item={item}
            isMultiSelectMode={isMultiSelectMode}
            isSelected={isSelected}
            showUpc={false}
          >
            <Row>{basicContentJsx}</Row>
          </ItemTileBasicContent>
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
              {basicContentJsx}
            </Column>
            <ItemTileNameAndUpcColumn item={item}>
              {mainContentJsx}
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
      <Column>
        <Row backgroundColor={theme.colors.white}>{renderContent()}</Row>
      </Column>
    </RectButton>
  );
}

const styles = StyleSheet.create({
  rectButton: {
    ...tileContainerStyles,
    paddingTop: theme.space[2],
    paddingBottom: theme.space[FORM_INTER_ITEM_SPACING],
  },
});
