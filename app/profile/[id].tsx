import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, ActivityIndicator, Text, RefreshControl, useColorScheme, TouchableOpacity } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
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
import { supabase } from '../../src/lib/supabase';
import { ChevronLeft, ClipboardList } from 'lucide-react-native';
import { User as AppUser } from '../../src/types';

export default function ProfileDetailScreen() {
  const { id: userId } = useLocalSearchParams<{ id: string }>();
  const { profile: currentUser } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState<ProfileTabType>('Posts');

  // 1. Fetch user profile
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          body_metrics:user_body_metrics(*),
          goals:user_goals(*),
          credentials:user_credentials(*)
        `)
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      const metricsData = Array.isArray(data.body_metrics) ? data.body_metrics[0] : data.body_metrics;

      const mappedProfile: AppUser = {
        ...data,
        body_metrics: metricsData,
        build: metricsData ? {
          body_type: metricsData.body_type,
          activity_level: metricsData.activity_level,
          experience_level: metricsData.experience_level,
          last_updated: metricsData.build_updated_at || metricsData.updated_at
        } : undefined,
        goals: data.goals || [],
        credentials: data.credentials || [],
        is_physio_tab_visible: data.is_physio_tab_visible ?? data.physio_tab_visible ?? true,
        posts_count: data.posts ?? 0,
        followers_count: data.followers ?? 0,
        following_count: data.following ?? 0,
        subscribers_count: data.subscribers ?? 0,
        subscriptions_count: data.subscriptions ?? 0,
      };
      return mappedProfile;
    },
  });

  // 2. Fetch user posts
  const { data: posts, isLoading: postsLoading, refetch: refetchPosts } = useQuery({
    queryKey: ['user-posts', userId],
    queryFn: () => userId ? PostsService.fetchUserPosts(userId) : Promise.resolve([]),
    enabled: !!userId && selectedTab === 'Posts',
  });

  if (profileLoading || !profile) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: isDark ? '#000' : '#fff' }]}>
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
  
  if (profile.is_physio_tab_visible) {
    availableTabs.push('Physio');
  }

  const isMe = currentUser?.id === userId;

  const onRefresh = async () => {
    await refetchProfile();
    if (selectedTab === 'Posts') {
      await refetchPosts();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <Stack.Screen 
        options={{
          headerTitle: profile.handle,
          headerLeft: () => !isMe ? (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
              <ChevronLeft size={28} color={isDark ? '#fff' : '#007AFF'} />
            </TouchableOpacity>
          ) : null,
        }}
      />

      <ScrollView 
        stickyHeaderIndices={[isMe ? 2 : 3]} // Sticky tab bar
        refreshControl={
          <RefreshControl 
            refreshing={false} 
            onRefresh={onRefresh} 
            tintColor={isDark ? '#fff' : '#000'}
          />
        }
      >
        <ProfileHeader user={profile} onEditPress={isMe ? (() => router.push('/profile/edit' as any)) : undefined} />
        
        {!isMe && (
          <View style={styles.actionButtons}>
             <TouchableOpacity style={[styles.actionButton, styles.followButton]}>
                <Text style={styles.actionButtonText}>Follow</Text>
             </TouchableOpacity>
             {profile.profile_type === 'Coach' && (
               <TouchableOpacity style={[styles.actionButton, styles.subscribeButton]}>
                  <Text style={styles.actionButtonText}>Subscribe</Text>
               </TouchableOpacity>
             )}
             <TouchableOpacity 
               style={[styles.actionButton, styles.messageButton]}
               onPress={() => router.push(`/chat/${userId}` as any)}
             >
                <Text style={[styles.actionButtonText, { color: isDark ? '#fff' : '#000' }]}>Message</Text>
             </TouchableOpacity>
          </View>
        )}

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
                posts?.map((post) => (
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  followButton: {
    backgroundColor: '#007AFF',
  },
  subscribeButton: {
    backgroundColor: '#FF9500',
  },
  messageButton: {
    backgroundColor: 'rgba(142, 142, 147, 0.2)',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
