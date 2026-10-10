import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateFlashcardDeckDto,
  CreateFlashcardDto,
  FlashcardDeckDto,
  FlashcardDto,
  GenerateFlashcardsDto,
  QuizDto,
  QuizQuestionDto,
  QuizResultDto,
  ReviewFlashcardDto,
  SubmitQuizDto,
} from '@lifeos/shared-types';
import { DEFAULT_EASE_FACTOR, Sm2Service } from './sm2.service';

@Injectable()
export class StudyService {
  private decksStore: Map<string, FlashcardDeckDto> = new Map();
  private cardsStore: Map<string, FlashcardDto> = new Map();
  private quizzesStore: Map<string, QuizDto> = new Map();

  constructor(private readonly sm2Service: Sm2Service) {
    this.seedInitialStudyData();
  }

  private seedInitialStudyData(): void {
    const defaultUserId = 'usr_default_01';

    // Deck 1: Distributed Systems & Consensus
    const deck1: FlashcardDeckDto = {
      id: 'deck-dist-sys',
      userId: defaultUserId,
      title: 'Distributed Systems & Consensus',
      description: 'Core concepts in Paxos, Raft, Byzantine fault tolerance, and vector clocks.',
      tags: ['cs', 'distributed-systems', 'consensus'],
      totalCards: 3,
      dueCards: 2,
      createdAt: new Date('2026-09-25T08:00:00Z').toISOString(),
      updatedAt: new Date('2026-09-25T08:00:00Z').toISOString(),
    };

    const card1: FlashcardDto = {
      id: 'card-001',
      deckId: deck1.id,
      userId: defaultUserId,
      question: 'What is the role of the Leader in the Raft consensus protocol?',
      answer: 'The Leader manages log replication, accepts client requests, and sends periodic heartbeats to maintain authority.',
      explanation: 'Followers forward requests to the Leader; elections trigger when heartbeats timeout.',
      repetitions: 2,
      interval: 6,
      easeFactor: 2.5,
      dueDate: new Date(Date.now() - 3600000).toISOString(), // Due now
      lastReviewedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      createdAt: new Date('2026-09-25T08:05:00Z').toISOString(),
      updatedAt: new Date('2026-09-25T08:05:00Z').toISOString(),
    };

    const card2: FlashcardDto = {
      id: 'card-002',
      deckId: deck1.id,
      userId: defaultUserId,
      question: 'State the CAP Theorem and its fundamental tradeoff.',
      answer: 'A distributed system can guarantee at most two out of Consistency, Availability, and Partition Tolerance.',
      explanation: 'In the presence of network partitions (P), a system must trade off between C and A.',
      repetitions: 1,
      interval: 1,
      easeFactor: 2.4,
      dueDate: new Date(Date.now() - 7200000).toISOString(), // Due now
      lastReviewedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      createdAt: new Date('2026-09-25T08:10:00Z').toISOString(),
      updatedAt: new Date('2026-09-25T08:10:00Z').toISOString(),
    };

    const card3: FlashcardDto = {
      id: 'card-003',
      deckId: deck1.id,
      userId: defaultUserId,
      question: 'What is the difference between synchronous and asynchronous replication?',
      answer: 'Synchronous replication waits for acknowledgment from replicas before confirming write, whereas asynchronous commits locally first.',
      explanation: 'Synchronous prioritizes safety/consistency; asynchronous prioritizes lower write latency.',
      repetitions: 3,
      interval: 15,
      easeFactor: 2.6,
      dueDate: new Date(Date.now() + 10 * 86400000).toISOString(), // Not due yet
      lastReviewedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      createdAt: new Date('2026-09-25T08:15:00Z').toISOString(),
      updatedAt: new Date('2026-09-25T08:15:00Z').toISOString(),
    };

    this.decksStore.set(deck1.id, deck1);
    this.cardsStore.set(card1.id, card1);
    this.cardsStore.set(card2.id, card2);
    this.cardsStore.set(card3.id, card3);

    // Initial Practice Quiz
    const quiz1: QuizDto = {
      id: 'quiz-001',
      title: 'Distributed Consensus Quick Quiz',
      topic: 'Raft & CAP Theorem',
      questions: [
        {
          id: 'q-1',
          question: 'What triggers a new election in the Raft consensus algorithm?',
          options: [
            'Client requests a new term',
            'Heartbeat timer expires without receiving leader ping',
            'Log index reaches capacity',
            'Network bandwidth exceeds quota',
          ],
          correctOptionIndex: 1,
          explanation: 'When election timer expires without heartbeat, a follower increments term and transitions to candidate.',
        },
        {
          id: 'q-2',
          question: 'Under CAP theorem, which property MUST be assumed in real-world distributed networks?',
          options: ['Consistency', 'Availability', 'Partition Tolerance', 'Linearizability'],
          correctOptionIndex: 2,
          explanation: 'Network partitions are inevitable physical realities, so systems must be partition tolerant.',
        },
      ],
      totalQuestions: 2,
      createdAt: new Date('2026-09-26T00:00:00Z').toISOString(),
    };
    this.quizzesStore.set(quiz1.id, quiz1);
  }

