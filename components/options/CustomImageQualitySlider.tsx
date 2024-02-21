import Slider from '@react-native-community/slider'
import { FormControl, Stack, useTheme } from 'native-base'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { FORM_INTER_ITEM_SPACING } from '@/constants/general'
import {
  customImageQualitySelector,
  setCustomImageQuality,
} from '@/state/slices/optionsSlice'

export function CustomImageQualitySlider() {
  const theme = useTheme()
  const customImageQuality = useSelector(customImageQualitySelector)
  const dispatch = useDispatch()

  const onValueChange = useCallback((newValue: number) => {
    const rounded = Math.round(newValue * 100) / 100;
    dispatch(setCustomImageQuality(rounded))
  }, [])

  return (
    <Stack space={theme.space[FORM_INTER_ITEM_SPACING]}>
      <FormControl.Label>
        Custom Image Quality (current: {customImageQuality * 100}%):
      </FormControl.Label>
      <Slider
        style={{
          width: '100%',
          marginBottom: theme.space[2],
        }}
        minimumValue={0}
        maximumValue={1}
        value={customImageQuality}
        onValueChange={onValueChange}
        thumbTintColor={theme.colors.primary[900]}
        minimumTrackTintColor={theme.colors.gray[900]}
        maximumTrackTintColor={theme.colors.black}
      />
    </Stack>
  )
}
