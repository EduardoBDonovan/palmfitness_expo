import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, useColorScheme, Switch } from 'react-native';
import { Plus, Trash2, Lock, Unlock } from 'lucide-react-native';
import { AppTheme } from '../../constants/theme';
import { User, Exercise, WorkoutType } from '../../types';
import { LockButton } from './LifestyleComposer';

export const WorkoutComposer: React.FC<{ composer: any, profile: User | null }> = ({ composer, profile }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const updateExercise = (index: number, newFields: Partial<Exercise>) => {
    const newExercises = [...composer.exercises];
    newExercises[index] = { ...newExercises[index], ...newFields };
    composer.setExercises(newExercises);
  };

  return (
    <View style={styles.container}>
      {/* Workout Title */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.label, { color: isDark ? '#fff' : '#000' }]}>Workout Title</Text>
          <Text style={styles.required}>*</Text>
        </View>
        <TextInput
          style={[styles.input, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7', color: isDark ? '#fff' : '#000' }]}
          placeholder="Enter workout title"
          placeholderTextColor="#8E8E93"
          value={composer.workoutTitle}
          onChangeText={composer.setWorkoutTitle}
        />
      </View>

      {/* Notes */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.label, { color: isDark ? '#fff' : '#000' }]}>Notes</Text>
        </View>
        <TextInput
          style={[styles.textArea, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7', color: isDark ? '#fff' : '#000' }]}
          placeholder="Optional notes"
          placeholderTextColor="#8E8E93"
          multiline
          value={composer.workoutNotes}
          onChangeText={composer.setWorkoutNotes}
          textAlignVertical="top"
        />
      </View>

      {/* Exercises */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.label, { color: isDark ? '#fff' : '#000' }]}>Exercises</Text>
          <Text style={styles.required}>*</Text>
          <View style={{ flex: 1 }} />
          <LockButton 
            section="exercises" 
            lockedSections={composer.lockedSections} 
            onToggle={composer.toggleLockedSection} 
            profile={profile}
          />
        </View>

        <View style={styles.exerciseList}>
          {composer.exercises.map((exercise: any, index: number) => (
            <View key={exercise.id} style={[styles.exerciseRow, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }]}>
              <View style={styles.exerciseHeader}>
                <TextInput
                  style={[styles.exerciseInput, { color: isDark ? '#fff' : '#000' }]}
                  placeholder="Exercise Name"
                  placeholderTextColor="#8E8E93"
                  value={exercise.name}
                  onChangeText={(text) => updateExercise(index, { name: text })}
                />
                <TouchableOpacity onPress={() => composer.removeExercise(index)}>
                  <Trash2 size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.typeSelector}>
                 {['weightlifting', 'cardio', 'yoga', 'pilates'].map((type) => (
                   <TouchableOpacity 
                     key={type}
                     onPress={() => updateExercise(index, { workout_type: type as WorkoutType })}
                     style={[
                       styles.typePill, 
                       exercise.workout_type === type && { backgroundColor: AppTheme.colors.workout }
                     ]}
                   >
                     <Text style={[
                       styles.typePillText,
                       exercise.workout_type === type && { color: '#fff' }
                     ]}>
                       {type.charAt(0).toUpperCase() + type.slice(1)}
                     </Text>
                   </TouchableOpacity>
                 ))}
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.addButton} 
          onPress={composer.addExercise}
        >
          <Plus size={20} color={AppTheme.colors.workout} />
          <Text style={[styles.addButtonText, { color: AppTheme.colors.workout }]}>Add Exercise</Text>
        </TouchableOpacity>

        <View style={styles.muscleMapToggle}>
           <Text style={[styles.toggleLabel, { color: isDark ? '#fff' : '#000' }]}>Generate Muscle Map</Text>
           <Switch 
             value={composer.generateMuscleMap} 
             onValueChange={composer.setGenerateMuscleMap}
             trackColor={{ true: AppTheme.colors.workout }}
           />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  section: {
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
  },
  required: {
    color: '#FF3B30',
  },
  input: {
    height: 44,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  exerciseList: {
    gap: 12,
  },
  exerciseRow: {
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  exerciseInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 4,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(142, 142, 147, 0.3)',
  },
  typePillText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  muscleMapToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  toggleLabel: {
    fontSize: 15,
  }
});
