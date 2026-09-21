import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const TypingIndicator = () => (
  <View style={styles.container}>
    <Text style={styles.dots}>•••</Text>
    <Text style={styles.text}>AI Assistant is reasoning...</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginVertical: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  dots: {
    fontSize: 16,
    color: '#818CF8',
    marginRight: 6,
    fontWeight: 'bold',
  },
  text: {
    color: '#94A3B8',
    fontStyle: 'italic',
    fontSize: 12,
  },
});
