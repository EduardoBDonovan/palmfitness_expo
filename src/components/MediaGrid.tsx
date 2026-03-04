import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { MediaAsset, Post } from '../types';
import { Lock } from 'lucide-react-native';
import { SupabaseImage } from './SupabaseImage';
import { useAccessControl } from '../hooks/useAccessControl';

interface MediaGridProps {
  media: MediaAsset[];
  post: Post;
}

const { width } = Dimensions.get('window');
const GRID_PADDING = 32; // 16 each side
const IMAGE_GAP = 4;
const SINGLE_IMAGE_WIDTH = width - GRID_PADDING;
const TWO_IMAGE_WIDTH = (width - GRID_PADDING - IMAGE_GAP) / 2;

export const MediaGrid: React.FC<MediaGridProps> = ({ media, post }) => {
  const { canAccessMedia } = useAccessControl();
  if (!media || media.length === 0) return null;

  // Take up to 4 images for the grid
  const displayMedia = media.slice(0, 4);
  const count = displayMedia.length;

  const renderMediaItem = (item: MediaAsset, index: number, totalCount: number) => {
    let itemWidth = SINGLE_IMAGE_WIDTH;
    let itemHeight = 300;

    if (totalCount === 2) {
      itemWidth = TWO_IMAGE_WIDTH;
      itemHeight = 200;
    } else if (totalCount === 3) {
      if (index === 0) {
        itemWidth = SINGLE_IMAGE_WIDTH;
        itemHeight = 200;
      } else {
        itemWidth = TWO_IMAGE_WIDTH;
        itemHeight = 150;
      }
    } else if (totalCount === 4) {
      itemWidth = TWO_IMAGE_WIDTH;
      itemHeight = 150;
    }

    const isLocked = !canAccessMedia(item, post);

    return (
      <TouchableOpacity key={item.id} activeOpacity={0.8} style={[styles.mediaItem, { width: itemWidth, height: itemHeight }]}>
        <SupabaseImage 
          url={item.url} 
          isLocked={isLocked}
          style={styles.mediaImage}
          resizeMode="cover"
          containerStyle={{ width: '100%', height: '100%' }}
        />
        {isLocked && (
          <View style={styles.lockOverlay}>
            <Lock size={24} color="#fff" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {displayMedia.map((item, index) => renderMediaItem(item, index, count))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: IMAGE_GAP,
  },
  mediaItem: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#333',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
