import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { SceneMap, TabView } from 'react-native-tab-view';
import { useDispatch, useSelector } from 'react-redux';

import { useGpsCoordinate } from '@/components/hooks/useGeoLocation';
import { InCartList } from '@/components/lists/InCartList';
import { ShoppingList } from '@/components/lists/ShoppingLIst';
import {
  ListName,
  setCurrentLocation,
  storeSpecificListSelector,
} from '@/state/slices/listsSlice';

const renderScene = SceneMap({
  first: () => <ShoppingList />,
  second: () => <InCartList />,
});

export default function TabOneScreen() {
  const dispatch = useDispatch();
  useGpsCoordinate({
    onSuccess: (gpsCoordinate) => {
      dispatch(setCurrentLocation(gpsCoordinate));
    },
  });
  const layout = useWindowDimensions();
  const shoppingList = useSelector(
    storeSpecificListSelector(ListName.ShoppingList),
  );
  const inCartList = useSelector(
    storeSpecificListSelector(ListName.InCartList),
  );

  const [index, setIndex] = useState(0);

  const firstTabTitle = useMemo(() => {
    const main = 'Need';
    if (shoppingList.length === 0 && inCartList.length === 0) {
      return main;
    }
    return shoppingList.length > 0
      ? `${main} ${shoppingList.length}`
      : `Finished`;
  }, [shoppingList.length, inCartList.length]);

  const secondTabTitle = useMemo(() => {
    const main = 'In Cart';
    if (shoppingList.length === 0 && inCartList.length === 0) {
      return main;
    }
    return inCartList.length > 0
      ? `${main} (${inCartList.length})`
      : `Cart Empty`;
  }, [shoppingList.length, inCartList.length]);

  const routes = useMemo(
    () => [
      {
        key: 'first',
        title: firstTabTitle,
      },
      {
        key: 'second',
        title: secondTabTitle,
      },
    ],
    [firstTabTitle, secondTabTitle],
  );

  useLayoutEffect(() => {
    if (inCartList.length <= 0) {
      setIndex(0);
    } else if (shoppingList.length === 0) {
      setIndex(1);
    }
  }, [inCartList.length]);

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
    />
  );
}
