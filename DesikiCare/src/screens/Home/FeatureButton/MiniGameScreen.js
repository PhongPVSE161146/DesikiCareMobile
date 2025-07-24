"use client"

import { useState, useEffect } from "react"
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { MaterialIcons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { fetchGameTypes } from "../../../config/axios/MiniGame/minigameService"

const MiniGameListScreen = () => {
  const navigation = useNavigation()
  const [gameTypes, setGameTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadGameTypes = async () => {
      try {
        setLoading(true)
        console.log("🎮 Loading game types...")

        const response = await fetchGameTypes()
        console.log("🎮 fetchGameTypes response:", JSON.stringify(response, null, 2))

        const gameTypesData = response.gameTypes || []

        if (!Array.isArray(gameTypesData)) {
          throw new Error("Invalid game types response")
        }

        // Filter only supported game types (spin wheel only)
        const supportedGameTypes = gameTypesData.filter((type) => {
          const gameTypeId = Number(type._id || type.id)
          return gameTypeId === 1 // Only spin wheel
        })

        if (supportedGameTypes.length === 0) {
          throw new Error("Không có loại trò chơi nào được hỗ trợ")
        }

        const mappedGameTypes = supportedGameTypes.map((type) => ({
          ...type,
          id: type._id || type.id,
          _id: String(type._id || type.id),
          displayName: type.displayName || type.name || "Quay trúng thưởng",
          description: type.description || "Quay bánh xe để nhận điểm thưởng",
          icon: "casino", // Material icon for spin wheel
          isSupported: true,
        }))

        setGameTypes(mappedGameTypes)
        setError(null)

        console.log(`✅ Loaded ${mappedGameTypes.length} supported game types`)
      } catch (err) {
        const errorMessage = err.message || "Không thể tải danh sách trò chơi"
        console.error("❌ Error loading game types:", err)
        setError(errorMessage)
        Alert.alert("Lỗi", errorMessage)
      } finally {
        setLoading(false)
      }
    }

    loadGameTypes()
  }, [])

  const handleGameTypePress = (gameType) => {
    const gameTypeId = gameType._id || gameType.id

    console.log("🎮 Selected game type:", gameTypeId, gameType.displayName)

    // Only support spin wheel game (gameTypeId = 1)
    if (Number(gameTypeId) === 1) {
      navigation.navigate("SpinWheelGame", {
        gameTypeId: String(gameTypeId),
        gameTypeName: gameType.displayName,
      })
    } else {
      Alert.alert("Thông báo", 'Loại trò chơi này chưa được hỗ trợ. Hiện tại chỉ có "Quay trúng thưởng" khả dụng.')
    }
  }

  const renderGameType = ({ item }) => (
    <TouchableOpacity
      style={[styles.gameCard, !item.isSupported && styles.disabledGameCard]}
      onPress={() => handleGameTypePress(item)}
      disabled={!item.isSupported}
    >
      <View style={styles.gameIconContainer}>
        <MaterialIcons name={item.icon || "casino"} size={40} color={item.isSupported ? "#4CAF50" : "#BDBDBD"} />
      </View>

      <View style={styles.gameInfo}>
        <Text style={[styles.gameTitle, !item.isSupported && styles.disabledText]}>{item.displayName}</Text>

        <Text style={[styles.gameDescription, !item.isSupported && styles.disabledText]}>{item.description}</Text>

        {item.isSupported && (
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Khả dụng</Text>
          </View>
        )}
      </View>

      <MaterialIcons name="chevron-right" size={24} color={item.isSupported ? "#4CAF50" : "#BDBDBD"} />
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.safeContainer} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mini Games</Text>
          <View style={styles.headerRight}>
          
          </View>
        </View>

        <View style={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>Đang tải danh sách trò chơi...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <MaterialIcons name="error-outline" size={48} color="#ff4444" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => {
                  setError(null)
                  setLoading(true)
                  // Reload game types
                  const loadGameTypes = async () => {
                    try {
                      const response = await fetchGameTypes()
                      const gameTypesData = response.gameTypes || []
                      const supportedGameTypes = gameTypesData.filter((type) => Number(type._id || type.id) === 1)
                      const mappedGameTypes = supportedGameTypes.map((type) => ({
                        ...type,
                        id: type._id || type.id,
                        _id: String(type._id || type.id),
                        displayName: type.displayName || type.name || "Quay trúng thưởng",
                        description: type.description || "Quay bánh xe để nhận điểm thưởng",
                        icon: "casino",
                        isSupported: true,
                      }))
                      setGameTypes(mappedGameTypes)
                      setError(null)
                    } catch (err) {
                      setError(err.message || "Không thể tải danh sách trò chơi")
                    } finally {
                      setLoading(false)
                    }
                  }
                  loadGameTypes()
                }}
              >
                <Text style={styles.retryButtonText}>Thử lại</Text>
              </TouchableOpacity>
            </View>
          ) : gameTypes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="games" size={48} color="#BDBDBD" />
              <Text style={styles.emptyText}>Không có trò chơi nào khả dụng.</Text>
            </View>
          ) : (
            <>
              <View style={styles.infoContainer}>
                <MaterialIcons name="info-outline" size={20} color="#2196F3" />
                <Text style={styles.infoText}>Chơi game để nhận điểm thưởng! Điểm có thể sử dụng để mua sắm.</Text>
              </View>

              <FlatList
                data={gameTypes}
                renderItem={renderGameType}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
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
  headerRight: {
    flexDirection: "row",
  },
  historyButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoText: {
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
    marginBottom: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  disabledGameCard: {
    backgroundColor: "#f5f5f5",
    opacity: 0.6,
  },
  gameIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  gameDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  disabledText: {
    color: "#BDBDBD",
  },
  statusBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "500",
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
    marginTop: 12,
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 12,
  },
})

export default MiniGameListScreen
