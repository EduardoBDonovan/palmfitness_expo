import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Switch, Alert, KeyboardAvoidingView, Platform, useColorScheme } from 'react-native';
import { usePostComposer } from '../../src/hooks/usePostComposer';
import { useAuth } from '../../src/context/AuthContext';
import { Dumbbell, Utensils, MessageSquare, Plus, Trash2, Lock, Unlock } from 'lucide-react-native';
import { AppTheme } from '../../src/constants/theme';
import { WorkoutComposer } from '../../src/components/composer/WorkoutComposer';
import { MealComposer } from '../../src/components/composer/MealComposer';
import { LifestyleComposer } from '../../src/components/composer/LifestyleComposer';
import { MediaSection } from '../../src/components/composer/MediaSection';
import { Stack, useRouter } from 'expo-router';

export default function PostScreen() {
  const composer = usePostComposer();
  const { profile } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const handleClear = () => {
    Alert.alert(
      'Clear Post?',
      'Are you sure you want to clear all content? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: composer.resetForm }
      ]
    );
  };

  const handleSubmit = async () => {
    // We'll implement the actual submission logic in PostsService
    Alert.alert('Success', 'Post submitted successfully!');
    composer.resetForm();
    router.replace('/(tabs)');
  };

  const availableTypes = [
    { type: 'workout', label: 'Workout', icon: Dumbbell, color: AppTheme.colors.workout },
    { type: 'meal', label: 'Meal', icon: Utensils, color: AppTheme.colors.meal },
    { type: 'lifestyle', label: 'Lifestyle', icon: MessageSquare, color: AppTheme.colors.lifestyle },
  ] as const;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}
      keyboardVerticalOffset={100}
    >
      <Stack.Screen 
        options={{
          headerTitle: 'Create Post',
          headerLeft: () => (
            <TouchableOpacity onPress={handleClear} style={{ paddingLeft: 10 }}>
              <Text style={{ color: 'red', fontSize: 16 }}>Clear</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity 
              onPress={handleSubmit} 
              disabled={!composer.canSubmit}
              style={{ paddingRight: 10 }}
            >
              <Text style={{ 
                color: composer.canSubmit ? AppTheme.colors.workout : '#666', 
                fontSize: 16, 
                fontWeight: 'bold' 
              }}>Post</Text>
            </TouchableOpacity>
          )
        }} 
      />

      <View style={styles.typeSelector}>
        {availableTypes.map((item) => (
          <TouchableOpacity
            key={item.type}
            style={[
              styles.typeButton,
              composer.currentPostType === item.type && { backgroundColor: item.color }
            ]}
            onPress={() => composer.setCurrentPostType(item.type)}
          >
            <item.icon 
              size={20} 
              color={composer.currentPostType === item.type ? '#fff' : '#8E8E93'} 
            />
            <Text style={[
              styles.typeText,
              { color: composer.currentPostType === item.type ? '#fff' : '#8E8E93' }
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {composer.currentPostType === 'workout' && <WorkoutComposer composer={composer} profile={profile} />}
        {composer.currentPostType === 'meal' && <MealComposer composer={composer} profile={profile} />}
        {composer.currentPostType === 'lifestyle' && <LifestyleComposer composer={composer} profile={profile} />}

        <MediaSection composer={composer} profile={profile} />

        <View style={styles.shareToggle}>
           <Text style={[styles.toggleLabel, { color: isDark ? '#fff' : '#000' }]}>Share to Feed</Text>
           <Switch 
             value={composer.isPublic} 
             onValueChange={composer.setIsPublic}
             trackColor={{ true: availableTypes.find(t => t.type === composer.currentPostType)?.color }}
           />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  typeSelector: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    backgroundColor: 'rgba(142, 142, 147, 0.12)',
    margin: 16,
    borderRadius: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  shareToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#333',
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
