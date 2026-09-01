import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AIScreen } from '../screens/AIScreen';

export const BottomTabs = () => (
  <View style={styles.container}>
    <AIScreen />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
});
