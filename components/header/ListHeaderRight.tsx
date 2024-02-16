import { theme } from 'native-base'
import { forwardRef } from 'react'
import {
  Menu,
  MenuOption,
  MenuOptionCustomStyle,
  MenuOptions,
  MenuOptionsCustomStyle,
  MenuTrigger,
  renderers,
} from 'react-native-popup-menu'

import { EllipsisButton } from './EllipsisButton'
const { NotAnimatedContextMenu } = renderers

type ListHeaderRightProps = {
  onSortPress: () => void
  onFilterPress: () => void
}
export const ListHeaderRight = forwardRef<Menu, ListHeaderRightProps>(
  (props, ref) => {
    const { onSortPress, onFilterPress } = props;
    return (
      <Menu renderer={NotAnimatedContextMenu} ref={ref}>
        <MenuTrigger children={<EllipsisButton />} />
        <MenuOptions customStyles={customMenuOptionsStyle}>
          <MenuOption
            customStyles={customOptionStyles}
            onSelect={onSortPress}
            text="Sort"
          />
          <MenuOption
            customStyles={customOptionStyles}
            onSelect={onFilterPress}
            text="Filter"
          />
        </MenuOptions>
      </Menu>
    )
  },
)

const customOptionStyles: MenuOptionCustomStyle = {
  optionText: {
    color: theme.colors.white,
    fontWeight: '300',
    fontSize: 20,
    textAlign: 'center',
  },
}

const customMenuOptionsStyle: MenuOptionsCustomStyle = {
  optionsContainer: { backgroundColor: theme.colors.black },
}
