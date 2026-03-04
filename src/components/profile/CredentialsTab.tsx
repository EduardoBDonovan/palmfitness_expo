import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Credential } from '../../types';
import { ShieldCheck, CheckCircle2 } from 'lucide-react-native';
import { format } from 'date-fns';

interface CredentialsTabProps {
  credentials?: Credential[];
}

export const CredentialsTab: React.FC<CredentialsTabProps> = ({ credentials = [] }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  if (credentials.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <ShieldCheck size={50} color="#8E8E93" />
        <Text style={[styles.emptyTitle, { color: isDark ? '#fff' : '#000' }]}>No Credentials</Text>
        <Text style={styles.emptySubtitle}>Professional credentials will appear here</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {credentials.map((cred) => (
        <View key={cred.id} style={[styles.credCard, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }]}>
          <View style={styles.credHeader}>
            <View style={styles.titleContainer}>
              <Text style={[styles.credTitle, { color: isDark ? '#fff' : '#000' }]}>{cred.title}</Text>
              {cred.is_verified && <CheckCircle2 size={16} color="#007AFF" />}
            </View>
            <Text style={styles.issuerText}>{cred.issuer}</Text>
          </View>

          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Earned:</Text>
            <Text style={[styles.dateValue, { color: isDark ? '#fff' : '#000' }]}>
              {format(new Date(cred.date_earned), 'MMM d, yyyy')}
            </Text>
          </View>

          {cred.expiration_date && (
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Expires:</Text>
              <Text style={[styles.dateValue, { color: isDark ? '#fff' : '#000' }]}>
                {format(new Date(cred.expiration_date), 'MMM d, yyyy')}
              </Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  credCard: {
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  credHeader: {
    gap: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  credTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  issuerText: {
    fontSize: 15,
    color: '#8E8E93',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateLabel: {
    fontSize: 13,
    color: '#8E8E93',
  },
  dateValue: {
    fontSize: 13,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
