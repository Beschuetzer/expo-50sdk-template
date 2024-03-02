import { Column, ScrollView, View, useTheme } from 'native-base';
import { ReactNode, useState } from 'react';

import { FORM_INTER_ITEM_SPACING } from '@/constants/general';
import { absolutePositioning } from '@/constants/styles';

type AbsolutePositionedScreenProps = {
  absolutelyPositionedJsx: ReactNode | ReactNode[];
  children: ReactNode | ReactNode[];
};

const CONTAINER_HEIGHT_DEFAULT = 0;
export function AbsolutePositionedScreen(props: AbsolutePositionedScreenProps) {
  const { absolutelyPositionedJsx, children } = props;
  const [containerHeight, setContainerHeight] = useState(
    CONTAINER_HEIGHT_DEFAULT,
  );
  const theme = useTheme();

  return (
    <Column {...absolutePositioning}>
      <ScrollView m={theme.space[1]} mt={0} mb={containerHeight}>
        <View pb={theme.sizes[1]}>{children}</View>
      </ScrollView>
      <Column
        {...absolutePositioning}
        top="auto"
        p={theme.space[1]}
        py={theme.space[FORM_INTER_ITEM_SPACING]}
        backgroundColor={theme.colors.white}
        onLayout={(event) => {
          const height = event.nativeEvent?.layout?.height;
          setContainerHeight(height || CONTAINER_HEIGHT_DEFAULT);
        }}
      >
        {absolutelyPositionedJsx}
      </Column>
    </Column>
  );
}
