export type ErrorNative = {
  stack?: string;
  message?: string;
  name?: string;
  code?: string | number;
};

export type Error = {
  name?: string;
  message: string;
  statusCode?: number;
  stack?: string;
  code?: string | number;
  error?: ErrorNative;
};
