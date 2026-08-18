import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TextInput } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';

export const LibraryScreen: React.FC = () => {
  const { colors } = useThemeStore();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>📚 Universal Library</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>Notes • Receipts • Documents • RRF Search</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Hybrid Search (Keyword + pgvector embeddings)..."
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {/* Section: Pinned Notes */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Pinned Notes</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.noteTitle, { color: colors.text }]}>LifeOS Architecture Decisions (ADR-001)</Text>
            <Text style={[styles.noteSnippet, { color: colors.textMuted }]}>
              Modular Monolith + FastAPI CrewAI service for resilient multi-agent reasoning.
            </Text>
            <View style={styles.tagRow}>
              <View style={[styles.tag, { backgroundColor: colors.surfaceLight }]}>
                <Text style={[styles.tagText, { color: colors.primaryLight }]}>#architecture</Text>
              </View>
              <View style={[styles.tag, { backgroundColor: colors.surfaceLight }]}>
                <Text style={[styles.tagText, { color: colors.accent }]}>#v1</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section: Receipts & Vault */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Receipt Scans</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.receiptRow}>
              <View>
                <Text style={[styles.receiptMerchant, { color: colors.text }]}>Apple Developer Program</Text>
                <Text style={[styles.receiptDate, { color: colors.textMuted }]}>Aug 15, 2026 • Tech / Software</Text>
              </View>
              <Text style={[styles.receiptAmount, { color: colors.text }]}>$99.00</Text>
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  noteTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  noteSnippet: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  tagRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptMerchant: {
    fontSize: 14,
    fontWeight: '600',
  },
  receiptDate: {
    fontSize: 12,
    marginTop: 2,
  },
  receiptAmount: {
    fontSize: 15,
    fontWeight: '800',
  },
});
