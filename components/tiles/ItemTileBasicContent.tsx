import { Column } from 'native-base';
import React from 'react';

import { ItemTileProps } from './ItemTile';
import { ItemTileIsSelectedColumn } from './ItemTileIsSelectedColumn';
import { ItemTileNameAndUpcColumn } from './ItemTileNameAndUpcColumn';
import { ImageRenderer } from '../ImageRenderer';

import { Item } from '@/types/Item';
import { ItemProp } from '@/types/general';

type ItemTileBasicContentProps = ItemProp<Item> &
  Required<Pick<ItemTileProps<Item>, 'isSelected' | 'isMultiSelectMode'>>;

const HEIGHT = 46;
export function ItemTileBasicContent(props: ItemTileBasicContentProps) {
  const { item, isMultiSelectMode = false, isSelected = false } = props;
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
      <ItemTileNameAndUpcColumn item={item} />
      <ItemTileIsSelectedColumn
        isMultiSelectMode={isMultiSelectMode}
        isSelected={isSelected}
      />
    </>
  );
}
