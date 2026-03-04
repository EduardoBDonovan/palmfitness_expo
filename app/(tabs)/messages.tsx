import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, useColorScheme } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter, Stack } from 'expo-router';
import { MessageService } from '../../src/services/messages';
import { useAuth } from '../../src/context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, SquarePen } from 'lucide-react-native';

export default function MessagesScreen() {
  const { user } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const { data: chats, isLoading, refetch } = useQuery({
    queryKey: ['chats', user?.id],
    queryFn: () => user ? MessageService.fetchRecentChats(user.id) : Promise.resolve([]),
    enabled: !!user,
  });

  const renderItem = ({ item }: { item: any }) => {
    const timeAgo = formatDistanceToNow(new Date(item.last_message.created_at), { addSuffix: true })
      .replace('about ', '')
      .replace('less than a minute ago', 'now');

    return (
      <TouchableOpacity 
        style={styles.chatRow}
        onPress={() => router.push(`/chat/${item.id}`)}
      >
        <View style={styles.avatarContainer}>
          <LinearGradient
            colors={['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          {item.other_user.profile_picture_url ? (
            <Image 
              source={{ uri: item.other_user.profile_picture_url }} 
              style={styles.avatarImage} 
            />
          ) : (
            <Text style={styles.avatarInitials}>
              {item.other_user.avatar || item.other_user.name.substring(0, 1)}
            </Text>
          )}
        </View>

        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={[styles.userName, { color: isDark ? '#fff' : '#000' }]} numberOfLines={1}>
              {item.other_user.name}
            </Text>
            <Text style={styles.timeText}>{timeAgo}</Text>
          </View>
          
          <View style={styles.chatFooter}>
            <Text 
              style={[
                styles.lastMessage, 
                { color: item.unread_count > 0 ? (isDark ? '#fff' : '#000') : '#8E8E93' },
                item.unread_count > 0 && { fontWeight: '600' }
              ]} 
              numberOfLines={1}
            >
              {item.last_message.content}
            </Text>
            {item.unread_count > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unread_count}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: isDark ? '#000' : '#fff' }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <Stack.Screen 
        options={{
          headerTitle: 'Messages',
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => router.push('/messages/new')} 
              style={{ marginRight: 15 }}
            >
              <SquarePen size={24} color={isDark ? '#fff' : '#007AFF'} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <View style={[styles.searchBar, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }]}>
        <Search size={18} color="#8E8E93" />
        <Text style={styles.searchText}>Search messages</Text>
      </View>

      <FlatList
        data={chats}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshing={false}
        onRefresh={refetch}
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }]} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No messages yet</Text>
          </View>
        )}
      />
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 10,
    borderRadius: 10,
    gap: 10,
  },
  searchText: {
    color: '#8E8E93',
    fontSize: 16,
  },
  chatRow: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarImage: {
    width: 56,
    height: 56,
  },
  avatarInitials: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  chatInfo: {
    flex: 1,
    gap: 4,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
  },
  timeText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 15,
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    marginLeft: 84,
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
