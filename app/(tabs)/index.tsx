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
  const routes = useMemo(
    () => [
      {
        key: 'first',
        title:
          shoppingList.length > 0 ? `Need ${shoppingList.length}` : `Finished`,
      },
      {
        key: 'second',
        title:
          inCartList.length > 0
            ? `In Cart (${inCartList.length})`
            : `Cart Empty`,
      },
    ],
    [inCartList.length, shoppingList.length],
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
