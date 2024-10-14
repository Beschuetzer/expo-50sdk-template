import { useNavigation } from 'expo-router';
import { Button, Stack } from 'native-base';
import React, { useCallback } from 'react';

import { Routes } from '@/constants/navigation';

type BffServiceTesterProps = {
  route: Routes;
  name?: string;
};

export const ServiceTesterButton = (props: BffServiceTesterProps) => {
  const { name, route } = props;
  const navigation = useNavigation();

  const onBffServicePress = useCallback(() => {
    navigation.navigate(route);
  }, [navigation]);

  return (
    <Stack>
      <Button onPress={onBffServicePress}>{name || route}</Button>
    </Stack>
  );
};
