import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { Stack, Input, Row, useTheme, Button } from 'native-base';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { FrequencyInput } from './FrequencyInput';
import { InputText } from './InputText';
import { ItemFormStoreSpecific } from './ItemFormStoreSpecificItems';
import { ThumbnailPicker } from './ThumbnailPicker';
import { UnitInput } from './UnitInput';
import { AbsolutePositionedScreen } from '../AbsolutelyPositionedScreen';
import { Barcode } from '../Barcode';
import { InputValidationMessage } from '../InputValidationMessage';

import {
  AUTO_SAVE_DEBOUNCE_THRESHOLD,
  DEFAULT_IMAGE_INDEX,
  EMPTY_STRING,
  FORM_INTER_ITEM_SPACING,
} from '@/constants/general';
import {
  LOCAL_FILE_REGEX,
  UPC_REGEX,
  UPC_REQUIRED_CHAR_LENGTH,
} from '@/constants/regexs';
import { AddItemsListItemPayload } from '@/state/slices/listsSlice';
import {
  Item,
  ItemWithStoreSpecificValues,
  Key,
  StoreSpecificValueKey,
  StoreSpecificValues,
} from '@/types/Item';
import { Store } from '@/types/Store';
import { ItemProp, ItemsProp, OriginalKeyProp } from '@/types/general';
import {
  deleteFile,
  displayAlert,
  getFrequencyValue,
  getKeyToUse,
} from '@/utils/helpers';

type ItemFormValdation = {
  isValid: boolean;
  message: string;
};

export type ItemFormOnSave = {
  hasKeyChanged: boolean;
} & AddItemsListItemPayload;

type ItemFormData = {
  selectedUrl: string;
} & Required<Pick<Item, 'name' | 'upc'>>;

export type ItemFormProps = {
  autoSave?: boolean;
  itemInList?: Item | null;
  canOverrideItem?: boolean;
  currentStore?: Store;
  onClose: () => void;
  onSave: (onSavePayload: ItemFormOnSave) => void;
  showOverrideMsgInitial?: boolean;
  shouldFocusFirstField?: boolean;
  shouldAddQuantity?: boolean;
  shouldAddToCart?: boolean;
} & Partial<ItemProp<ItemWithStoreSpecificValues>> &
  ItemsProp<Item> &
  OriginalKeyProp;

