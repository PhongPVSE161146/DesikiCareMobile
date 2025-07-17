import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchGameTypes } from '../../../config/axios/MiniGame/minigameService';

// Mapping gameTypeId to game type names
const GAME_TYPES = {
  '1': 'Quay trúng thưởng',
  '2': 'Chọn 2 ô trùng nhau',
  '3': 'Cào thẻ',
  '4': 'Điền từ còn trống',
};

const MiniGameScreen = () => {
  const navigation = useNavigation();
  const [gameTypes, setGameTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadGameTypes = async () => {
      try {
        setLoading(true);
        const response = await fetchGameTypes();
        console.log('fetchGameTypes response:', JSON.stringify(response, null, 2)); // Log for debugging
        const gameTypesData = response.gameTypes || response.data || response || [];
        if (!Array.isArray(gameTypesData)) {
          throw new Error('Invalid game types response');
        }
        const mappedGameTypes = gameTypesData.map(type => ({
          ...type,
          _id: String(type._id), // Ensure _id is a string
          displayName: GAME_TYPES[String(type._id)] || type.name || 'Không xác định',
        }));
        setGameTypes(mappedGameTypes);
        setError(null);
      } catch (err) {
        const errorMessage = err.message || 'Không thể tải danh sách trò chơi';
        console.error('Error loading game types:', err);
        setError(errorMessage);
        Alert.alert('Lỗi', errorMessage);
      } finally {
        setLoading(false);
      }
    };
    loadGameTypes();
  }, []);

  const handleGameTypePress = (gameType) => {
    const { _id } = gameType;
    let screenName;

    switch (_id) {
      case '1':
        screenName = 'SpinWheelGame';
        break;
      case '2':
        screenName = 'MatchPairGame';
        break;
      case '3':
        screenName = 'ScratchCardGame';
        break;
      case '4':
        screenName = 'FillBlankGame';
        break;
      default:
        Alert.alert('Thông báo', 'Loại trò chơi không được hỗ trợ.');
        return;
    }

    navigation.navigate(screenName, { gameTypeId: _id });
  };

  const renderGameType = ({ item }) => (
    <TouchableOpacity style={styles.gameCard} onPress={() => handleGameTypePress(item)}>
      <View style={styles.gameInfo}>
        <Text style={styles.gameTitle}>{item.displayName}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loại Mini Games</Text>
        </View>
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator size="large" color="#4CAF50" />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : gameTypes.length === 0 ? (
            <Text style={styles.emptyText}>Không có loại trò chơi nào.</Text>
          ) : (
            <FlatList
              data={gameTypes}
              renderItem={renderGameType}
              keyExtractor={(item) => item._id}
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
    padding: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  gameCard: {
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
  gameInfo: {
    padding: 10,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
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

export default MiniGameScreen;