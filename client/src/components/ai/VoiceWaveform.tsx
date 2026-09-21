import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const VoiceWaveform = () => (
  <View style={styles.container}>
    <View style={styles.waveformRow}>
      <View style={[styles.bar, { height: 12 }]} />
      <View style={[styles.bar, { height: 24 }]} />
      <View style={[styles.bar, { height: 18 }]} />
      <View style={[styles.bar, { height: 30 }]} />
      <View style={[styles.bar, { height: 14 }]} />
    </View>
    <Text style={styles.text}>16kHz Mono PCM Audio Stream Dictation Active</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#334155',
    padding: 10,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  waveformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  bar: {
    width: 3,
    backgroundColor: '#EF4444',
    marginHorizontal: 2,
    borderRadius: 2,
  },
  text: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '500',
  },
});
