import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppTheme } from '../../constants/theme';
import { User } from '../../types';

interface ProfileHeaderProps {
  user: User;
  onEditPress?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, onEditPress }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      <View style={styles.avatarWrapper}>
        <View style={styles.avatarBorder}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['#3B82F6', '#8B5CF6']}
              style={styles.avatarGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            {user.profile_picture_url ? (
              <Image 
                source={{ uri: user.profile_picture_url }} 
                style={styles.avatarImage} 
              />
            ) : (
              <Text style={styles.avatarInitials}>{user.avatar || user.handle.substring(0, 2).toUpperCase()}</Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={[styles.nameText, { color: isDark ? '#fff' : '#000' }]}>{user.name}</Text>
        <Text style={styles.handleText}>{user.handle}</Text>
        {user.bio && (
          <Text style={[styles.bioText, { color: isDark ? '#fff' : '#000' }]}>
            {user.bio}
          </Text>
        )}
      </View>

      <TouchableOpacity 
        style={styles.editButton}
        onPress={onEditPress}
      >
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  avatarWrapper: {
    marginBottom: 16,
  },
  avatarBorder: {
    padding: 4,
    borderRadius: 54,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: '#333',
  },
  avatarGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarInitials: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 16,
    gap: 4,
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  handleText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  bioText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
