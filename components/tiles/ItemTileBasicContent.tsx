import { Column } from 'native-base';
import React from 'react';

import { ItemTileProps } from './ItemTile';
import { ItemTileIsSelectedColumn } from './ItemTileIsSelectedColumn';
import {
  ItemTileNameAndUpcColumn,
  ItemTileNameAndUpcColumnProps,
} from './ItemTileNameAndUpcColumn';
import { ImageRenderer } from '../ImageRenderer';

import { Item } from '@/types/Item';
import { ChildrenProp, ItemProp } from '@/types/general';

type ItemTileBasicContentProps = ChildrenProp &
  ItemProp<Item> &
  Required<Pick<ItemTileProps<Item>, 'isSelected' | 'isMultiSelectMode'>> &
  Pick<ItemTileNameAndUpcColumnProps, 'showUpc'>;

const HEIGHT = 46;
export function ItemTileBasicContent(props: ItemTileBasicContentProps) {
  const {
    children,
    item,
    isMultiSelectMode = false,
    isSelected = false,
    showUpc = true,
  } = props;
  return (
    <>
      <Column flex={0}>
        <ImageRenderer
          item={item}
          source={item.images[item.imageToUseIndex]}
          height={HEIGHT}
          width={(HEIGHT * 2) / 3}
        />
      </Column>
      <ItemTileNameAndUpcColumn item={item} showUpc={showUpc}>
        {children}
      </ItemTileNameAndUpcColumn>
      <ItemTileIsSelectedColumn
        isMultiSelectMode={isMultiSelectMode}
        isSelected={isSelected}
      />
    </>
  );
}
