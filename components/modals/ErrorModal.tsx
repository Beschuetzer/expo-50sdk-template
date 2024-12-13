import { Row, Button, Stack } from 'native-base';
import { useCallback } from 'react';

import { ModalWithBlur } from './ModalWithBlur';

import {
  ERRORS_INITIAL,
  errorSelector,
  setErrors,
} from '@/state/slices/generalSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';
import { Error } from '@/types/general';
import { displayAlert } from '@/utils/helpers';

export type ErrorModalProps = {
  // onDismiss: () => void;
};

export const ErrorModal = (props: ErrorModalProps) => {
  // const { onDismiss } = props;
  const errors = useAppSelector(errorSelector);
  const dispatch = useAppDispatch();

  // displayAlert({
  //   message: errors.message,
  //   statusCode: errors.statusCode || ERROR_MODAL_STATUS_CODE_DEFAULT,
  //   stackTrace: errors.error?.stack || EMPTY_STRING,
  //   error: errors?.error?.message || EMPTY_STRING,
  // });

  const onButtonPress = useCallback((error: Error) => {
    displayAlert({
      message: error.error?.message,
      stackTrace: error.error?.stack,
    });
  }, []);

  const onConfirmPress = useCallback(() => {
    dispatch(setErrors(ERRORS_INITIAL));
  }, []);

  return (
    <ModalWithBlur
      onConfirm={onConfirmPress}
      confirmButton={{ text: 'Ok' }}
      cancelButton={{ isVisible: false }}
      title="Errors Encountered (Press to View)"
      isVisible={errors.some((error) => Boolean(error.message))}
    >
      <Stack>
        {errors.map((error, index) => {
          if (!error.message) return null;
          return (
            <Row key={index} justifyContent="space-between" alignItems="center">
              <Button variant="link" onPress={() => onButtonPress(error)}>
                {`${index + 1}). ${error.message}`}
              </Button>
            </Row>
          );
        })}
      </Stack>
    </ModalWithBlur>
  );
};
