import { Stack, useTheme } from 'native-base';

import { CurrentInventoryLocationItems } from '@/components/CurrentInventoryLocationItems';
import { InventoryManager } from '@/components/InventoryManager';
import { FORM_INTER_ITEM_SPACING } from '@/constants/general';

export default function InventoryScreen() {
  const theme = useTheme();

  return (
    <>
      <Stack p={theme.space[FORM_INTER_ITEM_SPACING]}>
        <InventoryManager showList showAdd showRemove displayOnOneLine />
      </Stack>
      <CurrentInventoryLocationItems />
    </>
  );
}
