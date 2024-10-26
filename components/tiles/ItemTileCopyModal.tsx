import { Column, Row, Text } from 'native-base';
import React from 'react';
import { useSelector } from 'react-redux';

import { ItemTileNameAndUpcColumn } from './ItemTileNameAndUpcColumn';
import { ImageRenderer } from '../ImageRenderer';

import { itemsListItemSelector } from '@/state/slices/listsSlice';

type ItemTileCopyModalProps = {
  itemKey: string;
  value: string;
};

export function ItemTileCopyModal(props: ItemTileCopyModalProps) {
  const { itemKey, value } = props;
  const item = useSelector(itemsListItemSelector(itemKey)) || undefined;

  return (
    <Row width="100%">
      <Column flex={0}>
        <ImageRenderer
          item={item}
          source={item?.images[item?.imageToUseIndex]}
          useMarginRight
        />
      </Column>
      <Column maxWidth="85%">
        <ItemTileNameAndUpcColumn
          item={item}
          orientation="vertical"
          nameProps={{ numberOfLines: 2 }}
        />
        <Text>Value to use: {value}</Text>
      </Column>
    </Row>
  );
}
