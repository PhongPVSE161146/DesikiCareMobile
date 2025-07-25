"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
  RefreshControl,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { MaterialIcons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { fetchGameEvents, canSpinWheel, getGameEventStatusText } from "../../config/axios/MiniGame/minigameService"

const GameEventsScreen = () => {
  const navigation = useNavigation()
  const [gameEvents, setGameEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  const loadGameEvents = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true)
      console.log("🎮 Loading game events...")

      const response = await fetchGameEvents()
      console.log("🎮 fetchGameEvents response:", JSON.stringify(response, null, 2))

      const gameEventsData = response.gameEvents || []

      if (!Array.isArray(gameEventsData)) {
        throw new Error("Invalid game events response")
      }

      // Filter only spin wheel events (gameTypeId = 1)
      const spinWheelEvents = gameEventsData.filter((eventWrapper) => {
        const gameEvent = eventWrapper.gameEvent
        return gameEvent && Number(gameEvent.gameTypeId) === 1
      })

      console.log(`✅ Loaded ${spinWheelEvents.length} spin wheel game events`)

      setGameEvents(spinWheelEvents)
      setError(null)
    } catch (err) {
      const errorMessage = err.message || "Không thể tải danh sách sự kiện"
      console.error("❌ Error loading game events:", err)
      setError(errorMessage)
      if (!isRefresh) {
        Alert.alert("Lỗi", errorMessage)
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadGameEvents()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    loadGameEvents(true)
  }

  const handleGamePress = (eventWrapper) => {
    const gameEvent = eventWrapper.gameEvent
    if (!gameEvent || !gameEvent._id) {
      Alert.alert("Lỗi", "Thông tin sự kiện không hợp lệ")
      return
    }

    // Navigate to GameEventDetailScreen
    navigation.navigate("GameEventDetailScreen", {
      gameEventId: gameEvent._id,
    })
  }

  const handlePlayGame = (eventWrapper) => {
    const gameEvent = eventWrapper.gameEvent
    if (!gameEvent) return

    if (!canSpinWheel(gameEvent)) {
      const statusText = getGameEventStatusText(gameEvent)
      Alert.alert("Không thể chơi", `Trạng thái: ${statusText}`)
      return
    }

    // Navigate directly to spin wheel game
    navigation.navigate("SpinWheelGameScreen", {
      gameTypeId: String(gameEvent.gameTypeId),
      gameTypeName: gameEvent.gameTypeName,
      gameEventId: gameEvent._id,
    })
  }

  const getStatusColor = (gameEvent) => {
    if (!gameEvent) return "#666"

    switch (gameEvent.status) {
      case "active":
        return "#4CAF50"
      case "ended":
        return "#FF5722"
      case "upcoming":
        return "#FF9800"
      case "no_spins_left":
        return "#9C27B0"
      case "deactivated":
        return "#757575"
      default:
        return "#666"
    }
  }

  const renderGameEvent = ({ item }) => {
    const { gameEvent, gameTypeImageUrls } = item
    const imageUrl = gameEvent.imageUrl || gameTypeImageUrls?.[0]?.imageUrl

    return (
      <TouchableOpacity style={styles.gameCard} onPress={() => handleGamePress(item)}>
        {/* Event Image */}
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.gameImage} resizeMode="cover" />
          ) : (
            <View style={[styles.gameImage, styles.placeholderImage]}>
              <MaterialIcons name="casino" size={32} color="#BDBDBD" />
              <Text style={styles.placeholderText}>Không có ảnh</Text>
            </View>
          )}

          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(gameEvent) }]}>
            <Text style={styles.statusBadgeText}>{getGameEventStatusText(gameEvent)}</Text>
          </View>
        </View>

        {/* Event Info */}
        <View style={styles.gameInfo}>
          <Text style={styles.gameTitle} numberOfLines={2}>
            {gameEvent.eventName || "Sự kiện trò chơi"}
          </Text>

          <Text style={styles.gameType}>{gameEvent.gameTypeName || "Quay trúng thưởng"}</Text>

          {gameEvent.description && (
            <Text style={styles.gameDescription} numberOfLines={2}>
              {gameEvent.description}
            </Text>
          )}

          {/* Game Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <MaterialIcons name="casino" size={16} color="#4CAF50" />
              <Text style={styles.statText}>{gameEvent.remainingPlays} lượt</Text>
            </View>

            <View style={styles.statItem}>
              <MaterialIcons name="stars" size={16} color="#FF9800" />
              <Text style={styles.statText}>{gameEvent.totalPointsEarned} điểm</Text>
            </View>
          </View>

          {/* Date Range */}
          <Text style={styles.gameDate}>
            {gameEvent.formattedStartDate} - {gameEvent.formattedEndDate}
          </Text>

          {/* Remaining Time */}
          {gameEvent.remainingTimeText && (
            <Text style={[styles.remainingTime, { color: getStatusColor(gameEvent) }]}>
              {gameEvent.remainingTimeText}
            </Text>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.detailButton} onPress={() => handleGamePress(item)}>
              <MaterialIcons name="info-outline" size={16} color="#2196F3" />
              <Text style={styles.detailButtonText}>Chi tiết</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.playButton, !canSpinWheel(gameEvent) && styles.disabledPlayButton]}
              onPress={() => handlePlayGame(item)}
              disabled={!canSpinWheel(gameEvent)}
            >
              <MaterialIcons name="casino" size={16} color="#fff" />
              <Text style={styles.playButtonText}>{canSpinWheel(gameEvent) ? "Chơi ngay" : "Không thể chơi"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="casino" size={64} color="#BDBDBD" />
      <Text style={styles.emptyTitle}>Không có sự kiện nào</Text>
      <Text style={styles.emptyText}>Hiện tại chưa có sự kiện trò chơi nào đang diễn ra.</Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => loadGameEvents()}>
        <MaterialIcons name="refresh" size={20} color="#fff" />
        <Text style={styles.retryButtonText}>Thử lại</Text>
      </TouchableOpacity>
    </View>
  )

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <MaterialIcons name="error-outline" size={64} color="#ff4444" />
      <Text style={styles.errorTitle}>Có lỗi xảy ra</Text>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => loadGameEvents()}>
        <MaterialIcons name="refresh" size={20} color="#fff" />
        <Text style={styles.retryButtonText}>Thử lại</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <SafeAreaView style={styles.safeContainer} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          {/* <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity> */}
          <Text style={styles.headerTitle}>Sự kiện trò chơi</Text>
       
        </View>

        {/* Content */}
        <View style={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>Đang tải sự kiện...</Text>
            </View>
          ) : error ? (
            renderErrorState()
          ) : gameEvents.length === 0 ? (
            renderEmptyState()
          ) : (
            <>
              {/* Info Banner */}
              <View style={styles.infoBanner}>
                <MaterialIcons name="info-outline" size={20} color="#2196F3" />
                <Text style={styles.infoBannerText}>
                  Tham gia các sự kiện để nhận điểm thưởng! Điểm có thể sử dụng để mua sắm.
                </Text>
              </View>

              {/* Events List */}
              <FlatList
                data={gameEvents}
                renderItem={renderGameEvent}
                keyExtractor={(item) => item.gameEvent._id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#4CAF50"]} />
                }
              />
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#4CAF50",
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 15,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
  historyButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoBannerText: {
    fontSize: 14,
    color: "#1976D2",
    marginLeft: 8,
    flex: 1,
  },
  listContainer: {
    paddingBottom: 20,
  },
  gameCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
  },
  gameImage: {
    width: "100%",
    height: 160,
  },
  placeholderImage: {
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#BDBDBD",
    fontSize: 12,
    marginTop: 4,
  },
  statusBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  gameInfo: {
    padding: 16,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  gameType: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "500",
    marginBottom: 8,
  },
  gameDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  gameDate: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
  },
  remainingTime: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    justifyContent: "center",
  },
  detailButtonText: {
    color: "#2196F3",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  playButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    justifyContent: "center",
  },
  disabledPlayButton: {
    backgroundColor: "#BDBDBD",
  },
  playButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ff4444",
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#ff4444",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
})

export default GameEventsScreen
