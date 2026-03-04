import { supabase } from '../lib/supabase';
import { Message, Chat, User } from '../types';

export const MessageService = {
  async fetchRecentChats(currentUserId: string): Promise<Chat[]> {
    // 1. Fetch all messages for current user
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!messages) return [];

    // 2. Group by other user ID
    const latestMessages: Record<string, Message> = {};
    const unreadCounts: Record<string, number> = {};
    const otherUserIds = new Set<string>();

    messages.forEach((msg) => {
      const otherId = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id;
      otherUserIds.add(otherId);

      if (!latestMessages[otherId]) {
        latestMessages[otherId] = msg;
      }

      if (msg.receiver_id === currentUserId && !msg.is_read) {
        unreadCounts[otherId] = (unreadCounts[otherId] || 0) + 1;
      }
    });

    // 3. Fetch User Profiles for these IDs
    const { data: userProfiles, error: usersError } = await supabase
      .from('users')
      .select('*')
      .in('id', Array.from(otherUserIds));

    if (usersError) throw usersError;

    // 4. Combine into Chats
    const chats: Chat[] = (userProfiles || []).map((profile) => {
      const lastMessage = latestMessages[profile.id];
      return {
        id: profile.id,
        other_user: profile as User,
        last_message: lastMessage,
        unread_count: unreadCounts[profile.id] || 0,
      };
    });

    return chats.sort((a, b) => 
      new Date(b.last_message.created_at).getTime() - new Date(a.last_message.created_at).getTime()
    );
  },

  async fetchMessages(currentUserId: string, otherUserId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async sendMessage(senderId: string, receiverId: string, content: string): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert({ sender_id: senderId, receiver_id: receiverId, content })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async markAsRead(messageId: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', messageId);

    if (error) throw error;
  },

  subscribeToMessages(
    currentUserId: string, 
    otherUserId: string, 
    onMessageReceived: (message: Message) => void
  ) {
    return supabase
      .channel('public:messages')
      .on(
        'postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages' 
        }, 
        (payload) => {
          const newMessage = payload.new as Message;
          const isRelevant = 
            (newMessage.sender_id === currentUserId && newMessage.receiver_id === otherUserId) ||
            (newMessage.sender_id === otherUserId && newMessage.receiver_id === currentUserId);
          
          if (isRelevant) {
            onMessageReceived(newMessage);
          }
        }
      )
      .subscribe();
  }
};
