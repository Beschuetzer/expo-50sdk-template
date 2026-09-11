import { Button, ButtonText } from '@gluestack-ui/themed';
import { type NavigationProp } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import React, { useCallback } from 'react';

import { type AppParamList, Routes } from '@/constants/navigation';

type BffServiceTesterProps = {
  route: Routes;
  name?: string;
};

export const ServiceTesterButton = (props: BffServiceTesterProps) => {
  const { name, route } = props;
  const navigation = useNavigation<NavigationProp<AppParamList>>();

  const onBffServicePress = useCallback(() => {
    navigation.navigate(route as never);
  }, [navigation, route]);

  return (
    <Button onPress={onBffServicePress}>
      <ButtonText>{name || route}</ButtonText>
    </Button>
  );
};
