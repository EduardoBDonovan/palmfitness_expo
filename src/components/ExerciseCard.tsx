import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Exercise, Post, WorkoutType, ExercisePose } from '../types';
import { useAccessControl } from '../hooks/useAccessControl';
import { Lock, Clock, Thermometer, User, Settings } from 'lucide-react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ExerciseCardProps {
  exercise: Exercise;
  workoutType: WorkoutType;
  post: Post;
  forceExpand?: boolean;
  onPostDetailRequested?: (post: Post, focusComments: boolean) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, workoutType, post, forceExpand = false, onPostDetailRequested }) => {
  const { canAccessExercise } = useAccessControl();
  const hasAccess = canAccessExercise(exercise, post);
  const effectiveType = exercise.workout_type || workoutType;

  if (!hasAccess) {
    return (
      <View style={styles.lockedCard}>
        <Lock size={24} color="#8E8E93" />
        <Text style={styles.lockedText}>Locked Exercise</Text>
      </View>
    );
  }

  if (effectiveType === 'yoga' || effectiveType === 'pilates') {
    return <YogaPilatesCard exercise={exercise} type={effectiveType} forceExpand={forceExpand} post={post} onPostDetailRequested={onPostDetailRequested} />;
  }

  return <StandardExerciseCard exercise={exercise} workoutType={effectiveType} />;
};

