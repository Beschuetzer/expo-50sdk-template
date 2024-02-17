import { createSelector, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

import { RootState } from '../store'

import { ListFilterFilters } from '@/components/lists/ListFilter'
import { SortOrder, SortType, getSorter } from '@/components/lists/sorters'
import { EMPTY_STRING } from '@/constants/general'
import {
  Item,
  ItemWithStoreSpecificValues,
  ItemsList,
  Key,
  LastPurchasedItem,
  LastPurchasedList,
  ListFilters,
  ShoppingList,
  StoreList,
  StoreSpecificValueKey,
  StoreSpecificValues,
} from '@/types/Item'
import { GpsCoordinate, Store } from '@/types/Store'
import { ListNameProp } from '@/types/general'
import {
  calculateDistance,
  getEmptyArray,
  getEmptyObject,
  getItemFromList,
  getKeyToUse,
} from '@/utils/helpers'

export enum ListName {
  ItemsList = 'itemsList',
  LastPurchasedList = 'lastPurchasedList',
  ShoppingLIst = 'shoppingLIst',
  StoresList = 'storesList',
}

export type SortOrders = {
  [key in ListName]: SortOrderValue
}
export type SortOrderValue = { sortBy: SortType; sortOrder: SortOrder }

//#region Payloads
export type AddItemsListItemPayload = {
  item: Item
  storeSpecificValues?: StoreSpecificValues
  currentStore?: Store
}

export type ResetFiltersPayload = object & ListNameProp

export type SetFiltersPayload = {
  filters: ListFilterFilters<any>
} & ListNameProp

export type SortListPayload = {
  sortBy: SortType
} & ListNameProp

export type ToggleSortOrderPayload = Pick<SortListPayload, 'listName'>

export type UpdateStoreSpecificValuesPayload = {
  /**
   *The key to get the item from {@link ItemsList itemsList}
   **/
  key: Key
  /**
   *The new value for each store specific value
   **/
  storeSpecificValuesToUpdate: Partial<{
    [key in StoreSpecificValueKey]: (currentValue: any) => any
  }>
}
//#endregion

//#region State
const CURRENT_LOCATION_INITIAL = null

/**
 * {@link ListsState.itemsList itemsList} has all of the items that have been scanned (these can be added to any store)
 * {@link ListsState.lastPurchasedList lastPurchasedList} keeps track of the last time the upc was purchased
 * {@link ListsState.shoppingList shoppingList} is the items currently being bought
 * {@link ListsState.stores stores} is a list of the stores created
 **/
export type ListsState = {
  currentLocation: GpsCoordinate | null
  currentStoreName: string
  filters: ListFilters
  [ListName.ItemsList]: ItemsList
  [ListName.LastPurchasedList]: LastPurchasedList
  [ListName.ShoppingLIst]: ShoppingList
  [ListName.StoresList]: StoreList
  sortOrders: SortOrders
}

const initialState: ListsState = {
  currentLocation: CURRENT_LOCATION_INITIAL,
  currentStoreName: EMPTY_STRING,
  filters: getEmptyObject(),
  [ListName.ItemsList]: getEmptyArray(),
  [ListName.LastPurchasedList]: getEmptyArray(),
  [ListName.ShoppingLIst]: getEmptyArray(),
  [ListName.StoresList]: getEmptyArray(),
  sortOrders: {
    [ListName.ItemsList]: {
      sortBy: SortType.Name,
      sortOrder: SortOrder.Ascending,
    },
    [ListName.LastPurchasedList]: {
      sortBy: SortType.Name,
      sortOrder: SortOrder.Ascending,
    },
    [ListName.ShoppingLIst]: {
      sortBy: SortType.Name,
      sortOrder: SortOrder.Ascending,
    },
    [ListName.StoresList]: {
      sortBy: SortType.Name,
      sortOrder: SortOrder.Ascending,
    },
  },
}
//#endregion

export const listsSlice = createSlice({
  name: 'lists',
  initialState,
  reducers: {
    addMockItems: (state: ListsState, action: PayloadAction<ItemsList>) => {
      state.itemsList = action.payload
    },
    addItemsListItem: (
      state: ListsState,
      action: PayloadAction<AddItemsListItemPayload>,
    ) => {
      const { item, storeSpecificValues, currentStore } = action.payload || {}
      const keyToUse = getKeyToUse(action.payload.item)

      if (!keyToUse) {
        alert('Unable to add an item with no name and no upc to the itemsList.')
        return
      }

      const currentItem = getItemFromList(state.itemsList, keyToUse) as any
      const newItem = { ...item } as any
      const itemToUse = currentItem || newItem

      //add store specific values if they exist
      if (storeSpecificValues && currentStore?.name) {
        for (const [valueName, value] of Object.entries(storeSpecificValues)) {
          itemToUse[valueName] = {
            ...itemToUse?.[valueName],
            [currentStore.name]: value?.[currentStore.name],
          }
        }
      }

      if (!currentItem) {
        state.itemsList.push(newItem)
        state.itemsList = [
          ...state.itemsList.sort(
            getSorter(state.sortOrders[ListName.ItemsList].sortBy),
          ),
        ]
      } else {
        for (const [key, value] of Object.entries(item)) {
          currentItem[key] = value
        }
      }
    },
    addLastPurchasedList: (
      state: ListsState,
      action: PayloadAction<LastPurchasedItem>,
    ) => {
      const keyToUse = getKeyToUse(action.payload)
      if (!keyToUse) {
        alert(
          'Unable to add an item with no name and no upc to the lastPurchasedList.',
        )
        return
      }
      state.lastPurchasedList = {
        ...state.lastPurchasedList,
        [keyToUse]: action.payload,
      }
    },
    addStoresListItem: (state: ListsState, action: PayloadAction<Store>) => {
      const store = action.payload
      const keyToUse = getKeyToUse(store)
      if (!keyToUse) {
        alert('Unable to add an item with no name to the storesList.')
        return
      }

      if (
        state.storesList.find((store) => {
          return store.name === keyToUse
        })
      )
        return
      state.storesList.push({
        ...store,
        calculatedDistance: calculateDistance(
          store.gpsCoordinates,
          state.currentLocation,
        ),
      })
      state.storesList.sort(
        getSorter(state.sortOrders[ListName.StoresList].sortBy),
      )

      if (state.storesList.length === 1) {
        state.currentStoreName = store.name
      }
    },
    removeItemsListItem: (state: ListsState, action: PayloadAction<Key>) => {
      const keyToUse = getKeyToUse(action.payload)
      if (!keyToUse) {
        alert(
          'A key must be provided in order to remove an item from the itemsList.',
        )
        return
      }
      state.itemsList = state.itemsList.filter((item) => {
        if (item.upc && item.name) return item.upc !== keyToUse
        return item.name !== keyToUse
      })
    },
    removeLastPurchasedList: (
      state: ListsState,
      action: PayloadAction<Key>,
    ) => {
      const keyToUse = getKeyToUse(action.payload)
      if (!keyToUse) {
        alert(
          'A key must be provided in order to remove an item from the lastPurchasedList.',
        )
        return
      }
      state.lastPurchasedList = state.lastPurchasedList.filter((item) => {
        if (item.upc && item.name) return item.upc !== keyToUse
        return item.name !== keyToUse
      })
    },
    removeStoresListItem: (state: ListsState, action: PayloadAction<Key>) => {
      const keyToUse = getKeyToUse(action.payload)
      if (!keyToUse) {
        alert(
          'A key must be provided in order to remove an item from the storesList.',
        )
        return
      }
      state.storesList = state.storesList.filter(
        (store) => store.name !== keyToUse,
      )
    },
    resetCurrentLocation: (state: ListsState) => {
      state.currentLocation = CURRENT_LOCATION_INITIAL
      for (const store of state.storesList) {
        store.calculatedDistance = -1
      }
    },
    resetFilters: (
      state: ListsState,
      action: PayloadAction<ResetFiltersPayload>,
    ) => {
      const { listName } = action.payload
      if (!listName) return
      state.filters = {
        ...state.filters,
        [listName]: getEmptyObject(),
      }
    },
    resetItemsList: (state: ListsState) => {
      state.itemsList = getEmptyArray()
    },
    resetLastPurchasedList: (state: ListsState) => {
      state.lastPurchasedList = getEmptyArray()
    },
    resetStoresList: (state: ListsState) => {
      state.storesList = getEmptyArray()
      state.currentStoreName = EMPTY_STRING
    },
    resetCurrentStoreName: (state: ListsState) => {
      state.currentStoreName = EMPTY_STRING
    },
    setCurrentLocation: (
      state: ListsState,
      action: PayloadAction<GpsCoordinate>,
    ) => {
      if (!action.payload) return
      state.currentLocation = action.payload
      for (const store of state.storesList) {
        store.calculatedDistance = calculateDistance(
          state.currentLocation,
          store.gpsCoordinates,
        )
      }
    },
    setCurrentStoreName: (
      state: ListsState,
      action: PayloadAction<string | undefined>,
    ) => {
      if (!action.payload) return
      state.currentStoreName = action.payload
    },
    setFilters: (
      state: ListsState,
      action: PayloadAction<SetFiltersPayload>,
    ) => {
      const { filters, listName } = action.payload

      if (!listName || Object.keys(filters || {}).length === 0) {
        return
      }

      for (const [key, value] of Object.entries(filters)) {
        if (!value) {
          delete filters[key]
        }
      }

      state.filters[listName] = filters
    },
    sortList: (state: ListsState, action: PayloadAction<SortListPayload>) => {
      const { listName, sortBy = SortType.Name } = action.payload
      const listToSort = state[listName]

      if (!listToSort) {
        alert(`Unable to find a list with name of '${listName}'.`)
        return
      }
      listToSort?.sort(getSorter(sortBy, state.sortOrders[listName].sortOrder))

      if (!state.sortOrders[listName]) return

      state.sortOrders = {
        ...state.sortOrders,
        [listName]: {
          ...state.sortOrders[listName],
          sortBy,
        },
      }
    },
    toggleSortOrder: (
      state: ListsState,
      action: PayloadAction<ToggleSortOrderPayload>,
    ) => {
      const { listName } = action.payload
      const listToSort = state[listName]

      if (!state.sortOrders[listName]) return
      const sortOrder =
        state.sortOrders[listName]?.sortOrder === SortOrder.Ascending
          ? SortOrder.Descending
          : SortOrder.Ascending
      if (listToSort) {
        listToSort?.sort(
          getSorter(state.sortOrders[listName].sortBy, sortOrder),
        )
      }

      state.sortOrders = {
        ...state.sortOrders,
        [listName]: {
          ...state.sortOrders[listName],
          sortOrder,
        },
      }
    },
    updateStoreSpecificValues: (
      state: ListsState,
      action: PayloadAction<UpdateStoreSpecificValuesPayload>,
    ) => {
      if (!action.payload) return
      const { storeSpecificValuesToUpdate, key } = action.payload
      const keyToUse = getKeyToUse(key)
      const itemToUpdate = getItemFromList(state.itemsList, keyToUse) as any
      if (!itemToUpdate || !storeSpecificValuesToUpdate) {
        alert(
          `A key, storeName, and storeSpecificValuesToUpdate must be provided in order to update an item.`,
        )
        return
      }

      for (const [valueName, value] of Object.entries(
        storeSpecificValuesToUpdate,
      )) {
        itemToUpdate[valueName] = {
          ...itemToUpdate[valueName],
          [state.currentStoreName]: value(
            itemToUpdate[valueName][state.currentStoreName],
          ),
        }
      }
    },
  },
})

// Action creators are generated for each case reducer function
export const {
  addItemsListItem,
  addLastPurchasedList,
  addMockItems,
  addStoresListItem,
  removeItemsListItem,
  removeLastPurchasedList,
  removeStoresListItem,
  resetCurrentLocation,
  resetCurrentStoreName,
  resetFilters,
  resetItemsList,
  resetLastPurchasedList,
  resetStoresList,
  setCurrentLocation,
  setCurrentStoreName,
  setFilters,
  sortList,
  toggleSortOrder,
  updateStoreSpecificValues,
} = listsSlice.actions

export default listsSlice.reducer

export const currentLocationSelector = (state: RootState) =>
  state[listsSlice.name].currentLocation

export const currentStoreSelector = createSelector(
  [
    (state: RootState) => state[listsSlice.name].storesList,
    (state: RootState) => state[listsSlice.name].currentStoreName,
  ],
  (storesList, currentStoreName) => {
    const foundStore = (storesList.find(
      (store) => store.name === currentStoreName,
    ) || {
      name: EMPTY_STRING,
      gpsCoordinates: null,
    }) as Store
    return foundStore
  },
)

export const filterSelector = (listName: ListName) =>
  createSelector(
    [(state: RootState) => state[listsSlice.name].filters],
    (filters) => {
      return filters[listName]
    },
  )

export const itemsListItemSelector = (id: string) =>
  createSelector(
    [(state: RootState) => state[listsSlice.name].itemsList],
    (itemsList) => {
      return getItemFromList(itemsList, id)
    },
  )

export const itemsListSelector = (state: RootState) =>
  state[listsSlice.name].itemsList

export const shoppingListSelector = createSelector(
  [
    (state: RootState) => state[listsSlice.name].itemsList,
    (state: RootState) => state[listsSlice.name].storesList,
    (state: RootState) => state[listsSlice.name].currentStoreName,
  ],
  (itemsList, storesList, currentStoreName) => {
    const currentStore = storesList.find(
      (store) => store.name === currentStoreName,
    )
    const shoppingList: ItemWithStoreSpecificValues[] = []
    for (const item of Object.values(itemsList)) {
      if (
        item?.[StoreSpecificValueKey.Quantity]?.[
          currentStore?.name || EMPTY_STRING
        ]
      ) {
        shoppingList.push(item)
      }
    }
    return shoppingList
  },
)

export const sortOrdersSelector = (state: RootState) =>
  state[listsSlice.name].sortOrders

export const sortOrderSelector = (listName: ListName) =>
  createSelector(
    [(state: RootState) => state[listsSlice.name].sortOrders],
    (sortOrders) => {
      return sortOrders[listName]
    },
  )

export const storesListSelector = (state: RootState) =>
  state[listsSlice.name].storesList

export const storesListArraySelector = createSelector(
  [(state: RootState) => state[listsSlice.name].storesList],
  (storesList) => {
    return Object.values(storesList)
  },
)

export const storesListItemSelector = (storeName: string) =>
  createSelector(
    [(state: RootState) => state[listsSlice.name].storesList],
    (storesList) => {
      return storesList?.find((store) => store.name === storeName) as Store
    },
  )
