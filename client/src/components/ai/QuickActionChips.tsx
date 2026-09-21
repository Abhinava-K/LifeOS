import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { AIIntentHint } from '../../types/ai';

export interface ActionChip {
  label: string;
  intent: AIIntentHint;
  defaultPrompt: string;
  icon: string;
}

const CHIPS: ActionChip[] = [
  { icon: '📅', label: 'Plan Day', intent: 'PLAN_DAY', defaultPrompt: 'Optimize my daily calendar and task priority for today' },
  { icon: '🧾', label: 'Analyze Expense', intent: 'ANALYZE_EXPENSE', defaultPrompt: 'Scan receipt and calculate monthly budget breakdown' },
  { icon: '📝', label: 'Summarize Note', intent: 'SUMMARIZE_NOTE', defaultPrompt: 'Generate structured summary and flashcards from my note' },
  { icon: '⚡', label: 'Quick Chat', intent: 'GENERAL_CHAT', defaultPrompt: 'Give me a 3-point productivity tip for focus' },
];

interface Props {
  onSelectAction: (chip: ActionChip) => void;
}

export const QuickActionChips: React.FC<Props> = ({ onSelectAction }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container} contentContainerStyle={styles.content}>
    {CHIPS.map((chip) => (
      <TouchableOpacity key={chip.intent} style={styles.chip} onPress={() => onSelectAction(chip)} activeOpacity={0.7}>
        <Text style={styles.chipIcon}>{chip.icon}</Text>
        <Text style={styles.chipText}>{chip.label}</Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    maxHeight: 50,
    marginVertical: 4,
  },
  content: {
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  chipIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  chipText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '500',
  },
});
