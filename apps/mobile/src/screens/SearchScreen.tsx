import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search,
  X,
  FileText,
  CheckSquare,
  Calendar,
  CreditCard,
  File,
  Layers,
  Zap,
} from 'lucide-react-native';
import { useThemeStore } from '../store/useThemeStore';
import { searchService } from '../services/search.service';
import { SearchEntityType, SearchResultItemDto } from '@lifeos/shared-types';

const FILTER_TABS: { label: string; value: SearchEntityType | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Notes', value: SearchEntityType.NOTE },
  { label: 'Tasks', value: SearchEntityType.TASK },
  { label: 'Events', value: SearchEntityType.EVENT },
  { label: 'Expenses', value: SearchEntityType.EXPENSE },
  { label: 'Docs', value: SearchEntityType.DOCUMENT },
  { label: 'Flashcards', value: SearchEntityType.FLASHCARD },
];

export const SearchScreen: React.FC = () => {
  const { colors } = useThemeStore();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<SearchEntityType | 'ALL'>('ALL');
  const [results, setResults] = useState<SearchResultItemDto[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [executionTimeMs, setExecutionTimeMs] = useState(0);
  const [loading, setLoading] = useState(false);

  const performSearch = useCallback(
    async (searchQuery: string, filterType: SearchEntityType | 'ALL') => {
      if (!searchQuery.trim()) {
        setResults([]);
        setTotalMatches(0);
        setExecutionTimeMs(0);
        return;
      }

      setLoading(true);
      try {
        const types = filterType === 'ALL' ? undefined : [filterType];
        const res = await searchService.quickSearch(searchQuery, types, 25);
        setResults(res.results);
        setTotalMatches(res.totalMatches);
        setExecutionTimeMs(res.executionTimeMs);
      } catch (err) {
        console.warn('Search error:', err);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query, activeFilter);
    }, 250);
    return () => clearTimeout(timer);
  }, [query, activeFilter, performSearch]);

  const getTypeBadge = (type: SearchEntityType) => {
    switch (type) {
      case SearchEntityType.NOTE:
        return { label: 'NOTE', Icon: FileText, color: '#6366F1' };
      case SearchEntityType.TASK:
        return { label: 'TASK', Icon: CheckSquare, color: '#10B981' };
      case SearchEntityType.EVENT:
        return { label: 'EVENT', Icon: Calendar, color: '#3B82F6' };
      case SearchEntityType.EXPENSE:
        return { label: 'EXPENSE', Icon: CreditCard, color: '#F59E0B' };
      case SearchEntityType.DOCUMENT:
        return { label: 'DOC', Icon: File, color: '#8B5CF6' };
      case SearchEntityType.FLASHCARD:
        return { label: 'CARD', Icon: Layers, color: '#EC4899' };
      default:
        return { label: 'ITEM', Icon: Search, color: colors.textMuted };
    }
  };

  const renderResultItem = ({ item }: { item: SearchResultItemDto }) => {
    const badge = getTypeBadge(item.type);
    const BadgeIcon = badge.Icon;

    return (
      <TouchableOpacity
        style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.typeBadge, { backgroundColor: badge.color + '18', borderColor: badge.color + '33', borderWidth: 1 }]}>
            <BadgeIcon size={11} color={badge.color} strokeWidth={2.4} style={{ marginRight: 4 }} />
            <Text style={[styles.typeBadgeText, { color: badge.color }]}>
              {badge.label}
            </Text>
          </View>
          {item.rrfScore ? (
            <Text style={[styles.rrfScore, { color: colors.primaryLight }]}>
              RRF: {(item.rrfScore * 100).toFixed(1)}%
            </Text>
          ) : null}
        </View>

        <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
          {item.title}
        </Text>

        <Text style={[styles.cardSnippet, { color: colors.textSecondary }]} numberOfLines={3}>
          {item.snippet}
        </Text>

        {item.createdAt ? (
          <Text style={[styles.cardDate, { color: colors.textMuted }]}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header & Search Bar */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Universal Search</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Hybrid RRF: Notes, Tasks, Events, Expenses & Docs
        </Text>

        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Search size={18} color={colors.textMuted} strokeWidth={2} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search anything across LifeOS..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={16} color={colors.textMuted} strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTER_TABS}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => {
            const isSelected = activeFilter === item.value;
            return (
              <TouchableOpacity
                onPress={() => setActiveFilter(item.value)}
                style={[
                  styles.filterTab,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={styles.filterList}
        />
      </View>

      {/* Stats Bar */}
      {query.trim().length > 0 && (
        <View style={styles.statsBar}>
          <Text style={[styles.statsText, { color: colors.textMuted }]}>
            Found {totalMatches} results in {executionTimeMs}ms (Reciprocal Rank Fusion)
          </Text>
        </View>
      )}

      {/* Results Content */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primaryLight} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Searching...</Text>
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          renderItem={renderResultItem}
          contentContainerStyle={styles.resultsList}
        />
      ) : query.trim().length > 0 ? (
        <View style={styles.centered}>
          <View style={[styles.emptyIconContainer, { backgroundColor: colors.surface }]}>
            <Search size={28} color={colors.textMuted} strokeWidth={1.75} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No matching items found</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            Try refining your keywords or searching in 'All' categories
          </Text>
        </View>
      ) : (
        <View style={styles.centered}>
          <View style={[styles.emptyIconContainer, { backgroundColor: colors.primary + '18' }]}>
            <Zap size={28} color={colors.primary} strokeWidth={1.75} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Search Across Your Digital Life</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            Type any topic, task, person, amount, or formula to search notes, tasks, calendar, receipts & documents simultaneously.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  clearIcon: {
    fontSize: 16,
    padding: 4,
  },
  filterContainer: {
    paddingVertical: 8,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsBar: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  statsText: {
    fontSize: 11,
    fontWeight: '500',
  },
  resultsList: {
    padding: 16,
    gap: 12,
  },
  resultCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  rrfScore: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSnippet: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  cardDate: {
    fontSize: 11,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
