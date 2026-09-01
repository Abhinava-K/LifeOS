import React from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Props {
  imageUri: string;
  onRemove: () => void;
}

export const ImageAttachmentPicker: React.FC<Props> = ({ imageUri, onRemove }) => (
  <View style={styles.container}>
    <Image source={{ uri: imageUri }} style={styles.image} />
    <TouchableOpacity style={styles.removeBtn} onPress={onRemove}>
      <Text style={styles.removeText}>✕</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: { position: 'relative', margin: 12, width: 80, height: 80 },
  image: { width: '100%', height: '100%', borderRadius: 8 },
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    width: 20,
    height: 20,
    alignItems: 'center',
    justify: 'center',
  },
  removeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
});
