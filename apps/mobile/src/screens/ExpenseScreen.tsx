import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { ExpenseCategory, ExpenseDto } from '@lifeos/shared-types';
import { useThemeStore } from '../store/useThemeStore';

export const ExpenseScreen: React.FC = () => {
  const { colors } = useThemeStore();

  const [expenses, setExpenses] = useState<ExpenseDto[]>([
    {
      id: 'exp_001',
      userId: 'usr_default_01',
      amount: 99.0,
      currency: 'USD',
      category: ExpenseCategory.TECH_SOFTWARE,
      merchant: 'Apple Developer Program',
      description: 'Annual iOS Developer Subscription',
      receiptUrl: 'https://storage.lifeos.dev/receipts/exp_001.pdf',
      ocrRawText: 'APPLE.COM/BILL TAX INVOICE $99.00 USD AUG 15 2026',
      date: '2026-08-15',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'exp_002',
      userId: 'usr_default_01',
      amount: 42.5,
      currency: 'USD',
      category: ExpenseCategory.FOOD_DINING,
      merchant: 'Sweetgreen Salad',
      description: 'Team Lunch & Drinks',
      date: '2026-09-10',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isOcrModalVisible, setIsOcrModalVisible] = useState<boolean>(false);
  const [ocrInputText, setOcrInputText] = useState<string>('');
  const [isProcessingOcr, setIsProcessingOcr] = useState<boolean>(false);

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const monthlyBudget = 1500.0;
  const remainingBudget = Math.max(0, monthlyBudget - totalSpent);

  const filteredExpenses =
    selectedCategory === 'ALL'
      ? expenses
      : expenses.filter((e) => e.category === selectedCategory);

  const handleSimulateOcr = () => {
    if (!ocrInputText.trim()) {
      Alert.alert('Scan Input Empty', 'Please enter simulated receipt text.');
      return;
    }

    setIsProcessingOcr(true);
    setTimeout(() => {
      const raw = ocrInputText.toUpperCase();
      let merchant = 'Extracted Merchant';
      let category = ExpenseCategory.MISCELLANEOUS;
      let amount = 19.99;

      if (raw.includes('STARBUCKS') || raw.includes('COFFEE')) {
        merchant = 'Starbucks Coffee';
        category = ExpenseCategory.FOOD_DINING;
        amount = 8.75;
      } else if (raw.includes('UBER') || raw.includes('LYFT')) {
        merchant = 'Uber Ride';
        category = ExpenseCategory.TRANSPORTATION;
        amount = 26.40;
      } else if (raw.includes('AWS') || raw.includes('GITHUB') || raw.includes('SOFTWARE')) {
        merchant = 'GitHub Enterprise';
        category = ExpenseCategory.TECH_SOFTWARE;
        amount = 21.0;
      }

      const newExp: ExpenseDto = {
        id: `exp_${Date.now()}`,
        userId: 'usr_default_01',
        amount,
        currency: 'USD',
        category,
        merchant,
        description: 'Auto-extracted via Receipt OCR engine',
        ocrRawText: ocrInputText,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setExpenses([newExp, ...expenses]);
      setIsProcessingOcr(false);
      setIsOcrModalVisible(false);
      setOcrInputText('');
      Alert.alert('OCR Success', `Extracted expense from ${merchant} ($${amount.toFixed(2)})`);
    }, 800);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>💳 Expense Ledger & OCR (REQ-EXP)</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
          Smart Spend Tracking • Automated Receipt OCR • Budget Analytics
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Budget Overview Card */}
        <View style={[styles.budgetCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.budgetRow}>
            <View>
              <Text style={[styles.budgetLabel, { color: colors.textMuted }]}>Total Spend (Sep 2026)</Text>
              <Text style={[styles.budgetAmount, { color: colors.primaryLight }]}>${totalSpent.toFixed(2)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.budgetLabel, { color: colors.textMuted }]}>Remaining Budget</Text>
              <Text style={[styles.budgetRemaining, { color: colors.accent }]}>${remainingBudget.toFixed(2)}</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={[styles.progressTrack, { backgroundColor: colors.surfaceLight }]}>
            <View
              style={[
                styles.progressBar,
                {
                  backgroundColor: colors.primary,
                  width: `${Math.min(100, (totalSpent / monthlyBudget) * 100)}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.textMuted }]}>
            {((totalSpent / monthlyBudget) * 100).toFixed(1)}% of ${monthlyBudget} monthly budget used
          </Text>
        </View>

        {/* OCR Scan Trigger */}
        <TouchableOpacity
          style={[styles.ocrButton, { backgroundColor: colors.primary }]}
          onPress={() => setIsOcrModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.ocrButtonText}>📷 Scan Receipt with OCR Engine</Text>
        </TouchableOpacity>

        {/* Category Filter Pills */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Category Ledger</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {['ALL', ExpenseCategory.FOOD_DINING, ExpenseCategory.TECH_SOFTWARE, ExpenseCategory.TRANSPORTATION, ExpenseCategory.GROCERIES].map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryPill,
                {
                  backgroundColor: selectedCategory === cat ? colors.primary : colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryPillText,
                  { color: selectedCategory === cat ? '#FFF' : colors.text },
                ]}
              >
                {cat.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Expenses List */}
        {filteredExpenses.map((item) => (
          <View key={item.id} style={[styles.expenseCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.expenseRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.merchantTitle, { color: colors.text }]}>{item.merchant}</Text>
                <Text style={[styles.expenseCategory, { color: colors.textMuted }]}>
                  {item.category} • {item.date}
                </Text>
                {item.description ? (
                  <Text style={[styles.expenseDesc, { color: colors.textMuted }]}>{item.description}</Text>
                ) : null}
              </View>
              <Text style={[styles.expenseAmount, { color: colors.text }]}>-${item.amount.toFixed(2)}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* OCR Modal */}
      <Modal visible={isOcrModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>📷 Receipt OCR Scanner</Text>
            <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
              Paste receipt OCR text or receipt payload below for extraction:
            </Text>

            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              multiline
              numberOfLines={4}
              placeholder="e.g. STARBUCKS COFFEE #402 TOTAL $8.75 TAX $0.80..."
              placeholderTextColor={colors.textMuted}
              value={ocrInputText}
              onChangeText={setOcrInputText}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { borderColor: colors.border }]}
                onPress={() => setIsOcrModalVisible(false)}
              >
                <Text style={{ color: colors.text }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalExtractBtn, { backgroundColor: colors.primary }]}
                onPress={handleSimulateOcr}
                disabled={isProcessingOcr}
              >
                <Text style={{ color: '#FFF', fontWeight: '700' }}>
                  {isProcessingOcr ? 'Extracting...' : 'Extract & Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, borderBottomWidth: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  headerSubtitle: { fontSize: 12, marginTop: 2, textAlign: 'center' },
  scrollContent: { padding: 16 },
  budgetCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  budgetRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  budgetLabel: { fontSize: 12, fontWeight: '600' },
  budgetAmount: { fontSize: 22, fontWeight: '900', marginTop: 4 },
  budgetRemaining: { fontSize: 20, fontWeight: '800', marginTop: 4 },
  progressTrack: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressBar: { height: '100%', borderRadius: 4 },
  progressText: { fontSize: 11, textAlign: 'right' },
  ocrButton: { padding: 14, borderRadius: 14, alignItems: 'center', marginBottom: 20 },
  ocrButtonText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  categoryScroll: { flexDirection: 'row', marginBottom: 16 },
  categoryPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  categoryPillText: { fontSize: 12, fontWeight: '700' },
  expenseCard: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10 },
  expenseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  merchantTitle: { fontSize: 15, fontWeight: '700' },
  expenseCategory: { fontSize: 12, marginTop: 2 },
  expenseDesc: { fontSize: 11, marginTop: 2, italic: true },
  expenseAmount: { fontSize: 16, fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalCard: { borderRadius: 18, borderWidth: 1, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  modalSubtitle: { fontSize: 12, marginBottom: 12 },
  modalInput: { borderRadius: 10, borderWidth: 1, padding: 12, fontSize: 13, height: 100, textAlignVertical: 'top', marginBottom: 16 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  modalCancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  modalExtractBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 },
});
