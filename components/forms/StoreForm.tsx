import { Stack, FormControl, Input, Row, useTheme, Button } from 'native-base'
import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

import { AbsolutePositionedScreen } from '../AbsolutelyPositionedScreen'
import { InputValidationMessage } from '../InputValidationMessage'

import { EMPTY_STRING, GPS_COORDINATES_DEFAULT } from '@/constants/general'
import { storesListSelector } from '@/state/slices/listsSlice'
import { GpsCoordinate, Store } from '@/types/Store'

type StoreFormValdation = {
  isValid: boolean
  message: string
}

type StoreFormProps = {
  onClose: () => void
  onSave: (store: Store) => void
}

const INTER_ITEM_SPACING = 0.5
export function StoreForm(props: StoreFormProps) {
  const { onClose, onSave } = props
  const theme = useTheme()
  const [storeName, setStoreName] = useState(EMPTY_STRING)
  const [gpsCoordinates, setGpsCoordinates] = useState<GpsCoordinate>({
    ...GPS_COORDINATES_DEFAULT,
  })
  const storesList = useSelector(storesListSelector)

  const formValidation: StoreFormValdation = useMemo(() => {
    const isValid = storeName.length > 0
    return {
      isValid,
      message: isValid ? EMPTY_STRING : 'A store name must be given',
    }
  }, [storeName])

  function onClosePress() {
    onClose && onClose()
  }

  function onSavePress() {
    const itmeToSave = {
      name: storeName,
      gpsCoordinates,
    } as Store
    onSave && onSave(itmeToSave)
    onClose && onClose()
  }

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
            isValid={!storesList[storeName]}
            message={`An store with the key of '${storeName}' is already in the list and will be overriden.`}
          />
        </>
      }
    >
      <Stack mt={theme.space[INTER_ITEM_SPACING]}>
        <FormControl.Label>Name</FormControl.Label>
        <Input
          variant="outline"
          p={theme.space[1]}
          placeholder="Store Name"
          value={storeName}
          onChangeText={(newText) => setStoreName(newText)}
          isInvalid={storeName.length <= 0}
        />
      </Stack>
      <Stack mt={theme.space[INTER_ITEM_SPACING]}>
        <Row alignItems="center">
          <FormControl.Label mr={theme.space[INTER_ITEM_SPACING]}>
            Lat:
          </FormControl.Label>
          <Input
            variant="outline"
            keyboardType="numeric"
            p={theme.space[1]}
            flex={1}
            placeholder="latitude"
            value={gpsCoordinates.lat.toString()}
            onChangeText={(newLat) =>
              setGpsCoordinates((current: GpsCoordinate) => {
                return {
                  ...current,
                  lat: newLat,
                }
              })
            }
            isInvalid={isNaN(parseFloat(gpsCoordinates.lat))}
          />
          <FormControl.Label mx={theme.space[INTER_ITEM_SPACING]}>
            Long:
          </FormControl.Label>
          <Input
            flex={1}
            variant="outline"
            keyboardType="numeric"
            p={theme.space[1]}
            placeholder="longitude"
            value={gpsCoordinates.lon.toString()}
            onChangeText={(newLong) =>
              setGpsCoordinates((current: GpsCoordinate) => {
                return {
                  ...current,
                  lon: newLong,
                }
              })
            }
            isInvalid={isNaN(parseFloat(gpsCoordinates.lon))}
          />
        </Row>
      </Stack>
    </AbsolutePositionedScreen>
  )
}
