import { Center, Icon, Row, View, theme } from 'native-base'
import { useCallback, useMemo } from 'react'
import { TouchableOpacity } from 'react-native'

import { ImageRenderer } from './ImageRenderer'
import { useIsDarkMode } from './hooks/useIsDarkTheme'

import { UpcProduct } from '@/types/UpcResponse'
import { StyleProp } from '@/types/general'
import { getImagesFromUpcProduct } from '@/utils/helpers'
import { Feather } from '@expo/vector-icons'

type ThumbnailPickerProps = {
  upcProduct: UpcProduct
  selectedUrl: string
  onSelectImage: (url: string) => void
} & StyleProp

export function ThumbnailPicker(props: ThumbnailPickerProps) {
  const { upcProduct, selectedUrl, onSelectImage, style } = props
  const isDarkMode = useIsDarkMode()
  const modeColor = useMemo(() => isDarkMode
            ? theme.colors.black
            : theme.colors.white, [theme])
  const imagesToRender = useMemo(
    () => new Set(getImagesFromUpcProduct(upcProduct)),
    [upcProduct],
  )

  const handleSelect = useCallback(
    (imageUrl?: string) => {
      if (!imageUrl) return
      onSelectImage && onSelectImage(imageUrl)
    },
    [onSelectImage],
  )


  return (
    <Row space={1} style={style}>
      {Array.from(imagesToRender).map((imageUrl) => {
        const isSelected = imageUrl === selectedUrl
        const borderColor = isSelected ? theme.colors.tertiary[900] : modeColor

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
      <TouchableOpacity onPress={() => alert('pressed')}>
        <Center borderColor={modeColor} width={75} height={100}>
          <Feather name="plus" size={50} color={theme.colors.black} />
        </Center>
      </TouchableOpacity>
    </Row>
  )
}




