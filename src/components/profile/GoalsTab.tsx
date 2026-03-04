import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Goal } from '../../types';
import { Target, CheckCircle2 } from 'lucide-react-native';
import { format } from 'date-fns';

interface GoalsTabProps {
  goals?: Goal[];
}

export const GoalsTab: React.FC<GoalsTabProps> = ({ goals = [] }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  if (goals.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Target size={50} color="#8E8E93" />
        <Text style={[styles.emptyTitle, { color: isDark ? '#fff' : '#000' }]}>No Goals Set</Text>
        <Text style={styles.emptySubtitle}>Add your goals in your profile settings</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {goals.map((goal) => (
        <View key={goal.id} style={[styles.goalCard, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7', opacity: goal.is_completed ? 0.7 : 1 }]}>
          <View style={styles.goalHeader}>
            <Text style={[styles.goalTitle, { color: isDark ? '#fff' : '#000' }]}>{goal.title}</Text>
            {goal.is_completed && <CheckCircle2 size={20} color="#34C759" />}
          </View>

          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Target Date:</Text>
            <Text style={[styles.dateValue, { color: isDark ? '#fff' : '#000' }]}>
              {format(new Date(goal.target_date), 'MMM d, yyyy')}
            </Text>
          </View>

          {goal.date_completed && (
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Completed:</Text>
              <Text style={[styles.dateValue, { color: '#34C759' }]}>
                {format(new Date(goal.date_completed), 'MMM d, yyyy')}
              </Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  goalCard: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateLabel: {
    fontSize: 15,
    color: '#8E8E93',
  },
  dateValue: {
    fontSize: 15,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
