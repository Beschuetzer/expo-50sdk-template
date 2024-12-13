import { UserIdNeeded, IdNeeded } from './bffService';

/**
 *The key is the index and the value is the _id
 **/
type BulkWriteResultSuccessObj = Record<string, string>;

/**
 *https://www.mongodb.com/docs/v6.2/reference/method/BulkWriteResult/#mongodb-data-BulkWriteResult.writeErrors
 **/
type BulkWriteResultWriteError = {
  index: number;
  code: number;
  errmsg: string;
  op: any;
};

export type BulkWriteResult = {
  result: BulkWriteResultResult;
  insertedCount: number;
  matchedCount: number;
  modifiedCount: number;
  deletedCount: number;
  upsertedCount: number;
  upsertedIds: BulkWriteResultSuccessObj;
  insertedIds: BulkWriteResultSuccessObj;
  n: number;
};

type BulkWriteResultResult = {
  ok: number;
  writeErrors: BulkWriteResultWriteError[];
  writeConcernErrors: Pick<BulkWriteResultWriteError, 'code' | 'errmsg'>[];
  insertedIds: number[];
  nInserted: number;
  nUpserted: number;
  nMatched: number;
  nModified: number;
  nRemoved: number;
  upserted: string[];
};

export type DocumentResult<T> = {
  values: T;
} & UserIdNeeded &
  IdNeeded;
