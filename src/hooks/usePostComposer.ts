import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { PostType, WorkoutType, Exercise, Ingredient, RecipeStep, MediaAsset } from '../types';

export const usePostComposer = () => {
  const [currentPostType, setCurrentPostType] = useState<PostType>('workout');
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [lockedSections, setLockedSections] = useState<Set<string>>(new Set());

  // ... rest of fields

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newAssets: MediaAsset[] = result.assets.map(asset => ({
        id: Math.random().toString(36).substr(2, 9),
        url: asset.uri,
        media_type: 'photo',
        display_order: mediaAssets.length,
        is_locked: false,
      }));
      setMediaAssets([...mediaAssets, ...newAssets]);
    }
  };

  const removeMedia = useCallback((id: string) => {
    setMediaAssets(prev => prev.filter(a => a.id !== id));
  }, []);

  // Workout fields
  const [workoutTitle, setWorkoutTitle] = useState('');
  const [exercises, setExercises] = useState<Partial<Exercise>[]>([]);
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [generateMuscleMap, setGenerateMuscleMap] = useState(false);

  // Meal fields
  const [mealTitle, setMealTitle] = useState('');
  const [macros, setMacros] = useState({ protein: 0, fat: 0, carbs: 0, calories: 0 });
  const [ingredients, setIngredients] = useState<Partial<Ingredient>[]>([]);
  const [recipeSteps, setRecipeSteps] = useState<Partial<RecipeStep>[]>([]);
  const [mealNotes, setMealNotes] = useState('');
  const [generatePieChart, setGeneratePieChart] = useState(false);

  // Lifestyle fields
  const [lifestyleBody, setLifestyleBody] = useState('');

  const resetForm = useCallback(() => {
    setIsPublic(true);
    setMediaAssets([]);
    setLockedSections(new Set());
    setWorkoutTitle('');
    setExercises([]);
    setWorkoutNotes('');
    setGenerateMuscleMap(false);
    setMealTitle('');
    setMacros({ protein: 0, fat: 0, carbs: 0, calories: 0 });
    setIngredients([]);
    setRecipeSteps([]);
    setMealNotes('');
    setGeneratePieChart(false);
    setLifestyleBody('');
  }, []);

  const addExercise = useCallback(() => {
    const defaultType: WorkoutType = exercises[0]?.workout_type || 'weightlifting';
    const newExercise: Partial<Exercise> = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      workout_type: defaultType,
      display_order: exercises.length,
      is_locked: false,
    };
    setExercises([...exercises, newExercise]);
  }, [exercises]);

  const removeExercise = useCallback((index: number) => {
    setExercises(prev => prev.filter((_, i) => i !== index));
  }, []);

  const addIngredient = useCallback(() => {
    const newIngredient: Partial<Ingredient> = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      amount: '',
      unit: '',
      ingredient_order: ingredients.length,
      is_locked: false,
    };
    setIngredients([...ingredients, newIngredient]);
  }, [ingredients]);

  const removeIngredient = useCallback((index: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  }, []);

  const addRecipeStep = useCallback(() => {
    const newStep: Partial<RecipeStep> = {
      id: Math.random().toString(36).substr(2, 9),
      text: '',
      step_number: recipeSteps.length + 1,
      is_locked: false,
    };
    setRecipeSteps([...recipeSteps, newStep]);
  }, [recipeSteps]);

  const removeRecipeStep = useCallback((index: number) => {
    setRecipeSteps(prev => prev.filter((_, i) => i !== index));
  }, []);

  const toggleLockedSection = useCallback((section: string) => {
    setLockedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  }, []);

  const canSubmit = () => {
    switch (currentPostType) {
      case 'workout':
        return workoutTitle.length > 0 && exercises.length > 0 && exercises.every(ex => ex.name || ex.workout_type === 'yoga' || ex.workout_type === 'pilates');
      case 'meal':
        return mealTitle.length > 0 && ingredients.length > 0;
      case 'lifestyle':
        return lifestyleBody.length > 0;
      default:
        return false;
    }
  };

  return {
    currentPostType, setCurrentPostType,
    mediaAssets, setMediaAssets,
    isPublic, setIsPublic,
    lockedSections, toggleLockedSection,
    workoutTitle, setWorkoutTitle,
    exercises, setExercises, addExercise, removeExercise,
    workoutNotes, setWorkoutNotes,
    generateMuscleMap, setGenerateMuscleMap,
    mealTitle, setMealTitle,
    macros, setMacros,
    ingredients, setIngredients, addIngredient, removeIngredient,
    recipeSteps, setRecipeSteps, addRecipeStep, removeRecipeStep,
    mealNotes, setMealNotes,
    generatePieChart, setGeneratePieChart,
    lifestyleBody, setLifestyleBody,
    resetForm,
    pickImage,
    removeMedia,
    canSubmit: canSubmit()
  };
};
