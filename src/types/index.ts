export type ProfileType = 'Athlete' | 'Coach';

export type TrainerSpecialization =
  | 'Bodybuilding'
  | 'Aesthetic Training'
  | 'Nutrition'
  | 'Strength Training'
  | 'Powerlifting'
  | 'Olympic Weightlifting'
  | 'CrossFit'
  | 'Functional Training'
  | 'Rehabilitation'
  | 'Sports Performance'
  | 'General Fitness';

export interface User {
  id: string;
  handle: string;
  name: string;
  bio?: string;
  avatar?: string;
  profile_picture_url?: string;
  profile_type: ProfileType;
  trainer_specialization?: TrainerSpecialization;
  posts_count: number;
  followers_count: number;
  following_count: number;
  subscriptions_count: number;
  subscribers_count: number;
  is_physio_tab_visible: boolean;
  created_at: string;
  last_active: string;
  
  // New fields
  body_metrics?: BodyMetrics;
  build?: Build;
  goals?: Goal[];
  credentials?: Credential[];
}

export interface BodyMetrics {
  id: string;
  user_id: string;
  height_cm: number;
  height_feet: number;
  height_inches: number;
  weight_kg: number;
  body_fat_percent: number;
  muscle_mass_kg: number;
  height_unit: 'imperial' | 'metric';
  weight_unit: 'imperial' | 'metric';
  muscle_unit: 'imperial' | 'metric';
  body_metrics_updated_at: string;
  body_type: string;
  activity_level: string;
  experience_level: string;
  build_updated_at: string;
  created_at: string;
  updated_at: string;
}

export interface Build {
  body_type: 'Ectomorph' | 'Mesomorph' | 'Endomorph';
  activity_level: 'Sedentary' | 'Lightly Active' | 'Moderate' | 'Very Active' | 'Extra Active';
  experience_level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  last_updated: string;
}

export interface Goal {
  id: string;
  title: string;
  target_date: string;
  is_completed: boolean;
  date_completed?: string;
}

export interface Credential {
  id: string;
  title: string;
  issuer: string;
  date_earned: string;
  expiration_date?: string;
  credential_id?: string;
  is_verified: boolean;
}

export type PostType = 'workout' | 'meal' | 'lifestyle';

export interface Post {
  id: string;
  creator_uid: string;
  creator_handle: string;
  creator_avatar: string;
  creator_profile_picture_url?: string;
  post_type: PostType;
  content: WorkoutPost | MealPost | LifestylePost | null;
  media: MediaAsset[];
  is_locked: boolean;
  locked_sections: string[];
  is_public: boolean;
  likes_count: number;
  comments_count: number;
  views_count: number;
  reposts_count: number;
  timestamp: string;
  created_at: string;
  updated_at: string;
  
  // Repost metadata
  reposter_id?: string;
  reposter_handle?: string;
  repost_type?: 'repost' | 'track';
  repost_date?: string;
}

export interface MediaAsset {
  id: string;
  url: string;
  media_type: 'photo' | 'video' | 'audio';
  thumbnail_url?: string;
  display_order: number;
  is_locked: boolean;
}

export interface WorkoutPost {
  id: string;
  post_id: string;
  title: string;
  notes?: string;
  muscle_mapping?: any;
  shows_muscle_map: boolean;
  exercises: Exercise[];
}

export type WorkoutType = 'weightlifting' | 'cardio' | 'yoga' | 'pilates';

export interface Exercise {
  id: string;
  workout_id: string;
  name: string;
  workout_type: WorkoutType;
  is_locked: boolean;
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  distance?: number;
  distance_unit?: 'miles' | 'km' | 'meters' | 'floors';
  duration_seconds?: number;
  display_order: number;
  sets?: ExerciseSet[];
  poses?: ExercisePose[];
  
  // Yoga/Pilates specifics
  yoga_style?: string;
  yoga_intensity?: string;
  yoga_temperature?: string;
  yoga_instructor?: string;
  pilates_style?: string;
  pilates_intensity?: string;
  pilates_equipment?: string[];
  pilates_equipment_details?: string;
  pilates_instructor?: string;
  pilates_temperature?: string;
}

export interface ExerciseSet {
  id: string;
  exercise_id: string;
  set_number: number;
  reps?: number;
  weight?: number;
  weight_unit: string;
  duration_seconds?: number;
}

export interface ExercisePose {
  id: string;
  exercise_id: string;
  name: string;
  pose_order: number;
  hold_duration_seconds?: number;
  hold_duration_unit: string;
  repetitions?: number;
  is_locked: boolean;
  notes?: string;
}

export interface MealPost {
  id: string;
  post_id: string;
  title: string;
  notes?: string;
  calories: number;
  protein_grams: number;
  fat_grams: number;
  carbs_grams: number;
  shows_pie_chart: boolean;
  ingredients: Ingredient[];
  recipe_steps: RecipeStep[];
}

export interface Ingredient {
  id: string;
  meal_id: string;
  name: string;
  amount: string;
  unit: string;
  ingredient_order: number;
  is_locked: boolean;
}

export interface RecipeStep {
  id: string;
  meal_id: string;
  text: string;
  step_number: number;
  is_locked: boolean;
}

export interface LifestylePost {
  id: string;
  post_id: string;
  body: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  text: string;
  created_at: string;
  user_handle?: string;
  user_avatar?: string;
  user_profile_picture_url?: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Chat {
  id: string; // Other user's ID
  other_user: User;
  last_message: Message;
  unread_count: number;
}

export type PresetType = 'workout' | 'exercise';

export interface UserPreset {
  id: string;
  user_id: string;
  name: string;
  preset_type: PresetType;
  activity_type: string;
  data: WorkoutPost | Exercise;
  created_at: string;
  updated_at: string;
}
