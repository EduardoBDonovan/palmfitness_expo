import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Grid, ClipboardList, ShieldCheck, Target, Dumbbell } from 'lucide-react-native';

export type ProfileTabType = 'Posts' | 'Programs' | 'Credentials' | 'Goals' | 'Physio';

interface ProfileTabsProps {
  selectedTab: ProfileTabType;
  onTabSelect: (tab: ProfileTabType) => void;
  availableTabs: ProfileTabType[];
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({ selectedTab, onTabSelect, availableTabs }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const getIcon = (tab: ProfileTabType, color: string) => {
    switch (tab) {
      case 'Posts': return <Grid size={24} color={color} />;
      case 'Programs': return <ClipboardList size={24} color={color} />;
      case 'Credentials': return <ShieldCheck size={24} color={color} />;
      case 'Goals': return <Target size={24} color={color} />;
      case 'Physio': return <Dumbbell size={24} color={color} />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }]}>
      {availableTabs.map((tab) => {
        const isSelected = selectedTab === tab;
        const color = isSelected ? '#007AFF' : '#8E8E93';

        return (
          <TouchableOpacity 
            key={tab} 
            style={styles.tab} 
            onPress={() => onTabSelect(tab)}
          >
            <View style={styles.tabContent}>
              {getIcon(tab, color)}
              <Text style={[styles.tabText, { color }]}>{tab}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
  },
  tabContent: {
    alignItems: 'center',
    gap: 4,
  },
  tabText: {
    fontSize: 10,
    fontWeight: '500',
  },
});
