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
  StoreSpecificValuesMap,
} from '@/types/Item'
import { GpsCoordinate, Store } from '@/types/Store'
import { ListNameProp } from '@/types/general'
import {
  calculateDistance,
  deleteImages,
  getEmptyList,
  getEmptyObject,
  getFilteredList,
  getItemFromList,
  getKeyToUse,
  getStoreWithDistance,
} from '@/utils/helpers'

export enum ListName {
  ItemsList = 'itemsList',
  LastPurchasedList = 'lastPurchasedList',
  ShoppingList = 'shoppingLIst',
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

export type ResetListToDisplayFiltersPayload = ListNameProp

export type ResetListToDisplayPayload = ListNameProp

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
  [ListName.ShoppingList]: ShoppingList
  [ListName.StoresList]: StoreList
  storeSpecificValuesMap: StoreSpecificValuesMap
}

const initialState: ListsState = {
  currentLocation: CURRENT_LOCATION_INITIAL,
  currentStoreName: EMPTY_STRING,
  [ListName.ItemsList]: getEmptyList(),
  [ListName.LastPurchasedList]: getEmptyList(),
  [ListName.ShoppingList]: getEmptyList(),
  [ListName.StoresList]: getEmptyList(),
  storeSpecificValuesMap: getEmptyObject(),
}
//#endregion

