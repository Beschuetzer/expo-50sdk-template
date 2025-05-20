import { View, Stack } from 'native-base';
import { useCallback, useEffect, useState } from 'react';

import { ModalWithBlur, ModalWithBlurProps } from './ModalWithBlur';
import { InventoryManager } from '../InventoryManager';
import { InputText } from '../forms/InputText';
import { NumberInputProps, NumberInput } from '../forms/NumberInput';

import { InventoryLocation } from '@/types/inventory';

const INITIAL_VALUES = Object.freeze({
  number: 1,
  location: null,
}) as AddItemToInventoryModalValues;

export type AddItemToInventoryModalValues = {
  number: number;
  location: InventoryLocation | null;
};

type AddItemToInventoryModalInput = {
  isVisible?: boolean;
  title?: string;
};

export type AddItemToInventoryModalProps = {
  modalProps: Omit<ModalWithBlurProps, 'onConfirm' | 'onCancel'>;
  numberInputProps?: Partial<
    Omit<
      NumberInputProps,
      'initialValue' | 'onPlusPress' | 'onMinusPress' | 'title'
    >
  > &
    AddItemToInventoryModalInput;
  onConfirm?: (values: AddItemToInventoryModalValues) => void;
  onCancel?: () => void;
  onValueChange?: (values: AddItemToInventoryModalValues) => void;
  locationInputProps?: AddItemToInventoryModalInput;
};

export function AddItemToInventoryModal(props: AddItemToInventoryModalProps) {
  const {
    modalProps,
    onCancel,
    onConfirm,
    onValueChange,
    numberInputProps,
    locationInputProps,
  } = props;
  const [values, setValues] =
    useState<AddItemToInventoryModalValues>(INITIAL_VALUES);
  const isLocationInputVisible =
    locationInputProps?.isVisible === true ||
    locationInputProps?.isVisible == null;
  const isNumberInputVisible =
    numberInputProps?.isVisible === true || numberInputProps?.isVisible == null;

  const onCancelLocal = useCallback(() => {
    setValues(INITIAL_VALUES);
    onCancel && onCancel();
  }, [onCancel]);

  const onConfirmLocal = useCallback(() => {
    onConfirm && onConfirm(values);
  }, [onConfirm, values]);

  useEffect(() => {
    onValueChange && onValueChange(values);
  }, [onValueChange, values]);

  return (
    <ModalWithBlur
      {...modalProps}
      onCancel={onCancelLocal}
      onConfirm={onConfirmLocal}
      confirmButton={{
        isEnabled: values.location != null && values.number > 0,
        text: 'Add',
      }}
    >
      <Stack minW="90%" maxW="100%" p={4}>
        {isLocationInputVisible ? (
          <View>
            <InputText>
              {locationInputProps?.title || 'Select a Location:'}
            </InputText>
            <InventoryManager
              showList
              showTag={false}
              onChange={(location) => {
                setValues((current) => ({
                  ...current,
                  location,
                }));
              }}
            />
          </View>
        ) : null}
        {isNumberInputVisible ? (
          <NumberInput
            {...numberInputProps}
            onValueChange={(number) => {
              setValues((current) => ({
                ...current,
                number,
              }));
            }}
            onPlusPress={() =>
              setValues((current) => ({
                ...current,
                number: parseInt(current.number as unknown as string, 10) + 1,
              }))
            }
            onMinusPress={() =>
              setValues((current) => ({
                ...current,
                number: parseInt(current.number as unknown as string, 10) - 1,
              }))
            }
            isMinusDisabled={values.number <= 1}
            initialValue={1}
            headingTag={InputText}
            title={numberInputProps?.title || 'Select a Quantity:'}
          />
        ) : null}
      </Stack>
    </ModalWithBlur>
  );
}
