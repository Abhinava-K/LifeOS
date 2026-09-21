import { Injectable, NotFoundException } from '@nestjs/common';
import { ExpenseCategory, ExpenseDto } from '@lifeos/shared-types';

export interface CreateExpenseInput {
  amount: number;
  currency?: string;
  category: ExpenseCategory;
  merchant: string;
  description?: string;
  receiptUrl?: string;
  ocrRawText?: string;
  date?: string;
}

export interface SpendAnalyticsSummary {
  totalSpent: number;
  currency: string;
  monthlyBudget: number;
  remainingBudget: number;
  categoryBreakdown: Record<ExpenseCategory, number>;
  transactionCount: number;
}

export interface OcrExtractionResult {
  merchant: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  date: string;
  confidenceScore: number;
  rawText: string;
}

@Injectable()
export class ExpensesService {
  private readonly expensesStore: Map<string, ExpenseDto[]> = new Map();

  constructor() {
    // Seed initial demo data for default user
    this.expensesStore.set('usr_default_01', [
      {
        id: 'exp_001',
        userId: 'usr_default_01',
        amount: 99.0,
        currency: 'USD',
        category: ExpenseCategory.TECH_SOFTWARE,
        merchant: 'Apple Developer Program',
        description: 'Annual iOS Developer Account Subscription',
        receiptUrl: 'https://storage.lifeos.dev/receipts/exp_001.pdf',
        ocrRawText: 'APPLE.COM/BILL TAX INVOICE $99.00 USD AUG 15 2026',
        date: new Date('2026-08-15').toISOString(),
        createdAt: new Date('2026-08-15').toISOString(),
        updatedAt: new Date('2026-08-15').toISOString(),
      },
      {
        id: 'exp_002',
        userId: 'usr_default_01',
        amount: 42.5,
        currency: 'USD',
        category: ExpenseCategory.FOOD_DINING,
        merchant: 'Sweetgreen Salad',
        description: 'Team Lunch & Drinks',
        date: new Date('2026-09-10').toISOString(),
        createdAt: new Date('2026-09-10').toISOString(),
        updatedAt: new Date('2026-09-10').toISOString(),
      },
    ]);
  }

  getUserExpenses(userId: string, category?: ExpenseCategory): ExpenseDto[] {
    const list = this.expensesStore.get(userId) || [];
    if (category) {
      return list.filter((exp) => exp.category === category);
    }
    return list;
  }

  createExpense(userId: string, input: CreateExpenseInput): ExpenseDto {
    const list = this.expensesStore.get(userId) || [];
    const newExpense: ExpenseDto = {
      id: `exp_${Date.now()}`,
      userId,
      amount: input.amount,
      currency: input.currency || 'USD',
      category: input.category,
      merchant: input.merchant,
      description: input.description || null,
      receiptUrl: input.receiptUrl || null,
      ocrRawText: input.ocrRawText || null,
      date: input.date || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    list.unshift(newExpense);
    this.expensesStore.set(userId, list);
    return newExpense;
  }

  deleteExpense(userId: string, expenseId: string): boolean {
    const list = this.expensesStore.get(userId) || [];
    const index = list.findIndex((exp) => exp.id === expenseId);
    if (index === -1) {
      throw new NotFoundException(`Expense ${expenseId} not found`);
    }
    list.splice(index, 1);
    this.expensesStore.set(userId, list);
    return true;
  }

  getSpendAnalytics(userId: string): SpendAnalyticsSummary {
    const expenses = this.getUserExpenses(userId);
    const categoryBreakdown: Record<ExpenseCategory, number> = {
      [ExpenseCategory.FOOD_DINING]: 0,
      [ExpenseCategory.GROCERIES]: 0,
      [ExpenseCategory.TRANSPORTATION]: 0,
      [ExpenseCategory.HOUSING_BILLS]: 0,
      [ExpenseCategory.ENTERTAINMENT]: 0,
      [ExpenseCategory.HEALTH_FITNESS]: 0,
      [ExpenseCategory.EDUCATION_STUDY]: 0,
      [ExpenseCategory.TECH_SOFTWARE]: 0,
      [ExpenseCategory.MISCELLANEOUS]: 0,
    };

    let totalSpent = 0;
    for (const exp of expenses) {
      totalSpent += exp.amount;
      categoryBreakdown[exp.category] = (categoryBreakdown[exp.category] || 0) + exp.amount;
    }

    const monthlyBudget = 1500.0;
    return {
      totalSpent,
      currency: 'USD',
      monthlyBudget,
      remainingBudget: Math.max(0, monthlyBudget - totalSpent),
      categoryBreakdown,
      transactionCount: expenses.length,
    };
  }

  processReceiptOcr(rawTextOrImage: string): OcrExtractionResult {
    // OCR Parsing Engine (Tesseract/Vision API Simulator)
    const raw = rawTextOrImage.toUpperCase();
    let merchant = 'Unknown Merchant';
    let amount = 0.0;
    let category = ExpenseCategory.MISCELLANEOUS;

    if (raw.includes('STARBUCKS') || raw.includes('COFFEE') || raw.includes('SWEETGREEN') || raw.includes('RESTAURANT')) {
      merchant = raw.includes('STARBUCKS') ? 'Starbucks Coffee' : 'Local Diner';
      category = ExpenseCategory.FOOD_DINING;
    } else if (raw.includes('UBER') || raw.includes('LYFT') || raw.includes('GAS') || raw.includes('SHELL')) {
      merchant = raw.includes('UBER') ? 'Uber Technologies' : 'Shell Station';
      category = ExpenseCategory.TRANSPORTATION;
    } else if (raw.includes('AWS') || raw.includes('GITHUB') || raw.includes('APPLE') || raw.includes('MICROSOFT')) {
      merchant = raw.includes('AWS') ? 'Amazon Web Services' : 'Apple Inc';
      category = ExpenseCategory.TECH_SOFTWARE;
    } else if (raw.includes('WALMART') || raw.includes('TARGET') || raw.includes('WHOLE FOODS')) {
      merchant = 'Whole Foods Market';
      category = ExpenseCategory.GROCERIES;
    }

    // Amount extraction heuristic
    const matches = raw.match(/\$?(\d+\.\d{2})/g);
    if (matches && matches.length > 0) {
      const numbers = matches.map((m) => parseFloat(m.replace('$', '')));
      amount = Math.max(...numbers);
    } else {
      amount = 24.99;
    }

    return {
      merchant,
      amount,
      currency: 'USD',
      category,
      date: new Date().toISOString().split('T')[0],
      confidenceScore: 0.94,
      rawText: rawTextOrImage,
    };
  }
}
