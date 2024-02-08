import { Center, Column, Row, View, theme } from 'native-base'
import { useCallback, useMemo, useState } from 'react'
import { TouchableOpacity } from 'react-native'

import { ImageRenderer } from './ImageRenderer'
import { useIsDarkMode } from './hooks/useIsDarkTheme'

import { StyleProp } from '@/types/general'
import {
  captureImage,
  pickImage,
} from '@/utils/helpers'
import { FontAwesome } from '@expo/vector-icons'
import { EMPTY_STRING } from '@/constants/general'
import { LOCAL_FILE_REGEX } from '@/constants/regexs'

type ThumbnailPickerProps = {
  imagesToRender: Set<string>;
  selectedUrl: string;
  onSelectImage: (url: string, isCustomImage: boolean) => void
} & StyleProp

export function ThumbnailPicker(props: ThumbnailPickerProps) {
  const { imagesToRender, selectedUrl, onSelectImage, style } = props
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
        handleSelect(result, true)
      } catch (error) {
        console.error('Error obtaining a custom image: ' + error)
      }
    },
    [],
  )

  return (
    <Column>
      <Row space={theme.space['0.5']} style={style}>
        {Array.from(imagesToRender).map((imageUrl) => {
          if (!imageUrl) return null

          const isSelected = imageUrl === selectedUrl
          const borderColor = isSelected
            ? theme.colors.tertiary[900]
            : modeColor

          return (
            <View key={imageUrl} borderWidth={2} borderColor={borderColor}>
              <TouchableOpacity onPress={() => handleSelect(imageUrl)}>
                <ImageRenderer
                  source={imageUrl}
                  contentFit="cover"
                  transition={1000}
                  cachePolicy="memory"
                />
              </TouchableOpacity>
            </View>
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

