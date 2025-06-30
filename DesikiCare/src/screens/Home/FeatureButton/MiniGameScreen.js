import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const MiniGameScreen = () => {
  const navigation = useNavigation();
  const [randomNumber, setRandomNumber] = useState(null);
  const [guess, setGuess] = useState('');
  const [message, setMessage] = useState('Đoán một số từ 1 đến 100!');
  const [attempts, setAttempts] = useState(0);

  // Generate a new random number when the component mounts or game restarts
  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = () => {
    setRandomNumber(Math.floor(Math.random() * 100) + 1);
    setGuess('');
    setMessage('Đoán một số từ 1 đến 100!');
    setAttempts(0);
  };

  const handleGuess = () => {
    const userGuess = parseInt(guess, 10);
    setAttempts(attempts + 1);

    if (isNaN(userGuess) || userGuess < 1 || userGuess > 100) {
      setMessage('Vui lòng nhập số từ 1 đến 100!');
      return;
    }

    if (userGuess === randomNumber) {
      Alert.alert('Chúc mừng!', `Bạn đã đoán đúng sau ${attempts + 1} lần!`, [
        { text: 'Chơi lại', onPress: resetGame },
      ]);
    } else if (userGuess < randomNumber) {
      setMessage('Quá thấp! Thử lại.');
    } else {
      setMessage('Quá cao! Thử lại.');
    }
    setGuess('');
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mini Game</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>Trò chơi đoán số</Text>
          <Text style={styles.message}>{message}</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={guess}
            onChangeText={setGuess}
            placeholder="Nhập số của bạn"
            placeholderTextColor="#888"
            onSubmitEditing={handleGuess}
          />
          <TouchableOpacity style={styles.button} onPress={handleGuess}>
            <Text style={styles.buttonText}>Đoán</Text>
          </TouchableOpacity>
          <Text style={styles.attempts}>Số lần đoán: {attempts}</Text>
          <TouchableOpacity style={styles.restartButton} onPress={resetGame}>
            <Text style={styles.restartButtonText}>Chơi lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#4CAF50', // Match header color for status bar
  },
  container: {
    flex: 1,
    backgroundColor: '#E0F7FA', // Match RegisterScreen, PolicyScreen, SupportScreen
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50', // Match RegisterScreen, PolicyScreen, SupportScreen
    paddingHorizontal: 15,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backButton: {
    marginRight: 15,
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    flex: 1,
    backgroundColor: '#E0F7FA', // Explicitly set to prevent green bleed
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    height: 50,
    borderColor: '#B0BEC5',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  button: {
    backgroundColor: '#4CAF50', // Match app theme
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  attempts: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  restartButton: {
    backgroundColor: '#ff4444', // Keep distinct red for restart
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  restartButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default MiniGameScreen;