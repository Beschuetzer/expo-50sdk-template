import { theme } from 'native-base'
import { forwardRef } from 'react'
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
  renderers,
} from 'react-native-popup-menu'

import { EllipsisButton } from './EllipsisButton'
const { NotAnimatedContextMenu } = renderers

type ListHeaderRightProps = {
  onSortPress: () => void
}
export const ListHeaderRight = forwardRef<Menu, ListHeaderRightProps>(
  (props, ref) => {
    const { onSortPress } = props;
    return (
      <Menu renderer={NotAnimatedContextMenu} ref={ref}>
        <MenuTrigger children={<EllipsisButton />} />
        <MenuOptions
          customStyles={{
            optionsContainer: { backgroundColor: theme.colors.black },
          }}
        >
          <MenuOption
            customStyles={{
              optionText: {
                color: theme.colors.white,
                fontWeight: '300',
                fontSize: 20,
                textAlign: 'center',
              },
            }}
            onSelect={onSortPress}
            text="Sort"
          />
        </MenuOptions>
      </Menu>
    )
  },
)
