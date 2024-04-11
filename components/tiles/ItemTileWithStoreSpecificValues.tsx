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

import { FORM_INTER_ITEM_SPACING } from '@/constants/general';
import { Routes } from '@/constants/navigation';
import { tileContainerStyles } from '@/constants/styles';
import {
  storeSpecificValuesSelector,
  updateStoreSpecificValues,
} from '@/state/slices/listsSlice';
import {
  ItemUnit,
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

  const quantityAtStoreJsx = useMemo(() => {
    return (
      <TouchableOpacity
        hitSlop={getButtonHitSlop()}
        onPress={incrementQuantity}
        onLongPress={decrementQuantity}
      >
        <Text style={{ color: theme.colors.info[900] }}>
          {quantityAtStore} {item.unit || ItemUnit.Package}
          {quantityAtStore && parseInt(quantityAtStore as any, 10) > 1
            ? 's'
            : ''}
        </Text>
      </TouchableOpacity>
    );
  }, [quantityAtStore, item, incrementQuantity, decrementQuantity]);

  const mainContentJsx = useMemo(() => {
    return (
      <>
        {aisleNumberAtStore ? <Text>Aisle #: {aisleNumberAtStore}</Text> : null}
        {priceAtStore ? <Text>${priceAtStore}</Text> : null}
      </>
    );
  }, [priceAtStore, aisleNumberAtStore]);

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
            {quantityAtStoreJsx}
          </ItemTileBasicContent>
        );
      default:
        return (
          <>
            <Column flex={0}>
              <ImageRenderer
                item={item}
                source={item.images[item.imageToUseIndex]}
              />
              {quantityAtStoreJsx}
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
            key: { upc: item.upc, name: item.name },
            showOverrideMsg: false,
            callerList: listName,
          });
        }
      }}
    >
      <Row backgroundColor={theme.colors.white}>{renderContent()}</Row>
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
