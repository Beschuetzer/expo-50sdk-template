export enum Routes {
  shoppingList = 'shoppingList',
}

export const ROUTE_INFO: { [key in Routes]: { name: string; title: string } } =
  {
    [Routes.shoppingList]: {
      name: Routes.shoppingList,
      title: 'Shopping List',
    },
  }
