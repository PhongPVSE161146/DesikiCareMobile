import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
  Animated,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { fetchGameEventById, canPlay, addGameEventReward } from '../../config/axios/MiniGame/minigameService';

// Fallback for Confetti
let Confetti;
try {
  Confetti = require('react-native-fast-confetti').Confetti;
} catch (e) {
  console.warn('react-native-fast-confetti not found, using fallback');
  Confetti = null;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 80) / 3; // 3 cards per row with padding
const CARD_HEIGHT = 120;

const ScratchCardGame = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { gameEventId, gameTypeId, gameTypeName } = route.params || {};

  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scratchedCards, setScratchedCards] = useState([]);
  const [scratchCount, setScratchCount] = useState(0);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [canPlayGame, setCanPlayGame] = useState(false);
  const [fadeAnims] = useState(() => new Array(9).fill().map(() => new Animated.Value(0)));

  const getDisplayName = () => {
    if (gameTypeName && gameTypeName !== 'Chọn 2 ô trùng nhau') return gameTypeName;
    return Number(gameTypeId) === 2 ? 'Cào thẻ' : 'Scratch Card';
  };

  useEffect(() => {
    const loadGameEvent = async () => {
      try {
        setLoading(true);
        console.log('🎮 Loading game event for ID:', gameEventId);

        if (!gameEventId) {
          throw new Error('Không tìm thấy ID sự kiện. Vui lòng quay lại và chọn sự kiện.');
        }

        if (Number(gameTypeId) !== 2) {
          throw new Error('Đây không phải trò chơi Cào thẻ. Vui lòng chọn đúng trò chơi.');
        }

        const response = await fetchGameEventById(gameEventId);
        const eventData = response?.gameEvent;
        console.log('🎮 Cards data:', eventData?.parsedConfig?.cards);

        if (!eventData || Number(eventData.gameTypeId) !== 2) {
          throw new Error('Sự kiện không hợp lệ hoặc không phải trò chơi Cào thẻ');
        }

        setCanPlayGame(canPlay(eventData));

        const configData = eventData.parsedConfig || {};
        const { cards, maxScratch, numOfScratchs } = configData;

        // Ensure unique IDs for cards
        const cardsWithIds = cards.map((card, index) => ({
          ...card,
          id: card.id ?? `${index}-${Math.random().toString(36).substr(2, 9)}`,
        }));

        const hasUniqueIds = new Set(cardsWithIds.map((card) => card.id)).size === cardsWithIds.length;
        const hasValidIds = cardsWithIds.every((card) => card.id !== undefined && card.id !== null);

        if (
          !Array.isArray(cardsWithIds) ||
          cardsWithIds.length === 0 ||
          !maxScratch ||
          maxScratch <= 0 ||
          cardsWithIds.length < numOfScratchs ||
          !hasUniqueIds ||
          !hasValidIds
        ) {
          throw new Error('Cấu hình trò chơi không hợp lệ: Cards phải có ID duy nhất và hợp lệ');
        }

        setConfig({ ...configData, cards: cardsWithIds });
        setError(null);
      } catch (err) {
        const errorMessage = err.message || 'Không thể tải cấu hình trò chơi';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadGameEvent();
  }, [gameEventId, gameTypeId]);

  const submitScore = async () => {
    try {
      console.log('🎮 Submitting score:', score, 'for gameEventId:', gameEventId);
      const response = await addGameEventReward({
        gameEventId,
        gameTypeId,
        reward: { points: score },
      });
      console.log('🎮 addGameEventReward response:', JSON.stringify(response, null, 2));
      Alert.alert('Thành công', `Đã gửi điểm số: ${score} điểm`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể gửi điểm số. Vui lòng thử lại.');
    }
  };

  const handleScratch = (cardId, reward, index) => {
    if (
      !canPlayGame ||
      !config ||
      scratchCount >= config.maxScratch ||
      scratchedCards.includes(cardId)
    ) {
      return;
    }

    // Animate card reveal
    Animated.timing(fadeAnims[index], {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setScratchedCards([...scratchedCards, cardId]);
    setScratchCount(scratchCount + 1);

    let points = 0;
    if (reward.includes('điểm')) {
      points = parseInt(reward) || 10;
      setShowConfetti(true);
      setConfettiTrigger((prev) => prev + 1);
      setTimeout(() => setShowConfetti(false), 3000);
    } else {
      points = 10; // Default points for non-point rewards
    }
    setScore((prev) => prev + points);

    if (scratchCount + 1 >= config.maxScratch) {
      const finalScore = score + points;
      Alert.alert('Hết lượt cào', `Điểm của bạn: ${finalScore}`, [
        { text: 'Gửi điểm', onPress: submitScore },
        { text: 'Quay lại', onPress: () => navigation.goBack() },
      ]);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
      
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  if (error || !config) {
    return (
      <View style={styles.container}>
        <MaterialIcons name="error-outline" size={64} color="#ff4444" />
        <Text style={styles.errorText}>{error || 'Không tìm thấy cấu hình trò chơi'}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.navigate('GameEventDetail')}
        >
          <Text style={styles.retryButtonText}>Quay lại danh sách sự kiện</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { cards, maxScratch } = config;

  return (
    <View style={styles.container}>
   
      <Text style={styles.title}>Cào Thẻ</Text>
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Điểm: {score}</Text>
        <Text style={styles.infoText}>Lượt cào còn lại: {maxScratch - scratchCount}</Text>
      </View>
      <View style={styles.cardContainer}>
        {cards.map((card, index) => (
          <Animated.View
            key={card.id}
            style={[
              styles.card,
              scratchedCards.includes(card.id) && { opacity: fadeAnims[index] },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.cardInner,
                scratchedCards.includes(card.id) ? styles.cardScratched : styles.cardCovered,
                !canPlayGame || scratchCount >= maxScratch ? styles.cardDisabled : null,
              ]}
              onPress={() => handleScratch(card.id, card.value, index)}
              disabled={!canPlayGame || scratchCount >= maxScratch || scratchedCards.includes(card.id)}
            >
              <Text style={styles.cardText}>
                {scratchedCards.includes(card.id) ? card.value : 'Cào để xem'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
      {showConfetti && Confetti ? (
        <Confetti
          key={confettiTrigger}
          type="default"
          count={100}
          duration={3000}
        />
      ) : (
        showConfetti && (
          <Text style={styles.fallbackConfetti}>🎉 Chúc mừng! 🎉</Text>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F7FA',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 12,
    width: '100%',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerRight: {
    width: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginTop: 20,
    marginBottom: 20,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  infoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    margin: 5,
  },
  cardInner: {
    flex: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardCovered: {
    backgroundColor: '#B0BEC5',
  },
  cardScratched: {
    backgroundColor: '#FFF',
    borderColor: '#4CAF50',
  },
  cardDisabled: {
    opacity: 0.5,
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    padding: 10,
  },
  loadingText: {
    fontSize: 16,
    color: '#333',
    marginTop: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fallbackConfetti: {
    fontSize: 20,
    color: '#FFD700',
    marginTop: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ScratchCardGame;