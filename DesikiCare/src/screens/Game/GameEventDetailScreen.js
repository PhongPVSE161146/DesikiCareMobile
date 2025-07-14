import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { fetchGameEventById } from '../../config/axios/MiniGame/minigameService'; // Đường dẫn tới file API của bạn

const GameEventDetailScreen = ({ route }) => {
  const { gameEventId } = route.params;
  const [gameEventData, setGameEventData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGameEvent = async () => {
      try {
        const { gameEvent } = await fetchGameEventById(gameEventId);
        setGameEventData(gameEvent);
        setLoading(false);
      } catch (error) {
        Alert.alert('Lỗi', error.message);
        setLoading(false);
      }
    };

    loadGameEvent();
  }, [gameEventId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!gameEventData) {
    return (
      <View style={styles.center}>
        <Text>Không tìm thấy thông tin sự kiện.</Text>
      </View>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {gameEventData.imageUrl ? (
          <Image
            source={{ uri: gameEventData.imageUrl }}
            style={styles.eventImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text>Không có hình ảnh</Text>
          </View>
        )}
        <Text style={styles.eventName}>{gameEventData.eventName}</Text>
        <Text style={styles.gameName}>{gameEventData.gameName}</Text>
      </View>

      <View style={styles.details}>
        <Text style={styles.label}>Loại game: </Text>
        <Text style={styles.value}>{gameEventData.gameTypeName}</Text>

        <Text style={styles.label}>Mô tả: </Text>
        <Text style={styles.value}>{gameEventData.description}</Text>

        <Text style={styles.label}>Ngày bắt đầu: </Text>
        <Text style={styles.value}>{formatDate(gameEventData.startDate)}</Text>

        <Text style={styles.label}>Ngày kết thúc: </Text>
        <Text style={styles.value}>{formatDate(gameEventData.endDate)}</Text>

        <Text style={styles.label}>Điểm thưởng: </Text>
        <Text style={styles.value}>{gameEventData.balancePoints}</Text>

        <Text style={styles.label}>Trạng thái: </Text>
        <Text style={styles.value}>
          {gameEventData.isDeactivated ? 'Đã hủy' : 'Đang hoạt động'}
        </Text>

        <Text style={styles.label}>Ngày tạo: </Text>
        <Text style={styles.value}>
          {formatDate(gameEventData.createdAt)} {new Date(gameEventData.createdAt).toLocaleTimeString('vi-VN')}
        </Text>
      </View>

      {/* <View style={styles.rewards}>
        <Text style={styles.sectionTitle}>Lịch sử phần thưởng</Text>
        {gameEventData.gameEventRewardResults && gameEventData.gameEventRewardResults.length > 0 ? (
          gameEventData.gameEventRewardResults.map((reward, index) => (
            <View key={reward.gameEventRewardResult._id} style={styles.rewardItem}>
              <Text style={styles.rewardText}>
                Phần thưởng #{index + 1}: {reward.gameEventRewardResult.points} điểm
              </Text>
              <Text style={styles.rewardDate}>
                Nhận vào: {formatDate(reward.gameEventRewardResult.createdAt)}
              </Text>
            </View>
          ))
        ) : (
          <Text>Chưa có phần thưởng nào.</Text>
        )}
      </View> */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  eventImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  placeholderImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  eventName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  gameName: {
    fontSize: 18,
    color: '#555',
  },
  details: {
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  value: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  rewards: {
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  rewardItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  rewardText: {
    fontSize: 16,
  },
  rewardDate: {
    fontSize: 14,
    color: '#666',
  },
});

export default GameEventDetailScreen;