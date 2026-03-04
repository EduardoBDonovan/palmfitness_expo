import { supabase } from '../lib/supabase';

export const UserService = {
  async fetchSubscriptions(subscriberId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('creator_id')
      .eq('subscriber_id', subscriberId)
      .eq('status', 'active');

    if (error) {
      console.error('Error fetching subscriptions:', error);
      return [];
    }

    return (data || []).map(record => record.creator_id);
  },

  async fetchFollowing(followerId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', followerId);

    if (error) {
      console.error('Error fetching following:', error);
      return [];
    }

    return (data || []).map(record => record.following_id);
  },

  async subscribe(subscriberId: string, creatorId: string): Promise<void> {
    const { error } = await supabase
      .from('subscriptions')
      .upsert({
        subscriber_id: subscriberId,
        creator_id: creatorId,
        status: 'active',
        started_at: new Date().toISOString()
      });

    if (error) throw error;
  },

  async unsubscribe(subscriberId: string, creatorId: string): Promise<void> {
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('subscriber_id', subscriberId)
      .eq('creator_id', creatorId);

    if (error) throw error;
  },

  async follow(followerId: string, followingId: string): Promise<void> {
    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: followerId,
        following_id: followingId,
        created_at: new Date().toISOString()
      });

    if (error) throw error;
  },

  async unfollow(followerId: string, followingId: string): Promise<void> {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) throw error;
  },
  
  async fetchUserSummary(uid: string) {
    const { data, error } = await supabase
      .rpc('get_user_summary', { uid });

    if (error) throw error;
    return data;
  }
};
