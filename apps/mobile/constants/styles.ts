import { Dimensions, ViewStyle } from 'react-native';

import { FORM_INTER_ITEM_SPACING } from './general';

/**
 *Roughly mirrors gluestack-ui/native-base's `$1` (4px) spacing token so `tileContainerStyles`
 *below doesn't need to depend on the UI library's theme object directly.
 **/
const BASE_SPACING_UNIT = 4;

export const maxWidth = {
  maxWidth: Dimensions.get('window').width >= 800 ? 800 : '90%',
};

export const maxWidthCentered = {
  marginRight: 'auto',
  marginLeft: 'auto',
  ...maxWidth,
};

export const absolutePositioning = {
  position: 'absolute' as const,
  top: 0,
  bottom: 0,
  right: 0,
  left: 0,
};

export const tileContainerStyles = {
  flex: 1,
  paddingVertical: BASE_SPACING_UNIT * FORM_INTER_ITEM_SPACING * 2,
  paddingHorizontal: BASE_SPACING_UNIT * FORM_INTER_ITEM_SPACING * 4,
  justifyContent: 'space-between',
  flexDirection: 'column',
  backgroundColor: 'white',
} as ViewStyle;
