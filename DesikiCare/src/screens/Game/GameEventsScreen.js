import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchGameEvents, fetchGameTypes } from '../../config/axios/MiniGame/minigameService';

const GameEventsScreen = () => {
  const navigation = useNavigation();
  const [gameEvents, setGameEvents] = useState([]);
  const [gameTypes, setGameTypes] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingGameTypes, setLoadingGameTypes] = useState(false);
  const [selectedGameType, setSelectedGameType] = useState(null);

  useEffect(() => {
    fetchGameEventsData();
    fetchGameTypesData();
  }, []);

  const fetchGameEventsData = async () => {
    try {
      const events = await fetchGameEvents();
      setGameEvents(events.gameEvents || []);
      setLoadingEvents(false);
    } catch (error) {
      setLoadingEvents(false);
      handleApiError(error, 'Không thể tải danh sách sự kiện game.');
    }
  };

  const fetchGameTypesData = async () => {
    setLoadingGameTypes(true);
    try {
      const types = await fetchGameTypes();
      setGameTypes(types || []);
      setLoadingGameTypes(false);
    } catch (error) {
      setLoadingGameTypes(false);
      handleApiError(error, 'Không thể tải danh sách loại game.');
    }
  };

  const handleApiError = (error, defaultMessage) => {
    const errorMessage = error.message || defaultMessage;
    if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
      Alert.alert('Lỗi', 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } else {
      Alert.alert('Lỗi', errorMessage);
    }
  };

  const filteredEvents = selectedGameType
    ? gameEvents.filter(event => event.gameEvent.gameTypeId === selectedGameType)
    : gameEvents;

  const renderGameEvent = ({ item }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => navigation.navigate('GameEventDetail', { gameEventId: item.gameEvent._id })}
    >
      <Text style={styles.eventTitle}>{item.gameEvent.eventName || 'Không có tên'}</Text>
      <Text style={styles.eventDescription}>{item.gameEvent.description || 'Không có mô tả'}</Text>
      <Text style={styles.eventType}>Loại game: {item.gameEvent.gameTypeName}</Text>
      <Text style={styles.eventDate}>
        Từ: {new Date(item.gameEvent.startDate).toLocaleDateString()} - Đến: {new Date(item.gameEvent.endDate).toLocaleDateString()}
      </Text>
      <Text style={styles.eventPoints}>Điểm thưởng: {item.gameEvent.balancePoints || 0}</Text>
      {item.gameEventRewardResults?.length > 0 && (
        <Text style={styles.eventRewards}>
          Phần thưởng: {item.gameEventRewardResults[0].gameEventRewardResult.points || 0} điểm
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderGameTypeFilter = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={[styles.filterButton, !selectedGameType && styles.filterButtonActive]}
        onPress={() => setSelectedGameType(null)}
      >
        <Text style={styles.filterButtonText}>Tất cả</Text>
      </TouchableOpacity>
      {gameTypes.map(type => (
        <TouchableOpacity
          key={type.id}
          style={[styles.filterButton, selectedGameType === type.id && styles.filterButtonActive]}
          onPress={() => setSelectedGameType(type.id)}
        >
          <Text style={styles.filterButtonText}>{type.name || GAME_TYPES[type.id]}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
     
          <Text style={styles.headerTitle}>Sự Kiện</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>Danh Sách Sự Kiện</Text>
          {loadingGameTypes ? (
            <Text style={styles.loadingText}>Đang tải loại game...</Text>
          ) : (
            renderGameTypeFilter()
          )}
          {loadingEvents ? (
            <Text style={styles.loadingText}>Đang tải sự kiện...</Text>
          ) : (
            <FlatList
              data={filteredEvents}
              renderItem={renderGameEvent}
              keyExtractor={(item) => item.gameEvent._id || Math.random().toString()}
              ListEmptyComponent={<Text style={styles.noEvents}>Không có sự kiện nào.</Text>}
              style={styles.eventList}
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
  backButton: {
    marginRight: 15,
    padding: 8,
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
    backgroundColor: '#E0F7FA',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 10,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    margin: 5,
    backgroundColor: '#f0f0f0',
  },
  filterButtonActive: {
    backgroundColor: '#4CAF50',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  eventList: {
    width: '100%',
    marginTop: 20,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
    marginVertical: 5,
  },
  eventType: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  eventDate: {
    fontSize: 14,
    color: '#888',
  },
  eventPoints: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  eventRewards: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 20,
    textAlign: 'center',
  },
  noEvents: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default GameEventsScreen;