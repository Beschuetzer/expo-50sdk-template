import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { Row, Column, Text, useTheme } from 'native-base';
import { StyleSheet } from 'react-native';
import { RectButton, RectButtonProps } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';

import { ImageRenderer } from '../ImageRenderer';

import { Routes } from '@/constants/navigation';
import { storeSpecificValuesSelector } from '@/state/slices/listsSlice';
import {
  ItemUnit,
  ItemWithStoreSpecificValues,
  StoreSpecificValueKey,
} from '@/types/Item';
import { ItemProp } from '@/types/general';

type ItemTileProps = {
  buttonProps?: RectButtonProps;
  isMultiSelectMode?: boolean;
  isSelected?: boolean;
  onSelect?: (item: ItemWithStoreSpecificValues) => void;
} & ItemProp;

export function ItemTileWithStoreSpecificValues(props: ItemTileProps) {
  const theme = useTheme();
  const navigation = useNavigation();
  const {
    isSelected = false,
    isMultiSelectMode = false,
    buttonProps,
    item,
    onSelect,
  } = props;
  const quantityAtStore = useSelector(
    storeSpecificValuesSelector(item, StoreSpecificValueKey.Quantity),
  );
  const priceAtStore = useSelector(
    storeSpecificValuesSelector(item, StoreSpecificValueKey.Price),
  );
  const aisleAtStore = useSelector(
    storeSpecificValuesSelector(item, StoreSpecificValueKey.Aisle),
  );

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
          });
        }
      }}
    >
      <Row space={2}>
        <Column>
          <ImageRenderer source={item.images[item.imageToUseIndex]} />
          <Text>
            {quantityAtStore} {item.unit || ItemUnit.Package}
            {quantityAtStore && parseInt(quantityAtStore as any, 10) > 1
              ? 's'
              : ''}
          </Text>
        </Column>
        <Column>
          <Text>{item.name}</Text>
          <Text>{item.upc}</Text>
          {aisleAtStore ? <Text>Aisle: {aisleAtStore}</Text> : null}
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
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    flexDirection: 'column',
    backgroundColor: 'white',
  },
});
