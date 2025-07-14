import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchGameEvents } from '../../config/axios/MiniGame/minigameService'; // Adjust the path based on your project structure

const GameEventsScreen = () => {
  const navigation = useNavigation();
  const [gameEvents, setGameEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadGameEvents = async () => {
      try {
        setLoading(true);
        const { gameEvents } = await fetchGameEvents();
        setGameEvents(gameEvents);
        setError(null);
      } catch (err) {
        setError(err.message);
        Alert.alert('Lỗi', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadGameEvents();
  }, []);

  const handleGamePress = (gameEvent) => {
    // Navigate to GameEventDetailScreen with gameEventId
    const { _id } = gameEvent.gameEvent;
    navigation.navigate('GameEventDetail', { gameEventId: _id });
  };

  const renderGameEvent = ({ item }) => {
    const { gameEvent, gameTypeImageUrls } = item;
    const imageUrl = gameTypeImageUrls?.[0]?.imageUrl || gameEvent.imageUrl;

    return (
      <TouchableOpacity style={styles.gameCard} onPress={() => handleGamePress(item)}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.gameImage} />
        ) : (
          <View style={[styles.gameImage, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
        <View style={styles.gameInfo}>
          <Text style={styles.gameTitle}>{gameEvent.eventName}</Text>
          <Text style={styles.gameType}>{gameEvent.gameTypeName}</Text>
          <Text style={styles.gameDescription} numberOfLines={2}>
            {gameEvent.description}
          </Text>
          <Text style={styles.gameDate}>
            Từ {new Date(gameEvent.startDate).toLocaleDateString('vi-VN')} đến{' '}
            {new Date(gameEvent.endDate).toLocaleDateString('vi-VN')}
          </Text>
          {gameEvent.isDeactivated && (
            <Text style={styles.deactivatedText}>Sự kiện đã bị hủy</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Sự Kiện</Text>
        </View>
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator size="large" color="#4CAF50" />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : gameEvents.length === 0 ? (
            <Text style={styles.emptyText}>Không có sự kiện trò chơi nào.</Text>
          ) : (
            <FlatList
              data={gameEvents}
              renderItem={renderGameEvent}
              keyExtractor={(item) => item.gameEvent._id}
              contentContainerStyle={styles.listContainer}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#4CAF50',
  },
  container: {
    flex: 1,
    backgroundColor: '#E0F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  
  gameCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  gameImage: {
    width: 100,
    height: 100,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  placeholderImage: {
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666',
    fontSize: 14,
  },
  gameInfo: {
    flex: 1,
    padding: 10,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  gameType: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 5,
  },
  gameDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  gameDate: {
    fontSize: 12,
    color: '#888',
  },
  deactivatedText: {
    fontSize: 12,
    color: '#ff4444',
    fontWeight: '600',
    marginTop: 5,
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default GameEventsScreen;