import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ActivityIndicator, useColorScheme } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageService } from '../../src/services/messages';
import { useAuth } from '../../src/context/AuthContext';
import { supabase } from '../../src/lib/supabase';
import { Send, ChevronLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';

export default function ChatScreen() {
  const { id: otherUserId } = useLocalSearchParams<{ id: string }>();
  const { user, profile: currentUser } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const queryClient = useQueryClient();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  // 1. Fetch other user's profile
  const { data: otherUser } = useQuery({
    queryKey: ['user-profile', otherUserId],
    queryFn: async () => {
      const { data, error } = await supabase.from('users').select('*').eq('id', otherUserId).maybeSingle();
      if (error) throw error;
      return data ?? null;
    },
  });

  // 2. Fetch messages
  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', otherUserId],
    queryFn: () => user ? MessageService.fetchMessages(user.id, otherUserId) : Promise.resolve([]),
    enabled: !!user,
  });

  // 3. Realtime Subscription
  useEffect(() => {
    if (!user || !otherUserId) return;

    const channel = MessageService.subscribeToMessages(user.id, otherUserId, (newMessage) => {
      queryClient.setQueryData(['messages', otherUserId], (old: any) => [...(old || []), newMessage]);
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, otherUserId]);

  // 4. Send Message Mutation
  const sendMutation = useMutation({
    mutationFn: (content: string) => 
      user ? MessageService.sendMessage(user.id, otherUserId, content) : Promise.reject('No user'),
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    }
  });

  const handleSend = () => {
    if (!newMessage.trim()) return;
    sendMutation.mutate(newMessage.trim());
  };

  const renderItem = ({ item }: { item: any }) => {
    const isMe = item.sender_id === user?.id;
    const time = format(new Date(item.created_at), 'HH:mm');

    return (
      <View style={[styles.messageBubbleContainer, isMe ? styles.myMessageContainer : styles.theirMessageContainer]}>
        {!isMe && (
          <View style={styles.bubbleAvatarContainer}>
            <LinearGradient
              colors={['#3B82F6', '#8B5CF6']}
              style={StyleSheet.absoluteFill}
            />
            {otherUser?.profile_picture_url ? (
              <Image source={{ uri: otherUser.profile_picture_url }} style={styles.bubbleAvatar} />
            ) : (
              <Text style={styles.bubbleAvatarText}>{otherUser?.avatar || '?'}</Text>
            )}
          </View>
        )}
        
        <View style={[
          styles.messageBubble, 
          isMe ? styles.myBubble : [styles.theirBubble, { backgroundColor: isDark ? '#333' : '#E9E9EB' }]
        ]}>
          <Text style={[styles.messageText, isMe ? styles.myMessageText : { color: isDark ? '#fff' : '#000' }]}>
            {item.content}
          </Text>
          <Text style={[styles.messageTime, isMe ? styles.myMessageTime : styles.theirMessageTime]}>
            {time}
          </Text>
        </View>

        {isMe && (
          <View style={styles.bubbleAvatarContainer}>
            <LinearGradient
              colors={['#3B82F6', '#8B5CF6']}
              style={StyleSheet.absoluteFill}
            />
            {currentUser?.profile_picture_url ? (
              <Image source={{ uri: currentUser.profile_picture_url }} style={styles.bubbleAvatar} />
            ) : (
              <Text style={styles.bubbleAvatarText}>{currentUser?.avatar || '?'}</Text>
            )}
          </View>
        )}
      </View>
    );
  };

  if (isLoading || !otherUser) {
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
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              <Text style={[styles.headerName, { color: isDark ? '#fff' : '#000' }]}>{otherUser.name}</Text>
              <Text style={styles.headerHandle}>{otherUser.handle}</Text>
            </View>
          ),
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
              <ChevronLeft size={28} color={isDark ? '#fff' : '#007AFF'} />
            </TouchableOpacity>
          ),
        }}
      />

      <FlatList
        data={[...(messages || [])].reverse()}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        inverted
        contentContainerStyle={styles.listContent}
      />

      <View style={[styles.inputContainer, { borderTopColor: isDark ? '#333' : '#E5E5E5' }]}>
        <TextInput
          style={[styles.input, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7', color: isDark ? '#fff' : '#000' }]}
          placeholder="Message..."
          placeholderTextColor="#8E8E93"
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]} 
          onPress={handleSend}
          disabled={!newMessage.trim() || sendMutation.isPending}
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
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerName: {
    fontSize: 17,
    fontWeight: '700',
  },
  headerHandle: {
    fontSize: 12,
    color: '#8E8E93',
  },
  listContent: {
    padding: 16,
  },
  messageBubbleContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
    gap: 8,
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
  },
  theirMessageContainer: {
    alignSelf: 'flex-start',
  },
  bubbleAvatarContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubbleAvatar: {
    width: 28,
    height: 28,
  },
  bubbleAvatarText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
  },
  myBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myMessageTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  theirMessageTime: {
    color: '#8E8E93',
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
