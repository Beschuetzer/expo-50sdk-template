import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { Row, Column, Text, useTheme, theme } from 'native-base';
import { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { RectButton, TouchableOpacity } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';

import { ItemTileProps } from './ItemTile';
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

export type ItemTileWithStoreSpecificValuesProps = {
  isRecommended?: boolean;
} & ItemTileProps<ItemWithStoreSpecificValues>;

export function ItemTileWithStoreSpecificValues(
  props: ItemTileWithStoreSpecificValuesProps,
) {
  const {
    isSelected = false,
    isMultiSelectMode = false,
    isRecommended = false,
    listName,
    buttonProps,
    item,
    onSelect,
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
      <Row
        space={theme.space[FORM_INTER_ITEM_SPACING]}
        backgroundColor={
          isRecommended ? theme.colors.success[900] : theme.colors.white
        }
      >
        <Column>
          <ImageRenderer source={item.images[item.imageToUseIndex]} />
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
        </Column>
        <Column>
          <Text>{item.name}</Text>
          <Text>{item.upc}</Text>
          {aisleNumberAtStore ? (
            <Text>Aisle #: {aisleNumberAtStore}</Text>
          ) : null}
          {priceAtStore ? <Text>${priceAtStore}</Text> : null}
        </Column>
        {isMultiSelectMode ? (
          <Column justifyContent="center" alignItems="flex-end" flex={1}>
            <FontAwesome
              name={`${isSelected ? 'circle' : 'circle-o'}`}
              color={theme.colors.primary[900]}
              size={theme.sizes[5]}
            />
          </Column>
        ) : null}
      </Row>
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
