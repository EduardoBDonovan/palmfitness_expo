import { supabase } from '../lib/supabase';
import { Post, WorkoutPost, MealPost, LifestylePost } from '../types';

export const PostsService = {
  async fetchFeed(limit: number = 20): Promise<Post[]> {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        post_workouts(*, post_workout_exercises(*, post_workout_exercise_sets(*), post_workout_exercise_poses(*))),
        post_meals(*, post_meal_ingredients(*), post_meal_recipe_steps(*)),
        post_lifestyle(*),
        post_media(*)
      `)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Supabase fetchFeed error:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log('No posts returned from Supabase feed query.');
    } else {
      console.log('Successfully fetched', data.length, 'raw posts.');
    }
    
    return this.mapPosts(data);
  },

  async fetchPostById(id: string): Promise<Post | null> {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        post_workouts(*, post_workout_exercises(*, post_workout_exercise_sets(*), post_workout_exercise_poses(*))),
        post_meals(*, post_meal_ingredients(*), post_meal_recipe_steps(*)),
        post_lifestyle(*),
        post_media(*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return this.mapPost(data);
  },

  async fetchUserPosts(uid: string, limit: number = 20): Promise<Post[]> {
    // 1. Fetch original posts
    const { data: originalData, error: originalError } = await supabase
      .from('posts')
      .select(`
        *,
        post_workouts(*, post_workout_exercises(*, post_workout_exercise_sets(*), post_workout_exercise_poses(*))),
        post_meals(*, post_meal_ingredients(*), post_meal_recipe_steps(*)),
        post_lifestyle(*),
        post_media(*)
      `)
      .eq('creator_uid', uid)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (originalError) throw originalError;

    // 2. Fetch reposts/tracks
    const { data: repostData, error: repostError } = await supabase
      .from('post_reposts')
      .select(`
        original_post_id,
        repost_type,
        created_at,
        user_id,
        users:user_id(handle),
        posts:original_post_id(
          *,
          post_workouts(*, post_workout_exercises(*, post_workout_exercise_sets(*), post_workout_exercise_poses(*))),
          post_meals(*, post_meal_ingredients(*), post_meal_recipe_steps(*)),
          post_lifestyle(*),
          post_media(*)
        )
      `)
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (repostError) throw repostError;

    const originalPosts = this.mapPosts(originalData);
    
    // Map and merge reposts
    const repostedPosts = (repostData || []).map((record: any) => {
      const post = this.mapPost(record.posts);
      if (!post) return null;
      
      return {
        ...post,
        reposter_id: record.user_id,
        reposter_handle: record.users?.handle,
        repost_type: record.repost_type,
        repost_date: record.created_at,
      };
    }).filter(Boolean) as Post[];

    // Merge and sort by effective date
    const allPosts = [...originalPosts];
    const existingIds = new Set(allPosts.map(p => p.id));

    for (const p of repostedPosts) {
      if (!existingIds.has(p.id)) {
        allPosts.push(p);
      }
    }

    return allPosts.sort((a, b) => {
      const dateA = new Date(a.repost_date || a.timestamp).getTime();
      const dateB = new Date(b.repost_date || b.timestamp).getTime();
      return dateB - dateA;
    });
  },

  async fetchUserSummary(uid: string) {
    const { data, error } = await supabase
      .rpc('get_user_summary', { uid });

    if (error) throw error;
    return data;
  },

  // MARK: - Social Interactions

  async likePost(postId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('post_likes')
      .insert({ post_id: postId, user_id: userId });
    
    if (error) throw error;
  },

  async unlikePost(postId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);
    
    if (error) throw error;
  },

  async checkIfUserLikedPost(postId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .limit(1);
    
    if (error) return false;
    return (data || []).length > 0;
  },

  async fetchComments(postId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('post_comments')
      .select(`
        id, 
        post_id, 
        user_id, 
        text, 
        created_at, 
        users(handle, avatar, profile_picture_url)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return (data || []).map(record => {
      const userData = Array.isArray(record.users) ? record.users[0] : record.users;
      return {
        id: record.id,
        post_id: record.post_id,
        user_id: record.user_id,
        text: record.text,
        created_at: record.created_at,
        user_handle: userData?.handle,
        user_avatar: userData?.avatar,
        user_profile_picture_url: userData?.profile_picture_url,
      };
    });
  },

  async addComment(postId: string, userId: string, text: string): Promise<void> {
    const { error } = await supabase
      .from('post_comments')
      .insert({ post_id: postId, user_id: userId, text });
    
    if (error) throw error;
  },

  async repostPost(postId: string, userId: string, type: 'repost' | 'track'): Promise<void> {
    const { error } = await supabase
      .from('post_reposts')
      .insert({ 
        original_post_id: postId, 
        user_id: userId, 
        repost_type: type 
      });
    
    if (error) throw error;
  },

  async removeRepost(postId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('post_reposts')
      .delete()
      .eq('original_post_id', postId)
      .eq('user_id', userId);
    
    if (error) throw error;
  },

  async checkIfUserReposted(postId: string, userId: string): Promise<'repost' | 'track' | null> {
    const { data, error } = await supabase
      .from('post_reposts')
      .select('repost_type')
      .eq('original_post_id', postId)
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle();
    
    if (error) throw error;
    return data?.repost_type ?? null;
  },

  async deletePost(postId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('creator_uid', userId);
    
    if (error) throw error;
  },

  // Helper to map DB records to our UI models
  mapPosts(data: any[] | null): Post[] {
    if (!data) return [];
    const mapped = data.map(record => this.mapPost(record)).filter(Boolean) as Post[];
    console.log('Mapped', mapped.length, 'posts successfully.');
    if (mapped.length > 0) {
      console.log('First mapped post content exists:', !!mapped[0].content);
    }
    return mapped;
  },

  mapPost(record: any): Post | null {
    if (!record) return null;

    let content: WorkoutPost | MealPost | LifestylePost | null = null;
    
    // Normalize data: Supabase might return an array [obj] or a single object {obj}
    const workoutData = Array.isArray(record.post_workouts) ? record.post_workouts[0] : record.post_workouts;
    const mealData = Array.isArray(record.post_meals) ? record.post_meals[0] : record.post_meals;
    const lifestyleData = Array.isArray(record.post_lifestyle) ? record.post_lifestyle[0] : record.post_lifestyle;

    if (workoutData) {
      const exercises = (workoutData.post_workout_exercises || []).map((ex: any) => ({
        ...ex,
        sets: ex.post_workout_exercise_sets || [],
        poses: ex.post_workout_exercise_poses || []
      }));

      content = {
        ...workoutData,
        exercises
      } as WorkoutPost;
    } else if (mealData) {
      content = {
        ...mealData,
        ingredients: mealData.post_meal_ingredients || [],
        recipe_steps: mealData.post_meal_recipe_steps || []
      } as MealPost;
    } else if (lifestyleData) {
      content = lifestyleData as LifestylePost;
    }

    const media = record.post_media || [];

    return {
      id: record.id,
      creator_uid: record.creator_uid,
      creator_handle: record.creator_handle,
      creator_avatar: record.creator_avatar,
      creator_profile_picture_url: record.creator_profile_picture_url,
      post_type: record.post_type,
      content,
      media,
      is_locked: record.is_locked,
      locked_sections: record.locked_sections || [],
      is_public: record.is_public,
      likes_count: record.likes || 0,
      comments_count: record.comments || 0,
      views_count: record.views || 0,
      reposts_count: record.reposts || 0,
      timestamp: record.timestamp,
      created_at: record.created_at,
      updated_at: record.updated_at,
    };
  }
};
