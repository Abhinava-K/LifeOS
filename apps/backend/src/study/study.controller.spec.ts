import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Sm2Service } from './services/sm2.service';
import { StudyService } from './services/study.service';
import { StudyController } from './study.controller';

describe('StudyController', () => {
  let controller: StudyController;
  let service: StudyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudyController],
      providers: [Sm2Service, StudyService],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<StudyController>(StudyController);
    service = module.get<StudyService>(StudyService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return user decks', () => {
    const res = controller.getDecks();
    expect(res.success).toBe(true);
    expect(res.data.length).toBeGreaterThanOrEqual(1);
  });

  it('should return due cards', () => {
    const res = controller.getDueCards();
    expect(res.success).toBe(true);
    expect(Array.isArray(res.data)).toBe(true);
  });

  it('should review a card with SM-2 score', () => {
    const dueRes = controller.getDueCards();
    if (dueRes.data.length > 0) {
      const card = dueRes.data[0];
      const reviewRes = controller.reviewCard(card.id, { recallScore: 5 });
      expect(reviewRes.success).toBe(true);
      expect(reviewRes.data.repetitions).toBeGreaterThan(0);
    }
  });

  it('should generate a practice quiz and submit it', () => {
    const quizRes = controller.generateQuiz({ topic: 'Operating Systems' });
    expect(quizRes.success).toBe(true);
    expect(quizRes.data.questions.length).toBeGreaterThanOrEqual(2);

    const answers: Record<string, number> = {};
    quizRes.data.questions.forEach((q) => {
      answers[q.id] = q.correctOptionIndex;
    });

    const submitRes = controller.submitQuiz(quizRes.data.id, answers);
    expect(submitRes.success).toBe(true);
    expect(submitRes.data.percentage).toBe(100);
  });
});