const StandardExerciseCard: React.FC<{ exercise: Exercise; workoutType: WorkoutType }> = ({ exercise, workoutType }) => {
  const isWeightlifting = workoutType === 'weightlifting';
  const isCardio = workoutType === 'cardio';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{exercise.name}</Text>
      </View>

      {isWeightlifting && exercise.sets && exercise.sets.length > 0 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.setsScroll}
        >
          {exercise.sets.map((set, index) => (
            <View key={set.id} style={styles.setColumn}>
              <Text style={styles.setLabel}>SET {index + 1}</Text>
              <Text style={styles.setValue}>
                {set.reps !== undefined ? set.reps : '0'}
              </Text>
              {set.weight !== undefined && (
                <Text style={styles.setSubValue}>{Math.round(set.weight)} {set.weight_unit || 'lbs'}</Text>
              )}
            </View>
          ))}
        </ScrollView>
      )}

      {isCardio && (
        <View style={styles.cardioDetails}>
          {exercise.duration_seconds !== undefined && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>{Math.floor(exercise.duration_seconds / 60)}m</Text>
            </View>
          )}
          {exercise.distance !== undefined && exercise.distance > 0 && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Distance</Text>
              <Text style={styles.detailValue}>{exercise.distance} {exercise.distance_unit || 'miles'}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const YogaPilatesCard: React.FC<{ 
  exercise: Exercise; 
  type: WorkoutType; 
  forceExpand: boolean;
  post: Post;
  onPostDetailRequested?: (post: Post, focusComments: boolean) => void;
}> = ({ exercise, type, forceExpand, post, onPostDetailRequested }) => {
  const isYoga = type === 'yoga';
  const [isExpanded, setIsExpanded] = useState(forceExpand);
  const collapsedCount = 4;
  
  const toggleExpand = () => {
    // If we have more than collapsedCount poses and we are NOT expanded, navigate to details
    if (!isExpanded && !forceExpand && (exercise.poses || []).length > collapsedCount) {
      if (onPostDetailRequested) {
        onPostDetailRequested(post, false);
        return;
      }
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  const displayedPoses = (isExpanded || forceExpand) ? (exercise.poses || []) : (exercise.poses || []).slice(0, collapsedCount);
  const instructor = isYoga ? exercise.yoga_instructor : exercise.pilates_instructor;

  return (
    <View style={styles.card}>
      {/* Badges Row - Flush at top if no name/header */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgesScroll}>
        {exercise.duration_seconds !== undefined && (
          <View style={styles.badge}>
            <Clock size={12} color="#8E8E93" />
            <Text style={styles.badgeText}>{Math.floor(exercise.duration_seconds / 60)} min</Text>
          </View>
        )}

        {isYoga ? (
          <>
            {exercise.yoga_style && (
              <View style={[styles.badge, { backgroundColor: 'rgba(168, 85, 247, 0.1)' }]}>
                <Text style={[styles.badgeText, { color: '#A855F7' }]}>{exercise.yoga_style}</Text>
              </View>
            )}
            {exercise.yoga_intensity && (
              <View style={[styles.badge, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <Text style={[styles.badgeText, { color: '#3B82F6' }]}>{exercise.yoga_intensity}</Text>
              </View>
            )}
            {exercise.yoga_temperature && (
              <View style={[styles.badge, { backgroundColor: exercise.yoga_temperature === 'regular' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(249, 115, 22, 0.1)' }]}>
                <Thermometer size={12} color={exercise.yoga_temperature === 'regular' ? '#3B82F6' : '#F97316'} />
                <Text style={[styles.badgeText, { color: exercise.yoga_temperature === 'regular' ? '#3B82F6' : '#F97316' }]}>{exercise.yoga_temperature}</Text>
              </View>
            )}
          </>
        ) : (
          <>
            {exercise.pilates_style && (
              <View style={[styles.badge, { backgroundColor: 'rgba(168, 85, 247, 0.1)' }]}>
                <Text style={[styles.badgeText, { color: '#A855F7' }]}>{exercise.pilates_style}</Text>
              </View>
            )}
            {exercise.pilates_equipment && exercise.pilates_equipment.length > 0 && (
              <View style={[styles.badge, { backgroundColor: 'rgba(168, 85, 247, 0.1)' }]}>
                <Text style={[styles.badgeText, { color: '#A855F7' }]}>{exercise.pilates_equipment.join(', ')}</Text>
              </View>
            )}
            {exercise.pilates_equipment_details && (
              <View style={[styles.badge, { backgroundColor: 'rgba(249, 115, 22, 0.1)' }]}>
                <Settings size={12} color="#F97316" />
                <Text style={[styles.badgeText, { color: '#F97316' }]}>{exercise.pilates_equipment_details}</Text>
              </View>
            )}
            {exercise.pilates_intensity && (
              <View style={[styles.badge, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <Text style={[styles.badgeText, { color: '#3B82F6' }]}>{exercise.pilates_intensity}</Text>
              </View>
            )}
            {exercise.pilates_temperature && (
              <View style={[styles.badge, { backgroundColor: exercise.pilates_temperature === 'regular' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(249, 115, 22, 0.1)' }]}>
                <Thermometer size={12} color={exercise.pilates_temperature === 'regular' ? '#3B82F6' : '#F97316'} />
                <Text style={[styles.badgeText, { color: exercise.pilates_temperature === 'regular' ? '#3B82F6' : '#F97316' }]}>{exercise.pilates_temperature}</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Instructor */}
      {instructor && (
        <View style={[styles.instructorRow, { marginTop: 8 }]}>
          <User size={14} color="rgba(255,255,255,0.6)" />
          <Text style={styles.instructorText}>Instructor: {instructor}</Text>
        </View>
      )}

      {/* Poses List */}
      {exercise.poses && exercise.poses.length > 0 && (
        <View style={[styles.posesContainer, { marginTop: 8 }]}>
          {displayedPoses.map((pose, index) => (
            <View key={pose.id} style={styles.poseItem}>
              <View style={styles.poseContent}>
                <Text style={styles.poseName}>{pose.name}</Text>
                {pose.notes && <Text style={styles.poseNotes}>{pose.notes}</Text>}
              </View>
              <View style={styles.poseStats}>
                {pose.hold_duration_seconds !== undefined && (
                  <Text style={styles.poseStatText}>
                    {pose.hold_duration_seconds}{pose.hold_duration_unit === 'breaths' ? ' breaths' : 's'}
                  </Text>
                )}
                {pose.hold_duration_seconds !== undefined && pose.repetitions !== undefined && (
                   <Text style={styles.poseStatText}> • </Text>
                )}
                {pose.repetitions !== undefined && (
                  <Text style={styles.poseStatText}>{pose.repetitions} reps</Text>
                )}
              </View>
            </View>
          ))}

          {!forceExpand && exercise.poses.length > collapsedCount && (
            <TouchableOpacity onPress={toggleExpand} style={styles.expandPosesButton}>
              <Text style={styles.expandPosesText}>{isExpanded ? 'Collapse' : 'Expand'}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    paddingVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
  },
  setsScroll: {
    gap: 24,
    paddingHorizontal: 16,
    marginTop: 8,
    flexGrow: 1,
    justifyContent: 'center',
  },
  setColumn: {
    alignItems: 'center',
    minWidth: 45,
  },
  setLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#8E8E93',
    marginBottom: 2,
  },
  setValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  setSubValue: {
    fontSize: 12,
    color: '#8E8E93',
  },
  cardioDetails: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginTop: 8,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  badgesScroll: {
    gap: 8,
    paddingRight: 16,
    paddingVertical: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  instructorText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  posesContainer: {
    gap: 8,
  },
  poseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  poseIcon: {
    marginRight: 8,
  },
  poseContent: {
    flex: 1,
  },
  poseName: {
    fontSize: 15,
    color: '#fff',
  },
  poseNotes: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    fontStyle: 'italic',
  },
  poseStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  poseStatText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  expandPosesButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  expandPosesText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  lockedCard: {
    height: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  lockedText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '600',
  }
});
