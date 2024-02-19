import { Stack, Input, Row, useTheme, Button } from 'native-base'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { FrequencyInput } from './FrequencyInput'
import { InputText } from './InputText'
import { ItemFormStoreSpecific } from './ItemFormStoreSpecificItems'
import { ThumbnailPicker } from './ThumbnailPicker'
import { UnitInput } from './UnitInput'
import { AbsolutePositionedScreen } from '../AbsolutelyPositionedScreen'
import { InputValidationMessage } from '../InputValidationMessage'
import { StoreManager } from '../StoreManager'

import {
  DEFAULT_IMAGE_INDEX,
  EMPTY_STRING,
  FORM_INTER_ITEM_SPACING,
} from '@/constants/general'
import {
  LOCAL_FILE_REGEX,
  UPC_REGEX,
  UPC_REQUIRED_CHAR_LENGTH,
} from '@/constants/regexs'
import { AddItemsListItemPayload } from '@/state/slices/listsSlice'
import { Item, StoreSpecificValues } from '@/types/Item'
import { Store } from '@/types/Store'
import { ItemProp } from '@/types/general'
import { deleteFile, getFrequencyValue, getKeyToUse } from '@/utils/helpers'

type ItemFormValdation = {
  isValid: boolean
  message: string
}

export type ItemFormProps = {
  itemInListUsingName?: Item | null
  itemInList?: Item | null
  currentStore?: Store
  onClose: () => void
  onSave: (addItemsListItemPayload: AddItemsListItemPayload) => void
  showOverrideMsg?: boolean
  shouldAddQuantity?: boolean
} & Partial<ItemProp>


