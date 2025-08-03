import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
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
const CARD_WIDTH = (width - 60) / 4; // 4 cards per row
const CARD_HEIGHT = 80;

const MemoryCatchingGame = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { gameEventId, gameTypeId, gameTypeName } = route.params || {};

  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [score, setScore] = useState(0);
  const [movesLeft, setMovesLeft] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [scratchPaths, setScratchPaths] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gameEvent, setGameEvent] = useState(null);
  const [canPlayGame, setCanPlayGame] = useState(false);

  // Initialize game with API data
  useEffect(() => {
    const loadGameEvent = async () => {
      try {
        setLoading(true);
        console.log('🎮 Loading game event for ID:', gameEventId);

        if (!gameEventId) {
          throw new Error('Không tìm thấy ID sự kiện');
        }

        const response = await fetchGameEventById(gameEventId);
        console.log('🎮 fetchGameEventById response:', JSON.stringify(response, null, 2));

        const eventData = response?.gameEvent;
        if (!eventData || Number(eventData.gameTypeId) !== 3) {
          throw new Error('Sự kiện không hợp lệ hoặc không phải trò chơi MemoryCatching');
        }

        setGameEvent(eventData);
        setCanPlayGame(canPlay(eventData));

        const config = eventData.parsedConfig || {};
        const pairs = config.pairs || [];
        const numOfPairs = config.numOfPairs || 0;
        const maxPlay = config.maxPlay || 20;

        if (!pairs.length || numOfPairs <= 0) {
          throw new Error('Cấu hình trò chơi không hợp lệ');
        }

        // Create cards from pairs (each pair has two identical cards)
        const cardValues = pairs.reduce((acc, pair) => {
          acc.push({ id: `${pair.id}-1`, value: pair.value });
          acc.push({ id: `${pair.id}-2`, value: pair.value });
          return acc;
        }, []);

        const shuffledCards = cardValues
          .map((card) => ({ ...card, flipped: false }))
          .sort(() => Math.random() - 0.5); // Shuffle

        setCards(shuffledCards);
        setMovesLeft(maxPlay);
        setError(null);
      } catch (err) {
        const errorMessage = err.message || 'Không thể tải thông tin trò chơi';
  
        setError(errorMessage);
        Alert.alert('Lỗi', errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadGameEvent();
  }, [gameEventId]);

  const submitScore = async () => {
    try {
      console.log('🎮 Submitting score:', score, 'for gameEventId:', gameEventId);
      const response = await addGameEventReward({
        gameEventId,
        gameTypeId,
        reward: { points: score },
      });
      console.log('🎮 addGameEventReward response:', JSON.stringify(response, null, 2));
      Alert.alert('Thành công', `Đã gửi điểm số: ${score} điểm`);
    } catch (err) {

      Alert.alert('Lỗi', 'Không thể gửi điểm số. Vui lòng thử lại.');
    }
  };

  const handleScratch = (cardId, value, event) => {
    if (
      !canPlayGame ||
      movesLeft <= 0 ||
      flippedCards.length >= 2 ||
      flippedCards.includes(cardId) ||
      matchedCards.includes(cardId)
    ) {
      return;
    }

    const { nativeEvent } = event;
    const { x, y } = nativeEvent;

    // Update scratch path for the card
    const path = scratchPaths[cardId] || Skia.Path.Make();
    if (nativeEvent.state === 2) { // GestureState.ACTIVE
      path.lineTo(x, y);
    } else if (nativeEvent.state === 1) { // GestureState.BEGAN
      path.moveTo(x, y);
    } else if (nativeEvent.state === 4) { // GestureState.END
      // Mark card as flipped when scratch ends
      const updatedCards = cards.map((card) =>
        card.id === cardId ? { ...card, flipped: true } : card
      );
      setCards(updatedCards);
      setFlippedCards([...flippedCards, cardId]);
      setScratchPaths({ ...scratchPaths, [cardId]: path });

      // Check for match when two cards are flipped
      if (flippedCards.length === 1) {
        const firstCard = cards.find((card) => card.id === flippedCards[0]);
        const secondCard = cards.find((card) => card.id === cardId);

        const points = gameEvent?.parsedConfig?.originalPoint || 10;
        const minusPoints = gameEvent?.parsedConfig?.minusPoint || 5;

        if (firstCard.value === secondCard.value) {
          // Match found
          setMatchedCards([...matchedCards, firstCard.id, secondCard.id]);
          setFlippedCards([]);
          setScore((prev) => prev + points);
          setShowConfetti(true);
          setConfettiTrigger((prev) => prev + 1);
          setTimeout(() => setShowConfetti(false), 3000);
        } else {
          // No match, flip back after delay
          setScore((prev) => Math.max(0, prev - minusPoints));
          setTimeout(() => {
            setCards((prevCards) =>
              prevCards.map((card) =>
                card.id === firstCard.id || card.id === secondCard.id
                  ? { ...card, flipped: false }
                  : card
              )
            );
            setFlippedCards([]);
            setScratchPaths((prev) => {
              const newPaths = { ...prev };
              delete newPaths[firstCard.id];
              delete newPaths[secondCard.id];
              return newPaths;
            });
          }, 1000);
        }
        setMovesLeft(movesLeft - 1);

        // Game over check
        if (movesLeft - 1 === 0 && matchedCards.length < cards.length) {
          Alert.alert('Hết lượt', `Điểm của bạn: ${score}`, [
            { text: 'Gửi điểm', onPress: submitScore },
            { text: 'Quay lại', onPress: () => navigation.goBack() },
          ]);
        } else if (matchedCards.length + 2 === cards.length) {
          const finalScore = score + (firstCard.value === secondCard.value ? points : 0);
          Alert.alert('Chúc mừng!', `Bạn đã tìm hết các cặp! Điểm: ${finalScore}`, [
            { text: 'Gửi điểm', onPress: submitScore },
            { text: 'Quay lại', onPress: () => navigation.goBack() },
          ]);
        }
      }
    } else {
      setScratchPaths({ ...scratchPaths, [cardId]: path });
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

  if (error || !gameEvent) {
    return (
      <View style={styles.container}>
        <MaterialIcons name="error-outline" size={64} color="#ff4444" />
        <Text style={styles.errorText}>{error || 'Không tìm thấy thông tin trò chơi'}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{gameTypeName || 'Tìm hình'}</Text>
        <View style={styles.headerRight} />
      </View>
      <Text style={styles.title}>Chọn 2 ô trùng nhau</Text>
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Điểm: {score}</Text>
        <Text style={styles.infoText}>{`${gameEvent.parsedConfig?.maxPlay || 'N/A'} lượt còn lại: ${movesLeft}`}</Text>
      </View>
      <View style={styles.cardContainer}>
        {cards.map((card) => (
          <View key={card.id} style={styles.card}>
            <PanGestureHandler
              onGestureEvent={(e) => handleScratch(card.id, card.value, e)}
              enabled={
                canPlayGame &&
                movesLeft > 0 &&
                !flippedCards.includes(card.id) &&
                !matchedCards.includes(card.id)
              }
            >
              <View>
                <Canvas style={styles.canvas}>
                  {!(card.flipped || matchedCards.includes(card.id)) && (
                    <Path
                      path={scratchPaths[card.id] || Skia.Path.Make()}
                      style="stroke"
                      strokeWidth={20}
                      color="transparent"
                      blendMode="clear"
                    />
                  )}
                </Canvas>
                <View
                  style={[
                    styles.cardContent,
                    card.flipped || matchedCards.includes(card.id)
                      ? styles.cardFlipped
                      : styles.cardCovered,
                  ]}
                >
                  <Text style={styles.cardText}>
                    {card.flipped || matchedCards.includes(card.id) ? card.value : '?'}
                  </Text>
                </View>
              </View>
            </PanGestureHandler>
          </View>
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
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 20,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    margin: 5,
    borderRadius: 8,
    overflow: 'hidden',
  },
  canvas: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#ccc',
  },
  cardContent: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardCovered: {
    backgroundColor: '#ccc',
  },
  cardFlipped: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  cardText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  fallbackConfetti: {
    fontSize: 18,
    color: '#FFD700',
    marginTop: 10,
    fontWeight: 'bold',
    textAlign: 'center',
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
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default MemoryCatchingGame;