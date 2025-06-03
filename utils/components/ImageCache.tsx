import { Image as ExpoImage, ImageContentFit } from 'expo-image';
import { StyleSheet } from 'react-native';

// Define the caching options
const CACHE_OPTIONS = {
  // Cache the image in memory and on disk
  cachePolicy: 'memory-disk' as const,
  // Keep images in the cache for 7 days
  expiresIn: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

interface ImageCacheProps {
  source: string | number;
  style?: any;
  resizeMode?: ImageContentFit;
}

export function ImageCache({ source, style, resizeMode = 'cover' }: ImageCacheProps) {
  return (
    <ExpoImage
      source={source}style={[styles.image, style]}
      contentFit={resizeMode}
      cachePolicy={CACHE_OPTIONS.cachePolicy}
      recyclingKey={typeof source === 'string' ? source : undefined}
      transition={300}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
});


export default ImageCache;

