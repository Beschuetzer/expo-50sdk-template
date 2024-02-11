import { Picker } from "@react-native-picker/picker";
import { FormControl, Row, Stack, View, useTheme } from "native-base";
import { useCallback, useEffect, useState } from "react";

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
  const [selectedSortType, setSelectedSortType] = useState(sortTypes[0]);
  const theme = useTheme();

  const onSortTypePress = useCallback(
    (sortType: SortType) => {
      setSelectedSortType(sortType);
      onValueChange && onValueChange(sortType);
    },
    [onValueChange],
  );

  useEffect(() => {
    onSortTypePress && onSortTypePress(sortTypes[0])
  }, [])

  return (
    <Stack mt={theme.space[FORM_INTER_ITEM_SPACING]}>
      <Row pl={theme.space[1]}>
        <Tag>Sort By: </Tag>
      </Row>
      <Picker selectedValue={selectedSortType} onValueChange={onSortTypePress}>
        {Object.values(SortType).map((sortType) => (
          <Picker.Item key={sortType} label={sortType} value={sortType} />
        ))}
      </Picker>
    </Stack>
  );
}
