import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, Image, Switch, ActivityIndicator, Alert, useColorScheme } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { supabase } from '../../src/lib/supabase';
import { Camera, ChevronLeft, Save } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { StorageService } from '../../src/services/storage';

export default function EditProfileScreen() {
  const { profile, user, refreshProfile } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const [name, setName] = useState(profile?.name || '');
  const [handle, setHandle] = useState(profile?.handle || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [isPhysioTabVisible, setIsPhysioTabVisible] = useState(profile?.is_physio_tab_visible ?? true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      let profilePictureUrl = profile?.profile_picture_url;

      // 1. Upload new image if selected
      if (selectedImage) {
        profilePictureUrl = await StorageService.uploadProfilePicture(selectedImage, user.id);
      }

      // 2. Update user record
      const { error } = await supabase
        .from('users')
        .update({
          name,
          handle,
          bio,
          is_physio_tab_visible: isPhysioTabVisible,
          profile_picture_url: profilePictureUrl,
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      Alert.alert('Success', 'Profile updated successfully!');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F2F2F7' }]}>
      <Stack.Screen 
        options={{
          headerTitle: 'Edit Profile',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
              <Text style={{ color: '#007AFF', fontSize: 17 }}>Cancel</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleSave} disabled={isSaving} style={{ marginRight: 10 }}>
              {isSaving ? <ActivityIndicator size="small" /> : <Text style={{ color: '#007AFF', fontSize: 17, fontWeight: '600' }}>Save</Text>}
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Section title="Profile Picture">
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={handlePickImage} style={styles.avatarContainer}>
              <LinearGradient colors={['#3B82F6', '#8B5CF6']} style={StyleSheet.absoluteFill} />
              {selectedImage || profile?.profile_picture_url ? (
                <Image source={{ uri: selectedImage || profile?.profile_picture_url }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarInitials}>{profile?.avatar || '?'}</Text>
              )}
              <View style={styles.cameraOverlay}>
                <Camera size={20} color="#fff" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePickImage}>
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
            </View>
            </Section>

        <Section title="Profile Information">
          <InputLabel label="Name" value={name} onChangeText={setName} placeholder="Your name" />
          <InputLabel label="Username" value={handle} onChangeText={setHandle} placeholder="@username" autoCapitalize="none" />
          <InputLabel label="Bio" value={bio} onChangeText={setBio} placeholder="Tell us about yourself" multiline />
        </Section>

        <Section title="Preferences">
          <View style={styles.toggleRow}>
            <Text style={[styles.toggleLabel, { color: isDark ? '#fff' : '#000' }]}>Show Physio Tab</Text>
            <Switch value={isPhysioTabVisible} onValueChange={setIsPhysioTabVisible} />
          </View>
        </Section>
      </ScrollView>
    </View>
  );
}

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => {
  const isDark = useColorScheme() === 'dark';
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
      <View style={[styles.sectionCard, { backgroundColor: isDark ? '#1C1C1E' : '#fff' }]}>
        {children}
      </View>
    </View>
  );
};

const InputLabel = ({ label, value, onChangeText, placeholder, ...props }: any) => {
  const isDark = useColorScheme() === 'dark';
  return (
    <View style={[styles.inputRow, { borderBottomColor: isDark ? '#333' : '#E5E5E5' }]}>
      <Text style={[styles.inputLabel, { color: isDark ? '#fff' : '#000' }]}>{label}</Text>
      <TextInput
        style={[styles.input, { color: isDark ? '#fff' : '#000' }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8E8E93"
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginLeft: 16,
    marginBottom: 8,
  },
  sectionCard: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#333',
  },
  avatarSection: {
    padding: 16,
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 100,
    height: 100,
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingVertical: 4,
    alignItems: 'center',
  },
  changePhotoText: {
    color: '#007AFF',
    fontSize: 16,
  },
  inputRow: {
    flexDirection: 'row',
    padding: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  inputLabel: {
    width: 100,
    fontSize: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 16,
  },
  toggleLabel: {
    fontSize: 16,
  }
});
