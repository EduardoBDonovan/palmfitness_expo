import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Post, WorkoutPost } from '../types';
import { MuscleMap } from './MuscleMap';
import { WorkoutIntensityCalculator } from '../lib/muscleMapping';
import { Lock } from 'lucide-react-native';
import { useAccessControl } from '../hooks/useAccessControl';
import { SupabaseImage } from './SupabaseImage';

interface WorkoutVisualsProps {
  post: Post;
}

export const WorkoutVisuals: React.FC<WorkoutVisualsProps> = ({ post }) => {
  const { canAccessContent, canAccessMedia } = useAccessControl();
  const workout = post.content as WorkoutPost;
  const photos = post.media.filter(m => m.media_type === 'photo' || m.media_type === 'video');
  const showsMap = workout.shows_muscle_map !== false;

  const intensities = useMemo(() => {
    return WorkoutIntensityCalculator.computeIntensity(workout);
  }, [workout]);

  if (!showsMap && photos.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {showsMap && (
          <View style={styles.mapContainer}>
            <MuscleMap intensities={intensities} width={280} height={200} />
          </View>
        )}
        
        {photos.map((item) => {
          const isLocked = !canAccessMedia(item, post);
          
          return (
            <TouchableOpacity key={item.id} activeOpacity={0.8} style={styles.mediaItem}>
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
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  mapContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  mediaItem: {
    width: 200,
    height: 200,
    borderRadius: 12,
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
