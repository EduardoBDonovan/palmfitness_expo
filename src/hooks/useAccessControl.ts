import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { UserService } from '../services/user';
import { Post, Exercise, Ingredient, MediaAsset } from '../types';

export const useAccessControl = () => {
  const { user } = useAuth();

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['user-subscriptions', user?.id],
    queryFn: () => user ? UserService.fetchSubscriptions(user.id) : Promise.resolve([]),
    enabled: !!user,
  });

  const canAccessContent = (post: Post, section: string): boolean => {
    // Logic: Creator always has access
    const isCreator = user?.id === post.creator_uid;
    if (isCreator) return true;

    // Not locked: anyone can access
    if (!post.is_locked) return true;

    // Locked, but section is NOT in locked_sections: anyone can access
    if (!post.locked_sections?.includes(section)) return true;

    // Locked and section IS locked: check subscription
    const isSubscribed = subscriptions.includes(post.creator_uid);
    return isSubscribed;
  };

  const canAccessExercise = (exercise: Exercise, post: Post): boolean => {
    // 1. If the whole "exercises" section is locked, check that first
    if (!canAccessContent(post, 'exercises')) {
      return false;
    }

    // 2. Even if the section is open, the specific exercise might be locked
    if (exercise.is_locked) {
      const isCreator = user?.id === post.creator_uid;
      if (isCreator) return true;

      // Check subscription
      const isSubscribed = subscriptions.includes(post.creator_uid);
      return isSubscribed;
    }

    return true;
  };

  const canAccessIngredient = (ingredient: Ingredient, post: Post): boolean => {
    // 1. If the whole "ingredients" section is locked, check that first
    if (!canAccessContent(post, 'ingredients')) {
      return false;
    }

    // 2. Even if the section is open, the specific ingredient might be locked
    if (ingredient.is_locked) {
      const isCreator = user?.id === post.creator_uid;
      if (isCreator) return true;

      // Check subscription
      const isSubscribed = subscriptions.includes(post.creator_uid);
      return isSubscribed;
    }

    return true;
  };

  const canAccessMedia = (asset: MediaAsset, post: Post): boolean => {
    const isCreator = user?.id === post.creator_uid;
    if (isCreator) return true;

    // 1. If the whole "media" section is locked, check that first
    if (!canAccessContent(post, 'media')) {
      return false;
    }

    // 2. Even if the section is open, the specific asset might be locked
    if (asset.is_locked) {
      const isSubscribed = subscriptions.includes(post.creator_uid);
      return isSubscribed;
    }

    return true;
  };

  return {
    canAccessContent,
    canAccessExercise,
    canAccessIngredient,
    canAccessMedia,
    subscriptions,
  };
};
