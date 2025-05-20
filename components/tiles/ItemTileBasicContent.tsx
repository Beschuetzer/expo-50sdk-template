import { Column } from 'native-base';
import React from 'react';

import { DeveloperInfo } from './DeveloperInfo';
import { ItemTileProps } from './ItemTile';
import { TileIsSelectedBackground } from './ItemTileIsSelectedColumn';
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
  Pick<ItemTileNameAndUpcColumnProps, 'showUpc'> & {
    showDeveloperInfo?: boolean;
  };

const HEIGHT = 46;
export function ItemTileBasicContent(props: ItemTileBasicContentProps) {
  const {
    children,
    item,
    isMultiSelectMode = false,
    isSelected = false,
    showDeveloperInfo = true,
    showUpc = true,
  } = props;
  return (
    <>
      <Column flex={0}>
        <ImageRenderer
          item={item}
          source={item?.images[item?.imageToUseIndex]}
          height={HEIGHT}
          width={(HEIGHT * 2) / 3}
          useMarginRight
        />
      </Column>
      <ItemTileNameAndUpcColumn item={item} showUpc={showUpc}>
        {children}
        {showDeveloperInfo ? <DeveloperInfo {...item} /> : null}
      </ItemTileNameAndUpcColumn>
      <TileIsSelectedBackground
        isMultiSelectMode={isMultiSelectMode}
        isSelected={isSelected}
      />
    </>
  );
}
