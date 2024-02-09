import { View } from 'native-base'
import { TouchableOpacity } from 'react-native'

import { ImageRenderer } from '../ImageRenderer'

type ThumbnailPickerImageProps = {
  borderColor: string
  imageUrl: string
  onPress: (imageUrl: string) => void
}

export function ThumbnailPickerImage(props: ThumbnailPickerImageProps) {
  const { imageUrl, borderColor, onPress } = props
  return (
    <View key={imageUrl} borderWidth={2} borderColor={borderColor}>
      <TouchableOpacity onPress={() => onPress && onPress(imageUrl)}>
        <ImageRenderer
          source={imageUrl}
          contentFit="cover"
          transition={1000}
          cachePolicy="memory"
        />
      </TouchableOpacity>
    </View>
  )
}
