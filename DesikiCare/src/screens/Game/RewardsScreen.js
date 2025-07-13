import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  FlatList,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchUserGameRewards } from '../../config/axios/MiniGame/minigameService';

const RewardsScreen = () => {
  const navigation = useNavigation();
  const [rewards, setRewards] = useState([]);
  const [loadingRewards, setLoadingRewards] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchRewardsData();
  }, []);

  const fetchRewardsData = async () => {
    setLoadingRewards(true);
    try {
      const rewardsData = await fetchUserGameRewards();
      setRewards(rewardsData.gameEventRewardResults || []);
    } catch (error) {
      handleApiError(error, 'Không thể tải lịch sử phần thưởng.');
    } finally {
      setLoadingRewards(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRewardsData();
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

  const renderReward = ({ item }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => navigation.navigate('GameEventDetail', { gameEventId: item.gameEvent._id })}
      accessible={true}
      accessibilityLabel={`Phần thưởng: ${item.gameEvent.eventName}`}
      accessibilityRole="button"
    >
      <Text style={styles.eventTitle} numberOfLines={1}>
        {item.gameEvent.eventName || 'Không có tên'}
      </Text>
      <Text style={styles.eventType}>Loại game: {item.gameEvent.gameTypeName}</Text>
      <Text style={styles.eventPoints}>Điểm nhận: {item.gameEventRewardResult.points || 0}</Text>
      <Text style={styles.eventDate}>
        Nhận vào: {new Date(item.gameEventRewardResult.createdAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="inbox" size={48} color="#666" />
      <Text style={styles.noEvents}>Không có phần thưởng nào</Text>
      <Text style={styles.emptySubtitle}>Tham gia các sự kiện để nhận thưởng!</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
        
          <Text style={styles.headerTitle}>Lịch Sử Điểm</Text>
        </View>
        <View style={styles.content}>
          {/* <Text style={styles.title}>Lịch Sử Phần Thưởng</Text> */}
          {loadingRewards ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>Đang tải phần thưởng...</Text>
            </View>
          ) : (
            <FlatList
              data={rewards}
              renderItem={renderReward}
              keyExtractor={(item) => item.gameEventRewardResult._id || Math.random().toString()}
              ListEmptyComponent={renderEmptyState}
              style={styles.eventList}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#4CAF50']}
                />
              }
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
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  eventList: {
    width: '100%',
  },
  listContent: {
    paddingBottom: 20,
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
    marginBottom: 8,
  },
  eventType: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 4,
  },
  eventPoints: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: '#888',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 200,
  },
  noEvents: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 5,
  },
});

export default RewardsScreen;