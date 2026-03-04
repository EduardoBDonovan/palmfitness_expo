import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, useColorScheme, Switch } from 'react-native';
import { Plus, Trash2 } from 'lucide-react-native';
import { AppTheme } from '../../constants/theme';
import { User, Ingredient, RecipeStep } from '../../types';
import { LockButton } from './LifestyleComposer';

export const MealComposer: React.FC<{ composer: any, profile: User | null }> = ({ composer, profile }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const updateMacro = (field: string, value: string) => {
    const num = parseInt(value) || 0;
    composer.setMacros({ ...composer.macros, [field]: num });
  };

  const updateIngredient = (index: number, newFields: Partial<Ingredient>) => {
    const newItems = [...composer.ingredients];
    newItems[index] = { ...newItems[index], ...newFields };
    composer.setIngredients(newItems);
  };

  const updateStep = (index: number, text: string) => {
    const newItems = [...composer.recipeSteps];
    newItems[index] = { ...newItems[index], text };
    composer.setRecipeSteps(newItems);
  };

  return (
    <View style={styles.container}>
      {/* Meal Title */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.label, { color: isDark ? '#fff' : '#000' }]}>Meal Title</Text>
          <Text style={styles.required}>*</Text>
        </View>
        <TextInput
          style={[styles.input, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7', color: isDark ? '#fff' : '#000' }]}
          placeholder="Enter meal title"
          placeholderTextColor="#8E8E93"
          value={composer.mealTitle}
          onChangeText={composer.setMealTitle}
        />
      </View>

      {/* Notes */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.label, { color: isDark ? '#fff' : '#000' }]}>Notes</Text>
        </View>
        <TextInput
          style={[styles.textArea, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7', color: isDark ? '#fff' : '#000' }]}
          placeholder="Optional notes"
          placeholderTextColor="#8E8E93"
          multiline
          value={composer.mealNotes}
          onChangeText={composer.setMealNotes}
          textAlignVertical="top"
        />
      </View>

      {/* Macros */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.label, { color: isDark ? '#fff' : '#000' }]}>Macros</Text>
          <View style={{ flex: 1 }} />
          <LockButton 
            section="macros" 
            lockedSections={composer.lockedSections} 
            onToggle={composer.toggleLockedSection} 
            profile={profile}
          />
        </View>
        <View style={styles.macroGrid}>
          {['protein', 'fat', 'carbs', 'calories'].map((macro) => (
            <View key={macro} style={styles.macroItem}>
              <Text style={styles.macroLabel}>{macro.charAt(0).toUpperCase() + macro.slice(1)}</Text>
              <TextInput
                style={[styles.macroInput, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7', color: isDark ? '#fff' : '#000' }]}
                keyboardType="numeric"
                value={composer.macros[macro].toString()}
                onChangeText={(text) => updateMacro(macro, text)}
              />
            </View>
          ))}
        </View>
      </View>

      {/* Ingredients */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.label, { color: isDark ? '#fff' : '#000' }]}>Ingredients</Text>
          <Text style={styles.required}>*</Text>
          <View style={{ flex: 1 }} />
          <LockButton 
            section="ingredients" 
            lockedSections={composer.lockedSections} 
            onToggle={composer.toggleLockedSection} 
            profile={profile}
          />
        </View>
        {composer.ingredients.map((ing: any, index: number) => (
          <View key={ing.id} style={styles.rowItem}>
            <TextInput
              style={[styles.input, { flex: 2, backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7', color: isDark ? '#fff' : '#000' }]}
              placeholder="Ingredient"
              placeholderTextColor="#8E8E93"
              value={ing.name}
              onChangeText={(text) => updateIngredient(index, { name: text })}
            />
            <TextInput
              style={[styles.input, { flex: 1, backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7', color: isDark ? '#fff' : '#000' }]}
              placeholder="Amt"
              placeholderTextColor="#8E8E93"
              value={ing.amount}
              onChangeText={(text) => updateIngredient(index, { amount: text })}
            />
            <TouchableOpacity onPress={() => composer.removeIngredient(index)}>
              <Trash2 size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.addButton} onPress={composer.addIngredient}>
          <Plus size={20} color={AppTheme.colors.meal} />
          <Text style={[styles.addButtonText, { color: AppTheme.colors.meal }]}>Add Ingredient</Text>
        </TouchableOpacity>
      </View>

      {/* Pie Chart Toggle */}
      <View style={styles.toggleRow}>
        <Text style={[styles.toggleLabel, { color: isDark ? '#fff' : '#000' }]}>Generate Macro Pie Chart</Text>
        <Switch 
          value={composer.generatePieChart} 
          onValueChange={composer.setGeneratePieChart}
          trackColor={{ true: AppTheme.colors.meal }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  section: {
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
  },
  required: {
    color: '#FF3B30',
  },
  input: {
    height: 44,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  macroGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  macroItem: {
    flex: 1,
    gap: 4,
  },
  macroLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  macroInput: {
    height: 40,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 16,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  toggleLabel: {
    fontSize: 15,
  }
});
