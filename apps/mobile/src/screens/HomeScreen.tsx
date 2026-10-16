import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Flame,
  CreditCard,
  Check,
} from 'lucide-react-native';
import { useThemeStore } from '../store/useThemeStore';
import { useAuthStore } from '../store/useAuthStore';

export const HomeScreen: React.FC = () => {
  const { colors, isDark } = useThemeStore();
  const { user } = useAuthStore();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Top Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.greetingSubtitle, { color: colors.textMuted }]}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </Text>
            <Text style={[styles.greetingTitle, { color: colors.text }]}>
              Good morning, {user?.fullName?.split(' ')[0] || 'User'}
            </Text>
          </View>
          <View style={[styles.avatarBadge, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {user?.fullName?.substring(0, 2).toUpperCase() || 'US'}
            </Text>
          </View>
        </View>

        {/* AI Daily Briefing Widget */}
        <View style={[styles.card, styles.aiCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.aiBadgeRow}>
            <View style={[styles.sparkleIconWrapper, { backgroundColor: colors.primary + '18' }]}>
              <Sparkles size={14} color={colors.primary} />
            </View>
            <Text style={[styles.aiBadgeText, { color: colors.primary }]}>COGNITIVE BRIEFING</Text>
          </View>
          <Text style={[styles.aiBriefQuote, { color: colors.text }]}>
            "Focus on database indexing and Thin Client core navigation today. You have 3 deep work blocks scheduled."
          </Text>
          <View style={styles.aiActionRow}>
            <TouchableOpacity style={[styles.aiActionButton, { backgroundColor: colors.primary }]}>
              <View style={styles.aiActionInner}>
                <Text style={styles.aiActionText}>Ask Assistant</Text>
                <ArrowRight size={13} color="#FFFFFF" style={{ marginLeft: 6 }} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's Schedule Snapshot */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Schedule</Text>
            <TouchableOpacity>
              <Text style={[styles.sectionLink, { color: colors.primary }]}>View All</Text>
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
            <View style={styles.gridIconWrapper}>
              <CheckCircle2 size={18} color={colors.accent} />
            </View>
            <Text style={[styles.gridNumber, { color: colors.text }]}>4 / 6</Text>
            <Text style={[styles.gridLabel, { color: colors.textMuted }]}>Tasks Done</Text>
          </View>

          {/* Habit Streaks */}
          <View style={[styles.gridCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.gridIconWrapper}>
              <Flame size={18} color={colors.warning} />
            </View>
            <Text style={[styles.gridNumber, { color: colors.text }]}>12 Days</Text>
            <Text style={[styles.gridLabel, { color: colors.textMuted }]}>Habit Streak</Text>
          </View>

          {/* Budget Snapshot */}
          <View style={[styles.gridCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.gridIconWrapper}>
              <CreditCard size={18} color={colors.primary} />
            </View>
            <Text style={[styles.gridNumber, { color: colors.text }]}>$248</Text>
            <Text style={[styles.gridLabel, { color: colors.textMuted }]}>Spend Logged</Text>
          </View>
        </View>

        {/* High Priority Tasks Preview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>High Priority Tasks (Q1)</Text>
            <TouchableOpacity>
              <Text style={[styles.sectionLink, { color: colors.primary }]}>Matrix</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.taskRow}>
              <View style={[styles.checkbox, { borderColor: colors.primary, backgroundColor: colors.primary + '14' }]}>
                <Check size={12} color={colors.primary} />
              </View>
              <Text style={[styles.taskTitle, { color: colors.text }]}>
                Configure PostgreSQL 15 & pgvector extension
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.taskRow}>
              <View style={[styles.checkbox, { borderColor: colors.border }]} />
              <Text style={[styles.taskTitle, { color: colors.text }]}>
                Build React Native Thin Client 6-tab core
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
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  avatarBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  aiCard: {
    padding: 18,
  },
  aiBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sparkleIconWrapper: {
    width: 26,
    height: 26,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  aiBriefQuote: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  aiActionRow: {
    marginTop: 14,
    flexDirection: 'row',
  },
  aiActionButton: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  aiActionInner: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  sectionLink: {
    fontSize: 12,
    fontWeight: '600',
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  timeIndicator: {
    width: 3,
    height: 32,
    borderRadius: 2,
    marginRight: 14,
  },
  scheduleDetails: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  scheduleSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: 10,
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
    padding: 14,
    alignItems: 'center',
  },
  gridIconWrapper: {
    marginBottom: 8,
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
    paddingVertical: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskTitle: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
});
