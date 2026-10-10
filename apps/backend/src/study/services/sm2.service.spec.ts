import { BadRequestException } from '@nestjs/common';
import { DEFAULT_EASE_FACTOR, MINIMUM_EASE_FACTOR, Sm2Service } from './sm2.service';

describe('Sm2Service (REQ-STDY-2 SuperMemo-2 Spaced Repetition)', () => {
  let service: Sm2Service;

  beforeEach(() => {
    service = new Sm2Service();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Initial Review (Repetition 0)', () => {
    it('should set interval to 1 day on initial successful review (score 4 or 5)', () => {
      const result = service.calculateReview('card-1', 4, 0, 0, DEFAULT_EASE_FACTOR);
      expect(result.repetitions).toBe(1);
      expect(result.interval).toBe(1);
      expect(result.nextReviewInDays).toBe(1);
    });

    it('should reset repetitions to 0 and set interval to 1 on failed recall (score < 3)', () => {
      const result = service.calculateReview('card-1', 2, 0, 0, DEFAULT_EASE_FACTOR);
      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
    });
  });

  describe('Second Review (Repetition 1)', () => {
    it('should set interval to 6 days on second successful review', () => {
      const result = service.calculateReview('card-1', 5, 1, 1, DEFAULT_EASE_FACTOR);
      expect(result.repetitions).toBe(2);
      expect(result.interval).toBe(6);
      expect(result.nextReviewInDays).toBe(6);
    });

    it('should reset repetitions to 0 on second review if score < 3', () => {
      const result = service.calculateReview('card-1', 1, 1, 1, DEFAULT_EASE_FACTOR);
      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
    });
  });

  describe('Subsequent Reviews (Repetitions >= 2)', () => {
    it('should multiply previous interval by ease factor', () => {
      const currentInterval = 6;
      const easeFactor = 2.5;
      const result = service.calculateReview('card-1', 5, 2, currentInterval, easeFactor);

      expect(result.repetitions).toBe(3);
      // EF for score 5: 2.5 + (0.1 - 0) = 2.6
      // interval = round(6 * 2.5) = 15
      expect(result.interval).toBe(15);
      expect(result.easeFactor).toBeGreaterThan(easeFactor);
    });
  });

  describe('Ease Factor boundary checks', () => {
    it('should not allow ease factor to fall below MINIMUM_EASE_FACTOR (1.3)', () => {
      // Multiple bad scores
      let ef = 1.4;
      const result = service.calculateReview('card-1', 0, 1, 6, ef);
      expect(result.easeFactor).toBe(MINIMUM_EASE_FACTOR);
    });

    it('should reject invalid recall scores', () => {
      expect(() => service.calculateReview('card-1', NaN, 0, 0)).toThrow(BadRequestException);
    });
  });
});
