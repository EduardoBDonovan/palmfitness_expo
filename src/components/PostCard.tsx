import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, useColorScheme, Alert, Modal, Pressable, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, MessageCircle, Repeat, MoreHorizontal, CheckCircle2, ChevronDown, ChevronUp, Lock, Trash2, User as UserIcon, Flag } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { AppTheme } from '../constants/theme';
import { Post, PostType, WorkoutPost, MealPost, LifestylePost, Exercise } from '../types';
import { useAuth } from '../context/AuthContext';
import { PostsService } from '../services/posts';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useAccessControl } from '../hooks/useAccessControl';
import { MediaGrid } from './MediaGrid';
import { ExerciseCard } from './ExerciseCard';
import { WorkoutVisuals } from './WorkoutVisuals';

interface PostCardProps {
  post: Post;
  forceExpand?: boolean;
  onProfileTapped?: (uid: string) => void;
  onPostDetailRequested?: (post: Post, focusComments: boolean) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const PostCard: React.FC<PostCardProps> = ({ post, forceExpand = false, onProfileTapped, onPostDetailRequested }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 16 });
  const moreButtonRef = useRef<View>(null);

  // Check if user liked/reposted
  const { data: isLiked } = useQuery({
    queryKey: ['post-like', post.id, user?.id],
    queryFn: () => user ? PostsService.checkIfUserLikedPost(post.id, user.id) : Promise.resolve(false),
    enabled: !!user,
  });

  const { data: repostType } = useQuery({
    queryKey: ['post-repost', post.id, user?.id],
    queryFn: () => user ? PostsService.checkIfUserReposted(post.id, user.id) : Promise.resolve(null),
    enabled: !!user,
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;
      if (isLiked) {
        await PostsService.unlikePost(post.id, user.id);
      } else {
        await PostsService.likePost(post.id, user.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-like', post.id] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['user-posts'] });
    }
  });

  const repostMutation = useMutation({
    mutationFn: async (type: 'repost' | 'track') => {
      if (!user) return;
      if (repostType) {
        await PostsService.removeRepost(post.id, user.id);
      } else {
        await PostsService.repostPost(post.id, user.id, type);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-repost', post.id] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['user-posts'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;
      await PostsService.deletePost(post.id, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['user-posts', user?.id] });
    }
  });

  const handleDelete = () => {
    setMenuVisible(false);
    Alert.alert(
      'Delete Post',
      'This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => deleteMutation.mutate(), style: 'destructive' }
      ]
    );
  };

  const handleMorePress = () => {
    moreButtonRef.current?.measureInWindow((x, y, width, height) => {
      setMenuPosition({
        top: y + height,
        right: SCREEN_WIDTH - (x + width)
      });
      setMenuVisible(true);
    });
  };

  const handleRepostPress = () => {
    if (post.creator_uid === user?.id) return;
    
    Alert.alert(
      'Repost or Track',
      'Choose an action',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: repostType === 'repost' ? 'Remove Repost' : 'Repost', 
          onPress: () => repostMutation.mutate('repost'),
          style: repostType === 'repost' ? 'destructive' : 'default'
        },
        { text: repostType === 'track' ? 'Remove Track' : 'Track', 
          onPress: () => repostMutation.mutate('track'),
          style: repostType === 'track' ? 'destructive' : 'default'
        },
      ]
    );
  };

  const getTypeColor = (type: PostType) => {
    switch (type) {
      case 'workout': return AppTheme.colors.workout;
      case 'meal': return AppTheme.colors.meal;
      case 'lifestyle': return AppTheme.colors.lifestyle;
      default: return AppTheme.colors.workout;
    }
  };

  const typeColor = getTypeColor(post.post_type);
  const isOwnPost = post.creator_uid === user?.id;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? AppTheme.colors.postCard.dark : AppTheme.colors.postCard.light }]}>
      {/* Repost / Track Attribution Banner */}
      {post.repost_type && (
        <View style={styles.repostBanner}>
          {post.repost_type === 'repost' ? (
            <Repeat size={12} color="#8E8E93" />
          ) : (
            <CheckCircle2 size={12} color="#8E8E93" />
          )}
          <Text style={styles.repostText}>
            {post.reposter_handle} {post.repost_type === 'repost' ? 'reposted' : 'tracked'}
          </Text>
        </View>
      )}

      {/* Header with Post Type Colored Gradient */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={[typeColor + 'CC', typeColor + '99', 'transparent']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <PostHeader 
          post={post} 
          onProfileTapped={onProfileTapped} 
          onMorePress={handleMorePress}
          moreButtonRef={moreButtonRef}
        />

        {/* Dropdown Menu */}
        <Modal
          transparent
          visible={menuVisible}
          onRequestClose={() => setMenuVisible(false)}
          animationType="fade"
        >
          <Pressable 
            style={styles.modalOverlay} 
            onPress={() => setMenuVisible(false)}
          >
            <View style={[
              styles.menuDropdown, 
              { 
                backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF',
                top: menuPosition.top,
                right: menuPosition.right
              }
            ]}>
              {isOwnPost ? (
                <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
                  <Trash2 size={18} color="#FF3B30" />
                  <Text style={[styles.menuItemText, { color: '#FF3B30' }]}>Delete Post</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity 
                    style={styles.menuItem} 
                    onPress={() => {
                      setMenuVisible(false);
                      onProfileTapped?.(post.creator_uid);
                    }}
                  >
                    <UserIcon size={18} color={isDark ? '#FFF' : '#000'} />
                    <Text style={[styles.menuItemText, { color: isDark ? '#FFF' : '#000' }]}>View Profile</Text>
                  </TouchableOpacity>
                  <View style={[styles.menuDivider, { backgroundColor: isDark ? '#3A3A3C' : '#E5E5EA' }]} />
                  <TouchableOpacity 
                    style={styles.menuItem} 
                    onPress={() => {
                      setMenuVisible(false);
                      Alert.alert('Report', 'Thank you for reporting. We will review this post.');
                    }}
                  >
                    <Flag size={18} color="#FF3B30" />
                    <Text style={[styles.menuItemText, { color: '#FF3B30' }]}>Report Post</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </Pressable>
        </Modal>
      </View>

      {/* Content Area */}
      <View style={[styles.contentArea, { backgroundColor: isDark ? AppTheme.colors.postCard.dark : AppTheme.colors.postCard.light }]}>
        <View style={styles.contentInner}>
          <PostContent post={post} forceExpand={forceExpand} isDark={isDark} onPostDetailRequested={onPostDetailRequested} />
          
          {/* Actions Footer */}
          <PostActions 
            post={post} 
            isLiked={!!isLiked} 
            repostType={repostType || null}
            onLike={() => likeMutation.mutate()}
            onRepost={handleRepostPress}
            onPostDetailRequested={onPostDetailRequested} 
          />
        </View>
      </View>
    </View>
  );
};

const PostHeader: React.FC<{ post: Post; onProfileTapped?: (uid: string) => void; onMorePress?: () => void; moreButtonRef: React.RefObject<View | null> }> = ({ post, onProfileTapped, onMorePress, moreButtonRef }) => {
  const timeAgo = formatDistanceToNow(new Date(post.timestamp), { addSuffix: false })
    .replace('about ', '')
    .replace('less than a minute', 'now')
    .replace(' minute', 'm')
    .replace(' minutes', 'm')
    .replace(' hour', 'h')
    .replace(' hours', 'h')
    .replace(' day', 'd')
    .replace(' days', 'd');

  return (
    <View style={styles.headerInner}>
      <TouchableOpacity onPress={() => onProfileTapped?.(post.creator_uid)}>
        <View style={styles.avatarContainer}>
          <LinearGradient
            colors={['#3B82F6', '#8B5CF6']}
            style={styles.avatarGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          {post.creator_profile_picture_url ? (
            <Image 
              source={{ uri: post.creator_profile_picture_url }} 
              style={styles.avatarImage} 
            />
          ) : (
            <Text style={styles.avatarInitials}>{post.creator_avatar}</Text>
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.headerInfo}>
        <TouchableOpacity onPress={() => onProfileTapped?.(post.creator_uid)}>
          <Text style={styles.handleText}>{post.creator_handle}</Text>
        </TouchableOpacity>
        <Text style={styles.timeText}>{timeAgo}</Text>
      </View>

      <View ref={moreButtonRef} collapsable={false}>
        <TouchableOpacity style={styles.moreButton} onPress={onMorePress}>
          <MoreHorizontal size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const PostContent: React.FC<{ post: Post; forceExpand: boolean; isDark: boolean; onPostDetailRequested?: (post: Post, focusComments: boolean) => void }> = ({ post, forceExpand, isDark, onPostDetailRequested }) => {
  const { canAccessContent } = useAccessControl();

  switch (post.post_type) {
    case 'workout':
      return <WorkoutContent post={post} workout={post.content as WorkoutPost} forceExpand={forceExpand} isDark={isDark} onPostDetailRequested={onPostDetailRequested} />;
    case 'meal':
      return <MealContent post={post} meal={post.content as MealPost} isDark={isDark} />;
    case 'lifestyle':
      return <LifestyleContent post={post} lifestyle={post.content as LifestylePost} isDark={isDark} />;
    default:
      return null;
  }
};

const WorkoutContent: React.FC<{ 
  post: Post; 
  workout: WorkoutPost; 
  forceExpand: boolean; 
  isDark: boolean;
  onPostDetailRequested?: (post: Post, focusComments: boolean) => void;
}> = ({ post, workout, forceExpand, isDark, onPostDetailRequested }) => {
  const [isExpanded, setIsExpanded] = useState(forceExpand);
  const { canAccessContent } = useAccessControl();
  
  if (!workout) return null;

  const hasExerciseAccess = canAccessContent(post, 'exercises');
  const displayedExercises = (isExpanded || forceExpand) ? workout.exercises : workout.exercises?.slice(0, 1);
  const textColor = isDark ? '#fff' : '#000';
  const dividerColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  const handleExpand = () => {
    if (!isExpanded && !forceExpand && (workout.exercises || []).length > 4) {
      if (onPostDetailRequested) {
        onPostDetailRequested(post, false);
        return;
      }
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.workoutContent}>
      <Text style={[styles.postTitle, { color: textColor }]}>{workout.title}</Text>
      {workout.notes && (
        <View>
          <View style={[styles.titleDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }]} />
          <Text style={[styles.postNotes, { color: textColor }]}>{workout.notes}</Text>
        </View>
      )}

      <View style={[styles.divider, { backgroundColor: dividerColor }]} />
      
      {!hasExerciseAccess ? (
        <View style={styles.lockedContainer}>
          <Lock size={20} color="#8E8E93" />
          <Text style={styles.lockedText}>Subscribe to Unlock Exercises</Text>
        </View>
      ) : (
        <>
          <View style={styles.exerciseList}>
            {displayedExercises?.map((ex, index) => (
              <View key={ex.id}>
                {index > 0 && <View style={[styles.exerciseDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]} />}
                <ExerciseCard 
                  exercise={ex} 
                  workoutType={ex.workout_type || 'weightlifting'} 
                  post={post} 
                  forceExpand={forceExpand} 
                  onPostDetailRequested={onPostDetailRequested}
                />
              </View>
            ))}
          </View>
          
          {workout.exercises?.length > 1 && !forceExpand && (
            <TouchableOpacity 
              style={styles.expandButton}
              onPress={handleExpand}
            >
              <Text style={styles.expandText}>{isExpanded ? 'Collapse' : 'Expand'}</Text>
              {isExpanded ? <ChevronUp size={16} color={textColor} /> : <ChevronDown size={16} color={textColor} />}
            </TouchableOpacity>
          )}
        </>
      )}

      <View style={[styles.divider, { backgroundColor: dividerColor }]} />

      {/* Visuals / Media - Now using WorkoutVisuals which handles map + scroll of photos */}
      <WorkoutVisuals post={post} />
    </View>
  );
};

const MealContent: React.FC<{ post: Post; meal: MealPost; isDark: boolean }> = ({ post, meal, isDark }) => {
  const { canAccessContent } = useAccessControl();
  if (!meal) return null;
  const textColor = isDark ? '#fff' : '#000';
  const dividerColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const hasIngredientAccess = canAccessContent(post, 'ingredients');

  return (
    <View style={styles.mealContent}>
      <Text style={[styles.postTitle, { color: textColor }]}>{meal.title}</Text>
      {meal.notes && (
        <View>
          <View style={[styles.titleDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }]} />
          <Text style={[styles.postNotes, { color: textColor }]}>{meal.notes}</Text>
        </View>
      )}

      <View style={styles.nutritionGrid}>
        <View style={styles.nutritionItem}>
          <Text style={[styles.nutritionValue, { color: textColor }]}>{meal.calories}</Text>
          <Text style={styles.nutritionLabel}>kcal</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={[styles.nutritionValue, { color: textColor }]}>{meal.protein_grams}g</Text>
          <Text style={styles.nutritionLabel}>Protein</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={[styles.nutritionValue, { color: textColor }]}>{meal.carbs_grams}g</Text>
          <Text style={styles.nutritionLabel}>Carbs</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={[styles.nutritionValue, { color: textColor }]}>{meal.fat_grams}g</Text>
          <Text style={styles.nutritionLabel}>Fat</Text>
        </View>
      </View>

      {!hasIngredientAccess ? (
        <View style={styles.lockedContainer}>
          <View style={[styles.divider, { backgroundColor: dividerColor }]} />
          <View style={styles.lockedContentRow}>
             <Lock size={20} color="#8E8E93" />
             <Text style={styles.lockedText}>Subscribe to Unlock Ingredients</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: dividerColor }]} />
        </View>
      ) : (
        meal.ingredients?.length > 0 && (
          <View style={styles.ingredientsList}>
            <View style={[styles.divider, { backgroundColor: dividerColor }]} />
            <Text style={[styles.sectionHeader, { color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)' }]}>Ingredients</Text>
            <View style={styles.pillsContainer}>
              {meal.ingredients.map(ing => (
                <View key={ing.id} style={[styles.pill, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                  <Text style={[styles.pillText, { color: textColor }]}>{ing.name}</Text>
                </View>
              ))}
            </View>
            <View style={[styles.divider, { backgroundColor: dividerColor }]} />
          </View>
        )
      )}

      {/* Media */}
      <MediaGrid media={post.media} post={post} />
    </View>
  );
};

const LifestyleContent: React.FC<{ post: Post; lifestyle: LifestylePost; isDark: boolean }> = ({ post, lifestyle, isDark }) => {
  if (!lifestyle) return null;
  const textColor = isDark ? '#fff' : '#000';
  return (
    <View style={styles.lifestyleContent}>
      <Text style={[styles.lifestyleBody, { color: textColor }]}>{lifestyle.body}</Text>
      <MediaGrid media={post.media} post={post} />
    </View>
  );
};

const PostActions: React.FC<{ 
  post: Post; 
  isLiked: boolean;
  repostType: 'repost' | 'track' | null;
  onLike: () => void;
  onRepost: () => void;
  onPostDetailRequested?: (post: Post, focus: boolean) => void 
}> = ({ post, isLiked, repostType, onLike, onRepost, onPostDetailRequested }) => {
  return (
    <View style={styles.actionsContainer}>
      <TouchableOpacity style={styles.actionButton} onPress={onLike}>
        <Heart size={20} color={isLiked ? '#FF3B30' : '#8E8E93'} fill={isLiked ? '#FF3B30' : 'transparent'} />
        <Text style={[styles.actionText, isLiked && { color: '#FF3B30' }]}>{post.likes_count}</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => onPostDetailRequested?.(post, true)}
      >
        <MessageCircle size={20} color="#8E8E93" />
        <Text style={styles.actionText}>{post.comments_count}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton} onPress={onRepost}>
        <Repeat size={20} color={repostType ? '#007AFF' : '#8E8E93'} />
        <Text style={[styles.actionText, repostType && { color: '#007AFF' }]}>{post.reposts_count}</Text>
      </TouchableOpacity>
      
      <View style={{ flex: 1 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  repostBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 4,
  },
  repostText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    zIndex: 10,
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: '#333',
  },
  avatarGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarInitials: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  headerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  handleText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  timeText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  moreButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  menuDropdown: {
    position: 'absolute',
    width: 180,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 8,
  },
  contentArea: {
    paddingTop: 8,
  },
  contentInner: {
    paddingHorizontal: 16,
  },
  postTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  titleDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 8,
  },
  postNotes: {
    fontSize: 15,
    color: '#fff',
    lineHeight: 20,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 12,
  },
  exerciseList: {
    marginVertical: 4,
  },
  exerciseDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: 12,
    marginHorizontal: 32,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  expandText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  lockedContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  lockedContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  lockedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  nutritionItem: {
    alignItems: 'center',
    flex: 1,
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  nutritionLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pillText: {
    fontSize: 13,
    color: '#fff',
  },
  lifestyleBody: {
    fontSize: 17,
    color: '#fff',
    lineHeight: 24,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  workoutContent: {
    marginBottom: 4,
  },
  mealContent: {
    marginBottom: 4,
  },
  lifestyleContent: {
    marginBottom: 4,
  },
  ingredientsList: {
    marginTop: 8,
  }
});
