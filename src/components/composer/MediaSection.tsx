import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, useColorScheme } from 'react-native';
import { Camera, Image as ImageIcon, X } from 'lucide-react-native';
import { AppTheme } from '../../constants/theme';
import { User, MediaAsset } from '../../types';
import { LockButton } from './LifestyleComposer';

interface MediaSectionProps {
  composer: any;
  profile: User | null;
}

export const MediaSection: React.FC<MediaSectionProps> = ({ composer, profile }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.label, { color: isDark ? '#fff' : '#000' }]}>Media</Text>
        <View style={{ flex: 1 }} />
        <LockButton 
          section="media" 
          lockedSections={composer.lockedSections} 
          onToggle={composer.toggleLockedSection} 
          profile={profile}
        />
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.mediaButton, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }]}
          onPress={composer.pickImage}
        >
          <ImageIcon size={20} color={AppTheme.colors.workout} />
          <Text style={[styles.mediaButtonText, { color: AppTheme.colors.workout }]}>Photos</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.mediaButton, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }]}
          onPress={() => {}} // Camera not implemented yet
        >
          <Camera size={20} color={AppTheme.colors.workout} />
          <Text style={[styles.mediaButtonText, { color: AppTheme.colors.workout }]}>Camera</Text>
        </TouchableOpacity>
      </View>

      {composer.mediaAssets.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewScroll}>
          {composer.mediaAssets.map((asset: MediaAsset) => (
            <View key={asset.id} style={styles.previewCard}>
              <Image source={{ uri: asset.url }} style={styles.previewImage} />
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => composer.removeMedia(asset.id)}
              >
                <X size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  mediaButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  previewScroll: {
    marginTop: 8,
  },
  previewCard: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    padding: 4,
  }
});
