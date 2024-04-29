import { FlashList } from '@shopify/flash-list';
import { theme, Button, View } from 'native-base';
import React, { useCallback, useMemo, useState } from 'react';
import { Dimensions } from 'react-native';

import { ModalWithBlur, ModalWithBlurProps } from './ModalWithBlur';
import { ItemTileCopyModal } from '../tiles/ItemTileCopyModal';

import { EMPTY_STRING, FORM_INTER_ITEM_SPACING } from '@/constants/general';

export type CopyModalValues = { [key: string]: unknown };

type CopyValueModalProps = {
  fieldName: string;
  onConfirm: (selectedValue: unknown) => void;
  values: CopyModalValues;
} & Omit<ModalWithBlurProps, 'children' | 'onConfirm' | 'title'>;

export default function CopyValueModal(props: CopyValueModalProps) {
  const { fieldName, onConfirm, onCancel, values } = props;
  const [currentlySelectedKey, setCurrentlySelectedKey] =
    useState<string>(EMPTY_STRING);

  const valuesList = useMemo(() => Object.entries(values || {}), [values]);
  const windowDimensions = useMemo(() => Dimensions.get('window'), []);
  const valueToUse = useMemo(
    () => values[currentlySelectedKey],
    [values, currentlySelectedKey],
  );

  const reset = useCallback(() => {
    setCurrentlySelectedKey(EMPTY_STRING);
  }, []);

  const onConfirmPress = useCallback(() => {
    onConfirm && onConfirm(valueToUse);
    reset();
  }, [onConfirm, reset, valueToUse]);

  const onCancelPress = useCallback(() => {
    onCancel && onCancel();
    reset();
  }, [onCancel, reset]);

  return (
    <ModalWithBlur
      {...props}
      isVisible={valuesList.length > 0}
      confirmButton={{
        isEnabled: !!currentlySelectedKey,
      }}
      onConfirm={onConfirmPress}
      onCancel={onCancelPress}
      title={`Copy ${fieldName}${currentlySelectedKey ? ` (${valueToUse})` : ''}`}
    >
      <View width={windowDimensions.width} flex={1}>
        <FlashList
          renderItem={(item) => {
            const { item: itemToRender } = item;
            const [key, value] = itemToRender;
            return (
              <Button
                key={key}
                mt={theme.space[FORM_INTER_ITEM_SPACING]}
                variant="subtle"
                isDisabled={currentlySelectedKey === key}
                onPress={() => setCurrentlySelectedKey(key)}
                justifyContent="space-between"
              >
                <ItemTileCopyModal itemKey={key} value={String(value)} />
              </Button>
            );
          }}
          estimatedItemSize={117}
          data={Object.entries(values)}
        />
      </View>
    </ModalWithBlur>
  );
}
