import { Center, Column, Icon, Row, View, theme } from 'native-base'
import { useCallback, useMemo, useState } from 'react'
import { TouchableOpacity } from 'react-native'

import { ImageRenderer } from './ImageRenderer'
import { useIsDarkMode } from './hooks/useIsDarkTheme'

import { UpcProduct } from '@/types/UpcResponse'
import { StyleProp } from '@/types/general'
import {
  captureImage,
  getImagesFromUpcProduct,
  pickImage,
} from '@/utils/helpers'
import { Feather, FontAwesome } from '@expo/vector-icons'
import { EMPTY_FREQUENCY, EMPTY_STRING } from '@/constants/general'

type ThumbnailPickerProps = {
  upcProduct: UpcProduct
  selectedUrl: string
  onSelectImage: (url: string) => void
} & StyleProp

export function ThumbnailPicker(props: ThumbnailPickerProps) {
  const { upcProduct, selectedUrl, onSelectImage, style } = props
  const [customImageUri, setCustomImageUri] = useState(EMPTY_STRING)
  const isDarkMode = useIsDarkMode()
  const modeColor = useMemo(
    () => (isDarkMode ? theme.colors.black : theme.colors.white),
    [theme],
  )
  const imagesToRender = useMemo(
    () => new Set([...getImagesFromUpcProduct(upcProduct), customImageUri]),
    [upcProduct, customImageUri],
  )

  const handleSelect = useCallback(
    (imageUrl?: string) => {
      if (!imageUrl) return
      onSelectImage && onSelectImage(imageUrl)
    },
    [onSelectImage],
  )

  const getCustomImage = useCallback(
    async (resultFetcher: () => Promise<string | undefined>) => {
      try {
        const result = await resultFetcher()
        console.log({result});
        
        setCustomImageUri(result || EMPTY_STRING)
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
          if (!imageUrl) return null;

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


