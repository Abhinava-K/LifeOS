import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useThemeStore } from '../store/useThemeStore';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AIScreen: React.FC = () => {
  const { colors } = useThemeStore();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'assistant',
      text: 'Hello Jahaan! I am your LifeOS Second Brain. Ask me about your tasks, schedule, recent expenses, or notes.',
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

    // Simulate AI gateway response
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>🤖 AI Assistant</Text>
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
          style={[styles.textInput, { color: colors.text, backgroundColor: colors.surfaceLight }]}
          placeholder="Ask LifeOS Second Brain..."
          placeholderTextColor={colors.textMuted}
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity style={[styles.sendButton, { backgroundColor: colors.primary }]} onPress={handleSend}>
          <Text style={styles.sendButtonText}>Send</Text>
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
    padding: 16,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  chatList: {
    padding: 16,
    paddingBottom: 24,
  },
  messageBubble: {
    padding: 14,
    borderRadius: 18,
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
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    marginRight: 10,
  },
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
