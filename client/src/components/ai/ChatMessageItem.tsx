import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { AIMessage } from '../../types/ai';

interface Props {
  message: AIMessage;
}

export const ChatMessageItem: React.FC<Props> = ({ message }) => {
  const isUser = message.sender === 'user';
  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      {message.imageUri && (
        <Image source={{ uri: message.imageUri }} style={styles.imagePreview} resizeMode="cover" />
      )}
      <Text style={[styles.text, isUser ? styles.userText : styles.assistantText]}>
        {message.content}
      </Text>
      <Text style={styles.timestamp}>{message.timestamp}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    padding: 12,
    borderRadius: 16,
    maxWidth: '82%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userContainer: {
    alignSelf: 'flex-end',
    backgroundColor: '#6366F1',
    borderBottomRightRadius: 4,
  },
  assistantContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#1E293B',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
    fontWeight: '400',
  },
  assistantText: {
    color: '#F8FAFC',
    fontWeight: '400',
  },
  imagePreview: {
    width: 200,
    height: 130,
    borderRadius: 10,
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
});
