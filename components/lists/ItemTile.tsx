import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { Row, Column, Text, useTheme } from 'native-base';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { RectButton, RectButtonProps } from 'react-native-gesture-handler';

import { ImageRenderer } from '../ImageRenderer';

import { Routes } from '@/constants/navigation';
import { Item } from '@/types/Item';
import { ItemProp } from '@/types/general';
import { getFrequencyValue } from '@/utils/helpers';

type ItemTileProps = {
  buttonProps?: RectButtonProps;
  isMultiSelectMode?: boolean;
  isSelected?: boolean;
  onSelect?: (item: Item) => void;
} & ItemProp;

export function ItemTile(props: ItemTileProps) {
  const theme = useTheme();
  const navigation = useNavigation();
  const {
    isSelected = false,
    isMultiSelectMode = false,
    buttonProps,
    item,
    onSelect,
  } = props;
  const frequencyObj = useMemo(
    () => getFrequencyValue(item?.frequency),
    [item],
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
        <ImageRenderer source={item.images[item.imageToUseIndex]} />
        <Column>
          <Text>{item.name}</Text>
          <Text>{item.upc}</Text>
          <Text>
            Frequency: {frequencyObj?.number} {frequencyObj?.timeSpan}
            {frequencyObj?.number > 1 ? 's' : ''}
          </Text>
          <Text>Unit: {item?.unit}</Text>
          <Text>Added: {new Date(item.addedDate).toLocaleString()}</Text>
          <Text>
            Updated: {new Date(item.lastUpdatedDate).toLocaleString()}
          </Text>
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
