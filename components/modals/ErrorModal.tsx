import { Button, ButtonText, HStack, VStack } from '@gluestack-ui/themed';
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

export type ErrorModalProps = object;

export const ErrorModal = (props: ErrorModalProps) => {
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
      <VStack>
        {uniqueErrors.map((error, index) => {
          if (!error.message) return null;
          return (
            <HStack
              key={index}
              justifyContent="space-between"
              alignItems="center"
            >
              <Button variant="link" onPress={() => onButtonPress(error)}>
                <ButtonText>{`${index + 1}). ${error.message}`}</ButtonText>
              </Button>
            </HStack>
          );
        })}
      </VStack>
    </ModalWithBlur>
  );
};
