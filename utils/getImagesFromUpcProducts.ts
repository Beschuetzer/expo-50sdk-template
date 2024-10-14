import { IMAGE_PRIORITY_MAPPING, EMPTY_STRING } from '@/constants/general';
import { UpcProduct } from '@/types/UpcResponse';

export function getImagesFromUpcProduct(upcProduct?: UpcProduct | null) {
  const uniqueImages = new Set<string>();
  Object.values(IMAGE_PRIORITY_MAPPING).forEach((key) => {
    const image = upcProduct?.[key] || EMPTY_STRING;
    if (image !== EMPTY_STRING) {
      uniqueImages.add(image);
    }
  });
  return Array.from(uniqueImages);
}
