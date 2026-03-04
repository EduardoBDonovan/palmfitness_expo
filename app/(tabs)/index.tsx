import React from 'react';
import { StyleSheet, FlatList, View, ActivityIndicator, Text, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { PostsService } from '../../src/services/posts';
import { PostCard } from '../../src/components/PostCard';
import { AppTheme } from '../../src/constants/theme';
import { useColorScheme } from '@/components/useColorScheme';
import { useRouter } from 'expo-router';

export default function FeedScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const { 
    data: posts, 
    isLoading, 
    isRefetching, 
    refetch 
  } = useQuery({
    queryKey: ['feed'],
    queryFn: () => PostsService.fetchFeed(),
  });

  const renderItem = ({ item }: { item: any }) => (
    <PostCard 
      post={item} 
      onProfileTapped={(uid) => router.push(`/profile/${uid}` as any)}
      onPostDetailRequested={(post, focus) => router.push({
        pathname: `/post/${post.id}` as any,
        params: { focus: focus ? 'true' : 'false' }
      })}
    />
  );

  const renderSeparator = () => (
    <View style={[
      styles.separator, 
      { backgroundColor: isDark ? '#000' : AppTheme.colors.background.light }
    ]} />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: isDark ? '#fff' : '#000' }]}>
        No posts yet
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!posts || posts.length === 0) {
    // Attempt to show what's wrong if posts is not null but empty
    return (
      <View style={styles.centered}>
        <Text style={{ color: '#fff', marginBottom: 20 }}>No posts found in Feed</Text>
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#fff" />
      </View>
    );
  }

  return (
    <View style={[
      styles.container, 
      { backgroundColor: isDark ? '#000' : AppTheme.colors.background.light }
    ]}>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={renderSeparator}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl 
            refreshing={isRefetching} 
            onRefresh={refetch} 
            tintColor={isDark ? '#fff' : '#000'}
          />
        }
        contentContainerStyle={styles.listContent}
      />
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
  listContent: {
    paddingBottom: 20,
  },
  separator: {
    height: 8,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
  }
});
