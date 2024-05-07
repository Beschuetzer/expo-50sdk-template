import { useNavigation } from 'expo-router';
import { useEffect } from 'react';

import { List } from '@/types/Item';

type UseUpdateListTitleProps = {
  list: List<any>;
  title: string;
};
export function useUpdatedListTitle(props: UseUpdateListTitleProps) {
  const { list, title } = props;
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerTitle: `${title}${Object.keys(list.filters || {}).length > 0 ? ' (filtered)' : ''}`,
    });
  }, [list.filters]);
}
