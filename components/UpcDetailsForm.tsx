import { Checkbox } from 'expo-checkbox'
import {
  Stack,
  FormControl,
  Input,
  Row,
  useTheme,
  Text,
  Column,
  Button,
} from 'native-base'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { FrequencyInput } from './FrequencyInput'
import { InputValidationMessage } from './InputValidationMessage'
import { ThumbnailPicker } from './ThumbnailPicker'

import { EMPTY_STRING } from '@/constants/general'
import { UPC_REGEX, UPC_REQUIRED_CHAR_LENGTH } from '@/constants/regexs'
import { maxWidthCentered } from '@/constants/styles'
import { upcProductToDisplaySelector } from '@/state/slices/generalSlice'
import {
  addItemsListItem,
  itemsListItemSelector,
} from '@/state/slices/listsSlice'
import { UpcProduct } from '@/types/UpcResponse'
import { getKeyToUse, saveImageLocally } from '@/utils/helpers'
import { Keyboard } from 'react-native'

type UpcDetailsFormValdation = {
  isValid: boolean
  message: string
}

type UpcDetailsFormProps = {
  onClose: () => void
}

function getProductNameValue(upcProduct: UpcProduct) {
  if (!upcProduct.brands && !upcProduct.product_name) return EMPTY_STRING
  return `${upcProduct.brands} - ${upcProduct.product_name}` || EMPTY_STRING
}

function getUpcValue(upcProduct: UpcProduct) {
  return upcProduct.code || upcProduct.id || EMPTY_STRING
}

const SHOULD_SAVE_TO_DEVICE_INITIAL = true

/**
 *NOTE: Be sure to update and new POS in the useEffect below
 **/
export function UpcDetailsForm(props: UpcDetailsFormProps) {
  const { onClose } = props
  const dispatch = useDispatch()
  const theme = useTheme()
  const upcProduct = useSelector(upcProductToDisplaySelector)
  const upcFromUpcProduct = useMemo(() => getUpcValue(upcProduct), [upcProduct])
  const nameFromUpcProduct = useMemo(() => getProductNameValue(upcProduct), [upcProduct])
  const keyToUse = useMemo(() => getKeyToUse({ name: nameFromUpcProduct, upc: upcFromUpcProduct }, false), [nameFromUpcProduct, upcFromUpcProduct])
  const itemInList = useSelector(itemsListItemSelector(keyToUse))
  const itemInListUsingName = useSelector(itemsListItemSelector(nameFromUpcProduct))
  const [selectedUrl, setSelectedUrl] = useState(EMPTY_STRING)
  const [upcValue, setUpcValue] = useState(itemInList?.upc || upcFromUpcProduct);
  const [productNameValue, setProductNameValue] = useState(itemInList?.name || nameFromUpcProduct);
  const [shouldSaveToDevice, setShouldSaveToDevice] = useState(
    SHOULD_SAVE_TO_DEVICE_INITIAL,
    )
  const frequencyInMsRef = useRef<number>(-1)
  const isUpcValid = useMemo(
    () => upcValue.length === 0 || !!UPC_REGEX.test(upcValue || EMPTY_STRING),
    [upcValue],
  )
  const formValidation: UpcDetailsFormValdation = useMemo(() => {
    const isValid = (isUpcValid && upcFromUpcProduct.length > 0) || !!productNameValue
    return {
      isValid,
      message: isValid
        ? ''
        : 'Either a Upc or a Name must be given for each item.',
    }
  }, [isUpcValid, productNameValue])

  async function onSavePress() {
    const itemToSave = {
      frequency: frequencyInMsRef.current,
      imageUri: selectedUrl || EMPTY_STRING,
      name: productNameValue,
      upc: upcValue,
    }
    dispatch(addItemsListItem(itemToSave))
    onClose && onClose()
  }

  useLayoutEffect(() => {
    Keyboard.dismiss();
  }, [upcProduct, itemInList])

  /**
   *Need to load the new values when upcProduct changes
   **/
  useEffect(() => {
    setProductNameValue(nameFromUpcProduct)
    setUpcValue(upcFromUpcProduct)
  }, [upcProduct])

  useEffect(() => {
    setUpcValue(itemInList?.upc || upcFromUpcProduct)
    setProductNameValue(itemInList?.name || nameFromUpcProduct)
    setSelectedUrl(itemInList?.imageUri || EMPTY_STRING)
  }, [itemInList, upcProduct])

  return (
    <FormControl {...maxWidthCentered}>
      <Stack>
        <Column space={theme.space[1]} m={theme.space[1]}>
          <Stack flex={1}>
            <FormControl.Label>Upc</FormControl.Label>
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
              message={`Must be ${UPC_REQUIRED_CHAR_LENGTH} numbers (currently ${upcValue.length} chars)`}
            />
          </Stack>
          <Stack flex={1}>
            <FormControl.Label>Name</FormControl.Label>
            <Input
              variant="outline"
              p={theme.space[1]}
              placeholder="Product Name"
              value={productNameValue}
              onChangeText={(newText) => setProductNameValue(newText)}
              isInvalid={productNameValue.length <= 0}
            />
          </Stack>
          <Stack space={theme.space[1]}>
            <FormControl.Label>Image</FormControl.Label>
            <Input
              variant="outline"
              p={theme.space[1]}
              placeholder="Thumbnail Image Url"
              value={selectedUrl}
            />
            <Row
              space={theme.space[1]}
              alignItems="center"
              onTouchStart={() => setShouldSaveToDevice((current) => !current)}
            >
              <Checkbox
                value={shouldSaveToDevice}
                color={
                  shouldSaveToDevice ? theme.colors.primary[900] : undefined
                }
              />
              <Text>Save thumbnail to device?</Text>
            </Row>
            <ThumbnailPicker
              selectedUrl={selectedUrl}
              setSelectedUrl={setSelectedUrl}
              upcProduct={upcProduct}
            />
          </Stack>
          <FrequencyInput
            onValueChange={(frequencyInMs) => {
              frequencyInMsRef.current = frequencyInMs
            }}
            headingTag={FormControl.Label}
          />
          <Row space={1}>
            <Button
              isDisabled={!formValidation.isValid}
              flex={1}
              onPress={onSavePress}
            >
              Save
            </Button>
            <Button flex={1} onPress={() => onClose && onClose()}>
              Close
            </Button>
          </Row>
          <InputValidationMessage
            isValid={formValidation.isValid}
            message={formValidation.message}
          />
          <InputValidationMessage
            isValid={!upcValue ? !itemInListUsingName : !itemInList}
            message={`An item with the key of '${upcValue && productNameValue ? keyToUse : !upcValue && productNameValue ? productNameValue : upcValue}' is already in the list and will be overriden.`}
          />
        </Column>
      </Stack>
    </FormControl>
  )
}



