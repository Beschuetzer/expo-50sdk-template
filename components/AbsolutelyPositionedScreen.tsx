import { Box, ScrollView } from '@gluestack-ui/themed';
import { FlashList } from '@shopify/flash-list';
import { ReactNode, useState } from 'react';

import { FORM_INTER_ITEM_SPACING } from '@/constants/general';
import { absolutePositioning } from '@/constants/styles';

type AbsolutePositionedScreenProps = {
  absolutelyPositionedJsx?: ReactNode | ReactNode[];
  children: ReactNode | ReactNode[];
  useFlatList?: boolean;
};

const CONTAINER_HEIGHT_DEFAULT = 0;
export function AbsolutePositionedScreen(props: AbsolutePositionedScreenProps) {
  const { absolutelyPositionedJsx, children, useFlatList } = props;
  const [containerHeight, setContainerHeight] = useState(
    CONTAINER_HEIGHT_DEFAULT,
  );

  function renderList() {
    const contentJSX = <Box pb="$1">{children}</Box>;

    if (useFlatList) {
      return (
        <FlashList
          data={[{ jsx: contentJSX, index: 1 }]}
          keyExtractor={(item) => item.index.toString()}
          renderItem={(item) => item?.item?.jsx as any}
          keyboardShouldPersistTaps="always"
          estimatedItemSize={200}
          contentContainerStyle={{ paddingBottom: containerHeight }}
        />
      );
    }
    return (
      <ScrollView
        keyboardShouldPersistTaps="always"
        m="$1"
        mt={0}
        contentContainerStyle={{ paddingBottom: containerHeight }}
      >
        {contentJSX}
      </ScrollView>
    );
  }

  return (
    <Box {...absolutePositioning}>
      {renderList()}
      <Box
        {...absolutePositioning}
        top="auto"
        p="$1"
        py={FORM_INTER_ITEM_SPACING}
        bg="$white"
        onLayout={(event: any) => {
          const height = event.nativeEvent?.layout?.height;
          setContainerHeight(height || CONTAINER_HEIGHT_DEFAULT);
        }}
      >
        {absolutelyPositionedJsx}
      </Box>
    </Box>
  );
}
