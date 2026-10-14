import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../store/useThemeStore';

interface VaultDoc {
  id: string;
  fileName: string;
  mimeType: string;
  sizeMb: string;
  summary: string;
  tags: string[];
}

interface StudyCard {
  id: string;
  question: string;
  answer: string;
  explanation: string;
  repetitions: number;
  interval: number;
  easeFactor: number;
}

export const LibraryScreen: React.FC = () => {
  const { colors } = useThemeStore();
  const [activeTab, setActiveTab] = useState<'ALL' | 'DOCS' | 'STUDY'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Document Vault State (REQ-DOC)
  const [docs, setDocs] = useState<VaultDoc[]>([
    {
      id: 'doc-001',
      fileName: 'Distributed_Systems_Lecture_04.pdf',
      mimeType: 'PDF',
      sizeMb: '4.2 MB',
      summary: 'Analysis of Raft and Paxos consensus algorithms, leader election, and distributed log replication.',
      tags: ['distributed-systems', 'consensus', 'raft'],
    },
    {
      id: 'doc-002',
      fileName: 'LifeOS_System_Architecture_Spec.docx',
      mimeType: 'DOCX',
      sizeMb: '1.8 MB',
      summary: 'IEEE 830 Architecture specification defining NestJS modular monolith, pgvector, and SM-2 flashcards.',
      tags: ['architecture', 'ieee-830', 'spec'],
    },
  ]);

  // Study Hub & SM-2 Flashcards State (REQ-STDY)
  const [flashcards, setFlashcards] = useState<StudyCard[]>([
    {
      id: 'card-001',
      question: 'What triggers a new leader election in the Raft consensus protocol?',
      answer: 'Heartbeat timer expires without receiving an append-entries ping from current leader.',
      explanation: 'Followers increment their term number and transition into candidate state.',
      repetitions: 2,
      interval: 6,
      easeFactor: 2.5,
    },
    {
      id: 'card-002',
      question: 'What does the SM-2 algorithm do when a recall score < 3 is submitted?',
      answer: 'Resets repetitions to 0 and schedules next review for 1 day.',
      explanation: 'Unsuccessful recall restarts the learning phase to ensure memory retention.',
      repetitions: 1,
      interval: 1,
      easeFactor: 2.4,
    },
    {
      id: 'card-003',
      question: 'Under CAP Theorem, what tradeoff must distributed networks make during partitions?',
      answer: 'Systems must choose between strong Consistency (C) or high Availability (A).',
      explanation: 'Network partitions are physical realities that cannot be avoided.',
      repetitions: 3,
      interval: 15,
      easeFactor: 2.6,
    },
  ]);

  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState<string | null>(null);

  const currentCard = flashcards[activeCardIndex];

  // SuperMemo-2 Spaced Repetition Handler (REQ-STDY-2)
  const handleSm2Review = (score: number) => {
    if (!currentCard) return;

    let nextInterval = currentCard.interval;
    let nextReps = currentCard.repetitions;
    let nextEf = currentCard.easeFactor;

    if (score < 3) {
      nextReps = 0;
      nextInterval = 1;
    } else {
      if (nextReps === 0) nextInterval = 1;
      else if (nextReps === 1) nextInterval = 6;
      else nextInterval = Math.round(nextInterval * nextEf);
      nextReps += 1;
    }

    const efDelta = 0.1 - (5 - score) * (0.08 + (5 - score) * 0.02);
    nextEf = Math.max(1.3, Number((nextEf + efDelta).toFixed(2)));

    const updated = [...flashcards];
    updated[activeCardIndex] = {
      ...currentCard,
      repetitions: nextReps,
      interval: nextInterval,
      easeFactor: nextEf,
    };
    setFlashcards(updated);

    setReviewFeedback(
      `SM-2 Score: ${score}/5 • Next review in ${nextInterval} day(s) • EF: ${nextEf}`,
    );

    setTimeout(() => {
      setIsAnswerRevealed(false);
      setReviewFeedback(null);
      setActiveCardIndex((prev) => (prev + 1) % flashcards.length);
    }, 1200);
  };

  const handleSimulatedUpload = () => {
    Alert.alert(
      'Document Vault (REQ-DOC-1)',
      'Upload simulator: Select a PDF or DOCX file under 25MB to index with PostgreSQL tsvector.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Upload Demo PDF',
          onPress: () => {
            const newDoc: VaultDoc = {
              id: `doc-${Date.now()}`,
              fileName: 'Quantum_Computing_Lecture_01.pdf',
              mimeType: 'PDF',
              sizeMb: '3.1 MB',
              summary: 'Superposition, qubits, and Grover search algorithms.',
              tags: ['quantum', 'algorithms'],
            };
            setDocs([newDoc, ...docs]);
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>📚 Universal Library & Study Hub</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
          Notes • Documents Vault • SM-2 Flashcards • Quizzes
        </Text>
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'ALL' && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab('ALL')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'ALL' ? colors.primary : colors.textMuted },
            ]}
          >
            Overview
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'DOCS' && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab('DOCS')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'DOCS' ? colors.primary : colors.textMuted },
            ]}
          >
            Vault ({docs.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'STUDY' && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab('STUDY')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'STUDY' ? colors.primary : colors.textMuted },
            ]}
          >
            Study Hub (SM-2)
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search notes, documents, and flashcard decks..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* STUDY HUB TAB / SM-2 ENGINE (REQ-STDY) */}
        {(activeTab === 'ALL' || activeTab === 'STUDY') && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                🧠 SM-2 Spaced Repetition Deck
              </Text>
              <View style={[styles.dueBadge, { backgroundColor: colors.primaryLight + '20' }]}>
                <Text style={[styles.dueBadgeText, { color: colors.primary }]}>
                  Card {activeCardIndex + 1} of {flashcards.length}
                </Text>
              </View>
            </View>

            {currentCard && (
              <View style={[styles.cardContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardRepBadge, { color: colors.textMuted }]}>
                    Repetitions: {currentCard.repetitions} • Interval: {currentCard.interval}d • EF: {currentCard.easeFactor}
                  </Text>
                </View>

                <Text style={[styles.cardQuestion, { color: colors.text }]}>
                  {currentCard.question}
                </Text>

                {isAnswerRevealed ? (
                  <View style={[styles.answerBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <Text style={[styles.answerLabel, { color: colors.primary }]}>ANSWER</Text>
                    <Text style={[styles.answerText, { color: colors.text }]}>
                      {currentCard.answer}
                    </Text>
                    <Text style={[styles.explanationText, { color: colors.textMuted }]}>
                      💡 {currentCard.explanation}
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.revealButton, { backgroundColor: colors.primary }]}
                    onPress={() => setIsAnswerRevealed(true)}
                  >
                    <Text style={styles.revealButtonText}>Tap to Reveal Answer</Text>
                  </TouchableOpacity>
                )}

                {/* SM-2 Recall Rating Buttons */}
                {isAnswerRevealed && (
                  <View style={styles.sm2RatingContainer}>
                    <Text style={[styles.ratingPrompt, { color: colors.textMuted }]}>
                      Rate Recall Difficulty (SM-2):
                    </Text>
                    <View style={styles.ratingButtonGroup}>
                      <TouchableOpacity
                        style={[styles.ratingBtn, { backgroundColor: '#EF4444' }]}
                        onPress={() => handleSm2Review(0)}
                      >
                        <Text style={styles.ratingBtnScore}>0</Text>
                        <Text style={styles.ratingBtnLabel}>Blackout</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.ratingBtn, { backgroundColor: '#F59E0B' }]}
                        onPress={() => handleSm2Review(2)}
                      >
                        <Text style={styles.ratingBtnScore}>2</Text>
                        <Text style={styles.ratingBtnLabel}>Hard</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.ratingBtn, { backgroundColor: '#3B82F6' }]}
                        onPress={() => handleSm2Review(3)}
                      >
                        <Text style={styles.ratingBtnScore}>3</Text>
                        <Text style={styles.ratingBtnLabel}>Pass</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.ratingBtn, { backgroundColor: '#10B981' }]}
                        onPress={() => handleSm2Review(5)}
                      >
                        <Text style={styles.ratingBtnScore}>5</Text>
                        <Text style={styles.ratingBtnLabel}>Perfect</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {reviewFeedback && (
                  <View style={styles.feedbackBanner}>
                    <Text style={styles.feedbackText}>{reviewFeedback}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* DOCUMENT VAULT TAB (REQ-DOC) */}
        {(activeTab === 'ALL' || activeTab === 'DOCS') && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                📁 Document Vault (REQ-DOC)
              </Text>
              <TouchableOpacity
                style={[styles.uploadBtn, { backgroundColor: colors.primary }]}
                onPress={handleSimulatedUpload}
              >
                <Text style={styles.uploadBtnText}>+ Upload (≤25MB)</Text>
              </TouchableOpacity>
            </View>

            {docs.map((doc) => (
              <View
                key={doc.id}
                style={[styles.docCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={styles.docHeader}>
                  <View style={[styles.mimeBadge, { backgroundColor: colors.primaryLight + '20' }]}>
                    <Text style={[styles.mimeText, { color: colors.primary }]}>{doc.mimeType}</Text>
                  </View>
                  <Text style={[styles.docName, { color: colors.text }]} numberOfLines={1}>
                    {doc.fileName}
                  </Text>
                  <Text style={[styles.docSize, { color: colors.textMuted }]}>{doc.sizeMb}</Text>
                </View>

                <Text style={[styles.docSummary, { color: colors.textMuted }]} numberOfLines={2}>
                  {doc.summary}
                </Text>

                <View style={styles.tagRow}>
                  {doc.tags.map((tag, idx) => (
                    <View key={idx} style={[styles.tag, { backgroundColor: colors.surfaceLight }]}>
                      <Text style={[styles.tagText, { color: colors.primaryLight }]}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* PINNED NOTES OVERVIEW */}
        {activeTab === 'ALL' && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>📝 Pinned Knowledge Base</Text>
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.noteTitle, { color: colors.text }]}>
                LifeOS Architecture Decisions (ADR-001)
              </Text>
              <Text style={[styles.noteSnippet, { color: colors.textMuted }]}>
                Modular Monolith + FastAPI CrewAI service with PostgreSQL pgvector embeddings and SM-2 spaced repetition.
              </Text>
              <View style={styles.tagRow}>
                <View style={[styles.tag, { backgroundColor: colors.surfaceLight }]}>
                  <Text style={[styles.tagText, { color: colors.primaryLight }]}>#architecture</Text>
                </View>
                <View style={[styles.tag, { backgroundColor: colors.surfaceLight }]}>
                  <Text style={[styles.tagText, { color: colors.accent }]}>#phase4-complete</Text>
                </View>
              </View>
            </View>
          </View>
        )}
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
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 8,
  },
  tabItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
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
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  dueBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dueBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardRepBadge: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardQuestion: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 14,
  },
  revealButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  revealButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  answerBox: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  answerLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  answerText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  explanationText: {
    fontSize: 12,
    marginTop: 8,
    lineHeight: 16,
  },
  sm2RatingContainer: {
    marginTop: 16,
  },
  ratingPrompt: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  ratingButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  ratingBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  ratingBtnScore: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  ratingBtnLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  feedbackBanner: {
    marginTop: 12,
    backgroundColor: '#10B98120',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  feedbackText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
  },
  uploadBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  uploadBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  docCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  docHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  mimeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  mimeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  docName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  docSize: {
    fontSize: 11,
  },
  docSummary: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
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
    marginTop: 4,
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
});
