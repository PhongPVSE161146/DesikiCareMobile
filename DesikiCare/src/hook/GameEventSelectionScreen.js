import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { fetchGameEvents } from '../config/axios/MiniGame/minigameService';

const GameEventSelectionScreen = ({ navigation, route }) => {
  const { gameTypeId, gameName } = route.params || { gameTypeId: '1', gameName: 'Vòng Quay May Mắn' };
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGameEvents = async () => {
      try {
        setLoading(true);
        const response = await fetchGameEvents();
        console.log('fetchGameEvents response:', JSON.stringify(response, null, 2));
        const gameEvents = response.gameEvents || [];
        const filtered = gameEvents.filter(
          (item) => String(item.gameEvent?.gameTypeId) === gameTypeId
        );
        setEvents(filtered);
        setError(null);
      } catch (err) {
        console.error('Error fetching game events:', err);
        setError(err.message || 'Không thể tải danh sách sự kiện');
      } finally {
        setLoading(false);
      }
    };
    fetchGameEvents();
  }, [gameTypeId]);

  const renderEvent = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('MiniGameScreen', {
          gameEvent: item,
          gameTypeId,
          gameName,
        })
      }
    >
      <Image
        source={{ uri: item.gameEvent.imageBase64 ? `data:image/png;base64,${item.gameEvent.imageBase64}` : item.gameTypeImageUrls?.find(img => img.id === 1)?.imageUrl || 'https://example.com/spin-wheel.png' }}
        style={styles.cardImage}
        resizeMode="cover"
      />
      <View style={styles.cardContent}>
        <Text style={styles.eventName}>{item.gameEvent.eventName}</Text>
        <Text style={styles.eventDescription}>{item.gameEvent.description}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#DC3545" />
        <Text style={styles.loadingText}>Đang tải sự kiện...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Chọn sự kiện cho: {gameName}
        </Text>
      </View>
      <FlatList
        data={events}
        renderItem={renderEvent}
        keyExtractor={(item) => item.gameEvent._id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
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
  backButton: {
    marginRight: 10,
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  list: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: 100,
    height: 100,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  cardContent: {
    flex: 1,
    padding: 12,
  },
  eventName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  loadingText: {
    fontSize: 18,
    color: '#DC3545',
    marginTop: 10,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#B71C1C',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default GameEventSelectionScreen;