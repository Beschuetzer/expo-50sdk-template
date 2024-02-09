import { ViewStyle } from 'react-native'

import { UpcProduct } from './UpcResponse'
import { Item } from './Item'

export type TimeSpan = 'Hour' | 'Day' | 'Week'
export type Frequency = {
  number: number
  timeSpan: TimeSpan
}

export type SpacingProp = {
  spacing?: number | string
}

export type HeadingTagProp = {
  /**
   *This is the component to use to render the header.
   **/
  headingTag?: any //todo: figure out type here
}

export type ItemProp = {
  item: Item
}

export type UpcProp = {
  upc: string
}

export type UpcProductProp = {
  upcProduct: UpcProduct
}

export type StyleProp = {
  style?: ViewStyle
}
