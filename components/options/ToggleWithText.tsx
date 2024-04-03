import { Row, useTheme } from 'native-base';
import { useCallback, useEffect, useState } from 'react';
import { Switch, SwitchProps } from 'react-native';

import { ChildrenProp } from '@/types/general';

type ToggleWithTextProps = {
  switchProps: SwitchProps;
} & ChildrenProp;
export function ToggleWithText(props: ToggleWithTextProps) {
  const theme = useTheme();
  const { children, switchProps } = props;
  const [isEnabled, setIsEnabled] = useState(switchProps.value);

  useEffect(() => {
    setIsEnabled(switchProps.value);
  }, [switchProps.value]);

  return (
    <Row alignItems="center" justifyContent="space-between">
      <Row alignItems="center">{children}</Row>
      <Switch
        trackColor={{
          false: theme.colors.secondary[200],
          true: theme.colors.primary[200],
        }}
        thumbColor={
          isEnabled ? theme.colors.primary[900] : theme.colors.secondary[900]
        }
        ios_backgroundColor={theme.colors.black[400]}
        {...switchProps}
      />
    </Row>
  );
}
