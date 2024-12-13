import { useNavigation } from 'expo-router';
import { RefObject, useCallback, useEffect, useRef } from 'react';
import { Menu } from 'react-native-popup-menu';

type UseMenuInput = {
  navigationOptionsGetter: (menuRef: RefObject<Menu>) => any;
};

type UseMenuResponse = [RefObject<Menu>, () => void];

export const useMenu = (input: UseMenuInput): UseMenuResponse => {
  const { navigationOptionsGetter } = input;
  const navigation = useNavigation();
  const menuRef = useRef<Menu>(null);

  const closeMenu = useCallback(() => {
    menuRef.current?.close();
  }, [menuRef]);

  useEffect(() => {
    closeMenu();
    navigation.setOptions(navigationOptionsGetter(menuRef));
  }, [navigation, navigationOptionsGetter, menuRef]);

  return [
    menuRef,
    function () {
      menuRef.current?.close();
    },
  ];
};
