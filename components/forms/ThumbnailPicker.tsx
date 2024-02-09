import { Center, Column, Row, theme } from 'native-base'
import { useCallback, useMemo, useState } from 'react'
import { TouchableOpacity } from 'react-native'

import { useIsDarkMode } from '../hooks/useIsDarkTheme'

import { SpacingProp, StyleProp } from '@/types/general'
import { captureImage, pickImage } from '@/utils/helpers'
import { FontAwesome } from '@expo/vector-icons'
import { EMPTY_STRING } from '@/constants/general'
import { LOCAL_FILE_REGEX } from '@/constants/regexs'
import { ThumbnailPickerImage } from './ThumbnailPickerImage'

type ThumbnailPickerProps = {
  imagesToRender: Set<string>
  selectedUrl: string
  onSelectImage: (url: string, isCustomImage: boolean) => void
} & StyleProp & SpacingProp

export function ThumbnailPicker(props: ThumbnailPickerProps) {
  const { imagesToRender, selectedUrl, onSelectImage, style, spacing } = props
  const [customImageUri, setCustomImageUri] = useState(
    selectedUrl.match(LOCAL_FILE_REGEX) ? selectedUrl : EMPTY_STRING,
  )
  const isDarkMode = useIsDarkMode()
  const modeColor = useMemo(
    () => (isDarkMode ? theme.colors.black : theme.colors.white),
    [theme],
  )

  const handleSelect = useCallback(
    (imageUrl?: string, isCustomImage?: boolean) => {
      if (!imageUrl) return
      onSelectImage && onSelectImage(imageUrl, isCustomImage || false)
    },
    [onSelectImage],
  )

  const getCustomImage = useCallback(
    async (resultFetcher: () => Promise<string | undefined>) => {
      try {
        const result = (await resultFetcher()) || EMPTY_STRING
        setCustomImageUri(result)
        handleSelect(result, true)
      } catch (error) {
        console.error('Error obtaining a custom image: ' + error)
      }
    },
    [],
  )

  return (
    <Column mt={spacing}>
      <Row space={theme.space['0.5']} style={style}>
        {Array.from(imagesToRender.add(customImageUri)).map((imageUrl) => {
          if (!imageUrl) return null

          const isSelected = imageUrl === selectedUrl
          const borderColor = isSelected
            ? theme.colors.tertiary[900]
            : modeColor

          return (
            <ThumbnailPickerImage
              key={imageUrl}
              borderColor={borderColor}
              imageUrl={imageUrl}
              onPress={(imageUrl) => handleSelect(imageUrl)}
            />
          )
        })}
      </Row>
      <Row space={theme.space['0.5']} mt={theme.space[0.5]}>
        <TouchableOpacity onPress={getCustomImage.bind(null, captureImage)}>
          <Center borderColor={modeColor} width={75} height={50}>
            <FontAwesome name="camera" size={50} />
          </Center>
        </TouchableOpacity>
        <TouchableOpacity onPress={getCustomImage.bind(null, pickImage)}>
          <Center borderColor={modeColor} width={75} height={50}>
            Select
          </Center>
        </TouchableOpacity>
      </Row>
    </Column>
  )
}
