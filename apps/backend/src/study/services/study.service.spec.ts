import { NotFoundException } from '@nestjs/common';
import { Sm2Service } from './sm2.service';
import { StudyService } from './study.service';

describe('StudyService (REQ-STDY)', () => {
  let service: StudyService;
  let sm2Service: Sm2Service;
  const testUserId = 'usr_test_study';

  beforeEach(() => {
    sm2Service = new Sm2Service();
    service = new StudyService(sm2Service);
  });

  it('should seed initial study decks and cards', () => {
    const decks = service.getUserDecks('usr_default_01');
    expect(decks.length).toBeGreaterThanOrEqual(1);
    expect(decks[0].title).toBe('Distributed Systems & Consensus');
    expect(decks[0].totalCards).toBe(3);
  });

  describe('Deck and Card Management', () => {
    it('should create a deck and add cards', () => {
      const deck = service.createDeck(testUserId, {
        title: 'Compiler Design',
        description: 'Lexical analysis, ASTs, and LLVM IR.',
      });
      expect(deck.id).toBeDefined();
      expect(deck.title).toBe('Compiler Design');

      const card = service.addCardToDeck(testUserId, deck.id, {
        deckId: deck.id,
        question: 'What is a Context-Free Grammar (CFG)?',
        answer: 'A formal grammar where every production rule is of the form A -> alpha.',
      });
      expect(card.id).toBeDefined();
      expect(card.repetitions).toBe(0);

      const deckWithCards = service.getDeckById(testUserId, deck.id);
      expect(deckWithCards.cards.length).toBe(1);
      expect(deckWithCards.totalCards).toBe(1);
    });

    it('should throw NotFoundException for unknown deck', () => {
      expect(() => service.getDeckById(testUserId, 'nonexistent')).toThrow(NotFoundException);
    });
  });

  describe('reviewCard with SM-2 (REQ-STDY-2)', () => {
    it('should successfully review a card and update its interval and repetitions', () => {
      const deck = service.createDeck(testUserId, { title: 'Network Protocols' });
      const card = service.addCardToDeck(testUserId, deck.id, {
        deckId: deck.id,
        question: 'What is the purpose of TCP SYN-ACK?',
        answer: 'Establishes a synchronized bidirectional sequence number hand-shake.',
      });

      const updated = service.reviewCard(testUserId, card.id, 5);
      expect(updated.repetitions).toBe(1);
      expect(updated.interval).toBe(1);
      expect(updated.lastReviewedAt).toBeDefined();
    });
  });

  describe('generateFlashcardsFromContent (REQ-STDY-1)', () => {
    it('should synthesize flashcards from lecture material or note content', () => {
      const source = `Operating Systems Kernel.\nMonolithic vs Microkernel architecture.\nVirtual memory paging mechanisms.\nTLB cache translation.`;
      const result = service.generateFlashcardsFromContent(testUserId, {
        noteTitle: 'OS Kernel Notes',
        sourceText: source,
        cardCount: 3,
      });

      expect(result.deck).toBeDefined();
      expect(result.generatedCards.length).toBe(3);
      expect(result.generatedCards[0].question).toContain('OS Kernel Notes');
    });
  });

  describe('Practice Quizzes (REQ-STDY-3)', () => {
    it('should generate and evaluate a practice quiz', () => {
      const quiz = service.generateQuiz(testUserId, 'Software Engineering', 2);
      expect(quiz.id).toBeDefined();
      expect(quiz.questions.length).toBe(2);

      const answers: Record<string, number> = {};
      quiz.questions.forEach((q) => {
        answers[q.id] = q.correctOptionIndex; // All correct
      });

      const result = service.submitQuiz(testUserId, {
        quizId: quiz.id,
        answers,
      });

      expect(result.score).toBe(2);
      expect(result.percentage).toBe(100);
      expect(result.passed).toBe(true);
    });
  });
});
