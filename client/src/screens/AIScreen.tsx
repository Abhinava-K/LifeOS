import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TextInput, TouchableOpacity, Text } from 'react-native';
import { QuickActionChips, ActionChip } from '../components/ai/QuickActionChips';
import { VoiceWaveform } from '../components/ai/VoiceWaveform';
import { ImageAttachmentPicker } from '../components/ai/ImageAttachmentPicker';
import { ChatMessageItem } from '../components/ai/ChatMessageItem';
import { TypingIndicator } from '../components/ai/TypingIndicator';
import { useAIStore } from '../store/useAIStore';
import { AIIntentHint } from '../types/ai';

export const AIScreen = () => {
  const { messages, isStreaming, isRecording, sendMessage, toggleRecording, selectedImage, setSelectedImage } = useAIStore();
  const [inputText, setInputText] = useState('');
  const [activeIntent, setActiveIntent] = useState<AIIntentHint>('GENERAL_CHAT');

  const handleSend = () => {
    if (!inputText && !selectedImage) return;
    sendMessage({ prompt: inputText, imageUri: selectedImage ?? undefined, intentHint: activeIntent });
    setInputText('');
    setSelectedImage(null);
    setActiveIntent('GENERAL_CHAT');
  };

  const handleSelectChip = (chip: ActionChip) => {
    setInputText(chip.defaultPrompt);
    setActiveIntent(chip.intent);
  };

  return (
    <View style={styles.container}>
      <QuickActionChips onSelectAction={handleSelectChip} />

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChatMessageItem message={item} />}
        contentContainerStyle={styles.chatList}
        ListFooterComponent={isStreaming ? <TypingIndicator /> : null}
      />

      {isRecording && <VoiceWaveform />}

      {selectedImage && (
        <ImageAttachmentPicker imageUri={selectedImage} onRemove={() => setSelectedImage(null)} />
      )}

      <View style={styles.inputDock}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => setSelectedImage('https://via.placeholder.com/600x400.jpg')}
        >
          <Text style={styles.icon}>📷</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={toggleRecording}>
          <Text style={styles.icon}>{isRecording ? '🔴' : '🎙️'}</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.textInput}
          placeholder="Ask LifeOS AI..."
          placeholderTextColor="#64748B"
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  chatList: { padding: 16, paddingBottom: 24 },
  inputDock: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0F172A',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#1E293B',
    color: '#FFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 40,
  },
  iconBtn: { padding: 8, marginRight: 4 },
  icon: { fontSize: 18 },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: '#6366F1',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  sendText: { color: '#FFF', fontWeight: 'bold' },
});
