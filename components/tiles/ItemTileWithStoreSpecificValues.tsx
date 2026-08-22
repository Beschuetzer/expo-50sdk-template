import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { Row, Column, Text, useTheme } from 'native-base';
import { useCallback, useMemo } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { RectButton, TouchableOpacity } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';

import { ItemTileProps, ItemTileViewingMode } from './ItemTile';
import { ItemTileBasicContent } from './ItemTileBasicContent';
import { TileIsSelectedBackground } from './ItemTileIsSelectedColumn';
import { ItemTileNameAndUpcColumn } from './ItemTileNameAndUpcColumn';
import { ImageRenderer } from '../ImageRenderer';

import { COLORS } from '@/constants/colors';
import {
  FORM_INTER_ITEM_SPACING,
  IMAGE_RENDERER_ASPECT_RATIO_DEFAULT,
  IMAGE_RENDERER_WIDTH_DEFAULT,
  ITEM_UNIT_INITIAL,
} from '@/constants/general';
import { Routes } from '@/constants/navigation';
import { tileContainerStyles } from '@/constants/styles';
import {
  activeRouteSelector,
  currentStoreIdSelector,
  storeSpecificValueForIdSelector,
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
    onTransferPress,
    viewingMode = ItemTileViewingMode.Full,
  } = props;
  const dispatch = useDispatch();
  const theme = useTheme();
  const navigation = useNavigation();
  const hasCookingInstructions =
    (item?.cookingInstructions?.steps?.length ?? 0) > 0 ||
    (item?.cookingInstructions?.images?.length ?? 0) > 0;

  const openCookingInstructions = () => {
    // @ts-ignore
    navigation.navigate(Routes.CookingInstructionsScreen, { item });
  };

  const quantityAtStore = useSelector(
    storeSpecificValuesSelector(item, StoreSpecificValueKey.Quantity),
  );
  const priceAtStore = useSelector(
    storeSpecificValuesSelector(item, StoreSpecificValueKey.Price),
  );
  const currentStoreId = useSelector(currentStoreIdSelector);
  const activeRoute = useSelector(activeRouteSelector(currentStoreId));
  // Location is keyed by routeId (not storeId): the same item can be at a
  // different location depending on which route through the store is active.
  const locationAtRoute = useSelector(
    storeSpecificValueForIdSelector(
      item,
      StoreSpecificValueKey.Location,
      activeRoute?.id,
    ),
  );
  const noteAtStore = useSelector(
    storeSpecificValuesSelector(item, StoreSpecificValueKey.Note),
  );
  const displayedLocation =
    activeRoute && activeRoute.locations.includes(String(locationAtRoute || ''))
      ? locationAtRoute
      : undefined;
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

  const onTransferPressLocal = useCallback(() => {
    onTransferPress && onTransferPress(item);
  }, [onTransferPress, item]);

  const basicContentJsx = useMemo(() => {
    return (
      <Row justifyContent="space-between" alignItems="center" flex={1}>
        <Row flex={1}>
          <Text>
            <Text>
              {quantityAtStore} {item.unit || ITEM_UNIT_INITIAL}
              {quantityAtStore && parseInt(quantityAtStore as any, 10) > 1
                ? 's'
                : ''}
            </Text>
            {priceAtStore ? <Text> at ${priceAtStore}</Text> : null}
            {displayedLocation ? (
              <Text> (located in {displayedLocation})</Text>
            ) : null}
          </Text>
        </Row>

        <Row space={theme.space[FORM_INTER_ITEM_SPACING] * 3} flex={0} mr={2}>
          {noteAtStore ? (
            <TouchableOpacity
              hitSlop={getButtonHitSlop(2)}
              onPress={() =>
                Alert.alert(item.name || 'Note', String(noteAtStore))
              }
            >
              <FontAwesome
                color={theme.colors.primary[900]}
                size={theme.sizes[3]}
                name="sticky-note-o"
              />
            </TouchableOpacity>
          ) : null}
          {hasCookingInstructions ? (
            <TouchableOpacity
              hitSlop={getButtonHitSlop(2)}
              onPress={openCookingInstructions}
            >
              <FontAwesome
                color={theme.colors.primary[900]}
                size={theme.sizes[3]}
                name="book"
              />
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            hitSlop={getButtonHitSlop(2)}
            onPress={onTransferPressLocal}
          >
            <FontAwesome
              color={theme.colors.primary[900]}
              size={theme.sizes[3]}
              name="arrow-right"
            />
          </TouchableOpacity>
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
    displayedLocation,
    incrementQuantity,
    item,
    noteAtStore,
    onTransferPressLocal,
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
      <Column bg={noteAtStore ? COLORS.light.noteBackground : undefined}>
        <Row padding={theme.space[FORM_INTER_ITEM_SPACING] * 1}>
          {renderContent()}
        </Row>
      </Column>
    </RectButton>
  );
}

const styles = StyleSheet.create({
  rectButton: {
    ...tileContainerStyles,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
});
