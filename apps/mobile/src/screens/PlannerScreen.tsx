import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';

export const PlannerScreen: React.FC = () => {
  const { colors } = useThemeStore();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>📅 Unified Planner</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>Tasks • Calendar • Habits • Goals</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Eisenhower Matrix Header */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Eisenhower Prioritization Matrix</Text>
          <View style={styles.matrixGrid}>
            <View style={[styles.matrixQuadrant, { backgroundColor: '#311019', borderColor: '#842029' }]}>
              <Text style={[styles.quadrantTitle, { color: '#F87171' }]}>Q1: Do First</Text>
              <Text style={styles.quadrantDesc}>Urgent & Important (2 items)</Text>
            </View>
            <View style={[styles.matrixQuadrant, { backgroundColor: '#132338', borderColor: '#1F4770' }]}>
              <Text style={[styles.quadrantTitle, { color: '#60A5FA' }]}>Q2: Schedule</Text>
              <Text style={styles.quadrantDesc}>Not Urgent, Important (4 items)</Text>
            </View>
          </View>
        </View>

        {/* Time Blocking Today */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Time-Blocked Calendar</Text>
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
    padding: 16,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
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
    color: '#D1D5DB',
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
