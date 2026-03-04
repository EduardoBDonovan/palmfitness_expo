import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { BodyMetrics, Build } from '../../types';
import { Ruler, Dumbbell } from 'lucide-react-native';
import { format } from 'date-fns';

interface PhysioTabProps {
  bodyMetrics?: BodyMetrics;
  build?: Build;
}

export const PhysioTab: React.FC<PhysioTabProps> = ({ bodyMetrics, build }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const KG_TO_LBS = 2.20462;

  const formatHeight = () => {
    if (!bodyMetrics) return { value: '--', subtitle: '--' };
    if (bodyMetrics.height_unit === 'imperial') {
      return { 
        value: `${bodyMetrics.height_feet}'${bodyMetrics.height_inches}"`, 
        subtitle: `${Math.round(bodyMetrics.height_cm)} cm` 
      };
    } else {
      const totalInches = bodyMetrics.height_cm / 2.54;
      const feet = Math.floor(totalInches / 12);
      const inches = Math.round(totalInches % 12);
      return { 
        value: `${Math.round(bodyMetrics.height_cm)} cm`, 
        subtitle: `${feet}'${inches}"` 
      };
    }
  };

  const formatWeight = () => {
    if (!bodyMetrics) return { value: '--', subtitle: '--' };
    const weight_kg = bodyMetrics.weight_kg || 0;
    const weight_lbs = weight_kg * KG_TO_LBS;

    if (bodyMetrics.weight_unit === 'imperial') {
      return { 
        value: `${Math.round(weight_lbs)} lbs`, 
        subtitle: `${Math.round(weight_kg)} kg` 
      };
    } else {
      return { 
        value: `${Math.round(weight_kg)} kg`, 
        subtitle: `${Math.round(weight_lbs)} lbs` 
      };
    }
  };

  const formatMuscle = () => {
    if (!bodyMetrics) return { value: '--', subtitle: '--' };
    const muscle_kg = bodyMetrics.muscle_mass_kg || 0;
    const muscle_lbs = muscle_kg * KG_TO_LBS;

    if (bodyMetrics.muscle_unit === 'imperial') {
      return { 
        value: `${Math.round(muscle_lbs)} lbs`, 
        subtitle: `${Math.round(muscle_kg)} kg` 
      };
    } else {
      return { 
        value: `${Math.round(muscle_kg)} kg`, 
        subtitle: `${Math.round(muscle_lbs)} lbs` 
      };
    }
  };

  const height = formatHeight();
  const weight = formatWeight();
  const muscle = formatMuscle();

  // Prefer build from props, but fall back to bodyMetrics fields if build is missing
  const effectiveBuild = {
    body_type: build?.body_type || bodyMetrics?.body_type || 'Not set',
    activity_level: build?.activity_level || bodyMetrics?.activity_level || 'Not set',
    experience_level: build?.experience_level || bodyMetrics?.experience_level || 'Not set',
    last_updated: build?.last_updated || bodyMetrics?.build_updated_at || bodyMetrics?.updated_at
  };

  return (
    <View style={styles.container}>
      {/* Body Metrics Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ruler size={20} color="#007AFF" />
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>Body Metrics</Text>
        </View>

        <View style={[styles.card, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }]}>
          <View style={styles.metricsGrid}>
            <MetricItem label="Height" value={height.value} subtitle={height.subtitle} />
            <MetricItem label="Weight" value={weight.value} subtitle={weight.subtitle} />
            <MetricItem label="Body Fat" value={`${Math.round(bodyMetrics?.body_fat_percent || 0)}%`} subtitle="Percentage" />
            <MetricItem label="Muscle" value={muscle.value} subtitle={muscle.subtitle} />
          </View>
          {bodyMetrics?.body_metrics_updated_at && (
            <Text style={styles.updatedText}>
              Updated: {format(new Date(bodyMetrics.body_metrics_updated_at), 'MM/dd/yy')}
            </Text>
          )}
        </View>
      </View>

      {/* Build Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Dumbbell size={20} color="#007AFF" />
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>Build</Text>
        </View>

        <View style={[styles.card, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }]}>
          <View style={styles.infoList}>
            <InfoRow label="Body Type" value={effectiveBuild.body_type} />
            <InfoRow label="Activity" value={effectiveBuild.activity_level} />
            <InfoRow label="Experience" value={effectiveBuild.experience_level} />
          </View>
          {effectiveBuild.last_updated && (
            <Text style={styles.updatedText}>
              Updated: {format(new Date(effectiveBuild.last_updated), 'MM/dd/yy')}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const MetricItem: React.FC<{ label: string; value: string; subtitle: string }> = ({ label, value, subtitle }) => {
  const isDark = useColorScheme() === 'dark';
  return (
    <View style={styles.metricItem}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color: isDark ? '#fff' : '#000' }]}>{value}</Text>
      <Text style={styles.metricSubtitle}>{subtitle}</Text>
    </View>
  );
};

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const isDark = useColorScheme() === 'dark';
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, { color: isDark ? '#fff' : '#000' }]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  card: {
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  metricItem: {
    flex: 1,
    gap: 2,
  },
  metricLabel: {
    fontSize: 12,
    color: '#8E8E93',
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  metricSubtitle: {
    fontSize: 11,
    color: '#8E8E93',
  },
  infoList: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 13,
    color: '#8E8E93',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  updatedText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'right',
  },
});
