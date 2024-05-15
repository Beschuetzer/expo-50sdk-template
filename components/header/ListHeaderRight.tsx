import { theme } from 'native-base';
import { forwardRef } from 'react';
import {
  Menu,
  MenuOption,
  MenuOptionCustomStyle,
  MenuOptions,
  MenuOptionsCustomStyle,
  MenuTrigger,
  renderers,
} from 'react-native-popup-menu';

import { EllipsisButton } from './EllipsisButton';

const { NotAnimatedContextMenu } = renderers;

export type ListHeaderRightOptions =
  | {
      text: string;
      onPress: () => void;
    }
  | undefined;

type ListHeaderRightProps = {
  onClose?: () => void;
  onSortPress?: () => void;
  onFilterPress?: () => void;
  onResetPress?: () => void;
  options?: ListHeaderRightOptions[];
};
export const ListHeaderRight = forwardRef<Menu, ListHeaderRightProps>(
  (props, ref) => {
    const { options, onClose, onSortPress, onFilterPress, onResetPress } =
      props;

    return (
      <Menu renderer={NotAnimatedContextMenu} ref={ref}>
        <MenuTrigger children={<EllipsisButton />} />
        <MenuOptions customStyles={customMenuOptionsStyle}>
          {onSortPress ? (
            <MenuOption
              customStyles={customOptionStyles}
              onSelect={onSortPress}
              text="Sort"
            />
          ) : null}
          {onFilterPress ? (
            <MenuOption
              customStyles={customOptionStyles}
              onSelect={onFilterPress}
              text="Filter"
            />
          ) : null}
          {onResetPress ? (
            <MenuOption
              customStyles={customOptionStyles}
              onSelect={onResetPress}
              text="Reset"
            />
          ) : null}
          {options && options?.length > 0
            ? options.map((option, index) => {
                if (!option) return null;
                return (
                  <MenuOption
                    key={index}
                    customStyles={customOptionStyles}
                    onSelect={option.onPress}
                    text={option.text}
                  />
                );
              })
            : null}
          <MenuOption
            customStyles={customOptionStyles}
            onSelect={onClose}
            text="Close"
          />
        </MenuOptions>
      </Menu>
    );
  },
);

const customOptionStyles: MenuOptionCustomStyle = {
  optionText: {
    color: theme.colors.white,
    fontWeight: '300',
    fontSize: 20,
    paddingVertical: theme.sizes[1],
    textAlign: 'center',
  },
};

const customMenuOptionsStyle: MenuOptionsCustomStyle = {
  optionsContainer: { backgroundColor: theme.colors.black },
};
