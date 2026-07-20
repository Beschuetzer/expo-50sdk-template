import { Column, ITextProps, Row, Text, useTheme } from 'native-base';
import { useMemo } from 'react';
import { Linking } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { COLORS } from '@/constants/colors';
import { FORM_INTER_ITEM_SPACING } from '@/constants/general';
import { Item } from '@/types/Item';
import { ChildrenProp, ItemProp } from '@/types/general';

export type ItemTileNameAndUpcColumnProps = {
  color?: string;
  nameProps?: ITextProps;
  orientation?: 'vertical' | 'horizontal';
  showUpc?: boolean;
  upcProps?: ITextProps;
} & Partial<ItemProp<Item>> &
  ChildrenProp;
export function ItemTileNameAndUpcColumn(props: ItemTileNameAndUpcColumnProps) {
  const theme = useTheme();
  const {
    children,
    color = theme.colors.black,
    item,
    nameProps,
    showUpc = true,
    orientation = 'horizontal',
    upcProps,
  } = props;
  const isHorizontal = orientation === 'horizontal';
  const TagToUse = useMemo(() => (isHorizontal ? Row : Column), [isHorizontal]);
  const spacingToUse = useMemo(
    () => (isHorizontal ? theme.space[FORM_INTER_ITEM_SPACING] : 0),
    [isHorizontal],
  );

  if (!item) return null;

  return (
    <Column flex={1}>
      <TagToUse space={spacingToUse}>
        <Column flex={1}>
          <TouchableOpacity
            disabled={!item.url}
            onPress={() => item.url && Linking.openURL(item.url)}
          >
            <Text
              noOfLines={1}
              color={item.url ? COLORS.light.tint : color}
              underline={!!item.url}
              {...nameProps}
            >
              {item?.name}
            </Text>
          </TouchableOpacity>
        </Column>
        <Column flex={0}>
          {showUpc && item.upc ? (
            <Text color={color} fontWeight={900} {...upcProps}>
              #{item?.upc}
            </Text>
          ) : null}
        </Column>
      </TagToUse>
      {children}
    </Column>
  );
}