export function ItemForm(props: ItemFormProps) {
  const {
    currentStore,
    item,
    itemInList,
    itemInListUsingName,
    onClose,
    onSave,
    shouldAddQuantity = false,
    showOverrideMsg = true,
  } = props
  const theme = useTheme()
  const keyToUse = useMemo(
    () =>
      getKeyToUse(
        { name: item?.name || EMPTY_STRING, upc: item?.upc || EMPTY_STRING },
        false,
      ),
    [item],
  )

  const itemToUse = useMemo(
    () => ({ ...(itemInList || item || ({} as Item)) }),
    [item, itemInList],
  )

  const [selectedUrl, setSelectedUrl] = useState(
    itemToUse?.images[itemToUse?.imageToUseIndex] || EMPTY_STRING,
  )
  const [upcValue, setUpcValue] = useState(itemToUse?.upc || EMPTY_STRING)
  const [productNameValue, setProductNameValue] = useState(
    itemToUse?.name || EMPTY_STRING,
  )
  const frequencyInMsRef = useRef<number>(itemToUse?.frequency || -1)
  const unitRef = useRef<string>(EMPTY_STRING)
  const isUpcValid = useMemo(
    () => upcValue?.length === 0 || !!UPC_REGEX.test(upcValue || EMPTY_STRING),
    [upcValue],
  )
  const storeSpecificValuesRef = useRef<StoreSpecificValues>(null)
  const formValidation: ItemFormValdation = useMemo(() => {
    const isValid = (isUpcValid && upcValue.length > 0) || !!productNameValue
    return {
      isValid,
      message: isValid
        ? EMPTY_STRING
        : "A unique key must be given for each item.  Please enter either a 'Upc' or a 'Name'",
    }
  }, [isUpcValid, upcValue, productNameValue])
  const customImagesToDeleteOnUnloadRef = useRef<string[]>([])
  const shouldDeleteLastImageRef = useRef(true)

  function onClosePress() {
    shouldDeleteLastImageRef.current = true
    onClose && onClose()
  }

  function onSavePress() {
    const now = Date.now()
    const itemToSave = {
      frequency: frequencyInMsRef.current,
      unit: unitRef.current,
      images: itemToUse?.images || [],
      imageToUseIndex:
        itemToUse?.images.findIndex((image) => {
          return image === selectedUrl
        }) || DEFAULT_IMAGE_INDEX,
      name: productNameValue,
      upc: upcValue,
      addedDate: itemToUse?.addedDate || now,
      lastUpdatedDate: now,
    } as Item

    if (!itemToSave.images.includes(selectedUrl)) {
      itemToSave.images.push(selectedUrl)
      itemToSave.imageToUseIndex = itemToSave.images.length - 1
    }

    shouldDeleteLastImageRef.current = false
    onSave &&
      onSave({
        item: itemToSave,
        storeSpecificValues: storeSpecificValuesRef.current,
        currentStore,
      })
    onClose && onClose()
  }

  const onFrequencyChange = useCallback(
    (frequencyInMs: number) => {
      frequencyInMsRef.current = frequencyInMs
    },
    [frequencyInMsRef],
  )

  const onItemSpecificValueChange = useCallback(
    (storeSpecificValuesLocal: StoreSpecificValues) => {
      storeSpecificValuesRef.current = storeSpecificValuesLocal
    },
    [storeSpecificValuesRef],
  )

  const onUnitChange = useCallback((unit: string) => {
    unitRef.current = unit
  }, [])

  useEffect(() => {
    return () => {
      for (
        let index = 0;
        index < customImagesToDeleteOnUnloadRef.current.length;
        index++
      ) {
        const imageUrl = customImagesToDeleteOnUnloadRef.current[index]
        if (
          index === customImagesToDeleteOnUnloadRef.current.length - 1 &&
          shouldDeleteLastImageRef.current === false
        )
          break
        deleteFile(imageUrl)
      }
    }
  }, [])

  return (
    <AbsolutePositionedScreen
      absolutelyPositionedJsx={
        <>
          <Row space={3}>
            <Button
              isDisabled={!formValidation.isValid}
              flex={1}
              onPress={onSavePress}
            >
              Save
            </Button>
            <Button flex={1} onPress={onClosePress}>
              Close
            </Button>
          </Row>
          <InputValidationMessage
            isValid={formValidation.isValid}
            message={formValidation.message}
          />
          <InputValidationMessage
            isValid={
              !showOverrideMsg || !upcValue ? !itemInListUsingName : !itemInList
            }
            message={`An item with the key of '${upcValue && productNameValue ? keyToUse : !upcValue && productNameValue ? productNameValue : upcValue}' is already in the list and will be overriden.`}
          />
        </>
      }
    >
      <Stack>
        <InputText>Upc</InputText>
        <Input
          variant="outline"
          keyboardType="numeric"
          p={theme.space[1]}
          placeholder="UPC Code"
          value={upcValue}
          onChangeText={(newText) => setUpcValue(newText)}
          isInvalid={
            (!UPC_REGEX.test(upcValue || EMPTY_STRING) &&
              upcValue.length !== 0) ||
            productNameValue.length === 0
          }
        />
        <InputValidationMessage
          isValid={isUpcValid}
          message={`Must be ${UPC_REQUIRED_CHAR_LENGTH} or ${UPC_REQUIRED_CHAR_LENGTH + 1} numbers (currently ${upcValue.length})`}
        />
      </Stack>
      <Stack mt={theme.space[FORM_INTER_ITEM_SPACING]}>
        <InputText>Name</InputText>
        <Input
          variant="outline"
          p={theme.space[1]}
          placeholder="Product Name"
          value={productNameValue}
          onChangeText={(newText) => setProductNameValue(newText)}
          isInvalid={productNameValue.length <= 0}
        />
      </Stack>
      <Stack mt={theme.space[FORM_INTER_ITEM_SPACING]}>
        <InputText>Image</InputText>
        <Input
          variant="outline"
          p={theme.space[1]}
          placeholder="Thumbnail Image Url"
          value={selectedUrl}
        />
        <ThumbnailPicker
          spacing={theme.space[FORM_INTER_ITEM_SPACING]}
          selectedUrl={selectedUrl}
          onSelectImage={(url, isCustomImage) => {
            if (isCustomImage) {
              customImagesToDeleteOnUnloadRef.current.push(url)
              if (!itemToUse) return

              itemToUse.images = itemToUse?.images.filter((imageUrl) => {
                const shouldKeep = !imageUrl?.match(LOCAL_FILE_REGEX)
                if (!shouldKeep) {
                  deleteFile(imageUrl)
                }
                return shouldKeep
              })
              itemToUse?.images.push(url)
            }
            setSelectedUrl(url)
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
      <StoreManager showStoreList />
      <ItemFormStoreSpecific
        item={itemToUse}
        onValueChange={onItemSpecificValueChange}
        shouldAddQuantity={shouldAddQuantity}
      />
    </AbsolutePositionedScreen>
  )
}
