import { Button, ButtonText } from '@gluestack-ui/themed';
import { useNavigation } from 'expo-router';
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
    // @ts-ignore -- expo-router v3 typed params
    navigation.navigate(route);
  }, [navigation, route]);

  return (
    <Button onPress={onBffServicePress}>
      <ButtonText>{name || route}</ButtonText>
    </Button>
  );
};