  // ==========================================
  // Deck Operations
  // ==========================================

  getUserDecks(userId: string): FlashcardDeckDto[] {
    const decks = Array.from(this.decksStore.values()).filter((d) => d.userId === userId);
    return decks.map((deck) => this.refreshDeckMetrics(deck));
  }

  getDeckById(userId: string, id: string): FlashcardDeckDto & { cards: FlashcardDto[] } {
    const deck = this.decksStore.get(id);
    if (!deck || deck.userId !== userId) {
      throw new NotFoundException(`Flashcard deck '${id}' not found`);
    }
    const cards = Array.from(this.cardsStore.values()).filter((c) => c.deckId === id);
    return {
      ...this.refreshDeckMetrics(deck),
      cards,
    };
  }

  createDeck(userId: string, input: CreateFlashcardDeckDto): FlashcardDeckDto {
    if (!input.title || input.title.trim().length === 0) {
      throw new BadRequestException('Deck title is required');
    }

    const deckId = `deck-${Date.now()}`;
    const deck: FlashcardDeckDto = {
      id: deckId,
      userId,
      title: input.title.trim(),
      description: input.description || null,
      tags: input.tags || ['study'],
      totalCards: 0,
      dueCards: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.decksStore.set(deck.id, deck);
    return deck;
  }

  deleteDeck(userId: string, deckId: string): boolean {
    const deck = this.decksStore.get(deckId);
    if (!deck || deck.userId !== userId) {
      throw new NotFoundException(`Deck '${deckId}' not found`);
    }

    for (const [cardId, card] of this.cardsStore.entries()) {
      if (card.deckId === deckId) {
        this.cardsStore.delete(cardId);
      }
    }
    return this.decksStore.delete(deckId);
  }

  // ==========================================
  // Card Operations & SM-2 Spaced Repetition
  // ==========================================

  addCardToDeck(userId: string, deckId: string, input: CreateFlashcardDto): FlashcardDto {
    const deck = this.decksStore.get(deckId);
    if (!deck || deck.userId !== userId) {
      throw new NotFoundException(`Deck '${deckId}' not found`);
    }

    if (!input.question || !input.answer) {
      throw new BadRequestException('Both question and answer are required for a flashcard');
    }

    const cardId = `card-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const card: FlashcardDto = {
      id: cardId,
      deckId,
      userId,
      question: input.question.trim(),
      answer: input.answer.trim(),
      explanation: input.explanation || null,
      repetitions: 0,
      interval: 1,
      easeFactor: DEFAULT_EASE_FACTOR,
      dueDate: new Date().toISOString(), // New cards are due immediately
      lastReviewedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.cardsStore.set(card.id, card);
    this.refreshDeckMetrics(deck);
    return card;
  }

  getDueCards(userId: string, deckId?: string): FlashcardDto[] {
    const now = new Date().getTime();
    return Array.from(this.cardsStore.values())
      .filter((card) => {
        if (card.userId !== userId) return false;
        if (deckId && card.deckId !== deckId) return false;
        return new Date(card.dueDate).getTime() <= now;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }

  /**
   * REQ-STDY-2: Process user review rating (0..5) using SuperMemo-2
   */
  reviewCard(userId: string, cardId: string, recallScore: number): FlashcardDto {
    const card = this.cardsStore.get(cardId);
    if (!card || card.userId !== userId) {
      throw new NotFoundException(`Flashcard '${cardId}' not found`);
    }

    const calculation = this.sm2Service.calculateReview(
      card.id,
      recallScore,
      card.repetitions,
      card.interval,
      card.easeFactor,
    );

    card.repetitions = calculation.repetitions;
    card.interval = calculation.interval;
    card.easeFactor = calculation.easeFactor;
    card.dueDate = calculation.dueDate;
    card.lastReviewedAt = new Date().toISOString();
    card.updatedAt = new Date().toISOString();

    this.cardsStore.set(card.id, card);

    const deck = this.decksStore.get(card.deckId);
    if (deck) {
      this.refreshDeckMetrics(deck);
    }

    return card;
  }

  // ==========================================
  // REQ-STDY-1: Automated Flashcard Generation
  // ==========================================

  generateFlashcardsFromContent(
    userId: string,
    dto: GenerateFlashcardsDto,
  ): { deck: FlashcardDeckDto; generatedCards: FlashcardDto[] } {
    if (!dto.sourceText || dto.sourceText.trim().length === 0) {
      throw new BadRequestException('sourceText is required to generate flashcards');
    }

    const count = Math.min(10, Math.max(1, dto.cardCount || 4));
    const deckTitle = dto.deckTitle || `Study Deck: ${dto.noteTitle || 'Generated Topic'}`;

    const deck = this.createDeck(userId, {
      title: deckTitle,
      description: `Automated study deck generated from ${dto.noteTitle || 'source material'}.`,
      tags: ['ai-generated', 'study-hub'],
    });

    const lines = dto.sourceText.split('\n').filter((l) => l.trim().length > 0);
    const generatedCards: FlashcardDto[] = [];

    // Synthesize structured Q&A pairs from text lines
    for (let i = 0; i < count; i++) {
      const lineSample = lines[i % lines.length] || dto.sourceText.substring(0, 80);
      const question = `[${dto.noteTitle || 'Concept'}] What are the key implications of: "${lineSample.substring(0, 60).trim()}..."?`;
      const answer = `Core concept: ${lineSample.trim()}. Spaced recall reinforces long-term retention.`;

      const card = this.addCardToDeck(userId, deck.id, {
        deckId: deck.id,
        question,
        answer,
        explanation: `Generated from study notes for active recall training.`,
      });
      generatedCards.push(card);
    }

    return {
      deck: this.refreshDeckMetrics(deck),
      generatedCards,
    };
  }

  // ==========================================
  // REQ-STDY-3: Practice Quizzes
  // ==========================================

  generateQuiz(userId: string, topic: string, questionCount: number = 3): QuizDto {
    const qCount = Math.min(10, Math.max(1, questionCount));
    const quizId = `quiz-${Date.now()}`;

    const questions: QuizQuestionDto[] = [
      {
        id: `q-${quizId}-1`,
        question: `In ${topic}, what is the principal objective of active retrieval practice?`,
        options: [
          'Minimizing review session duration',
          'Strengthening neural synaptic pathways and recall latency',
          'Eliminating database persistence requirements',
          'Maximizing linear memory consumption',
        ],
        correctOptionIndex: 1,
        explanation: 'Active retrieval practice forces cognitive effort, directly improving retention according to SM-2 principles.',
      },
      {
        id: `q-${quizId}-2`,
        question: `How does the SM-2 algorithm handle an initial failed recall (score < 3)?`,
        options: [
          'Decreases review interval to 0 hours',
          'Resets repetitions count to 0 and schedules review for next day (1 day)',
          'Permanently archives the flashcard item',
          'Multiplies ease factor by 2',
        ],
        correctOptionIndex: 1,
        explanation: 'A recall score below 3 resets repetitions to 0 and restarts interval at 1 day to re-establish memory.',
      },
    ];

    if (qCount > 2) {
      questions.push({
        id: `q-${quizId}-3`,
        question: `What is the minimum floor value for the Ease Factor (EF) in SuperMemo-2?`,
        options: ['0.0', '1.0', '1.3', '2.5'],
        correctOptionIndex: 2,
        explanation: 'SuperMemo-2 fixes the minimum ease factor at 1.3 to prevent review intervals from shrinking infinitely.',
      });
    }

    const quiz: QuizDto = {
      id: quizId,
      title: `${topic} Practice Quiz`,
      topic,
      questions,
      totalQuestions: questions.length,
      createdAt: new Date().toISOString(),
    };

    this.quizzesStore.set(quiz.id, quiz);
    return quiz;
  }

  submitQuiz(userId: string, submission: SubmitQuizDto): QuizResultDto {
    const quiz = this.quizzesStore.get(submission.quizId);
    if (!quiz) {
      throw new NotFoundException(`Quiz '${submission.quizId}' not found`);
    }

    let correctCount = 0;
    const breakdown = quiz.questions.map((q) => {
      const selected = submission.answers[q.id];
      const isCorrect = selected === q.correctOptionIndex;
      if (isCorrect) correctCount += 1;
      return {
        questionId: q.id,
        question: q.question,
        selectedOptionIndex: selected ?? -1,
        correctOptionIndex: q.correctOptionIndex,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const percentage = Math.round((correctCount / quiz.totalQuestions) * 100);

    return {
      quizId: quiz.id,
      score: correctCount,
      totalQuestions: quiz.totalQuestions,
      percentage,
      passed: percentage >= 70,
      breakdown,
    };
  }

  private refreshDeckMetrics(deck: FlashcardDeckDto): FlashcardDeckDto {
    const now = new Date().getTime();
    const cards = Array.from(this.cardsStore.values()).filter((c) => c.deckId === deck.id);
    const dueCount = cards.filter((c) => new Date(c.dueDate).getTime() <= now).length;

    deck.totalCards = cards.length;
    deck.dueCards = dueCount;
    deck.updatedAt = new Date().toISOString();
    return deck;
  }
}
