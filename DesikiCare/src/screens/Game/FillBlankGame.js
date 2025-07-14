import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Vibration,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

const { width } = Dimensions.get('window');

// Danh sách câu hỏi
const questions = [
  { question: "Kem chống nắng giúp bảo vệ da khỏi tác hại của ____.", answer: "tia uv" },
  { question: "Sản phẩm tẩy trang giúp loại bỏ ____ trên da.", answer: "lớp trang điểm" },
  { question: "Son dưỡng môi giúp môi không bị ____.", answer: "khô nứt" },
  { question: "Vitamin C trong mỹ phẩm giúp làm sáng ____.", answer: "làn da" },
  { question: "Da dầu thường tiết nhiều ____.", answer: "bã nhờn" },
];

const createSnowflake = () => ({
  x: Math.random() * width,
  y: new Animated.Value(-Math.random() * 200),
  size: Math.random() * 6 + 4,
  speed: Math.random() * 4000 + 4000,
});

const FillBlankGame = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [snowflakes, setSnowflakes] = useState([]);
  const [sound, setSound] = useState(null);
  const confettiRef = useRef(null);

  useEffect(() => {
    // Hiệu ứng tuyết
    const flakes = Array.from({ length: 20 }).map(createSnowflake);
    flakes.forEach((flake) => {
      Animated.loop(
        Animated.timing(flake.y, {
          toValue: 800,
          duration: flake.speed,
          useNativeDriver: true,
        })
      ).start();
    });
    setSnowflakes(flakes);

    // Nhạc nền
    const playMusic = async () => {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/Nơi Này Có Anh - Sơn Tùng M-TP.mp3'), // Đặt file đúng chỗ này!
        { isLooping: true, volume: 0.2 }
      );
      setSound(sound);
      await sound.playAsync();
    };

    playMusic();

    return () => {
      sound?.unloadAsync();
    };
  }, []);

  const currentQuestion = questions[currentIndex];

  const handleCheckAnswer = () => {
    const trimmed = userAnswer.trim().toLowerCase();
    const correct = currentQuestion.answer.toLowerCase();
    const result = trimmed === correct;

    setIsCorrect(result);
    setIsSubmitted(true);

    if (result) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Vibration.vibrate(200);
      }

      setTimeout(() => {
        confettiRef.current?.start();
      }, 300);
    }
  };

  const handleNextQuestion = () => {
    const nextIndex = (currentIndex + 1) % questions.length;
    setCurrentIndex(nextIndex);
    setUserAnswer('');
    setIsSubmitted(false);
    setIsCorrect(false);
  };

  return (
    <View style={styles.container}>
      {/* Tuyết rơi */}
      {snowflakes.map((flake, index) => (
        <Animated.View
          key={index}
          style={[
            styles.snowflake,
            {
              transform: [{ translateY: flake.y }],
              left: flake.x,
              width: flake.size,
              height: flake.size,
            },
          ]}
        />
      ))}

      <Text style={styles.title}>❄️ Điền từ còn trống ❄️</Text>
      <Text style={styles.question}>
        {currentQuestion.question.replace('____', '______')}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Nhập từ còn thiếu"
        value={userAnswer}
        onChangeText={setUserAnswer}
        editable={!isSubmitted}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={isSubmitted ? handleNextQuestion : handleCheckAnswer}
      >
        <Text style={styles.buttonText}>
          {isSubmitted ? 'Câu tiếp theo' : 'Kiểm tra'}
        </Text>
      </TouchableOpacity>

      {isSubmitted && (
        <Text style={[styles.result, { color: isCorrect ? 'green' : 'red' }]}>
          {isCorrect
            ? '✅ Chính xác!'
            : `❌ Sai rồi! Đáp án đúng là "${currentQuestion.answer}"`}
        </Text>
      )}

      {isCorrect && (
        <ConfettiCannon
          count={120}
          origin={{ x: 200, y: -10 }}
          autoStart={false}
          fadeOut
          ref={confettiRef}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#bb5075ff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#dfa4c9ff',
    marginBottom: 20,
  },
  question: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#DB7093',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  result: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '500',
  },
  snowflake: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 10,
    opacity: 0.7,
  },
});

export default FillBlankGame;
