import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ActivityIndicator, useColorScheme, RefreshControl } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PostsService } from '../../src/services/posts';
import { useAuth } from '../../src/context/AuthContext';
import { PostCard } from '../../src/components/PostCard';
import { AppTheme } from '../../src/constants/theme';
import { Send, Trash2, ChevronLeft } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';

export default function PostDetailScreen() {
  const { id: postId, focus: focusComments } = useLocalSearchParams<{ id: string, focus?: string }>();
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const queryClient = useQueryClient();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const listRef = useRef<FlatList>(null);

  // 1. Fetch the single post
  const { data: post, isLoading: postLoading, refetch: refetchPost } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => PostsService.fetchPostById(postId),
  });

  // 2. Fetch comments
  const { data: comments, isLoading: commentsLoading, refetch: refetchComments } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => PostsService.fetchComments(postId),
  });

  useEffect(() => {
    if (focusComments === 'true') {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 500);
    }
  }, [focusComments]);

  // 3. Comment Mutation
  const commentMutation = useMutation({
    mutationFn: (text: string) => 
      user ? PostsService.addComment(postId, user.id, text) : Promise.reject('No user'),
    onSuccess: () => {
      setNewComment('');
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    }
  });

  const handleSendComment = () => {
    if (!newComment.trim()) return;
    commentMutation.mutate(newComment.trim());
  };

  const onRefresh = async () => {
    await Promise.all([refetchPost(), refetchComments()]);
  };

  const renderComment = ({ item }: { item: any }) => {
    const timeAgo = formatDistanceToNow(new Date(item.created_at), { addSuffix: true })
      .replace('about ', '')
      .replace('less than a minute ago', 'now');

    return (
      <View style={styles.commentRow}>
        <View style={styles.commentAvatarContainer}>
          <LinearGradient
            colors={['#3B82F6', '#8B5CF6']}
            style={StyleSheet.absoluteFill}
          />
          {item.user_profile_picture_url ? (
            <Image source={{ uri: item.user_profile_picture_url }} style={styles.commentAvatar} />
          ) : (
            <Text style={styles.commentAvatarText}>{item.user_avatar || '?'}</Text>
          )}
        </View>
        <View style={styles.commentContent}>
          <View style={styles.commentHeader}>
            <Text style={[styles.commentHandle, { color: isDark ? '#fff' : '#000' }]}>{item.user_handle}</Text>
            <Text style={styles.commentTime}>{timeAgo}</Text>
          </View>
          <Text style={[styles.commentText, { color: isDark ? '#fff' : '#000' }]}>{item.text}</Text>
        </View>
      </View>
    );
  };

  if (postLoading || !post) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: isDark ? '#000' : '#fff' }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Stack.Screen 
        options={{
          headerTitle: post.post_type === 'workout' ? 'Workout' : post.post_type === 'meal' ? 'Meal' : 'Post',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
              <ChevronLeft size={28} color={isDark ? '#fff' : '#007AFF'} />
            </TouchableOpacity>
          ),
        }}
      />

      <FlatList
        ref={listRef}
        data={comments}
        renderItem={renderComment}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={() => (
          <View>
            <PostCard post={post} forceExpand={true} />
            <View style={[styles.sectionDivider, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }]} />
            <Text style={[styles.commentsTitle, { color: isDark ? '#fff' : '#000' }]}>Comments</Text>
          </View>
        )}
        ListEmptyComponent={() => (
          !commentsLoading ? (
            <View style={styles.emptyComments}>
              <Text style={styles.emptyText}>No comments yet. Be the first!</Text>
            </View>
          ) : <ActivityIndicator style={{ marginTop: 20 }} />
        )}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={onRefresh} tintColor={isDark ? '#fff' : '#000'} />
        }
        contentContainerStyle={styles.listContent}
      />

      <View style={[styles.inputContainer, { borderTopColor: isDark ? '#333' : '#E5E5E5' }]}>
        <TextInput
          ref={inputRef}
          style={[styles.input, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7', color: isDark ? '#fff' : '#000' }]}
          placeholder="Add a comment..."
          placeholderTextColor="#8E8E93"
          value={newComment}
          onChangeText={setNewComment}
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]} 
          onPress={handleSendComment}
          disabled={!newComment.trim() || commentMutation.isPending}
        >
          <Send size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  listContent: {
    paddingBottom: 20,
  },
  sectionDivider: {
    height: 8,
  },
  commentsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 16,
  },
  commentRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  commentAvatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAvatar: {
    width: 36,
    height: 36,
  },
  commentAvatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  commentContent: {
    flex: 1,
    gap: 4,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commentHandle: {
    fontSize: 14,
    fontWeight: '700',
  },
  commentTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  commentText: {
    fontSize: 15,
    lineHeight: 20,
  },
  emptyComments: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 30 : 12,
    alignItems: 'center',
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#8E8E93',
  }
});
