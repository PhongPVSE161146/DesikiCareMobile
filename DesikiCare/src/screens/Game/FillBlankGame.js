import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const FillBlankGame = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Điền từ còn trống</Text>
      <Text style={styles.message}>Chưa triển khai trò chơi này.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    color: '#666',
  },
});

export default FillBlankGame;