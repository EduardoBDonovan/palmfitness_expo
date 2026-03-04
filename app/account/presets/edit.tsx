import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, useColorScheme } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../src/context/AuthContext';
import { PresetsService } from '../../../src/services/presets';
import { usePostComposer } from '../../../src/hooks/usePostComposer';
import { WorkoutComposer } from '../../../src/components/composer/WorkoutComposer';
import { AppTheme } from '../../../src/constants/theme';
import { supabase } from '../../../src/lib/supabase';
import { PresetType } from '../../../src/types';

export default function PresetEditorScreen() {
  const { id, type } = useLocalSearchParams<{ id?: string, type?: string }>();
  const { user, profile } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const queryClient = useQueryClient();
  const composer = usePostComposer();

  const [presetName, setPresetName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // 1. Fetch preset if editing
  const { data: existingPreset, isLoading: isFetching } = useQuery({
    queryKey: ['preset', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase.from('user_presets').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data ?? null;
    },
  });

  useEffect(() => {
    if (existingPreset) {
      setPresetName(existingPreset.name);
      composer.setCurrentPostType(existingPreset.preset_type);
      
      if (existingPreset.preset_type === 'workout') {
        const workoutData = existingPreset.data as any;
        composer.setWorkoutTitle(workoutData.title || '');
        composer.setWorkoutNotes(workoutData.notes || '');
        composer.setExercises(workoutData.exercises || []);
      } else {
        const exerciseData = existingPreset.data as any;
        composer.setExercises([exerciseData]);
      }
    } else if (type) {
      composer.setCurrentPostType(type as any);
    }
  }, [existingPreset, type]);

  const handleSave = async () => {
    if (!presetName.trim()) {
      Alert.alert('Error', 'Please enter a preset name');
      return;
    }

    setIsSaving(true);
    try {
      const presetType: PresetType = (composer.currentPostType === 'workout' ? 'workout' : 'exercise') as PresetType;
      let presetData: any;

      if (presetType === 'workout') {
        presetData = {
          title: composer.workoutTitle,
          notes: composer.workoutNotes,
          exercises: composer.exercises,
          shows_muscle_map: composer.generateMuscleMap,
        };
      } else {
        presetData = composer.exercises[0] || {};
      }

      const payload: any = {
        user_id: user?.id,
        name: presetName,
        preset_type: presetType,
        activity_type: presetType === 'workout' ? 'Weightlifting' : (presetData.workout_type || 'Weightlifting'),
        data: presetData,
      };

      if (id) {
        await PresetsService.updatePreset(id, payload);
      } else {
        await PresetsService.createPreset(payload);
      }

      queryClient.invalidateQueries({ queryKey: ['presets', user?.id] });
      Alert.alert('Success', 'Preset saved successfully!');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save preset');
    } finally {
      setIsSaving(false);
    }
  };

  if (isFetching) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: isDark ? '#000' : '#fff' }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const mode = composer.currentPostType === 'workout' ? 'Workout' : 'Exercise';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <Stack.Screen 
        options={{
          headerTitle: id ? `Edit ${mode} Preset` : `New ${mode} Preset`,
          headerRight: () => (
            <TouchableOpacity onPress={handleSave} disabled={isSaving} style={{ marginRight: 10 }}>
              {isSaving ? <ActivityIndicator size="small" /> : <Text style={{ color: '#007AFF', fontSize: 17, fontWeight: '600' }}>Save</Text>}
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          <Text style={[styles.label, { color: isDark ? '#fff' : '#000' }]}>Preset Name *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7', color: isDark ? '#fff' : '#000' }]}
            placeholder="e.g., 'Morning Yoga'"
            placeholderTextColor="#8E8E93"
            value={presetName}
            onChangeText={setPresetName}
          />
        </View>

        {composer.currentPostType === 'workout' ? (
          <WorkoutComposer composer={composer} profile={profile} />
        ) : (
          <View style={styles.singleExerciseSection}>
             <Text style={[styles.label, { color: isDark ? '#fff' : '#000', marginBottom: 12 }]}>Exercise Details</Text>
             {/* We can reuse parts of WorkoutComposer or a single exercise form */}
             {composer.exercises.length === 0 && (
               <TouchableOpacity 
                 style={styles.addButton} 
                 onPress={composer.addExercise}
               >
                 <Text style={{ color: AppTheme.colors.workout, fontWeight: '600' }}>Define Exercise</Text>
               </TouchableOpacity>
             )}
             <WorkoutComposer composer={composer} profile={profile} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerSection: {
    marginBottom: 24,
    gap: 8,
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
  },
  input: {
    height: 44,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  singleExerciseSection: {
    marginTop: 8,
  },
  addButton: {
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AppTheme.colors.workout,
    borderRadius: 8,
    borderStyle: 'dashed',
  }
});
