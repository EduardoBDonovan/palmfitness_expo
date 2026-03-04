import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { User } from '../../types';

interface ProfileStatsProps {
  user: User;
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({ user }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      <StatItem title="Posts" value={user.posts_count} />
      <StatItem title="Followers" value={user.followers_count} />
      <StatItem title="Following" value={user.following_count} />
      <StatItem title="Subscribers" value={user.subscribers_count} />
    </View>
  );
};

const StatItem: React.FC<{ title: string; value: number }> = ({ title, value }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.statContainer}>
      <Text style={[styles.valueText, { color: isDark ? '#fff' : '#000' }]}>{value}</Text>
      <Text style={styles.titleText}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#333',
  },
  statContainer: {
    alignItems: 'center',
  },
  valueText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  titleText: {
    fontSize: 12,
    color: '#8E8E93',
  },
});
