import { FontAwesome } from '@expo/vector-icons';
import { Column, theme } from 'native-base';

import { ITEM_TILE_ICON_SIZE } from '@/constants/general';

type ItemTileIsSelectedColumnProps = {
  isMultiSelectMode: boolean;
  isSelected: boolean;
};

export function ItemTileIsSelectedColumn(props: ItemTileIsSelectedColumnProps) {
  const { isMultiSelectMode, isSelected } = props;

  return (
    <Column
      justifyContent="center"
      alignItems="flex-end"
      flex={0}
      width={theme.sizes[2]}
    >
      {isMultiSelectMode ? (
        <FontAwesome
          name={`${isSelected ? 'circle' : 'circle-o'}`}
          color={theme.colors.primary[900]}
          size={theme.sizes[ITEM_TILE_ICON_SIZE]}
        />
      ) : null}
    </Column>
  );
}
