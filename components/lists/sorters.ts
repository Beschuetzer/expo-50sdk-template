export enum SortType {
  Aisle = 'Aisle',
  Distance = 'Distance',
  Frequency = 'Frequency',
  Name = 'Name',
  /**
   *This is effectively the order in which they were added
   **/
  None = 'When Added',
  Upc = 'Upc',
}

export type CompareFuntion = ((a: any, b: any) => number) | undefined
type HasAisleField = { aisle: string }
type HasFrequencyField = { frequency: string }
type HasNameField = { name: string }
type HasUpcField = { upc: string }
type HasCalculatedDistanceField = { calculatedDistance: number }

export const SORTERS: { [key in SortType]: CompareFuntion } = {
  [SortType.Aisle]: (current: HasAisleField, next: HasAisleField) => {
    console.log({current});
    
    if (!current.aisle && next.aisle) return 1
    if (current.aisle && !next.aisle) return -1
    if (current.aisle === next.aisle) return 0
    if (current.aisle <= next.aisle) return -1
    return 1
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
  [SortType.Frequency]: (current: HasFrequencyField, next: HasFrequencyField) => {
    if (!current.frequency && next.frequency) return 1
    if (current.frequency && !next.frequency) return -1
    if (current.frequency === next.frequency) return 0
    if (current.frequency <= next.frequency) return -1
    return 1
  },
  [SortType.Name]: (current: HasNameField, next: HasNameField) => {
    if (!current.name && next.name) return 1
    if (current.name && !next.name) return -1
    if (current.name === next.name) return 0
    if (current.name <= next.name) return -1
    return 1
  },
  [SortType.None]: (
    current: HasCalculatedDistanceField,
    next: HasCalculatedDistanceField,
  ) => {
    return 0
  },
  [SortType.Upc]: (current: HasUpcField, next: HasUpcField) => {
    if (!current.upc && next.upc) return 1
    if (current.upc && !next.upc) return -1
    if (current.upc === next.upc) return 0
    if (current.upc <= next.upc) return -1
    return 1
  },
}
