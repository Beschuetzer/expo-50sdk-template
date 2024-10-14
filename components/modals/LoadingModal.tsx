import { FontAwesome } from '@expo/vector-icons';
import { Center } from 'native-base';
import React, { useCallback } from 'react';

import { ModalWithBlur } from './ModalWithBlur';

import { EMPTY_STRING } from '@/constants/general';
import { loadingSelector, setLoading } from '@/state/slices/generalSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';

export type LoadingModalProps = object;

export const LoadingModal = (props: LoadingModalProps) => {
  const dispatch = useAppDispatch();
  const loadingMsg = useAppSelector(loadingSelector);

  const onConfirmPress = useCallback(() => {
    dispatch(setLoading(EMPTY_STRING));
  }, []);

  return (
    <ModalWithBlur
      onConfirm={onConfirmPress}
      confirmButton={{ text: 'Ok' }}
      cancelButton={{ isVisible: false }}
      title={loadingMsg}
      isVisible={!!loadingMsg}
    >
      <Center>
        <FontAwesome name="spinner" />
      </Center>
    </ModalWithBlur>
  );
};
