import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';

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
const MAX_MOVES = 20;

const MatchPairGame = () => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [score, setScore] = useState(0);
  const [movesLeft, setMovesLeft] = useState(MAX_MOVES);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [scratchPaths, setScratchPaths] = useState({});
  const [loading, setLoading] = useState(true);

  // Initialize cards
  useEffect(() => {
    const cardValues = [
      '100 điểm',
      '100 điểm',
      '50 điểm',
      '50 điểm',
      'Chúc bạn may mắn',
      'Chúc bạn may mắn',
      '200 điểm',
      '200 điểm',
      'Thử lại',
      'Thử lại',
      '300 điểm',
      '300 điểm',
      '150 điểm',
      '150 điểm',
      '500 điểm',
      '500 điểm',
    ];
    const shuffledCards = cardValues
      .map((value, index) => ({
        id: index,
        value,
        flipped: false,
      }))
      .sort(() => Math.random() - 0.5); // Shuffle
    setCards(shuffledCards);
    setLoading(false);
  }, []);

  const handleScratch = (cardId, value, event) => {
    if (
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
    if (event.state === 2) { // GestureState.ACTIVE
      path.lineTo(x, y);
    } else if (event.state === 1) { // GestureState.BEGAN
      path.moveTo(x, y);
    } else if (event.state === 4) { // GestureState.END
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

        if (firstCard.value === secondCard.value) {
          // Match found
          setMatchedCards([...matchedCards, firstCard.id, secondCard.id]);
          setFlippedCards([]);
          const points = secondCard.value.includes('điểm')
            ? parseInt(secondCard.value)
            : 10;
          setScore((prev) => prev + points);
          if (secondCard.value.includes('điểm')) {
            setShowConfetti(true);
            setConfettiTrigger((prev) => prev + 1);
            setTimeout(() => setShowConfetti(false), 3000);
          }
        } else {
          // No match, flip back after delay
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
          Alert.alert('Game Over', `Hết lượt! Điểm của bạn: ${score}`);
        } else if (matchedCards.length + 2 === cards.length) {
          Alert.alert('Chúc mừng!', `Bạn đã tìm hết các cặp! Điểm: ${score + (secondCard.value.includes('điểm') ? parseInt(secondCard.value) : 10)}`);
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chọn 2 ô trùng nhau</Text>
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Điểm: {score}</Text>
        <Text style={styles.infoText}>Lượt còn lại: {movesLeft}</Text>
      </View>
      <View style={styles.cardContainer}>
        {cards.map((card) => (
          <View key={card.id} style={styles.card}>
            <PanGestureHandler
              onGestureEvent={(e) => handleScratch(card.id, card.value, e)}
              enabled={
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
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
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
});

export default MatchPairGame;