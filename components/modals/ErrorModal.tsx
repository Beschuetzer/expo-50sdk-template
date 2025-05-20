import { Row, Button, Stack } from 'native-base';
import { useCallback, useMemo } from 'react';

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

  // Filter to unique errors by message using useMemo
  const uniqueErrors = useMemo(() => {
    return errors.filter(
      (error, index, self) =>
        index === self.findIndex((e) => e.message === error.message),
    );
  }, [errors]);

  const onButtonPress = useCallback((error: Error) => {
    displayAlert({
      message: error.error?.message,
      stackTrace: error.error?.stack,
    });
  }, []);

  const onConfirmPress = useCallback(() => {
    dispatch(setErrors(ERRORS_INITIAL));
  }, [dispatch]);

  return (
    <ModalWithBlur
      onConfirm={onConfirmPress}
      confirmButton={{ text: 'Ok' }}
      cancelButton={{ isVisible: false }}
      title="Errors Encountered (Press to View)"
      isVisible={uniqueErrors.some((error) => Boolean(error.message))}
    >
      <Stack>
        {uniqueErrors.map((error, index) => {
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
