import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { Row, Column, Text, useTheme } from 'native-base';
import { useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { RectButton, TouchableOpacity } from 'react-native-gesture-handler';

import { ItemTileProps } from './ItemTile';
import { ImageRenderer } from '../ImageRenderer';

import { FORM_INTER_ITEM_SPACING } from '@/constants/general';
import { Routes } from '@/constants/navigation';
import { tileContainerStyles } from '@/constants/styles';
import { ItemWithStoreSpecificValues } from '@/types/Item';
import { getButtonHitSlop } from '@/utils/helpers';

type ItemTileForPreviouslyPurchasedProps = {
  isInCart?: boolean;
  isInShopping?: boolean;
  isRecommended?: boolean;
  onAddPress?: () => void;
} & ItemTileProps<ItemWithStoreSpecificValues>;

const TILE_WIDTH = 30;
const ICON_SIZE = 5;
export function ItemTileForPreviouslyPurchased(
  props: ItemTileForPreviouslyPurchasedProps,
) {
  const {
    buttonProps,
    isInCart = false,
    isInShopping = false,
    isSelected = false,
    isMultiSelectMode = false,
    isRecommended = false,
    listName,
    item,
    onAddPress,
    onSelect,
  } = props;
  const theme = useTheme();
  const navigation = useNavigation();

  const isRecommendedAndNotAdded = isRecommended && !isInCart && !isInShopping;
  const dynamicBackgroundColor = useMemo(
    () =>
      isRecommendedAndNotAdded ? theme.colors.red[900] : theme.colors.white,
    [isRecommendedAndNotAdded, theme],
  );
  const dynamicTextColor = useMemo(
    () => (isRecommendedAndNotAdded ? theme.colors.white : theme.colors.black),
    [isRecommendedAndNotAdded, theme],
  );
  const greenColor = theme.colors.green[900];
  const dynamicAddColor = useMemo(
    () => (isRecommendedAndNotAdded ? theme.colors.white : theme.colors.black),
    [isRecommendedAndNotAdded, theme],
  );

  const onAddPressLocal = useCallback(() => {
    onAddPress && onAddPress();
  }, [onAddPress]);

  return (
    <RectButton
      {...buttonProps}
      style={[styles.rectButton, { backgroundColor: dynamicBackgroundColor }]}
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
      <Row space={theme.space['0']}>
        <Column flex={0} mr={FORM_INTER_ITEM_SPACING}>
          <ImageRenderer
            height={TILE_WIDTH * 1.5}
            width={TILE_WIDTH}
            source={item.images[item.imageToUseIndex]}
          />
        </Column>
        <Column flex={1}>
          <Text flex={1} noOfLines={1} color={dynamicTextColor}>
            {item.name}
          </Text>
          <Text color={dynamicTextColor}>{item.upc}</Text>
        </Column>
        <Row
          alignItems="center"
          flex={0}
          justifyContent="flex-end"
          ml={theme.space[FORM_INTER_ITEM_SPACING]}
        >
          {isInShopping ? (
            <FontAwesome
              name="check"
              size={theme.sizes[5]}
              color={greenColor}
            />
          ) : null}
          {isInCart ? (
            <FontAwesome
              name="shopping-cart"
              size={theme.sizes[ICON_SIZE]}
              color={greenColor}
            />
          ) : null}
          {!isInCart && !isInShopping ? (
            <TouchableOpacity
              onPress={onAddPressLocal}
              hitSlop={getButtonHitSlop(2)}
            >
              <FontAwesome
                name="plus"
                size={theme.sizes[ICON_SIZE]}
                color={dynamicAddColor}
              />
            </TouchableOpacity>
          ) : null}
        </Row>
        <Column
          width={theme.sizes[2]}
          justifyContent="center"
          alignItems="flex-end"
          flex={0}
        >
          {isMultiSelectMode ? (
            <FontAwesome
              name={`${isSelected ? 'circle' : 'circle-o'}`}
              color={theme.colors.primary[900]}
              size={theme.sizes[ICON_SIZE]}
            />
          ) : null}
        </Column>
      </Row>
    </RectButton>
  );
}

const styles = StyleSheet.create({
  rectButton: tileContainerStyles,
});
