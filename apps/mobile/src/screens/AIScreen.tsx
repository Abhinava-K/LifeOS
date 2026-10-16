import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bot, Send } from 'lucide-react-native';
import { useThemeStore } from '../store/useThemeStore';
import { useAuthStore } from '../store/useAuthStore';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AIScreen: React.FC = () => {
  const { colors } = useThemeStore();
  const { user } = useAuthStore();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'assistant',
      text: `Hello ${user?.fullName?.split(' ')[0] || 'there'}, I am your LifeOS Second Brain. Ask me about your tasks, schedule, recent expenses, or notes.`,
      timestamp: '09:00 AM',
    },
  ]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: 'Just now',
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      const aiReply: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'I have retrieved your schedule and indexed your latest note. How else can I assist your workflow today?',
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, aiReply]);
    }, 600);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
        <View style={styles.headerTitleRow}>
          <Bot size={18} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>AI Assistant</Text>
        </View>
        <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>CrewAI • Gemini 1.5 Pro</Text>
      </View>

      <ScrollView contentContainerStyle={styles.chatList} showsVerticalScrollIndicator={false}>
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageBubble,
              msg.sender === 'user'
                ? [styles.userBubble, { backgroundColor: colors.primary }]
                : [styles.assistantBubble, { backgroundColor: colors.surface, borderColor: colors.border }],
            ]}
          >
            <Text
              style={[
                styles.messageText,
                { color: msg.sender === 'user' ? '#FFFFFF' : colors.text },
              ]}
            >
              {msg.text}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Input Bar */}
      <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TextInput
          style={[styles.textInput, { color: colors.text, backgroundColor: colors.surfaceLight, borderColor: colors.border }]}
          placeholder="Ask LifeOS Second Brain..."
          placeholderTextColor={colors.textMuted}
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: input.trim() ? colors.primary : colors.surfaceLight }]}
          onPress={handleSend}
          disabled={!input.trim()}
        >
          <Send size={15} color={input.trim() ? '#FFFFFF' : colors.textMuted} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: 11,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  chatList: {
    padding: 16,
    paddingBottom: 24,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    maxWidth: '82%',
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    marginRight: 10,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
