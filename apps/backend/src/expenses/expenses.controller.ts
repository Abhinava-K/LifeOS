import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ExpenseCategory, ExpenseDto, StandardApiResponse } from '@lifeos/shared-types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateExpenseInput,
  ExpensesService,
  OcrExtractionResult,
  SpendAnalyticsSummary,
} from './expenses.service';

@Controller('api/v1/expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  getExpenses(
    @Query('category') category?: ExpenseCategory,
  ): StandardApiResponse<ExpenseDto[]> {
    const userId = 'usr_default_01';
    const expenses = this.expensesService.getUserExpenses(userId, category);
    return {
      success: true,
      data: expenses,
      timestamp: new Date().toISOString(),
    };
  }

  @Post()
  createExpense(
    @Body() input: CreateExpenseInput,
  ): StandardApiResponse<ExpenseDto> {
    const userId = 'usr_default_01';
    const expense = this.expensesService.createExpense(userId, input);
    return {
      success: true,
      data: expense,
      message: 'Expense item created successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('analytics')
  getAnalytics(): StandardApiResponse<SpendAnalyticsSummary> {
    const userId = 'usr_default_01';
    const analytics = this.expensesService.getSpendAnalytics(userId);
    return {
      success: true,
      data: analytics,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('ocr')
  processOcr(
    @Body('receiptText') receiptText: string,
  ): StandardApiResponse<OcrExtractionResult> {
    const ocrResult = this.expensesService.processReceiptOcr(receiptText || '');
    return {
      success: true,
      data: ocrResult,
      message: 'Receipt parsed successfully via OCR engine',
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(':id')
  deleteExpense(@Param('id') id: string): StandardApiResponse<{ deleted: boolean }> {
    const userId = 'usr_default_01';
    this.expensesService.deleteExpense(userId, id);
    return {
      success: true,
      data: { deleted: true },
      message: `Expense ${id} deleted`,
      timestamp: new Date().toISOString(),
    };
  }
}
