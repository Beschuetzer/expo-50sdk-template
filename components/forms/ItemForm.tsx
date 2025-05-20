import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import _ from 'lodash';
import { Stack, Input, Row, useTheme, Button } from 'native-base';
import React, {
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import CheckboxInput from './CheckboxInput';
import { DurationInput } from './DurationInput';
import { InputText } from './InputText';
import { ItemFormStoreSpecific } from './ItemFormStoreSpecificItems';
import { NumberInput } from './NumberInput';
import { ThumbnailPicker } from './ThumbnailPicker';
import { UnitInput } from './UnitInput';
import { AbsolutePositionedScreen } from '../AbsolutelyPositionedScreen';
import { InputValidationMessage } from '../InputValidationMessage';
import { BarcodeScannerModal } from '../modals/BarcodeScannerModal';
import { ALLOW_OVERRIDE_WHEN_SAME_UPC_MESSAGE } from '../options/CanCreateMultipleItemsWithSameUpcToggle';

import {
  AUTO_SAVE_DEBOUNCE_THRESHOLD,
  DEFAULT_IMAGE_INDEX,
  EMPTY_NUMBER,
  EMPTY_STRING,
  FORM_INTER_ITEM_SPACING,
  INVENTORY_MINIMUM_DEFAULT,
  IS_FROZEN_DEFAULT,
  TIME_TO_EXPIRATION_DEFAULT,
} from '@/constants/general';
import { UPC_REGEX, UPC_REQUIRED_CHAR_LENGTH } from '@/constants/regexs';
import {
  Item,
  ItemWithStoreSpecificValues,
  Key,
  StoreSpecificValueKey,
  StoreSpecificValues,
  StoreSpecificValuesMap,
} from '@/types/Item';
import {
  ItemFormProps,
  ItemFormData,
  ItemFormValdation,
} from '@/types/itemForm';
import {
  deleteFile,
  displayAlert,
  getEmptyItem,
  getDurationValue,
  getId,
  getItemValidation,
  getKeyToUse,
  sanitize,
} from '@/utils/helpers';
import { iterateStoreSpecificValuesMap } from '@/utils/iterateStoreSpecificValuesMap';

export function ItemForm(props: ItemFormProps) {
  const {
    autoSave = false,
    autoSaveDebounce = AUTO_SAVE_DEBOUNCE_THRESHOLD,
    autoSaveOverride = false,
    canOverrideItem,
    currentStore,
    hideStoreManagerRow,
    initialQuantity = 0,
    item,
    items,
    itemInList,
    onClose,
    onDeleteImage,
    onSave,
    originalKey,
    showContentOnly = false,
    shouldAddToCart = false,
    shouldFocusFirstField = true,
    showOverrideMsgInitial = true,
    storeManagerProps,
    storeSpecificValuesMap,
  } = props;

  const theme = useTheme();

  const barcodeModalRef = useRef<BottomSheetModalMethods>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const itemToUse = useMemo(
    () => ({ ...(itemInList || item || getEmptyItem()) }),
    [item, itemInList],
  ) as ItemWithStoreSpecificValues;

  const [showOverrideMsg, setShowOverrideMsg] = useState(
    showOverrideMsgInitial,
  );
  const [formData, setFormData] = useState<ItemFormData>({
    _id: itemToUse._id || EMPTY_STRING,
    upc: itemToUse?.upc || EMPTY_STRING,
    name: itemToUse?.name || EMPTY_STRING,
    selectedUrl:
      itemToUse?.images?.[itemToUse?.imageToUseIndex] || EMPTY_STRING,
  });

  const isFrozenRef = useRef<boolean>(itemToUse?.isFrozen || IS_FROZEN_DEFAULT);
  const inventoryMinimumRef = useRef<number>(
    itemToUse?.inventoryMinimum || INVENTORY_MINIMUM_DEFAULT,
  );
  const timeToExpirationRef = useRef<number>(itemToUse?.timeToExpiration || -1);
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
  const imagesToSaveRef = useRef<string[]>([]);
  const initialImages = useMemo(() => itemToUse?.images || [], [itemToUse]);
  const formValidation: ItemFormValdation = useMemo(
    () => getItemValidation(formData),
    [formData],
  );
  const customImagesToDeleteOnUnloadRef = useRef<string[]>([]);
  const shouldDeleteLastImageRef = useRef(true);
  const isProposedItemPresent = useMemo(
    () => getIsItemAlreadyPresent(items, itemInList, formData, originalKey),
    [items, itemInList, formData, originalKey],
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
      const foundIndex =
        imagesToSaveRef.current?.findIndex((image) => {
          return image === formData.selectedUrl;
        }) || -1;
      const now = Date.now();
      const itemToSave = {
        ...itemInList,
        ...formData,
        inventoryMinimum: inventoryMinimumRef.current,
        isFrozen: isFrozenRef.current,
        timeToExpiration: timeToExpirationRef.current,
        frequency: frequencyInMsRef.current,
        unit: unitRef.current,
        images: imagesToSaveRef.current,
        imageToUseIndex: foundIndex >= 0 ? foundIndex : DEFAULT_IMAGE_INDEX,
        addedDate: itemToUse?.addedDate || now,
        lastUpdatedDate: now,
      } as Item;

      const storeSpecificValuesToUse = {
        ...storeSpecificValuesRef.current,
        [StoreSpecificValueKey.IsInCart]: {
          ...storeSpecificValuesRef.current?.[StoreSpecificValueKey.IsInCart],
          [getKeyToUse(currentStore || EMPTY_STRING)]: shouldAddToCart,
        },
      } as StoreSpecificValues;

      //Detering if item needs saving
      itemToSave.needsSaving = true;
      if (itemInList) {
        const areItemsEqual = _.isEqual(
          {
            ...itemToSave,
            ...getStandardizedItemValuesForComparison(),
          } as Item,
          {
            ...itemInList,
            ...getStandardizedItemValuesForComparison(),
          } as Item,
        );

        const itemInListStoreSpecificValues =
          storeSpecificValuesMap[getKeyToUse(itemInList)];

        let areStoreSpecificValuesEqual = true;
        iterateStoreSpecificValuesMap({
          storeSpecificValuesMap: {
            [getKeyToUse(itemToSave)]: storeSpecificValuesToUse,
          } as StoreSpecificValuesMap,
          onNewStoreValue: ({
            storeSpecificValueKey,
            storeKey,
            storeValue,
          }) => {
            const originalValue = (itemInListStoreSpecificValues as any)?.[
              storeSpecificValueKey
            ]?.[storeKey];
            if (originalValue !== storeValue) {
              areStoreSpecificValuesEqual = false;
            }
          },
        });

        itemToSave.needsSaving =
          itemInList.needsSaving ||
          !areItemsEqual ||
          !areStoreSpecificValuesEqual;
      }

      // if (!itemToSave.images?.includes(formData?.selectedUrl)) {
      //   onCustomImageChange &&
      //     onCustomImageChange(formData.selectedUrl, itemToUse.images);
      // }

      //ensure id present
      if (!itemToSave._id) {
        itemToSave._id = getId();
      }

      shouldDeleteLastImageRef.current = false;

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
          originalKey: originalKeyToUse,
          hasKeyChanged: currentKey !== lastSaveKey,
        });
      shouldClose && onClose && onClose();
    },
    [
      currentStore,
      formData,
      timeToExpirationRef,
      frequencyInMsRef,
      imagesToSaveRef,
      inventoryMinimumRef,
      isFrozenRef,
      itemToUse,
      itemInList,
      lastSavedKeyRef,
      onClose,
      onDeleteImage,
      onSave,
      originalKey,
      shouldAddToCart,
      shouldDeleteLastImageRef,
      storeSpecificValuesRef,
      storeSpecificValuesMap,
      unitRef,
    ],
  );

  const handleAutoSave = useCallback(() => {
    clearInterval(autoSaveTimeoutRef.current);
    if (!autoSave || (!autoSaveOverride && isSavingDisabled)) return;

    const key = getKeyToUse(formData);

    autoSaveTimeoutRef.current = setTimeout(() => {
      if (!key && !autoSaveOverride) return;
      onSavePress(false);
    }, autoSaveDebounce);

    return () => {
      clearInterval(autoSaveTimeoutRef.current);
    };
  }, [autoSave, isSavingDisabled, autoSaveTimeoutRef, formData, onSavePress]);

  const onRefValueChange = useCallback(
    <T,>(newValue: T, timeSpanRef: MutableRefObject<T>) => {
      timeSpanRef.current = newValue;
      handleAutoSave();
    },
    [handleAutoSave],
  );

  const onItemSpecificValueChange = useCallback(
    (storeSpecificValuesLocal: StoreSpecificValues) => {
      storeSpecificValuesRef.current = storeSpecificValuesLocal;
      handleAutoSave();
    },
    [storeSpecificValuesRef, handleAutoSave],
  );

  const onSelectImage = useCallback(
    (url: string, isCustomImage: boolean) => {
      handleAutoSave();
      setFormData((current) => ({
        ...current,
        selectedUrl: url,
      }));
    },
    [handleAutoSave],
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
      setTimeout(() => {
        nameRef.current?.focus();
      }, EMPTY_NUMBER);
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

  const contentJSX = (
    <>
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
              name: sanitize(newText),
            }));
            setShowOverrideMsg(true);
          }}
          isInvalid={formData.name.length <= 0}
        />
      </Stack>
      <Stack mt={theme.space[FORM_INTER_ITEM_SPACING]}>
        <InputText>Upc</InputText>
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
            <BarcodeScannerModal
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
          onSelectImage={onSelectImage}
          onChange={(images) => {
            imagesToSaveRef.current = images;
            handleAutoSave();
          }}
          onDeleteImage={onDeleteImage}
          selectedIndex={itemToUse.imageToUseIndex}
          initialImages={initialImages}
        />
      </Stack>
      <DurationInput
        title="Time Until Expiration"
        onValueChange={(newValue) =>
          onRefValueChange(newValue, timeToExpirationRef)
        }
        headingTag={InputText}
        spacing={theme.space[1]}
        initialDuration={getDurationValue(
          itemToUse?.timeToExpiration || TIME_TO_EXPIRATION_DEFAULT,
        )}
      />
      <Stack mt={theme.space[FORM_INTER_ITEM_SPACING]}>
        <NumberInput
          initialValue={inventoryMinimumRef.current}
          title="Inventory Minimum"
          headingTag={InputText}
          onMinusPress={() => {
            inventoryMinimumRef.current = inventoryMinimumRef.current - 1;
          }}
          onPlusPress={() => {
            inventoryMinimumRef.current = inventoryMinimumRef.current + 1;
          }}
          onValueChange={(newValue) => {
            onRefValueChange(
              Math.max(newValue, EMPTY_NUMBER),
              inventoryMinimumRef,
            );
          }}
        />
      </Stack>
      <CheckboxInput
        initialValue={isFrozenRef.current}
        label="Is Frozen"
        onValueChange={(newValue) => {
          onRefValueChange(newValue, isFrozenRef);
        }}
        rowProps={{
          mt: theme.space[FORM_INTER_ITEM_SPACING] * 2,
        }}
      />
      <DurationInput
        title="Frequency"
        subTitle="Next expected purchase time:"
        onValueChange={(newValue) =>
          onRefValueChange(newValue, frequencyInMsRef)
        }
        headingTag={InputText}
        spacing={theme.space[1]}
        initialDuration={getDurationValue(itemToUse?.frequency)}
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
        initialQuantity={initialQuantity}
        storeManagerProps={storeManagerProps}
        hideStoreManagerRow={hideStoreManagerRow}
      />
    </>
  );

  if (showContentOnly) return contentJSX;
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
                : `The ${fieldBeingUsedInKey} '${keyBeingOverriden}' is currently in use.  You can enable '${ALLOW_OVERRIDE_WHEN_SAME_UPC_MESSAGE}' in the options menu, but this may result in unexpected behavior when trying to use the scanner.`
            }
          />
        </>
      }
    >
      {contentJSX}
    </AbsolutePositionedScreen>
  );
}

function getIsItemAlreadyPresent(
  items: ItemFormProps['items'],
  itemInList: ItemFormProps['itemInList'],
  formData: ItemFormData,
  originalKey: Key,
) {
  const originalKeyToUse = getKeyToUse(originalKey);
  if (
    (originalKey._id === formData._id && formData.upc === itemInList?.upc) ||
    (!formData.upc && !formData.name) ||
    originalKeyToUse === formData.name ||
    originalKeyToUse === formData.upc
  )
    return false;
  const toReturn = !!items.find((item) => {
    const key = item.upc || item.name;
    return key === (formData.upc ? formData.upc.trim() : formData.name);
  });
  return toReturn;
}

/**
 *This returns an item with values that don't need to be compared
 **/
function getStandardizedItemValuesForComparison() {
  return {
    needsSaving: false,
    addedDate: 0,
    lastUpdatedDate: 0,
  } as Partial<Item>;
}
