import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { fetchGameEvents } from '../../config/axios/MiniGame/minigameService';

const ScratchCardGame = () => {
  const route = useRoute();
  const { gameTypeId } = route.params || {};
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scratchedCards, setScratchedCards] = useState([]);
  const [scratchCount, setScratchCount] = useState(0);

  useEffect(() => {
    const loadGameEvent = async () => {
      if (!gameTypeId) {
        setError('Không tìm thấy ID loại trò chơi');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetchGameEvents();
        const gameEvents = response.gameEvents || response.data || response || [];
        const event = gameEvents.find(
          (e) => String(e.gameEvent?.gameTypeId) === String(gameTypeId)
        );

        if (event && event.gameEvent?.configJson) {
          const { cards, maxScratch } = event.gameEvent.configJson;
          if (Array.isArray(cards) && cards.length > 0 && maxScratch > 0) {
            setConfig(event.gameEvent.configJson);
          } else {
            throw new Error('Cấu hình trò chơi không hợp lệ');
          }
        } else {
          setConfig({
            cards: [
              { id: 1, reward: '100 điểm' },
              { id: 2, reward: '50 điểm' },
              { id: 3, reward: 'Thử lại' },
            ],
            maxScratch: 3,
          });
        }
        setError(null);
      } catch (err) {
        const errorMessage = err.message || 'Không thể tải cấu hình trò chơi';
        setError(errorMessage);
        Alert.alert('Lỗi', errorMessage);
      } finally {
        setLoading(false);
      }
    };
    loadGameEvent();
  }, [gameTypeId]);

  const handleScratch = (cardId) => {
    if (!config || scratchCount >= config.maxScratch || scratchedCards.includes(cardId)) return;

    setScratchedCards([...scratchedCards, cardId]);
    setScratchCount(scratchCount + 1);
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
        <Text style={styles.errorText}>{error || 'Không tìm thấy cấu hình trò chơi'}</Text>
      </View>
    );
  }

  const { cards, maxScratch } = config;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cào Thẻ</Text>
      <View style={styles.cardContainer}>
        {cards.map((card) => (
          <TouchableOpacity
            key={card.id.toString()}
            style={[
              styles.card,
              scratchedCards.includes(card.id) ? styles.cardScratched : styles.cardCovered,
            ]}
            onPress={() => handleScratch(card.id)}
            disabled={scratchCount >= maxScratch || scratchedCards.includes(card.id)}
          >
            <Text style={styles.cardText}>
              {scratchedCards.includes(card.id) ? card.reward : 'Cào để xem'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.scratchCount}>
        Lượt cào còn lại: {maxScratch - scratchCount}
      </Text>
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
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  card: {
    width: 100,
    height: 100,
    margin: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardCovered: {
    backgroundColor: '#ccc',
  },
  cardScratched: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  scratchCount: {
    fontSize: 16,
    color: '#333',
    marginTop: 20,
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
  },
});

export default ScratchCardGame;