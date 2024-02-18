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
  ShoppingList,
  StoreList,
  StoreSpecificValueKey,
  StoreSpecificValues,
} from '@/types/Item'
import { GpsCoordinate, Store } from '@/types/Store'
import { ListNameProp } from '@/types/general'
import {
  calculateDistance,
  getEmptyList,
  getEmptyObject,
  getFilteredList,
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

export type SetSortOrderPayload = object &
  ListNameProp &
  Pick<SortOrderValue, 'sortBy'>

export type ToggleSortOrderPayload = Pick<SetSortOrderPayload, 'listName'>

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
  [ListName.ItemsList]: ItemsList
  [ListName.LastPurchasedList]: LastPurchasedList
  [ListName.ShoppingLIst]: ShoppingList
  [ListName.StoresList]: StoreList
}

const initialState: ListsState = {
  currentLocation: CURRENT_LOCATION_INITIAL,
  currentStoreName: EMPTY_STRING,
  [ListName.ItemsList]: getEmptyList(),
  [ListName.LastPurchasedList]: getEmptyList(),
  [ListName.ShoppingLIst]: getEmptyList(),
  [ListName.StoresList]: getEmptyList(),
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

      const currentItem = getItemFromList(state.itemsList.data, keyToUse) as any
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
        state.itemsList.data.push(newItem)
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
        state.storesList.data.find((store) => {
          return store.name === keyToUse
        })
      )
        return
      state.storesList.data.push({
        ...store,
        calculatedDistance: calculateDistance(
          store.gpsCoordinates,
          state.currentLocation,
        ),
      })

      if (state.storesList.data.length === 1) {
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
      state.itemsList.data = state.itemsList.data.filter((item) => {
        if (item.upc && item.name) return item.upc !== keyToUse
        return item.name !== keyToUse
      })
    },
    removeLastPurchasedListItem: (
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
      state.lastPurchasedList.data = state.lastPurchasedList.data.filter(
        (item) => {
          if (item.upc && item.name) return item.upc !== keyToUse
          return item.name !== keyToUse
        },
      )
    },
    removeStoresListItem: (state: ListsState, action: PayloadAction<Key>) => {
      const keyToUse = getKeyToUse(action.payload)
      if (!keyToUse) {
        alert(
          'A key must be provided in order to remove an item from the storesList.',
        )
        return
      }
      state.storesList.data = state.storesList.data.filter(
        (store) => store.name !== keyToUse,
      )
    },
    resetCurrentLocation: (state: ListsState) => {
      state.currentLocation = CURRENT_LOCATION_INITIAL
      for (const store of state.storesList.data) {
        store.calculatedDistance = -1
      }
    },
    resetListToDisplay: (
      state: ListsState,
      action: PayloadAction<ResetFiltersPayload>,
    ) => {
      const { listName } = action.payload
      if (!listName) return
      const emptyList = getEmptyList<any>()
      emptyList.data = state[listName].data
      state[listName] = emptyList
    },
    resetItemsList: (state: ListsState) => {
      state.itemsList = getEmptyList()
    },
    resetLastPurchasedList: (state: ListsState) => {
      state.lastPurchasedList = getEmptyList()
    },
    resetStoresList: (state: ListsState) => {
      state.storesList = getEmptyList()
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
      for (const store of state.storesList.data) {
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

      state[listName].filters = filters
    },
    setSortOrder: (
      state: ListsState,
      action: PayloadAction<SetSortOrderPayload>,
    ) => {
      const { listName, sortBy = SortType.Name } = action.payload
      const listToSort = state[listName]

      if (!listToSort) {
        alert(`Unable to find a list with name of '${listName}'.`)
        return
      }
      listToSort.data?.sort(
        getSorter(sortBy, state[listName].sortOrderValue.sortOrder),
      )

      if (!state[listName].sortOrderValue.sortOrder) return

      state[listName].sortOrderValue = {
        sortBy,
        sortOrder: state[listName].sortOrderValue.sortOrder,
      }
    },
    toggleSortOrder: (
      state: ListsState,
      action: PayloadAction<ToggleSortOrderPayload>,
    ) => {
      const { listName } = action.payload

      if (!state[listName].sortOrderValue) return
      const sortOrder =
        state[listName].sortOrderValue?.sortOrder === SortOrder.Ascending
          ? SortOrder.Descending
          : SortOrder.Ascending

      state[listName].sortOrderValue.sortOrder = sortOrder
    },
    updateStoreSpecificValues: (
      state: ListsState,
      action: PayloadAction<UpdateStoreSpecificValuesPayload>,
    ) => {
      if (!action.payload) return
      const { storeSpecificValuesToUpdate, key } = action.payload
      const keyToUse = getKeyToUse(key)
      const itemToUpdate = getItemFromList(
        state.itemsList.data,
        keyToUse,
      ) as any
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
  removeLastPurchasedListItem: removeLastPurchasedList,
  removeStoresListItem,
  resetCurrentLocation,
  resetCurrentStoreName,
  resetListToDisplay,
  resetItemsList,
  resetLastPurchasedList,
  resetStoresList,
  setCurrentLocation,
  setCurrentStoreName,
  setFilters,
  setSortOrder,
  toggleSortOrder,
  updateStoreSpecificValues,
} = listsSlice.actions

export default listsSlice.reducer

export const currentLocationSelector = (state: RootState) =>
  state[listsSlice.name].currentLocation

export const currentStoreSelector = createSelector(
  [
    (state: RootState) => state[listsSlice.name].storesList.data,
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
    [(state: RootState) => state[listsSlice.name].itemsList.data],
    (itemsList) => {
      return getItemFromList(itemsList, id)
    },
  )

export const itemsListSelector = (state: RootState) =>
  state[listsSlice.name][ListName.ItemsList]

export const listToDisplaySelector = (listName: ListName) =>
  createSelector(
    [(state: RootState) => state[listsSlice.name]?.[listName]],
    (list) => {
      const { filters, sortOrderValue, data } = list
      const filteredList = getFilteredList<unknown>(data, filters)
      filteredList.sort(
        getSorter(sortOrderValue.sortBy, sortOrderValue.sortOrder),
      )
      return filteredList
    },
  )

export const shoppingListSelector = createSelector(
  [
    (state: RootState) => state[listsSlice.name].itemsList.data,
    (state: RootState) => state[listsSlice.name].storesList.data,
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

export const storesListSelector = (state: RootState) =>
  state[listsSlice.name].storesList.data

export const storesListItemSelector = (storeName: string) =>
  createSelector(
    [(state: RootState) => state[listsSlice.name].storesList.data],
    (storesList) => {
      return storesList?.find((store) => store.name === storeName) as Store
    },
  )
