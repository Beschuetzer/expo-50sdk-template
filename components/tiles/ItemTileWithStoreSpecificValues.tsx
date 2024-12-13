import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { Row, Column, Text, useTheme, theme } from 'native-base';
import { useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { RectButton, TouchableOpacity } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';

import { ItemTileProps, ItemTileViewingMode } from './ItemTile';
import { ItemTileBasicContent } from './ItemTileBasicContent';
import { TileIsSelectedBackground } from './ItemTileIsSelectedColumn';
import { ItemTileNameAndUpcColumn } from './ItemTileNameAndUpcColumn';
import { ImageRenderer } from '../ImageRenderer';

import {
  FORM_INTER_ITEM_SPACING,
  IMAGE_RENDERER_ASPECT_RATIO_DEFAULT,
  IMAGE_RENDERER_WIDTH_DEFAULT,
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
  const imageHeightInFullMode = useMemo(() => {
    const defaultHeight =
      IMAGE_RENDERER_WIDTH_DEFAULT * IMAGE_RENDERER_ASPECT_RATIO_DEFAULT;
    return defaultHeight * 1.25;
  }, [item.upc, noteAtStore]);

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

  const basicContentJsx = useMemo(() => {
    return (
      <Row justifyContent="space-between" alignItems="center" flex={1}>
        <Row>
          <Text>
            {quantityAtStore} {item.unit || ITEM_UNIT_INITIAL}
            {quantityAtStore && parseInt(quantityAtStore as any, 10) > 1
              ? 's'
              : ''}
          </Text>
          {priceAtStore ? <Text> at ${priceAtStore}</Text> : null}
          {aisleNumberAtStore ? (
            <Text> (aisle {aisleNumberAtStore})</Text>
          ) : null}
        </Row>

        <Row space={theme.space[FORM_INTER_ITEM_SPACING] * 3}>
          <TouchableOpacity
            hitSlop={getButtonHitSlop(2)}
            onPress={decrementQuantity}
          >
            <FontAwesome
              color={theme.colors.primary[900]}
              size={theme.sizes[3]}
              name="minus"
            />
          </TouchableOpacity>
          <TouchableOpacity
            hitSlop={getButtonHitSlop(2)}
            onPress={incrementQuantity}
          >
            <FontAwesome
              color={theme.colors.primary[900]}
              size={theme.sizes[3]}
              name="plus"
            />
          </TouchableOpacity>
        </Row>
      </Row>
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
        {noteAtStore ? (
          <Text fontStyle="italic" fontSize={theme.fontSizes.xs}>
            {noteAtStore}
          </Text>
        ) : null}
      </>
    );
  }, [noteAtStore, priceAtStore]);

  function renderContent() {
    switch (viewingMode) {
      case ItemTileViewingMode.Basic:
        return (
          <ItemTileBasicContent
            item={item}
            isMultiSelectMode={isMultiSelectMode}
            isSelected={isSelected}
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
                height={imageHeightInFullMode}
                width={(imageHeightInFullMode * 2) / 3}
                useMarginRight
              />
            </Column>
            <ItemTileNameAndUpcColumn item={item}>
              {mainContentJsx}
              {basicContentJsx}
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
