import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Alert, ActivityIndicator, BackHandler } from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import { MaterialIcons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import {
  fetchGameEvents,
  addGameEventReward,
  canSpinWheel,
  getGameEventStatusText,
  validateSpinResult,
} from "../../config/axios/MiniGame/minigameService"
import { Easing } from "react-native"

const SpinWheelGameScreen = () => {
  const route = useRoute()
  const navigation = useNavigation()
  const { gameTypeId, gameTypeName } = route.params || {}

  // Game state
  const [gameEvent, setGameEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [result, setResult] = useState(null)
  const [pointsEarned, setPointsEarned] = useState(null)
  const [hasClaimedReward, setHasClaimedReward] = useState(false)

  // Animations
  const spinAnimation = useRef(new Animated.Value(0)).current
  const buttonScale = useRef(new Animated.Value(1)).current
  const resultOpacity = useRef(new Animated.Value(0)).current
  const confettiAnimations = useRef(
    Array(12)
      .fill()
      .map(() => ({
        opacity: new Animated.Value(0),
        scale: new Animated.Value(0),
        translateX: new Animated.Value(0),
        translateY: new Animated.Value(0),
        rotation: new Animated.Value(0),
      })),
  ).current

  const totalRotation = useRef(0)

  // Load game event data
  useEffect(() => {
    const loadGameEvent = async () => {
      try {
        setLoading(true)
        const response = await fetchGameEvents()
        const gameEvents = response.gameEvents || []

        // Process game events and filter only spin wheel games
        const spinWheelEvents = gameEvents.filter((eventWrapper) => {
          const event = eventWrapper.gameEvent
          if (!event) return false

          const typeId = Number(event.gameTypeId)
          if (typeId !== 1) {
            return false
          }

          return event.isActive && event.canSpin
        })

        if (spinWheelEvents.length === 0) {
          throw new Error("Không tìm thấy sự kiện quay thưởng đang hoạt động")
        }

        // Get the first active spin wheel event
        const activeEvent = spinWheelEvents[0]
        setGameEvent(activeEvent.gameEvent)
        setError(null)
        setHasClaimedReward(false)
      } catch (err) {
        const errorMessage = err.message || "Không thể tải cấu hình trò chơi"
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    if (gameTypeId) {
      loadGameEvent()
    } else {
      setError("ID loại trò chơi không hợp lệ")
      setLoading(false)
    }
  }, [gameTypeId])

  // Button pulse animation
  useEffect(() => {
    if (!isSpinning && gameEvent && canSpinWheel(gameEvent) && !hasClaimedReward) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(buttonScale, {
            toValue: 1.05,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(buttonScale, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      )
      pulseAnimation.start()
      return () => pulseAnimation.stop()
    }
  }, [isSpinning, gameEvent, hasClaimedReward])

  // Confetti animation
  useEffect(() => {
    if (result && pointsEarned > 0) {
      confettiAnimations.forEach((anim, index) => {
        const angle = (index * 2 * Math.PI) / confettiAnimations.length
        const distance = 120 + Math.random() * 80

        // Reset values
        anim.opacity.setValue(0)
        anim.scale.setValue(0)
        anim.translateX.setValue(0)
        anim.translateY.setValue(0)
        anim.rotation.setValue(0)

        Animated.parallel([
          Animated.sequence([
            Animated.timing(anim.opacity, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(anim.opacity, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(anim.scale, {
            toValue: 1 + Math.random() * 0.5,
            duration: 1300,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(anim.translateX, {
            toValue: distance * Math.cos(angle) * (0.8 + Math.random() * 0.4),
            duration: 1300,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(anim.translateY, {
            toValue: distance * Math.sin(angle) * (0.8 + Math.random() * 0.4),
            duration: 1300,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(anim.rotation, {
            toValue: (Math.random() - 0.5) * 720,
            duration: 1300,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start()
      })
    }
  }, [result, pointsEarned])

  // Handle back button
  useEffect(() => {
    const backAction = () => {
      if (isSpinning) {
        Alert.alert("Thông báo", "Vui lòng đợi quay xong trước khi thoát.")
        return true
      }
      return false
    }

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction)
    return () => backHandler.remove()
  }, [isSpinning])

  const spin = async () => {
    if (!gameEvent) {
      Alert.alert("Lỗi", "Không tìm thấy thông tin sự kiện trò chơi")
      return
    }

    if (isSpinning) {
      Alert.alert("Thông báo", "Đang quay, vui lòng đợi.")
      return
    }

    if (hasClaimedReward) {
      Alert.alert("Thông báo", "Bạn đã nhận thưởng cho sự kiện này rồi.")
      return
    }

    if (!canSpinWheel(gameEvent)) {
      const statusText = getGameEventStatusText(gameEvent)
      Alert.alert("Không thể quay", `Trạng thái: ${statusText}`)
      return
    }

    const config = gameEvent.parsedConfig
    const sectors = config.sectors || []

    if (sectors.length === 0) {
      Alert.alert("Lỗi", "Cấu hình vòng quay không hợp lệ")
      return
    }

    // Filter sectors based on remaining plays to show progressive reduction
    let availableSectors = sectors
    const remainingPlays = gameEvent.remainingPlays || 0

    if (remainingPlays <= 3 && remainingPlays > 2) {
      availableSectors = sectors.slice(0, 3)
    } else if (remainingPlays <= 2 && remainingPlays > 1) {
      availableSectors = sectors.slice(0, 2)
    } else if (remainingPlays <= 1) {
      availableSectors = sectors.slice(0, 1)
    }

    const randomIndex = Math.floor(Math.random() * availableSectors.length)
    const selectedSector = availableSectors[randomIndex]
    const degreesPerSector = 360 / sectors.length

    const originalIndex = sectors.findIndex((s) => s.label === selectedSector.label)
    const targetAngle = 360 - (originalIndex * degreesPerSector + degreesPerSector / 2)
    const extraRotations = 360 * (config.minSpins || 5)
    const finalRotation = totalRotation.current + extraRotations + targetAngle

    setIsSpinning(true)
    setResult(null)
    setPointsEarned(null)
    resultOpacity.setValue(0)

    Animated.timing(spinAnimation, {
      toValue: finalRotation,
      duration: config.spinDuration || 4000,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start(async () => {
      totalRotation.current = finalRotation
      const points = selectedSector.value || 0
      const label = selectedSector.label || "Không xác định"

      setIsSpinning(false)
      setResult(label)
      setPointsEarned(points)

      Animated.timing(resultOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start()

      if (!validateSpinResult(gameEvent, points)) {
        Alert.alert("Lỗi", "Kết quả quay không hợp lệ. Vui lòng thử lại.")
        return
      }

      try {
        const response = await addGameEventReward(gameEvent._id, points)
        if (response.success || response.message.includes("successfully")) {
          setHasClaimedReward(true)
          setGameEvent((prev) => ({
            ...prev,
            remainingPlays: Math.max(0, prev.remainingPlays - 1),
            totalPlays: prev.totalPlays + 1,
            totalPointsEarned: prev.totalPointsEarned + points,
            canSpin: prev.remainingPlays > 1,
          }))

          const message =
            points > 0 ? `🎉 Chúc mừng! Bạn đã nhận được ${points} điểm!` : `😔 ${label}. Chúc bạn may mắn lần sau!`

          setTimeout(() => {
            Alert.alert("Kết quả", message, [
              {
                text: "OK",
                onPress: () => {
                  if (gameEvent.remainingPlays > 1) {
                    setHasClaimedReward(false)
                    setResult(null)
                    setPointsEarned(null)
                  }
                },
              },
            ])
          }, 500)
        } else {
          throw new Error(response.message || "Failed to save reward")
        }
      } catch (error) {
        if (error.message && error.message.includes("already received reward")) {
          setHasClaimedReward(true)
          Alert.alert("Thông báo", "Bạn đã nhận thưởng cho lượt quay này rồi. Vui lòng chờ lượt quay tiếp theo.", [
            {
              text: "OK",
              onPress: () => {
                const loadGameEvent = async () => {
                  try {
                    const response = await fetchGameEvents()
                    const gameEvents = response.gameEvents || []
                    const activeEvent = gameEvents.find((eventWrapper) => {
                      const event = eventWrapper.gameEvent
                      return event && Number(event.gameTypeId) === 1 && event.isActive
                    })

                    if (activeEvent) {
                      setGameEvent(activeEvent.gameEvent)
                      setHasClaimedReward(false)
                    }
                  } catch (err) {
                    // Handle error silently or log it
                  }
                }
                loadGameEvent()
              },
            },
          ])
        } else {
          Alert.alert("Lỗi", "Không thể lưu kết quả. Vui lòng thử lại.")
        }
      }
    })
  }

  // Custom wheel rendering without SVG
  const renderWheel = () => {
    if (!gameEvent || !gameEvent.parsedConfig) return null

    const config = gameEvent.parsedConfig
    const sectors = config.sectors || []
    const numSectors = sectors.length
    const remainingPlays = gameEvent.remainingPlays || 0

    return (
      <View style={styles.wheelSectors}>
        {sectors.map((sector, index) => {
          const rotation = (360 / numSectors) * index
          let shouldDim = false
          if (remainingPlays <= 3 && index >= 3) shouldDim = true
          if (remainingPlays <= 2 && index >= 2) shouldDim = true
          if (remainingPlays <= 1 && index >= 1) shouldDim = true

          const sectorStyle = {
            transform: [{ rotate: `${rotation}deg` }],
            backgroundColor: shouldDim ? "#CCCCCC" : sector.color,
            opacity: shouldDim ? 0.5 : 1,
          }

          return (
            <View key={index} style={[styles.sector, sectorStyle]}>
              <View style={styles.sectorContent}>
                <Text
                  style={[
                    styles.sectorText,
                    {
                      color: shouldDim ? "#666666" : sector.text,
                      opacity: shouldDim ? 0.7 : 1,
                    },
                  ]}
                >
                  {shouldDim ? "Đã hết" : sector.label}
                </Text>
              </View>
            </View>
          )
        })}
      </View>
    )
  }

  const renderConfetti = () => {
    return confettiAnimations.map((anim, index) => (
      <Animated.View
        key={index}
        style={[
          styles.confetti,
          {
            opacity: anim.opacity,
            transform: [
              { scale: anim.scale },
              { translateX: anim.translateX },
              { translateY: anim.translateY },
              {
                rotate: anim.rotation.interpolate({
                  inputRange: [0, 360],
                  outputRange: ["0deg", "360deg"],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.confettiText}>{["🎉", "✨", "🎊", "⭐", "💫"][index % 5]}</Text>
      </Animated.View>
    ))
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Đang tải vòng quay...</Text>
          </View>
        </View>
      </SafeAreaView>
    )
  }

  if (error || !gameEvent) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.container}>
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={64} color="#ff4444" />
            <Text style={styles.errorText}>{error || "Không thể tải trò chơi"}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
              <Text style={styles.retryButtonText}>Quay lại</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    )
  }

  const config = gameEvent.parsedConfig
  const canSpin = canSpinWheel(gameEvent) && !hasClaimedReward && !isSpinning

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{gameEvent.eventName || "Quay trúng thưởng"}</Text>
          <TouchableOpacity onPress={() => navigation.navigate("GameRewardHistoryScreen")} style={styles.historyButton}>
            <MaterialIcons name="history" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Game Info */}
        <View style={styles.gameInfo}>
          <Text style={styles.gameInfoText}>
            Lượt quay còn lại: <Text style={styles.gameInfoHighlight}>{gameEvent.remainingPlays}</Text>
          </Text>
          <Text style={styles.gameInfoText}>
            Tổng điểm đã nhận: <Text style={styles.gameInfoHighlight}>{gameEvent.totalPointsEarned}</Text>
          </Text>
        </View>

        {/* Wheel Container */}
        {gameEvent.remainingPlays > 0 ? (
          <View style={styles.wheelContainer}>
            <Animated.View
              style={[
                styles.wheel,
                {
                  transform: [
                    {
                      rotate: spinAnimation.interpolate({
                        inputRange: [0, 360],
                        outputRange: ["0deg", "360deg"],
                      }),
                    },
                  ],
                },
              ]}
            >
              {renderWheel()}
            </Animated.View>

            {/* Pointer */}
            <View style={styles.pointer} />

            {/* Confetti */}
            {result && pointsEarned > 0 && renderConfetti()}
          </View>
        ) : (
          <View style={styles.noSpinsContainer}>
            <MaterialIcons name="info-outline" size={64} color="#666" />
            <Text style={styles.noSpinsText}>Bạn đã hết lượt quay!</Text>
          </View>
        )}

        {/* Result */}
        {result && (
          <Animated.View style={[styles.resultContainer, { opacity: resultOpacity }]}>
            <Text style={styles.resultLabel}>Kết quả:</Text>
            <Text style={styles.resultText}>{result}</Text>
            <Text style={styles.pointsText}>
              {pointsEarned > 0 ? `+${pointsEarned} điểm` : "Chúc bạn may mắn lần sau!"}
            </Text>
          </Animated.View>
        )}

        {/* Spin Button */}
        <Animated.View style={[styles.spinButtonContainer, { transform: [{ scale: buttonScale }] }]}>
          <TouchableOpacity
            style={[styles.spinButton, !canSpin && styles.disabledButton]}
            onPress={spin}
            disabled={!canSpin}
          >
            {isSpinning ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <MaterialIcons name="casino" size={24} color="#fff" />
            )}
            <Text style={styles.spinButtonText}>
              {isSpinning ? "ĐANG QUAY..." : hasClaimedReward ? "ĐÃ NHẬN THƯỞNG" : "QUAY NGAY"}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Game Status */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            Trạng thái: <Text style={styles.statusHighlight}>{getGameEventStatusText(gameEvent)}</Text>
          </Text>
          {gameEvent.remainingTimeText && <Text style={styles.statusText}>{gameEvent.remainingTimeText}</Text>}
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
    backgroundColor: "#FFF8E1",
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
  gameInfo: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    elevation: 2,
  },
  gameInfoText: {
    fontSize: 14,
    color: "#666",
  },
  gameInfoHighlight: {
    fontWeight: "bold",
    color: "#4CAF50",
  },
  wheelContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
    position: "relative",
  },
  wheel: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "#fff",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    borderWidth: 4,
    borderColor: "#FFD700",
    overflow: "hidden",
  },
  wheelSectors: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  sector: {
    position: "absolute",
    width: "50%",
    height: "50%",
    top: "50%",
    left: "50%",
    transformOrigin: "0 0",
    borderWidth: 1,
    borderColor: "#fff",
  },
  sectorContent: {
    position: "absolute",
    top: "20%",
    left: "20%",
    right: "20%",
    alignItems: "center",
    justifyContent: "center",
  },
  sectorText: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  pointer: {
    position: "absolute",
    top: -10,
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 30,
    borderStyle: "solid",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#FF5722",
    zIndex: 10,
  },
  confetti: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  confettiText: {
    fontSize: 24,
  },
  resultContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    elevation: 3,
    marginBottom: 16,
  },
  resultLabel: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
  },
  resultText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  pointsText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  spinButtonContainer: {
    alignItems: "center",
    marginHorizontal: 16,
  },
  spinButton: {
    backgroundColor: "#FF5722",
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    minWidth: 200,
  },
  disabledButton: {
    backgroundColor: "#BDBDBD",
  },
  spinButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  statusContainer: {
    alignItems: "center",
    marginTop: 16,
    paddingHorizontal: 16,
  },
  statusText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  statusHighlight: {
    fontWeight: "bold",
    color: "#4CAF50",
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
  noSpinsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  noSpinsText: {
    fontSize: 18,
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
})

export default SpinWheelGameScreen