export const listsSlice = createSlice({
  name: 'lists',
  initialState,
  reducers: {
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

      //add store specific values if they exist
      if (storeSpecificValues && currentStore?.name) {
        state.storeSpecificValuesMap[keyToUse] = storeSpecificValues
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

      console.log({ storesList: state.storesList.data, store })
      const storeIndex = state.storesList.data.findIndex(
        (store) => store.name === keyToUse,
      )

      if (storeIndex !== -1) {
        state.storesList.data[storeIndex] = getStoreWithDistance(
          store,
          state.currentLocation,
        )
        return
      }
      state.storesList.data.push(
        getStoreWithDistance(store, state.currentLocation),
      )

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
        if (item.upc && item.name) {
          const isMatch = item.upc !== keyToUse
          if (!isMatch) {
            deleteImages(item.images)
          }
          return isMatch
        }
        const isMatch = item.name !== keyToUse
        if (!isMatch) {
          deleteImages(item.images)
        }
        return isMatch
      })
      state.storeSpecificValuesMap[keyToUse] = {} as StoreSpecificValues
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
    removeShoppingListItem: (state: ListsState, action: PayloadAction<Key>) => {
      const keyToUse = getKeyToUse(action.payload)
      if (!state.storeSpecificValuesMap[keyToUse]) {
        state.storeSpecificValuesMap[keyToUse] = {} as StoreSpecificValues
        return
      }
      state.storeSpecificValuesMap[keyToUse] = {
        ...((state.storeSpecificValuesMap[keyToUse] || {}) as any),
        [StoreSpecificValueKey.Quantity]: {
          ...(state.storeSpecificValuesMap[keyToUse]?.[
            StoreSpecificValueKey.Quantity
          ] || {}),
          [state.currentStoreName]: 0,
        },
      }
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
      action: PayloadAction<ResetListToDisplayPayload>,
    ) => {
      const { listName } = action.payload
      if (!listName) return
      const emptyList = getEmptyList<any>()
      emptyList.data = state[listName].data
      state[listName] = emptyList
    },
    resetListToDisplayFilters: (
      state: ListsState,
      action: PayloadAction<ResetListToDisplayFiltersPayload>,
    ) => {
      const { listName } = action.payload
      if (!listName) return
      const emptyList = getEmptyList<any>()
      emptyList.data = state[listName].data
      emptyList.sortOrderValue = state[listName].sortOrderValue
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
    setItemsList: (
      state: ListsState,
      action: PayloadAction<ListsState['itemsList']>,
    ) => {
      if (!action.payload) return
      state.itemsList = action.payload
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
    setStoresList: (
      state: ListsState,
      action: PayloadAction<ListsState['storesList']>,
    ) => {
      if (!action.payload) return
      state[ListName.StoresList] = action.payload
    },
    setStoreSpecificValues: (
      state: ListsState,
      action: PayloadAction<ListsState['storeSpecificValuesMap']>,
    ) => {
      if (!action.payload) return
      state.storeSpecificValuesMap = action.payload
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
      if (!keyToUse || !storeSpecificValuesToUpdate) {
        alert(
          `A key, storeName, and storeSpecificValuesToUpdate must be provided in order to update an item.`,
        )
        return
      }

      for (const [valueName, value] of Object.entries(
        storeSpecificValuesToUpdate,
      )) {
        const currentItem = state.storeSpecificValuesMap?.[keyToUse] as any
        const currentValue = currentItem?.[valueName]?.[state.currentStoreName]
        const newValue = value?.(currentValue)

        if (!currentItem || !currentValue) {
          state.storeSpecificValuesMap[keyToUse] = {
            ...state.storeSpecificValuesMap[keyToUse],
            [valueName]: {
              [state.currentStoreName]: newValue,
            },
          } as StoreSpecificValues
        } else {
          currentItem[valueName][state.currentStoreName] = newValue
        }
      }
    },
  },
})

// Action creators are generated for each case reducer function
export const {
  addItemsListItem,
  addLastPurchasedList,
  addStoresListItem,
  removeItemsListItem,
  removeLastPurchasedListItem,
  removeShoppingListItem,
  removeStoresListItem,
  resetCurrentLocation,
  resetCurrentStoreName,
  resetItemsList,
  resetLastPurchasedList,
  resetListToDisplay,
  resetListToDisplayFilters,
  resetStoresList,
  setCurrentLocation,
  setCurrentStoreName,
  setFilters,
  setItemsList,
  setSortOrder,
  setStoresList,
  setStoreSpecificValues,
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

export const itemsListItemSelector = (id: string) =>
  createSelector(
    [(state: RootState) => state[listsSlice.name].itemsList.data],
    (itemsList) => {
      return getItemFromList(itemsList, id)
    },
  )

export const itemsListWithStoreSpecificValuesSelector = (id: string) =>
  createSelector(
    [
      (state: RootState) => state[listsSlice.name].itemsList.data,
      (state: RootState) => state[listsSlice.name].storeSpecificValuesMap,
    ],
    (itemsListData, storeSpecificValuesMap) => {
      const itemToUse = getItemFromList(itemsListData, id)
      const storeSpecificValuesToUse = storeSpecificValuesMap[id]

      return {
        ...itemToUse,
        ...storeSpecificValuesToUse,
      } as ItemWithStoreSpecificValues
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

/**
 *The way this is written, the shopping list will update when the storeList changes when really it should only change when the current store changes
 *This may not be an issue though
 **/
export const shoppingListItemsSelector = createSelector(
  [
    (state: RootState) => state[listsSlice.name][ListName.ShoppingList],
    (state: RootState) => state[listsSlice.name][ListName.ItemsList],
    (state: RootState) => state[listsSlice.name].storeSpecificValuesMap,
    (state: RootState) => state[listsSlice.name].storesList.data,
    (state: RootState) => state[listsSlice.name].currentStoreName,
  ],
  (
    shoppingList,
    itemsList,
    storeSpecificValuesMap,
    storesList,
    currentStoreName,
  ) => {
    const currentStore = storesList.find(
      (store) => store.name === currentStoreName,
    )
    if (!currentStore?.name) return []

    const listToDisplay = [] as ItemWithStoreSpecificValues[]
    for (const [key, values] of Object.entries(storeSpecificValuesMap)) {
      const currentQuantityForItemAndStoreCombination =
        values?.[StoreSpecificValueKey.Quantity]?.[currentStore.name]
      if (
        currentQuantityForItemAndStoreCombination &&
        currentQuantityForItemAndStoreCombination > 0
      ) {
        const currentItem = getItemFromList(itemsList.data, key)
        if (!currentItem) continue
        listToDisplay.push({
          ...currentItem,
          ...values,
        } as ItemWithStoreSpecificValues)
      }
    }

    const filteredList = getFilteredList<ItemWithStoreSpecificValues>(
      listToDisplay,
      shoppingList.filters,
    )
    filteredList.sort(
      getSorter(
        shoppingList.sortOrderValue.sortBy,
        shoppingList.sortOrderValue.sortOrder,
      ),
    )
    return filteredList
  },
)

export const shoppingListSelector = (state: RootState) =>
  state[listsSlice.name][ListName.ShoppingList]

export const storesListSelector = (state: RootState) =>
  state[listsSlice.name][ListName.StoresList]

export const storesListItemSelector = (storeName: string) =>
  createSelector(
    [(state: RootState) => state[listsSlice.name].storesList.data],
    (storesList) => {
      return storesList?.find((store) => store.name === storeName) as Store
    },
  )

export const storeSpecificValuesSelector = (state: RootState) =>
  state[listsSlice.name].storeSpecificValuesMap
