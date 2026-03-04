import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Lock, Unlock } from 'lucide-react-native';
import { AppTheme } from '../../constants/theme';
import { User } from '../../types';

interface LockButtonProps {
  section: string;
  lockedSections: Set<string>;
  onToggle: (section: string) => void;
  profile?: User | null;
}

export const LockButton: React.FC<LockButtonProps> = ({ section, lockedSections, onToggle, profile }) => {
  if (profile?.profile_type !== 'Coach') return null;
  const isLocked = lockedSections.has(section);

  return (
    <TouchableOpacity onPress={() => onToggle(section)} style={styles.lockButton}>
      {isLocked ? (
        <Lock size={18} color="#FF3B30" />
      ) : (
        <Unlock size={18} color="#8E8E93" />
      )}
    </TouchableOpacity>
  );
};

export const LifestyleComposer: React.FC<{ composer: any, profile: User | null }> = ({ composer, profile }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.label, { color: isDark ? '#fff' : '#000' }]}>What's on your mind?</Text>
        <Text style={styles.required}>*</Text>
        <View style={{ flex: 1 }} />
        <LockButton 
          section="body" 
          lockedSections={composer.lockedSections} 
          onToggle={composer.toggleLockedSection} 
          profile={profile}
        />
      </View>

      <TextInput
        style={[
          styles.textArea, 
          { 
            backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7',
            color: isDark ? '#fff' : '#000'
          }
        ]}
        placeholder="Share your thoughts..."
        placeholderTextColor="#8E8E93"
        multiline
        value={composer.lifestyleBody}
        onChangeText={composer.setLifestyleBody}
        textAlignVertical="top"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
  },
  required: {
    color: '#FF3B30',
  },
  lockButton: {
    padding: 4,
  },
  textArea: {
    minHeight: 120,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  }
});
