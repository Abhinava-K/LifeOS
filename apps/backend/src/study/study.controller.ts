import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  CreateFlashcardDeckDto,
  CreateFlashcardDto,
  FlashcardDeckDto,
  FlashcardDto,
  GenerateFlashcardsDto,
  QuizDto,
  QuizResultDto,
  ReviewFlashcardDto,
  StandardApiResponse,
  SubmitQuizDto,
} from '@lifeos/shared-types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StudyService } from './services/study.service';

@Controller('api/v1/study')
@UseGuards(JwtAuthGuard)
export class StudyController {
  constructor(private readonly studyService: StudyService) {}

  @Get('decks')
  getDecks(): StandardApiResponse<FlashcardDeckDto[]> {
    const userId = 'usr_default_01';
    const decks = this.studyService.getUserDecks(userId);
    return {
      success: true,
      data: decks,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('decks')
  @HttpCode(HttpStatus.CREATED)
  createDeck(@Body() input: CreateFlashcardDeckDto): StandardApiResponse<FlashcardDeckDto> {
    const userId = 'usr_default_01';
    const deck = this.studyService.createDeck(userId, input);
    return {
      success: true,
      data: deck,
      message: 'Flashcard deck created successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('decks/:id')
  getDeckById(@Param('id') id: string): StandardApiResponse<FlashcardDeckDto & { cards: FlashcardDto[] }> {
    const userId = 'usr_default_01';
    const deckWithCards = this.studyService.getDeckById(userId, id);
    return {
      success: true,
      data: deckWithCards,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('decks/:id')
  deleteDeck(@Param('id') id: string): StandardApiResponse<{ deleted: boolean }> {
    const userId = 'usr_default_01';
    const deleted = this.studyService.deleteDeck(userId, id);
    return {
      success: true,
      data: { deleted },
      message: 'Flashcard deck deleted successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('decks/:id/cards')
  @HttpCode(HttpStatus.CREATED)
  addCardToDeck(
    @Param('id') deckId: string,
    @Body() input: CreateFlashcardDto,
  ): StandardApiResponse<FlashcardDto> {
    const userId = 'usr_default_01';
    const card = this.studyService.addCardToDeck(userId, deckId, input);
    return {
      success: true,
      data: card,
      message: 'Flashcard added to deck',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('due-cards')
  getDueCards(@Query('deckId') deckId?: string): StandardApiResponse<FlashcardDto[]> {
    const userId = 'usr_default_01';
    const cards = this.studyService.getDueCards(userId, deckId);
    return {
      success: true,
      data: cards,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('cards/:id/review')
  reviewCard(
    @Param('id') cardId: string,
    @Body() body: { recallScore: number },
  ): StandardApiResponse<FlashcardDto> {
    const userId = 'usr_default_01';
    const updatedCard = this.studyService.reviewCard(userId, cardId, body.recallScore);
    return {
      success: true,
      data: updatedCard,
      message: `Card reviewed with SM-2 (Recall Score: ${body.recallScore}). Next review in ${updatedCard.interval} day(s).`,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('generate-flashcards')
  generateFlashcards(
    @Body() input: GenerateFlashcardsDto,
  ): StandardApiResponse<{ deck: FlashcardDeckDto; generatedCards: FlashcardDto[] }> {
    const userId = 'usr_default_01';
    const result = this.studyService.generateFlashcardsFromContent(userId, input);
    return {
      success: true,
      data: result,
      message: `Generated ${result.generatedCards.length} flashcards from study materials`,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('quizzes/generate')
  generateQuiz(
    @Body() body: { topic: string; questionCount?: number },
  ): StandardApiResponse<QuizDto> {
    const userId = 'usr_default_01';
    const quiz = this.studyService.generateQuiz(userId, body.topic || 'General Computer Science', body.questionCount || 3);
    return {
      success: true,
      data: quiz,
      message: 'Practice quiz generated',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('quizzes/:id/submit')
  submitQuiz(
    @Param('id') quizId: string,
    @Body('answers') answers: Record<string, number>,
  ): StandardApiResponse<QuizResultDto> {
    const userId = 'usr_default_01';
    const result = this.studyService.submitQuiz(userId, { quizId, answers: answers || {} });
    return {
      success: true,
      data: result,
      message: `Quiz graded: ${result.score}/${result.totalQuestions} (${result.percentage}%)`,
      timestamp: new Date().toISOString(),
    };
  }
}
