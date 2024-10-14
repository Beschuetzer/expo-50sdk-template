import { Center, theme } from 'native-base';

type ItemTileIsSelectedColumnProps = {
  isMultiSelectMode: boolean;
  isSelected: boolean;
};

export function ItemTileIsSelectedColumn(props: ItemTileIsSelectedColumnProps) {
  const { isSelected, isMultiSelectMode } = props;
  const colorToUse = theme.colors.green[900];
  const opacity = !isMultiSelectMode || !isSelected ? 0 : 0.25;

  return (
    <Center
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      opacity={opacity}
      backgroundColor={colorToUse}
    />
  );
}
