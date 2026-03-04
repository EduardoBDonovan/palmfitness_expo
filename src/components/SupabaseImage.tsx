import React, { useState, useEffect } from 'react';
import { View, Image, ActivityIndicator, StyleSheet, ImageProps, ViewStyle, StyleProp } from 'react-native';
import { StorageService } from '../services/storage';

interface SupabaseImageProps extends Omit<ImageProps, 'source'> {
  url: string;
  isLocked?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

const cache: Record<string, string> = {};

export const SupabaseImage: React.FC<SupabaseImageProps> = ({ url, isLocked, containerStyle, ...props }) => {
  const [source, setSource] = useState<string | null>(cache[url] || null);
  const [loading, setLoading] = useState(!cache[url]);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadImage = async () => {
      if (cache[url]) {
        if (isMounted) setSource(cache[url]);
        return;
      }

      try {
        setLoading(true);
        setError(false);

        // Extract bucket and path
        // Expected format: https://.../storage/v1/object/public/post-media/path/to/file
        const publicMatch = url.match(/\/storage\/v1\/object\/public\/([^\/]+)\/(.+)$/);
        const authMatch = url.match(/\/storage\/v1\/object\/authenticated\/([^\/]+)\/(.+)$/);
        
        const match = publicMatch || authMatch;
        
        if (!match) {
          console.warn('[SupabaseImage] Invalid URL format:', url);
          if (isMounted) setSource(url); // Fallback to direct URL
          return;
        }

        const bucket = match[1];
        const path = match[2];

        const dataUrl = await StorageService.downloadImage(bucket, path);
        cache[url] = dataUrl;
        
        if (isMounted) {
          setSource(dataUrl);
          setLoading(false);
        }
      } catch (err) {
        console.error('[SupabaseImage] Failed to download image:', url, err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    };

    if (url) {
      loadImage();
    }

    return () => {
      isMounted = false;
    };
  }, [url]);

  if (loading && !source) {
    return (
      <View style={[styles.container, containerStyle]}>
        <ActivityIndicator color="#8E8E93" />
      </View>
    );
  }

  if (error && !source) {
    return (
      <View style={[styles.container, containerStyle, styles.errorContainer]}>
        <View style={styles.errorPlaceholder} />
      </View>
    );
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <Image
        {...props}
        source={{ uri: source || url }}
        style={[props.style, isLocked && styles.blurredImage]}
        blurRadius={isLocked ? 20 : 0}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
    overflow: 'hidden',
  },
  errorContainer: {
    backgroundColor: '#222',
  },
  errorPlaceholder: {
    width: '100%',
    height: '100%',
  },
  blurredImage: {
    opacity: 0.6,
  },
});
