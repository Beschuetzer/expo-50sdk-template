import { theme } from 'native-base';
import { ResponsiveValue } from 'native-base/lib/typescript/components/types';
import { Dimensions, ImageStyle } from 'react-native';

import { FORM_INTER_ITEM_SPACING } from './general';

export const maxWidth = {
  maxWidth: Dimensions.get('window').width >= 800 ? 800 : '90%',
};

export const maxWidthCentered = {
  marginRight: 'auto',
  marginLeft: 'auto',
  ...maxWidth,
};

export const absolutePositioning = {
  position: 'absolute' as ResponsiveValue<any>,
  top: 0,
  bottom: 0,
  right: 0,
  left: 0,
};

export const tileContainerStyles = {
  flex: 1,
  paddingVertical: theme.space[FORM_INTER_ITEM_SPACING] * 2,
  paddingHorizontal: theme.space[FORM_INTER_ITEM_SPACING] * 4,
  justifyContent: 'space-between',
  flexDirection: 'column',
  backgroundColor: 'white',
} as ImageStyle;
