import { Picker } from "@react-native-picker/picker";
import { FormControl, Row, Stack, View, useTheme } from "native-base";
import { useCallback, useEffect, useMemo, useState } from "react";

import { SortType } from "./sorters";

import { FORM_INTER_ITEM_SPACING } from "@/constants/general";
import { HeadingTagProp } from "@/types/general";

type ListSorterProps = {
  onValueChange: (SortType: SortType) => void;
  sortTypes: SortType[];
} & HeadingTagProp;

export function ListSorter(props: ListSorterProps) {
  const {
    onValueChange,
    sortTypes,
    headingTag: Tag = FormControl.Label,
  } = props;
  const defaultSortType = useMemo(
    () => sortTypes?.[0] || SortType.None,
    [sortTypes],
  );
  const [selectedSortType, setSelectedSortType] = useState(defaultSortType);
  const theme = useTheme();

  const onSortTypePress = useCallback(
    (sortType: SortType) => {
      setSelectedSortType(sortType);
      onValueChange && onValueChange(sortType);
    },
    [onValueChange],
  );

  useEffect(() => {
    onSortTypePress && onSortTypePress(defaultSortType)
  }, [])

  return (
    <Stack mt={theme.space[FORM_INTER_ITEM_SPACING]}>
      <Row pl={theme.space[1]}>
        <Tag>Sort By: </Tag>
      </Row>
      <Picker selectedValue={selectedSortType} onValueChange={onSortTypePress}>
        {sortTypes.map((sortType) => (
          <Picker.Item key={sortType} label={sortType} value={sortType} />
        ))}
      </Picker>
    </Stack>
  );
}
