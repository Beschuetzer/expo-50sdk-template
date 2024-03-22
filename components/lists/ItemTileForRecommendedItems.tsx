import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { Row, Column, Text, useTheme } from 'native-base';
import { StyleSheet } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import { useDispatch } from 'react-redux';

import { ItemTileProps } from './ItemTile';
import { ImageRenderer } from '../ImageRenderer';

import { Routes } from '@/constants/navigation';
import { tileContainerStyles } from '@/constants/styles';
import { ItemWithStoreSpecificValues } from '@/types/Item';

type ItemTileForRecommendedItemsProps = {
  isRecommended?: boolean;
} & ItemTileProps<ItemWithStoreSpecificValues>;

export function ItemTileForRecommendedItems(
  props: ItemTileForRecommendedItemsProps,
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
        space={2}
        backgroundColor={
          isRecommended ? theme.colors.success[900] : theme.colors.white
        }
      >
        <Column>
          <ImageRenderer source={item.images[item.imageToUseIndex]} />
        </Column>
        <Column>
          <Text>{item.name}</Text>
          <Text>{item.upc}</Text>
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
  rectButton: tileContainerStyles,
});