export function ItemForm(props: ItemFormProps) {
  const {
    autoSave = false,
    canOverrideItem,
    currentStore,
    item,
    items,
    itemInList,
    onClose,
    onSave,
    originalKey,
    shouldAddQuantity = false,
    shouldAddToCart = false,
    shouldFocusFirstField = true,
    showOverrideMsgInitial = true,
  } = props;

  const theme = useTheme();

  const barcodeModalRef = useRef<BottomSheetModalMethods>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const itemToUse = useMemo(
    () => ({ ...(itemInList || item || ({} as Item)) }),
    [item, itemInList],
  ) as ItemWithStoreSpecificValues;

  const [showOverrideMsg, setShowOverrideMsg] = useState(
    showOverrideMsgInitial,
  );
  const [formData, setFormData] = useState<ItemFormData>({
    upc: itemToUse?.upc || EMPTY_STRING,
    name: itemToUse?.name || EMPTY_STRING,
    selectedUrl: itemToUse?.images[itemToUse?.imageToUseIndex] || EMPTY_STRING,
  });
  const frequencyInMsRef = useRef<number>(itemToUse?.frequency || -1);
  const unitRef = useRef<string>(EMPTY_STRING);
  const lastSavedKeyRef = useRef<string>(EMPTY_STRING);
  const autoSaveTimeoutRef = useRef<any>();
  const isUpcValid = useMemo(
    () =>
      formData.upc?.length === 0 ||
      !!UPC_REGEX.test(formData.upc || EMPTY_STRING),
    [formData.upc],
  );
  const storeSpecificValuesRef = useRef<StoreSpecificValues>(null);
  const formValidation: ItemFormValdation = useMemo(() => {
    const isValid = !!formData.name;
    return {
      isValid,
      message: isValid ? EMPTY_STRING : 'Please enter a name',
    };
  }, [isUpcValid, formData.upc, formData.name]);
  const customImagesToDeleteOnUnloadRef = useRef<string[]>([]);
  const shouldDeleteLastImageRef = useRef(true);
  const isProposedItemPresent = useMemo(
    () =>
      getIsItemAlreadyPresent(
        items,
        formData.upc || EMPTY_STRING,
        formData.name || EMPTY_STRING,
        originalKey,
      ),
    [items, formData.upc, formData.name, originalKey],
  );
  const keyBeingOverriden = useMemo(
    () => formData.upc || formData.name,
    [formData.upc, formData.name],
  );
  const fieldBeingUsedInKey = useMemo(() => {
    return formData.upc && formData.upc.trim().length > 0 ? 'upc' : 'name';
  }, [formData.upc]);
  const isSavingDisabled = useMemo(
    () =>
      !formValidation.isValid ||
      !formData.name ||
      (!canOverrideItem && isProposedItemPresent),
    [
      formData.name,
      formValidation.isValid,
      canOverrideItem,
      isProposedItemPresent,
    ],
  );

  const onClosePress = useCallback(() => {
    shouldDeleteLastImageRef.current = true;
    onClose && onClose();
  }, [onClose, shouldDeleteLastImageRef]);

  const onSavePress = useCallback(
    (shouldClose = true) => {
      const now = Date.now();
      const itemToSave = {
        frequency: frequencyInMsRef.current,
        unit: unitRef.current,
        images: itemToUse?.images || [],
        imageToUseIndex:
          itemToUse?.images.findIndex((image) => {
            return image === formData.selectedUrl;
          }) || DEFAULT_IMAGE_INDEX,
        name: formData.name,
        upc: formData.upc,
        addedDate: itemToUse?.addedDate || now,
        lastUpdatedDate: now,
      } as Item;

      if (!itemToSave.images.includes(formData.selectedUrl)) {
        itemToSave.images = [...itemToSave.images, formData.selectedUrl];
        itemToSave.imageToUseIndex = itemToSave.images.length - 1;
      }

      shouldDeleteLastImageRef.current = false;

      const storeSpecificValuesToUse = {
        ...storeSpecificValuesRef.current,
        [StoreSpecificValueKey.IsInCart]: {
          ...storeSpecificValuesRef.current?.[StoreSpecificValueKey.IsInCart],
          [currentStore?.name || EMPTY_STRING]: shouldAddToCart,
        },
      } as StoreSpecificValues;

      const originalKeyToUse =
        (lastSavedKeyRef.current
          ? { upc: lastSavedKeyRef.current }
          : originalKey) || EMPTY_STRING;
      const lastSaveKey = getKeyToUse(originalKeyToUse);
      const currentKey = getKeyToUse(itemToSave);
      onSave &&
        onSave({
          item: itemToSave,
          storeSpecificValues: storeSpecificValuesToUse,
          currentStore,
          originalKey: originalKeyToUse,
          hasKeyChanged: currentKey !== lastSaveKey,
        });
      shouldClose && onClose && onClose();
    },
    [
      currentStore,
      formData,
      frequencyInMsRef,
      itemToUse,
      lastSavedKeyRef,
      onClose,
      onSave,
      originalKey,
      shouldAddToCart,
      shouldDeleteLastImageRef,
      storeSpecificValuesRef,
      unitRef,
    ],
  );

  const handleAutoSave = useCallback(() => {
    clearInterval(autoSaveTimeoutRef.current);
    if (!autoSave || isSavingDisabled) return;

    const key = getKeyToUse(formData);

    autoSaveTimeoutRef.current = setTimeout(() => {
      if (!key) return;
      onSavePress(false);
    }, AUTO_SAVE_DEBOUNCE_THRESHOLD);

    return () => {
      clearInterval(autoSaveTimeoutRef.current);
    };
  }, [autoSave, isSavingDisabled, autoSaveTimeoutRef, formData, onSavePress]);

  const onFrequencyChange = useCallback(
    (frequencyInMs: number) => {
      frequencyInMsRef.current = frequencyInMs;
      handleAutoSave();
    },
    [frequencyInMsRef, handleAutoSave],
  );

  const onItemSpecificValueChange = useCallback(
    (storeSpecificValuesLocal: StoreSpecificValues) => {
      storeSpecificValuesRef.current = storeSpecificValuesLocal;
      handleAutoSave();
    },
    [storeSpecificValuesRef, handleAutoSave],
  );

  const onUnitChange = useCallback(
    (unit: string) => {
      unitRef.current = unit;
      handleAutoSave();
    },
    [handleAutoSave],
  );

  //handle deleting images
  useEffect(() => {
    if (shouldFocusFirstField) {
      nameRef.current?.focus();
    }

    return () => {
      for (
        let index = 0;
        index < customImagesToDeleteOnUnloadRef.current.length;
        index++
      ) {
        const imageUrl = customImagesToDeleteOnUnloadRef.current[index];
        if (
          index === customImagesToDeleteOnUnloadRef.current.length - 1 &&
          shouldDeleteLastImageRef.current === false
        )
          break;
        deleteFile(imageUrl);
      }
    };
  }, []);

  useEffect(() => {
    handleAutoSave();
  }, [formData]);

  return (
    <AbsolutePositionedScreen
      absolutelyPositionedJsx={
        <>
          <Row space={3}>
            {!autoSave ? (
              <Button
                isDisabled={isSavingDisabled}
                flex={1}
                onPress={() => onSavePress()}
              >
                Save
              </Button>
            ) : null}
            <Button flex={1} onPress={onClosePress}>
              Close
            </Button>
          </Row>
          <InputValidationMessage
            isValid={formValidation.isValid}
            message={formValidation.message}
          />
          <InputValidationMessage
            isValid={!showOverrideMsg || !isProposedItemPresent}
            message={
              canOverrideItem
                ? `An item with the ${fieldBeingUsedInKey} of '${keyBeingOverriden}' is already in the list and will be overriden.`
                : `Please enable overriding items or remove the item with ${fieldBeingUsedInKey} of '${keyBeingOverriden}'`
            }
          />
        </>
      }
    >
      <Stack mt={theme.space[FORM_INTER_ITEM_SPACING]}>
        <InputText>Name</InputText>
        <Input
          ref={nameRef}
          variant="outline"
          p={theme.space[1]}
          placeholder="Product Name"
          value={formData.name}
          onChangeText={(newText) => {
            setFormData((current) => ({
              ...current,
              name: newText,
            }));
            setShowOverrideMsg(true);
          }}
          isInvalid={formData.name.length <= 0}
        />
      </Stack>
      <Stack>
        <InputText>Upc</InputText>
        <Row>
          <Input
            flex={1}
            variant="outline"
            keyboardType="numeric"
            p={theme.space[1]}
            placeholder="UPC Code"
            value={formData.upc}
            onChangeText={(newText) => {
              setFormData((current) => ({
                ...current,
                upc: newText,
              }));
              setShowOverrideMsg(true);
            }}
            isInvalid={
              !UPC_REGEX.test(formData.upc || EMPTY_STRING) &&
              formData.upc.length !== 0
            }
            InputRightElement={
              <Barcode
                ref={barcodeModalRef}
                style={{ marginRight: theme.space[2] }}
                onPress={() => barcodeModalRef.current?.present()}
                onScannedValue={(upc) => {
                  if (!upc) {
                    displayAlert({
                      msg: 'Invalid Upc',
                      upc,
                    });
                  }
                  setFormData((current) => ({
                    ...current,
                    upc,
                  }));
                }}
                size={37}
              />
            }
          />
        </Row>
        <InputValidationMessage
          isValid={isUpcValid}
          message={`Must be ${UPC_REQUIRED_CHAR_LENGTH} or ${UPC_REQUIRED_CHAR_LENGTH + 1} numbers (currently ${formData.upc.length})`}
        />
      </Stack>
      <Stack mt={theme.space[FORM_INTER_ITEM_SPACING]}>
        <InputText>Image</InputText>
        <Input
          variant="outline"
          p={theme.space[1]}
          placeholder="Thumbnail Image Url"
          value={formData.selectedUrl}
        />
        <ThumbnailPicker
          spacing={theme.space[FORM_INTER_ITEM_SPACING]}
          selectedUrl={formData.selectedUrl}
          onSelectImage={(url, isCustomImage) => {
            if (isCustomImage) {
              customImagesToDeleteOnUnloadRef.current.push(url);
              if (!itemToUse) return;

              itemToUse.images = itemToUse?.images.filter((imageUrl) => {
                const shouldKeep = !imageUrl?.match(LOCAL_FILE_REGEX);
                if (!shouldKeep) {
                  deleteFile(imageUrl);
                }
                return shouldKeep;
              });
              itemToUse?.images.push(url);
            }
            setFormData((current) => ({
              ...current,
              selectedUrl: url,
            }));
          }}
          imagesToRender={new Set(itemToUse?.images)}
        />
      </Stack>
      <FrequencyInput
        onValueChange={onFrequencyChange}
        headingTag={InputText}
        spacing={theme.space[1]}
        initialFrequency={getFrequencyValue(itemToUse?.frequency)}
      />
      <UnitInput
        initialValue={itemToUse?.unit}
        onValueChange={onUnitChange}
        headingTag={InputText}
        spacing={theme.space[FORM_INTER_ITEM_SPACING]}
      />
      <ItemFormStoreSpecific
        item={itemToUse}
        onValueChange={onItemSpecificValueChange}
        shouldAddQuantity={shouldAddQuantity}
      />
    </AbsolutePositionedScreen>
  );
}

function getIsItemAlreadyPresent(
  items: Item[],
  upcValue: string,
  name: string,
  originalKey: Key,
) {
  const originalKeyToUse = getKeyToUse(originalKey);
  if (
    (!upcValue && !name) ||
    originalKeyToUse === name ||
    originalKeyToUse === upcValue
  )
    return false;
  return !!items.find((item) => {
    const key = getKeyToUse(item);
    return key === (upcValue ? upcValue.trim() : name);
  });
}
