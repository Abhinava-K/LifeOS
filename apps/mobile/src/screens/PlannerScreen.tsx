import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, Layers } from 'lucide-react-native';
import { useThemeStore } from '../store/useThemeStore';

export const PlannerScreen: React.FC = () => {
  const { colors, isDark } = useThemeStore();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
        <View style={styles.headerTitleRow}>
          <Calendar size={18} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>Unified Planner</Text>
        </View>
        <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>Tasks • Calendar • Habits • Goals</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Eisenhower Matrix Header */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeaderRow}>
            <Layers size={16} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Eisenhower Prioritization Matrix</Text>
          </View>
          <View style={styles.matrixGrid}>
            <View
              style={[
                styles.matrixQuadrant,
                {
                  backgroundColor: isDark ? '#2D1418' : '#FDF2F2',
                  borderColor: isDark ? '#7F1D1D' : '#FCA5A5',
                },
              ]}
            >
              <Text style={[styles.quadrantTitle, { color: isDark ? '#FCA5A5' : '#991B1B' }]}>Q1: Do First</Text>
              <Text style={[styles.quadrantDesc, { color: isDark ? '#F87171' : '#B91C1C' }]}>Urgent & Important (2 items)</Text>
            </View>
            <View
              style={[
                styles.matrixQuadrant,
                {
                  backgroundColor: isDark ? '#111E2E' : '#EFF6FF',
                  borderColor: isDark ? '#1E3A8A' : '#93C5FD',
                },
              ]}
            >
              <Text style={[styles.quadrantTitle, { color: isDark ? '#93C5FD' : '#1E40AF' }]}>Q2: Schedule</Text>
              <Text style={[styles.quadrantDesc, { color: isDark ? '#60A5FA' : '#2563EB' }]}>Not Urgent, Important (4 items)</Text>
            </View>
          </View>
        </View>

        {/* Time Blocking Today */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeaderRow}>
            <Clock size={16} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Time-Blocked Calendar</Text>
          </View>
          <View style={styles.blockRow}>
            <Text style={[styles.blockTime, { color: colors.textMuted }]}>10:00 AM</Text>
            <View style={[styles.blockCard, { backgroundColor: colors.surfaceLight, borderLeftColor: colors.primary }]}>
              <Text style={[styles.blockTitle, { color: colors.text }]}>Backend Architecture Sync</Text>
            </View>
          </View>
          <View style={styles.blockRow}>
            <Text style={[styles.blockTime, { color: colors.textMuted }]}>02:00 PM</Text>
            <View style={[styles.blockCard, { backgroundColor: colors.surfaceLight, borderLeftColor: colors.accent }]}>
              <Text style={[styles.blockTitle, { color: colors.text }]}>pgvector & Mobile Deep Work</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: 11,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  matrixGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  matrixQuadrant: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  quadrantTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  quadrantDesc: {
    fontSize: 11,
    marginTop: 4,
  },
  blockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  blockTime: {
    width: 68,
    fontSize: 12,
    fontWeight: '600',
  },
  blockCard: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    borderLeftWidth: 3,
  },
  blockTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
});
