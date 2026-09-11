import { HStack } from '@gluestack-ui/themed';
import { useEffect, useState } from 'react';
import { Switch, SwitchProps } from 'react-native';

import { ChildrenProp } from '@/types/general';

type ToggleWithTextProps = {
  switchProps: SwitchProps;
} & ChildrenProp;
export function ToggleWithText(props: ToggleWithTextProps) {
  const { children, switchProps } = props;
  const [isEnabled, setIsEnabled] = useState(switchProps.value);

  useEffect(() => {
    setIsEnabled(switchProps.value);
  }, [switchProps.value]);

  return (
    <HStack alignItems="center" justifyContent="space-between">
      <HStack alignItems="center">{children}</HStack>
      <Switch
        trackColor={{ false: '#94a3b8', true: '#93c5fd' }}
        thumbColor={isEnabled ? '#1e40af' : '#475569'}
        ios_backgroundColor="#334155"
        {...switchProps}
      />
    </HStack>
  );
}
