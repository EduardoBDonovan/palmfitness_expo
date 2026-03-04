import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, ActivityIndicator, Text, RefreshControl, useColorScheme, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../src/context/AuthContext';
import { PostsService } from '../../src/services/posts';
import { ProfileHeader } from '../../src/components/profile/ProfileHeader';
import { ProfileStats } from '../../src/components/profile/ProfileStats';
import { ProfileTabs, ProfileTabType } from '../../src/components/profile/ProfileTabs';
import { GoalsTab } from '../../src/components/profile/GoalsTab';
import { PhysioTab } from '../../src/components/profile/PhysioTab';
import { CredentialsTab } from '../../src/components/profile/CredentialsTab';
import { PostCard } from '../../src/components/PostCard';
import { AppTheme } from '../../src/constants/theme';
import { useRouter, Stack } from 'expo-router';
import { Settings, ClipboardList } from 'lucide-react-native';
import { Post } from '../../src/types';

export default function ProfileScreen() {
  const { profile, user, refreshProfile } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<ProfileTabType>('Posts');

  const { 
    data: posts, 
    isLoading: postsLoading, 
    refetch: refetchPosts 
  } = useQuery({
    queryKey: ['user-posts', user?.id],
    queryFn: () => user ? PostsService.fetchUserPosts(user.id) : Promise.resolve([]),
    enabled: !!user && selectedTab === 'Posts',
  });

  if (!profile) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const availableTabs: ProfileTabType[] = ['Posts'];
  if (profile.profile_type === 'Coach') {
    availableTabs.push('Programs', 'Credentials');
  } else {
    availableTabs.push('Goals');
  }
  
  // In iOS, Physio tab is visible if userState.isPhysioTabVisible is true
  if (profile.is_physio_tab_visible) {
    availableTabs.push('Physio');
  }

  const onRefresh = async () => {
    if (selectedTab === 'Posts') {
      await refetchPosts();
    }
    await refreshProfile();
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <Stack.Screen 
        options={{
          headerTitle: profile.handle || 'Profile',
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => router.push('/account' as any)} 
              style={{ marginRight: 15 }}
            >
              <Settings size={24} color={isDark ? '#fff' : '#007AFF'} />
            </TouchableOpacity>
          ),
        }} 
      />
      <ScrollView 
        stickyHeaderIndices={[2]}
        refreshControl={
          <RefreshControl 
            refreshing={false} 
            onRefresh={onRefresh} 
            tintColor={isDark ? '#fff' : '#000'}
          />
        }
      >
        <ProfileHeader user={profile} onEditPress={() => router.push('/profile/edit' as any)} />
        <ProfileStats user={profile} />
        
        <View style={{ backgroundColor: isDark ? '#000' : '#fff' }}>
          <ProfileTabs 
            selectedTab={selectedTab} 
            onTabSelect={setSelectedTab} 
            availableTabs={availableTabs} 
          />
        </View>

        <View style={styles.tabContent}>
          {selectedTab === 'Posts' && (
            <View>
              {postsLoading ? (
                <ActivityIndicator style={{ marginTop: 20 }} />
              ) : (
                posts?.map((post: Post) => (
                  <View key={post.id}>
                    <PostCard 
                      post={post} 
                      onPostDetailRequested={(post, focus) => router.push({
                        pathname: `/post/${post.id}` as any,
                        params: { focus: focus ? 'true' : 'false' }
                      })}
                    />
                    <View style={[styles.separator, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }]} />
                  </View>
                ))
              )}
              {posts?.length === 0 && !postsLoading && (
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyText, { color: isDark ? '#fff' : '#000' }]}>No posts yet</Text>
                </View>
              )}
            </View>
          )}

          {selectedTab === 'Goals' && (
            <GoalsTab goals={profile.goals} />
          )}

          {selectedTab === 'Physio' && (
            <PhysioTab bodyMetrics={profile.body_metrics} build={profile.build} />
          )}

          {selectedTab === 'Credentials' && (
            <CredentialsTab credentials={profile.credentials} />
          )}

          {selectedTab === 'Programs' && (
            <View style={styles.placeholderTab}>
              <ClipboardList size={50} color="#8E8E93" />
              <Text style={[styles.emptyTitle, { color: isDark ? '#fff' : '#000', marginTop: 16 }]}>No Programs Yet</Text>
              <Text style={[styles.emptyText, { color: isDark ? '#fff' : '#000', textAlign: 'center', marginTop: 8 }]}>Professional training programs coming soon</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  tabContent: {
    flex: 1,
  },
  separator: {
    height: 8,
  },
  placeholderTab: {
    padding: 60,
    alignItems: 'center',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    opacity: 0.6,
    fontSize: 15,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
  }
});
