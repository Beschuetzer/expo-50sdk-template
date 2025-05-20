import {
  BottomSheetMethods,
  BottomSheetModalMethods,
} from '@gorhom/bottom-sheet/lib/typescript/types';
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
} from 'react';

import {
  BottomSheetModalWithFixedHeader,
  BottomSheetModalWithFixedHeaderProps,
} from '../BottomSheetModalWithFixedHeader';
import { ItemForm } from '../forms/ItemForm';

import { EMPTY_NUMBER, EMPTY_STRING } from '@/constants/general';
import {
  currentStoreSelector,
  itemsListSelector,
  storeSpecificValuesMapSelector,
} from '@/state/slices/listsSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';
import { saveItem } from '@/state/thunks';
import { ItemFormOnSave, ItemFormProps } from '@/types/itemForm';

type ItemFormSheetProps = {
  bottomSheetProps?: Omit<
    Partial<BottomSheetModalWithFixedHeaderProps>,
    'title'
  >;
  item: ItemFormProps['item'];
  itemFormProps?: Partial<ItemFormProps>;
  title: string;
};

export const ItemFormSheet = forwardRef<BottomSheetMethods, ItemFormSheetProps>(
  (props, ref) => {
    const { title, bottomSheetProps, itemFormProps, item } = props;
    const { onSave } = itemFormProps || ({} as ItemFormProps);
    const { onSubmit, onClose } =
      bottomSheetProps || ({} as BottomSheetModalWithFixedHeaderProps);
    const innerRef = useRef<BottomSheetModalMethods>(null);
    useImperativeHandle(ref, () => innerRef.current as BottomSheetModalMethods);
    const dispatch = useAppDispatch();
    const itemsList = useAppSelector(itemsListSelector);
    const storeSpecificValuesMap = useAppSelector(
      storeSpecificValuesMapSelector,
    );
    const currentStore = useAppSelector(currentStoreSelector);
    const currentSavePayloadRef = useRef<ItemFormOnSave>({} as ItemFormOnSave);

    const onCloseLocal = useCallback(() => {
      onClose && onClose();
      innerRef.current?.close();
    }, [onClose]);

    const onSubmitLocal = useCallback(() => {
      onSubmit && onSubmit();
      innerRef.current?.close();
      dispatch(saveItem(currentSavePayloadRef.current));
    }, [onSubmit, innerRef.current, dispatch]);

    const onSaveLocal = useCallback(
      (onSavePayload: ItemFormOnSave) => {
        currentSavePayloadRef.current = onSavePayload;
        onSave && onSave(onSavePayload);
      },
      [onSave],
    );

    return (
      <BottomSheetModalWithFixedHeader
        useFullscreen
        {...bottomSheetProps}
        ref={innerRef}
        title={title}
        onSubmit={onSubmitLocal}
        onClose={onCloseLocal}
        // submitButton={{
        //   validation: newItemValidation,
        //   isEnabled: newItemValidation.isValid,
        //   text: 'Save',
        // }}
        closeButton={{
          text: 'Cancel',
        }}
      >
        <ItemForm
          hideStoreManagerRow
          showContentOnly
          shouldFocusFirstField
          autoSave
          autoSaveOverride
          initialQuantity={EMPTY_NUMBER}
          autoSaveDebounce={EMPTY_NUMBER}
          storeSpecificValuesMap={storeSpecificValuesMap}
          items={itemsList.data}
          originalKey={{ name: EMPTY_STRING }}
          canOverrideItem={false}
          currentStore={currentStore}
          onSave={onSaveLocal}
          item={item}
        />
      </BottomSheetModalWithFixedHeader>
    );
  },
);
