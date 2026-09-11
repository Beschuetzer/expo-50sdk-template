import React from 'react';
import {
  SafeAreaView,
  SafeAreaViewProps,
} from 'react-native-safe-area-context';

import { ChildrenProp } from '@/types/general';

type SafeViewProps = SafeAreaViewProps & ChildrenProp;

export function SafeView(props: SafeViewProps) {
  const { children, ...restProps } = props;
  return (
    <SafeAreaView style={{ flex: 1 }} {...restProps}>
      {children}
    </SafeAreaView>
  );
}
