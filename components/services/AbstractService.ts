import { Dispatch } from '@reduxjs/toolkit';

import { MakeCallInput } from './BffService';

import { BFF_SERVICE_ABORT_TIMEOUT, EMPTY_STRING } from '@/constants/general';
import { setLoading } from '@/state/slices/generalSlice';
import { ErrorMessage } from '@/types/general';
import { handleError } from '@/utils/helpers';

export type GenericResponse = undefined | null;

export class AbstractService {
  protected readonly _baseUrl: string;

  constructor(baseUrl: string) {
    this._baseUrl = baseUrl;
  }

  protected validateCredentials(
    userId: string,
    password: string,
    dispatch: Dispatch<any>,
  ) {
    try {
      if (!userId || !password) {
        throw new Error('Invalid Credentials');
      }
      return true;
    } catch (error) {
      handleError(dispatch, error as any);
      return false;
    }
  }

  /**
   *Returns `undefined` if the call was aborted and `null` if another error occured
   **/
  protected async makeCall<T>(makeCallInput: MakeCallInput) {
    const {
      body,
      dispatch,
      errorMsg,
      loadingMsg,
      options,
      path,
      useErrorMessage = false,
    } = makeCallInput;

    try {
      if (!path) {
        throw new Error('no path given');
      }

      const controller = new AbortController();
      const { signal } = controller;
      const trimmedPath = path.trim();
      const url = `${this._baseUrl}${trimmedPath.startsWith('/') ? path : `/${path}`}`;
      const combinedOptions = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          ...options?.headers,
        },
        ...options,
        body,
        signal,
      };
      console.log({ url, combinedOptions, path, trimmedPath });

      dispatch(setLoading(loadingMsg));
      const timeoutId = setTimeout(
        () => controller.abort(),
        BFF_SERVICE_ABORT_TIMEOUT,
      );
      const response = await fetch(url, combinedOptions);
      clearTimeout(timeoutId);

      console.log({ response });
      const result = (await response.json()) as T;
      console.log({ result });
      if (response.ok) {
        return result;
      } else {
        const errorMessage = useErrorMessage
          ? errorMsg
          : (result as ErrorMessage)?.errorResponse?.message;
        if (errorMessage) {
          handleError(
            dispatch,
            { message: errorMessage },
            'Something went wrong trying to connect with the server',
          );
        }
      }
    } catch (error) {
      if ((error as Error)?.message !== 'Aborted') {
        handleError(dispatch, error as Error);
      } else {
        return undefined;
      }
    } finally {
      dispatch(setLoading(EMPTY_STRING));
    }
    return null;
  }
  //#endregion
}
