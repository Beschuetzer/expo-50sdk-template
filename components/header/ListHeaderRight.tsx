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
import { useDispatch } from 'react-redux'

import { EllipsisButton } from './EllipsisButton'

import { resetListToDisplay } from '@/state/slices/listsSlice'
import { ListNameProp } from '@/types/general'
const { NotAnimatedContextMenu } = renderers

type ListHeaderRightProps = {
  onSortPress: () => void
  onFilterPress: () => void
} & ListNameProp
export const ListHeaderRight = forwardRef<Menu, ListHeaderRightProps>(
  (props, ref) => {
    const { onSortPress, onFilterPress, listName } = props
    const dispatch = useDispatch()

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
          <MenuOption
            customStyles={customOptionStyles}
            onSelect={() => dispatch(resetListToDisplay({ listName }))}
            text="Reset"
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
