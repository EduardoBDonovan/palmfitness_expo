import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, useColorScheme } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { Settings, FileText, Sliders, CreditCard, ShieldCheck, LogOut, ChevronRight } from 'lucide-react-native';

export default function AccountScreen() {
  const { signOut } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => signOut() }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F2F2F7' }]}>
      <Stack.Screen 
        options={{
          headerTitle: 'Account',
          headerBackTitle: 'Profile',
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <MenuSection title="General">
          <MenuRow 
            title="Settings" 
            icon={<Settings size={18} color="#fff" />} 
            iconBg="#007AFF" 
            onPress={() => {}} 
          />
          <MenuRow 
            title="Summary" 
            icon={<FileText size={18} color="#fff" />} 
            iconBg="#AF52DE" 
            onPress={() => {}} 
          />
          <MenuRow 
            title="Presets" 
            icon={<Sliders size={18} color="#fff" />} 
            iconBg="#FF9500" 
            onPress={() => router.push('/account/presets')} 
          />
          <MenuRow 
            title="Payment" 
            icon={<CreditCard size={18} color="#fff" />} 
            iconBg="#FFCC00" 
            onPress={() => {}} 
          />
          <MenuRow 
            title="Privacy" 
            icon={<ShieldCheck size={18} color="#fff" />} 
            iconBg="#34C759" 
            onPress={() => {}} 
            isLast
          />
        </MenuSection>

        <MenuSection title="Account">
          <MenuRow 
            title="Sign Out" 
            icon={<LogOut size={18} color="#fff" />} 
            iconBg="#FF3B30" 
            onPress={handleSignOut}
            isDestructive
            isLast
          />
        </MenuSection>
      </ScrollView>
    </View>
  );
}

const MenuSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
    <View style={styles.sectionCard}>
      {children}
    </View>
  </View>
);

const MenuRow = ({ title, icon, iconBg, onPress, isLast, isDestructive }: any) => {
  const isDark = useColorScheme() === 'dark';
  return (
    <TouchableOpacity 
      style={[
        styles.row, 
        { backgroundColor: isDark ? '#1C1C1E' : '#fff' },
        isLast && { borderBottomWidth: 0 }
      ]} 
      onPress={onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
        {icon}
      </View>
      <Text style={[styles.rowTitle, { color: isDestructive ? '#FF3B30' : (isDark ? '#fff' : '#000') }]}>{title}</Text>
      <View style={{ flex: 1 }} />
      {!isDestructive && <ChevronRight size={18} color="#C7C7CC" />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginLeft: 16,
    marginBottom: 8,
  },
  sectionCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#333',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rowTitle: {
    fontSize: 17,
  }
});
