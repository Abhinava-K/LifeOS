import { BadRequestException, Injectable } from '@nestjs/common';
import { Sm2CalculationResult } from '@lifeos/shared-types';

export const MINIMUM_EASE_FACTOR = 1.3;
export const DEFAULT_EASE_FACTOR = 2.5;

@Injectable()
export class Sm2Service {
  /**
   * Deterministic implementation of the SuperMemo-2 (SM-2) Spaced Repetition Algorithm (REQ-STDY-2)
   *
   * @param cardId Unique identifier of the card
   * @param recallScore User recall score from 0 (complete blackout) to 5 (perfect response)
   * @param currentRepetitions Number of consecutive successful recall reviews
   * @param currentInterval Current review interval in days
   * @param currentEaseFactor Current ease factor (minimum floor of 1.3)
   */
  calculateReview(
    cardId: string,
    recallScore: number,
    currentRepetitions: number = 0,
    currentInterval: number = 0,
    currentEaseFactor: number = DEFAULT_EASE_FACTOR,
  ): Sm2CalculationResult {
    if (recallScore === undefined || recallScore === null || isNaN(recallScore)) {
      throw new BadRequestException('recallScore must be a valid number between 0 and 5');
    }

    // Clamp score strictly between 0 and 5
    const q = Math.max(0, Math.min(5, Math.round(recallScore)));

    let repetitions = currentRepetitions;
    let interval = currentInterval;
    let easeFactor = Math.max(MINIMUM_EASE_FACTOR, currentEaseFactor || DEFAULT_EASE_FACTOR);

    if (q < 3) {
      // Failed recall: reset repetitions count and schedule next review for tomorrow (1 day)
      repetitions = 0;
      interval = 1;
    } else {
      // Successful recall: update interval based on repetition stage
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.max(1, Math.round(interval * easeFactor));
      }
      repetitions += 1;
    }

    // Ease Factor formula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    const efDelta = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
    easeFactor = Math.max(MINIMUM_EASE_FACTOR, Number((easeFactor + efDelta).toFixed(3)));

    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + interval);

    return {
      cardId,
      recallScore: q,
      repetitions,
      interval,
      easeFactor,
      dueDate: nextDueDate.toISOString(),
      nextReviewInDays: interval,
    };
  }
}
