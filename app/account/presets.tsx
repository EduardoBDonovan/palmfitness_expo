import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, useColorScheme, RefreshControl } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../src/context/AuthContext';
import { PresetsService } from '../../src/services/presets';
import { PresetType, UserPreset } from '../../src/types';
import { Plus, Trash2, ChevronRight } from 'lucide-react-native';
import { format } from 'date-fns';

export default function PresetsScreen() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<PresetType>('workout');
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: presets, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['presets', user?.id],
    queryFn: () => user ? PresetsService.fetchPresets(user.id) : Promise.resolve([]),
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => PresetsService.deletePreset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presets', user?.id] });
    }
  });

  const handleDelete = (preset: UserPreset) => {
    Alert.alert(
      'Delete Preset',
      `Are you sure you want to delete "${preset.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(preset.id) }
      ]
    );
  };

  const filteredPresets = presets?.filter(p => p.preset_type === selectedTab) || [];

  const renderItem = ({ item }: { item: UserPreset }) => (
    <TouchableOpacity 
      style={[styles.row, { backgroundColor: isDark ? '#1C1C1E' : '#fff' }]}
      onPress={() => router.push({
        pathname: '/account/presets/edit',
        params: { id: item.id }
      })}
    >
      <View style={styles.rowContent}>
        <Text style={[styles.presetName, { color: isDark ? '#fff' : '#000' }]}>{item.name}</Text>
        <View style={styles.rowFooter}>
          <View style={styles.activityBadge}>
            <Text style={styles.activityText}>{item.activity_type}</Text>
          </View>
          <Text style={styles.dateText}>{format(new Date(item.created_at), 'MMM d, yyyy')}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteButton}>
        <Trash2 size={18} color="#FF3B30" />
      </TouchableOpacity>
      <ChevronRight size={18} color="#C7C7CC" />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F2F2F7' }]}>
      <Stack.Screen 
        options={{
          headerTitle: 'Presets',
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => router.push({
                pathname: '/account/presets/edit',
                params: { type: selectedTab }
              })} 
              style={{ marginRight: 15 }}
            >
              <Plus size={24} color="#007AFF" />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'workout' && styles.activeTab]} 
          onPress={() => setSelectedTab('workout')}
        >
          <Text style={[styles.tabText, selectedTab === 'workout' && styles.activeTabText]}>Workouts</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'exercise' && styles.activeTab]} 
          onPress={() => setSelectedTab('exercise')}
        >
          <Text style={[styles.tabText, selectedTab === 'exercise' && styles.activeTabText]}>Exercises</Text>
        </TouchableOpacity>
      </View>

      {isLoading && !isRefetching ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredPresets}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={isDark ? '#fff' : '#000'} />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No presets found.</Text>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: 'rgba(142, 142, 147, 0.12)',
    borderRadius: 8,
    padding: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8E8E93',
  },
  activeTabText: {
    color: '#000',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  rowContent: {
    flex: 1,
    gap: 4,
  },
  presetName: {
    fontSize: 17,
    fontWeight: '600',
  },
  rowFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityBadge: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activityText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  dateText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  deleteButton: {
    padding: 8,
    marginRight: 8,
  },
  separator: {
    height: 8,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 16,
  }
});
