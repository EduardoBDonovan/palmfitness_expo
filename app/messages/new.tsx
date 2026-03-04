import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, FlatList, TouchableOpacity, Image, ActivityIndicator, useColorScheme } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { supabase } from '../../src/lib/supabase';
import { Search, X, ChevronLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function NewMessageScreen() {
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { user: currentUser } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchText.trim()) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`handle.ilike.%${searchText}%,name.ilike.%${searchText}%`)
        .neq('id', currentUser?.id)
        .limit(20);

      if (!error && data) {
        setResults(data);
      }
      setIsSearching(false);
    };

    const timer = setTimeout(searchUsers, 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.userRow}
      onPress={() => router.push(`/chat/${item.id}`)}
    >
      <View style={styles.avatarContainer}>
        <LinearGradient
          colors={['#3B82F6', '#8B5CF6']}
          style={StyleSheet.absoluteFill}
        />
        {item.profile_picture_url ? (
          <Image source={{ uri: item.profile_picture_url }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarInitials}>{item.avatar || item.name.substring(0, 1)}</Text>
        )}
      </View>
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: isDark ? '#fff' : '#000' }]}>{item.name}</Text>
        <Text style={styles.userHandle}>{item.handle}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <Stack.Screen 
        options={{
          headerTitle: 'New Message',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
              <ChevronLeft size={28} color={isDark ? '#fff' : '#007AFF'} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={[styles.searchContainer, { borderBottomColor: isDark ? '#333' : '#E5E5E5' }]}>
        <Text style={styles.toLabel}>To:</Text>
        <TextInput
          style={[styles.searchInput, { color: isDark ? '#fff' : '#000' }]}
          placeholder="Search users..."
          placeholderTextColor="#8E8E93"
          value={searchText}
          onChangeText={setSearchText}
          autoFocus
          autoCapitalize="none"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <X size={18} color="#8E8E93" />
          </TouchableOpacity>
        )}
      </View>

      {isSearching ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={() => (
            searchText.length > 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No users found</Text>
              </View>
            ) : null
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  toLabel: {
    fontSize: 16,
    color: '#8E8E93',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  userRow: {
    flexDirection: 'row',
    padding: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 44,
    height: 44,
  },
  avatarInitials: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userHandle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 16,
  }
});
