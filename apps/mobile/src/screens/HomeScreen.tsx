import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useThemeStore } from '../store/useThemeStore';
import { useAuthStore } from '../store/useAuthStore';

export const HomeScreen: React.FC = () => {
  const { colors, isDark } = useThemeStore();
  const { user } = useAuthStore();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Top Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.greetingSubtitle, { color: colors.textMuted }]}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </Text>
            <Text style={[styles.greetingTitle, { color: colors.text }]}>
              Good morning, {user?.fullName?.split(' ')[0] || 'Jahaan'} 👋
            </Text>
          </View>
          <View style={[styles.avatarBadge, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}>
            <Text style={[styles.avatarText, { color: colors.primaryLight }]}>
              {user?.fullName?.substring(0, 2).toUpperCase() || 'JS'}
            </Text>
          </View>
        </View>

        {/* AI Daily Briefing Widget */}
        <View style={[styles.card, styles.aiCard, { backgroundColor: '#131B2E', borderColor: '#2E3A59' }]}>
          <View style={styles.aiBadgeRow}>
            <View style={styles.sparkleIconWrapper}>
              <Text style={styles.sparkleIcon}>🧠</Text>
            </View>
            <Text style={styles.aiBadgeText}>AI SECOND BRAIN BRIEFING</Text>
          </View>
          <Text style={styles.aiBriefQuote}>
            "Focus on the database indexing and Thin Client core navigation today. You have 3 deep work blocks scheduled."
          </Text>
          <View style={styles.aiActionRow}>
            <TouchableOpacity style={[styles.aiActionButton, { backgroundColor: colors.primary }]}>
              <Text style={styles.aiActionText}>Ask AI Assistant ⚡</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's Schedule Snapshot */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Schedule</Text>
            <TouchableOpacity>
              <Text style={[styles.sectionLink, { color: colors.primaryLight }]}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.scheduleItem}>
              <View style={[styles.timeIndicator, { backgroundColor: colors.primary }]} />
              <View style={styles.scheduleDetails}>
                <Text style={[styles.scheduleTitle, { color: colors.text }]}>Architecture & Contract Sync</Text>
                <Text style={[styles.scheduleSubtitle, { color: colors.textMuted }]}>09:30 AM – 10:30 AM • Lead Team Sync</Text>
              </View>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.scheduleItem}>
              <View style={[styles.timeIndicator, { backgroundColor: colors.accent }]} />
              <View style={styles.scheduleDetails}>
                <Text style={[styles.scheduleTitle, { color: colors.text }]}>Database pgvector Integration</Text>
                <Text style={[styles.scheduleSubtitle, { color: colors.textMuted }]}>02:00 PM – 04:30 PM • Deep Focus</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Metrics Grid (Tasks, Habits, Expenses) */}
        <View style={styles.gridRow}>
          {/* Tasks Card */}
          <View style={[styles.gridCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={styles.gridIcon}>✅</Text>
            <Text style={[styles.gridNumber, { color: colors.text }]}>4 / 6</Text>
            <Text style={[styles.gridLabel, { color: colors.textMuted }]}>Tasks Done</Text>
          </View>

          {/* Habit Streaks */}
          <View style={[styles.gridCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={styles.gridIcon}>🔥</Text>
            <Text style={[styles.gridNumber, { color: colors.text }]}>12 Days</Text>
            <Text style={[styles.gridLabel, { color: colors.textMuted }]}>Habit Streak</Text>
          </View>

          {/* Budget Snapshot */}
          <View style={[styles.gridCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={styles.gridIcon}>💳</Text>
            <Text style={[styles.gridNumber, { color: colors.text }]}>$248</Text>
            <Text style={[styles.gridLabel, { color: colors.textMuted }]}>Spend Logged</Text>
          </View>
        </View>

        {/* High Priority Tasks Preview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>High Priority Tasks (Q1)</Text>
            <TouchableOpacity>
              <Text style={[styles.sectionLink, { color: colors.primaryLight }]}>Matrix</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.taskRow}>
              <View style={[styles.checkbox, { borderColor: colors.primary }]} />
              <Text style={[styles.taskTitle, { color: colors.text }]}>
                Configure PostgreSQL 15 & pgvector extension
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.taskRow}>
              <View style={[styles.checkbox, { borderColor: colors.primary }]} />
              <Text style={[styles.taskTitle, { color: colors.text }]}>
                Build React Native Thin Client 5-tab core
              </Text>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greetingSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  avatarBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  aiCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
  },
  aiBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sparkleIconWrapper: {
    marginRight: 6,
  },
  sparkleIcon: {
    fontSize: 14,
  },
  aiBadgeText: {
    color: '#818CF8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  aiBriefQuote: {
    color: '#E0E7FF',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  aiActionRow: {
    marginTop: 12,
    flexDirection: 'row',
  },
  aiActionButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  aiActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  sectionLink: {
    fontSize: 13,
    fontWeight: '600',
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  timeIndicator: {
    width: 4,
    height: 32,
    borderRadius: 2,
    marginRight: 12,
  },
  scheduleDetails: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  scheduleSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 10,
  },
  gridCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
  },
  gridIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  gridNumber: {
    fontSize: 16,
    fontWeight: '800',
  },
  gridLabel: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 2,
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});
