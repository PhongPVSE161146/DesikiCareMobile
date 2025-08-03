import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import { MaterialIcons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { fetchGameEventById, canSpinWheel, getGameEventStatusText } from "../../config/axios/MiniGame/minigameService"

const GameEventDetailScreen = () => {
  const route = useRoute()
  const navigation = useNavigation()
  const { gameEventId } = route.params || {}

  const [gameEventData, setGameEventData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadGameEvent = async () => {
      try {
        setLoading(true)
     

        const response = await fetchGameEventById(gameEventId)
      

        setGameEventData(response)
        setError(null)
      } catch (err) {
        const errorMessage = err.message || "Không thể tải thông tin sự kiện"
        // console.error("❌ Error loading game event:", err)
        setError(errorMessage)
        // Alert.alert("Lỗi", errorMessage)
      } finally {
        setLoading(false)
      }
    }

    loadGameEvent()
  }, [gameEventId])

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (e) {
      return dateString
    }
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return `${date.toLocaleDateString("vi-VN")} ${date.toLocaleTimeString("vi-VN")}`
    } catch (e) {
      return dateString
    }
  }

  const handlePlayGame = () => {
    if (!gameEventData?.gameEvent) return

    const gameEvent = gameEventData.gameEvent

    if (!canSpinWheel(gameEvent)) {
      const statusText = getGameEventStatusText(gameEvent)
      // Alert.alert("Không thể chơi", `Trạng thái: ${statusText}`)
      return
    }

    // Navigate to spin wheel game with specific event
    navigation.navigate("SpinWheelGame", {
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

  if (loading) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chi tiết sự kiện</Text>
            <View style={styles.headerRight} />
          </View>

          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Đang tải thông tin sự kiện...</Text>
          </View>
        </View>
      </SafeAreaView>
    )
  }

  if (error || !gameEventData) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.container}>
          {/* <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chi tiết sự kiện</Text>
            <View style={styles.headerRight} />
          </View> */}

          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={64} color="#ff4444" />
            <Text style={styles.errorText}>{error || "Không tìm thấy thông tin sự kiện"}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
              <Text style={styles.retryButtonText}>Quay lại</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    )
  }

  const { gameEvent, gameEventRewardResults, gameTypeImageUrls } = gameEventData
  const config = gameEvent.parsedConfig || {}

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        {/* Header */}
       

        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Event Image */}
          <View style={styles.imageContainer}>
            {gameEvent.imageUrl ? (
              <Image source={{ uri: gameEvent.imageUrl }} style={styles.eventImage} resizeMode="cover" />
            ) : (
              <View style={styles.placeholderImage}>
                <MaterialIcons name="casino" size={48} color="#BDBDBD" />
                <Text style={styles.placeholderText}>Không có hình ảnh</Text>
              </View>
            )}

            {/* Status Badge */}
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(gameEvent) }]}>
              <Text style={styles.statusBadgeText}>{getGameEventStatusText(gameEvent)}</Text>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.shareButton}>
                <MaterialIcons name="share" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.favoriteButton}>
                <MaterialIcons name="favorite-border" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Event Info */}
          <View style={styles.eventInfoContainer}>
            <Text style={styles.eventName}>{gameEvent.eventName || "Sự kiện trò chơi"}</Text>
            <Text style={styles.gameName}>{gameEvent.gameName || gameEvent.gameTypeName}</Text>

            {gameEvent.description && <Text style={styles.description}>{gameEvent.description}</Text>}

            {/* Event Tags */}
            <View style={styles.tagsContainer}>
              <View style={styles.tag}>
                <MaterialIcons name="casino" size={14} color="#4CAF50" />
                <Text style={styles.tagText}>Quay thưởng</Text>
              </View>
              {gameEvent.isActive && (
                <View style={[styles.tag, styles.activeTag]}>
                  <MaterialIcons name="play-circle-filled" size={14} color="#fff" />
                  <Text style={[styles.tagText, styles.activeTagText]}>Đang diễn ra</Text>
                </View>
              )}
            </View>
          </View>

          {/* Game Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <MaterialIcons name="casino" size={24} color="#4CAF50" />
              </View>
              <Text style={styles.statLabel}>Lượt quay còn lại</Text>
              <Text style={styles.statValue}>{gameEvent.remainingPlays}</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <MaterialIcons name="stars" size={24} color="#FF9800" />
              </View>
              <Text style={styles.statLabel}>Tổng điểm nhận</Text>
              <Text style={styles.statValue}>{gameEvent.totalPointsEarned}</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <MaterialIcons name="play-circle-outline" size={24} color="#2196F3" />
              </View>
              <Text style={styles.statLabel}>Đã chơi</Text>
              <Text style={styles.statValue}>
                {gameEvent.totalPlays}/{gameEvent.maxPlays}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Tiến độ chơi</Text>
              <Text style={styles.progressPercentage}>
                {Math.round((gameEvent.totalPlays / gameEvent.maxPlays) * 100)}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(gameEvent.totalPlays / gameEvent.maxPlays) * 100}%` }]} />
            </View>
          </View>

          {/* Event Details */}
          <View style={styles.detailsContainer}>
            <Text style={styles.sectionTitle}>
              <MaterialIcons name="info-outline" size={20} color="#333" /> Thông tin chi tiết
            </Text>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <MaterialIcons name="category" size={18} color="#666" />
              </View>
              <Text style={styles.detailLabel}>Loại trò chơi:</Text>
              <Text style={styles.detailValue}>{gameEvent.gameTypeName}</Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <MaterialIcons name="schedule" size={18} color="#666" />
              </View>
              <Text style={styles.detailLabel}>Thời gian bắt đầu:</Text>
              <Text style={styles.detailValue}>{gameEvent.formattedStartTime}</Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <MaterialIcons name="event" size={18} color="#666" />
              </View>
              <Text style={styles.detailLabel}>Thời gian kết thúc:</Text>
              <Text style={styles.detailValue}>{gameEvent.formattedEndTime}</Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <MaterialIcons name="timer" size={18} color="#FF5722" />
              </View>
              <Text style={styles.detailLabel}>Thời gian còn lại:</Text>
              <Text style={[styles.detailValue, { color: "#FF5722", fontWeight: "bold" }]}>
                {gameEvent.remainingTimeText}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <MaterialIcons name="pie-chart" size={18} color="#666" />
              </View>
              <Text style={styles.detailLabel}>Số sectors:</Text>
              <Text style={styles.detailValue}>{config.numOfSectors || "N/A"}</Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <MaterialIcons name="repeat" size={18} color="#666" />
              </View>
              <Text style={styles.detailLabel}>Lượt quay tối đa:</Text>
              <Text style={styles.detailValue}>{config.maxSpin || "N/A"}</Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <MaterialIcons name="date-range" size={18} color="#666" />
              </View>
              <Text style={styles.detailLabel}>Ngày tạo:</Text>
              <Text style={styles.detailValue}>{formatDateTime(gameEvent.createdAt)}</Text>
            </View>
          </View>

          {/* Wheel Configuration */}
          {config.sectors && config.sectors.length > 0 && (
            <View style={styles.configContainer}>
              <Text style={styles.sectionTitle}>
                <MaterialIcons name="settings" size={20} color="#333" /> Cấu hình vòng quay
              </Text>

              {config.sectors.map((sector, index) => (
                <View key={index} style={styles.sectorItem}>
                  <View style={[styles.sectorColor, { backgroundColor: sector.color }]} />
                  <View style={styles.sectorInfo}>
                    <Text style={styles.sectorLabel}>{sector.label}</Text>
                    <Text style={styles.sectorValue}>{sector.value} điểm</Text>
                  </View>
                  <View style={styles.sectorChance}>
                    <Text style={styles.sectorChanceText}>{Math.round((1 / config.sectors.length) * 100)}%</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Reward History */}
          {gameEventRewardResults && gameEventRewardResults.length > 0 && (
            <View style={styles.rewardsContainer}>
              <Text style={styles.sectionTitle}>
                <MaterialIcons name="history" size={20} color="#333" /> Lịch sử phần thưởng
              </Text>

              {gameEventRewardResults.slice(0, 5).map((rewardWrapper, index) => {
                const reward = rewardWrapper.gameEventRewardResult || rewardWrapper
                return (
                  <View key={reward._id || index} style={styles.rewardItem}>
                    <View style={styles.rewardIcon}>
                      <MaterialIcons name="stars" size={20} color="#FF9800" />
                    </View>
                    <View style={styles.rewardInfo}>
                      <Text style={styles.rewardPoints}>+{reward.points} điểm</Text>
                      <Text style={styles.rewardDate}>{reward.formattedDateTime}</Text>
                    </View>
                    <View style={styles.rewardBadge}>
                      <Text style={styles.rewardBadgeText}>Thưởng</Text>
                    </View>
                  </View>
                )
              })}

              {gameEventRewardResults.length > 5 && (
                <TouchableOpacity style={styles.viewMoreButton}>
                  <Text style={styles.viewMoreText}>Xem thêm {gameEventRewardResults.length - 5} phần thưởng</Text>
                  <MaterialIcons name="keyboard-arrow-down" size={20} color="#2196F3" />
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* Play Button */}
        {gameEvent && (
          <View style={styles.playButtonContainer}>
            <TouchableOpacity
              style={[styles.playButton, !canSpinWheel(gameEvent) && styles.disabledPlayButton]}
              onPress={handlePlayGame}
              disabled={!canSpinWheel(gameEvent)}
            >
              <MaterialIcons name="casino" size={24} color="#fff" />
              <Text style={styles.playButtonText}>
                {canSpinWheel(gameEvent) ? "Chơi ngay" : getGameEventStatusText(gameEvent)}
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
  historyButton: {
    padding: 8,
  },
  headerRight: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  imageContainer: {
    position: "relative",
    margin: 16,
  },
  eventImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  placeholderImage: {
    width: "100%",
    height: 200,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  placeholderText: {
    fontSize: 14,
    color: "#BDBDBD",
    marginTop: 8,
  },
  statusBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  quickActions: {
    position: "absolute",
    bottom: 12,
    right: 12,
    flexDirection: "row",
  },
  shareButton: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  favoriteButton: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 20,
  },
  eventInfoContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  eventName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  gameName: {
    fontSize: 18,
    color: "#666",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  activeTag: {
    backgroundColor: "#4CAF50",
  },
  tagText: {
    fontSize: 12,
    color: "#4CAF50",
    marginLeft: 4,
    fontWeight: "500",
  },
  activeTagText: {
    color: "#fff",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    paddingVertical: 8,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    padding: 12,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  progressContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  progressPercentage: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "bold",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 4,
  },
  detailsContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailIcon: {
    width: 24,
    alignItems: "center",
    marginRight: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    textAlign: "right",
    flex: 1,
  },
  configContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  sectorItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sectorColor: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  sectorInfo: {
    flex: 1,
  },
  sectorLabel: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  sectorValue: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  sectorChance: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sectorChanceText: {
    fontSize: 12,
    color: "#2196F3",
    fontWeight: "500",
  },
  rewardsContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  rewardItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  rewardIcon: {
    marginRight: 12,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardPoints: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  rewardDate: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  rewardBadge: {
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rewardBadgeText: {
    fontSize: 10,
    color: "#FF9800",
    fontWeight: "500",
  },
  viewMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 8,
  },
  viewMoreText: {
    fontSize: 14,
    color: "#2196F3",
    fontWeight: "500",
    marginRight: 4,
  },
  bottomSpacing: {
    height: 20,
  },
  playButtonContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    elevation: 4,
  },
  playButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  disabledPlayButton: {
    backgroundColor: "#BDBDBD",
  },
  playButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#ff4444",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
})

export default GameEventDetailScreen
