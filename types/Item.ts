export type Item = {
  image?: string;
  name: string;
  /**
   *This is a unix timestamp in milliseconds
   **/
  lastPurchaseDate?: number;
  /**
   *This is in milliseconds
   **/
  frequency?: number;
};

export type ItemInGroceryList = {
  aisle: string;
  quantity: number;
  /**
   *Something like 'box', 'kg', or 'bottle'
   **/
  unit: string;
} & Item;


