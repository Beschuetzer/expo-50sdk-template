export enum SortType {
  Distance = 'Distance',
  Name = 'Name',
  /**
  *This is effectively the order in which they were added
  **/
  None = 'When Added',
}

export type CompareFuntion = ((a: any, b: any) => number) | undefined
type HasNameField = { name: string }
type HasCalculatedDistanceField = { calculatedDistance: number }

export const SORTERS: { [key in SortType]: CompareFuntion } = {
  [SortType.None]: (
    current: HasCalculatedDistanceField,
    next: HasCalculatedDistanceField,
  ) => {
    return 0;
  },
  [SortType.Distance]: (
    current: HasCalculatedDistanceField,
    next: HasCalculatedDistanceField,
  ) => {
    if (!current.calculatedDistance && next.calculatedDistance) return 1
    if (current.calculatedDistance && !next.calculatedDistance) return -1
    if (current.calculatedDistance === next.calculatedDistance) return 0
    if (
      current &&
      next &&
      current.calculatedDistance <= next.calculatedDistance
    )
      return -1
    return 1
  },
  [SortType.Name]: (current: HasNameField, next: HasNameField) => {
    if (!current.name && next.name) return 1
    if (current.name && !next.name) return -1
    if (current.name === next.name) return 0
    if (current.name <= next.name) return -1
    return 1
  },
}
