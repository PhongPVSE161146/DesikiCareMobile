import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from "axios"
import { API_URL_LOGIN } from "@env"

// Chỉ có spin wheel game
const GAME_TYPES = {
  1: "Quay trúng thưởng",
}

// Function to parse and validate spin wheel configJson
const parseSpinWheelConfig = (configJson) => {
  try {
    if (!configJson) {
      console.warn("No configJson provided for spin wheel game")
      return getDefaultSpinConfig()
    }

    // If configJson is already an object, use it directly
    const config = typeof configJson === "string" ? JSON.parse(configJson) : configJson

    // Validate required fields for spin wheel
    const requiredFields = ["numOfSectors", "sectors", "maxSpin"]

    for (const field of requiredFields) {
      if (!config[field]) {
        console.warn(`Missing required field: ${field}, using default config`)
        return getDefaultSpinConfig()
      }
    }

    // Validate sectors array
    if (!Array.isArray(config.sectors) || config.sectors.length !== config.numOfSectors) {
      console.warn("Sectors array length must match numOfSectors, using default config")
      return getDefaultSpinConfig()
    }

    // Validate each sector
    const validatedSectors = config.sectors.map((sector, index) => {
      const requiredSectorFields = ["value", "label", "color"]

      for (const field of requiredSectorFields) {
        if (sector[field] === undefined || sector[field] === null) {
          console.warn(`Sector ${index} missing required field: ${field}`)
          return {
            value: 10,
            label: "10 points",
            color: "#ce2c2c",
            text: "#ffffff",
          }
        }
      }

      return {
        ...sector,
        // Ensure text color exists
        text: sector.text || "#ffffff",
        // Ensure value is number
        value: Number(sector.value) || 0,
      }
    })

    return {
      numOfSectors: Number(config.numOfSectors),
      sectors: validatedSectors,
      maxSpin: Number(config.maxSpin) || 1,
      isDuplicate: config.isDuplicate !== undefined ? Boolean(config.isDuplicate) : true,
      spinDuration: Number(config.spinDuration) || 3000,
      minSpins: Number(config.minSpins) || 3,
      // Additional spin wheel settings
      enableSound: config.enableSound !== undefined ? Boolean(config.enableSound) : true,
      showConfetti: config.showConfetti !== undefined ? Boolean(config.showConfetti) : true,
    }
  } catch (error) {
    console.error("Error parsing spin wheel configJson:", error.message)
    return getDefaultSpinConfig()
  }
}

// Default spin wheel configuration
const getDefaultSpinConfig = () => ({
  numOfSectors: 4,
  sectors: [
    { value: 10, label: "10 points", color: "#ce2c2c", text: "#ffffff" },
    { value: 20, label: "20 points", color: "#2536b1", text: "#ffffff" },
    { value: 30, label: "30 points", color: "#075550", text: "#ffffff" },
    { value: 40, label: "40 points", color: "#ac19f0", text: "#ffffff" },
  ],
  maxSpin: 2,
  isDuplicate: true,
  spinDuration: 3000,
  minSpins: 3,
  enableSound: true,
  showConfetti: true,
})

// Function to fetch all game events
export const fetchGameEvents = async () => {
  try {
    const token = await AsyncStorage.getItem("userToken")
    if (!token) {
      throw new Error("No user token found. Please log in.")
    }

    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }

    console.log("🎮 Fetching game events from:", `${API_URL_LOGIN}/api/Game/gameEvents`)

    const response = await axios.get(`${API_URL_LOGIN}/api/Game/gameEvents`, { headers })

    console.log("🎮 fetchGameEvents raw response:", JSON.stringify(response.data, null, 2))

    const gameEvents = response.data.gameEvents || []

    if (!Array.isArray(gameEvents) || !gameEvents.length) {
      console.warn("⚠️ No game events found in response")
      return { gameEvents: [] }
    }

    const mappedEvents = gameEvents
      .map((eventWrapper, index) => {
        try {
          if (!eventWrapper.gameEvent) {
            console.warn(`⚠️ Invalid game event structure at index ${index}:`, JSON.stringify(eventWrapper, null, 2))
            return null
          }

          const gameEvent = eventWrapper.gameEvent
          const gameTypeId = gameEvent.gameTypeId

          // Only process spin wheel games (gameTypeId = 1)
          if (Number(gameTypeId) !== 1) {
            console.log(`⏭️ Skipping non-spin game with typeId: ${gameTypeId}`)
            return null
          }

          // Parse and validate configJson for spin wheel
          const parsedConfig = parseSpinWheelConfig(gameEvent.configJson)

          // Check if event is currently active
          const now = new Date()
          const startDate = new Date(gameEvent.startDate)
          const endDate = new Date(gameEvent.endDate)
          const isActive = now >= startDate && now <= endDate && !gameEvent.isDeactivated

          // Calculate user plays and remaining plays
          const userRewards = eventWrapper.gameEventRewardResults || []
          const totalPlays = userRewards.length
          const maxPlays = parsedConfig.maxSpin
          const remainingPlays = Math.max(0, maxPlays - totalPlays)

          // Calculate total points earned
          const totalPointsEarned = userRewards.reduce((sum, rewardWrapper) => {
            const reward = rewardWrapper.gameEventRewardResult || rewardWrapper
            return sum + (Number(reward.points) || 0)
          }, 0)

          return {
            ...eventWrapper,
            gameEvent: {
              ...gameEvent,
              // Enhanced properties
              gameTypeName: GAME_TYPES[1], // Always "Quay trúng thưởng"
              parsedConfig: parsedConfig,
              isActive: isActive,
              remainingPlays: remainingPlays,
              totalPlays: totalPlays,
              maxPlays: maxPlays,
              totalPointsEarned: totalPointsEarned,

              // Formatted dates
              formattedStartDate: startDate.toLocaleDateString("vi-VN"),
              formattedEndDate: endDate.toLocaleDateString("vi-VN"),
              formattedStartTime: startDate.toLocaleString("vi-VN"),
              formattedEndTime: endDate.toLocaleString("vi-VN"),

              // Status calculations
              status: getGameEventStatus(gameEvent, now, startDate, endDate, remainingPlays),
              remainingTimeText: getRemainingTimeText(endDate, now),

              // Spin wheel specific
              canSpin: isActive && remainingPlays > 0,
              nextSpinAvailable: remainingPlays > 0,
            },

            // Include additional data
            gameTypeImageUrls: eventWrapper.gameTypeImageUrls || [],
            gameEventRewardResults: userRewards.map((rewardWrapper) => ({
              ...rewardWrapper,
              gameEventRewardResult: {
                ...(rewardWrapper.gameEventRewardResult || rewardWrapper),
                formattedDate: new Date(
                  rewardWrapper.gameEventRewardResult?.createdAt || rewardWrapper.createdAt,
                ).toLocaleDateString("vi-VN"),
                formattedTime: new Date(
                  rewardWrapper.gameEventRewardResult?.createdAt || rewardWrapper.createdAt,
                ).toLocaleTimeString("vi-VN"),
                formattedDateTime: new Date(
                  rewardWrapper.gameEventRewardResult?.createdAt || rewardWrapper.createdAt,
                ).toLocaleString("vi-VN"),
              },
            })),
          }
        } catch (error) {
          console.error(`❌ Error processing game event at index ${index}:`, error.message)
          return null
        }
      })
      .filter(Boolean) // Remove null entries

    // Sort events: active first, then by start date (newest first)
    const sortedEvents = mappedEvents.sort((a, b) => {
      // Active events first
      if (a.gameEvent.isActive !== b.gameEvent.isActive) {
        return b.gameEvent.isActive - a.gameEvent.isActive
      }
      // Then by start date (newest first)
      return new Date(b.gameEvent.startDate) - new Date(a.gameEvent.startDate)
    })

    console.log(`✅ Successfully processed ${sortedEvents.length} spin wheel game events`)

    return { gameEvents: sortedEvents }
  } catch (error) {
    console.error("❌ Error fetching game events:", error.response?.data || error.message)
    throw new Error(error.response?.data?.message || "Lỗi kết nối. Vui lòng thử lại.")
  }
}

// Function to fetch a specific game event by ID
export const fetchGameEventById = async (gameEventId) => {
  try {
    const token = await AsyncStorage.getItem("userToken")
    if (!token) {
      throw new Error("No user token found. Please log in.")
    }

    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }

    console.log("🎮 Fetching game event by ID:", gameEventId)

    const response = await axios.get(`${API_URL_LOGIN}/api/Game/gameEvents/${gameEventId}`, { headers })

    console.log("🎮 fetchGameEventById response:", JSON.stringify(response.data, null, 2))

    const eventData = response.data
    const gameEvent = eventData.gameEvent

    if (!gameEvent) {
      throw new Error("Game event not found in response")
    }

    if (!gameEvent.gameTypeId) {
      throw new Error("Game event missing gameTypeId")
    }

    // Only process spin wheel games
    if (Number(gameEvent.gameTypeId) !== 1) {
      throw new Error("This game type is not supported. Only spin wheel games are available.")
    }

    // Parse and validate configJson for spin wheel
    const parsedConfig = parseSpinWheelConfig(gameEvent.configJson)

    // Check if event is currently active
    const now = new Date()
    const startDate = new Date(gameEvent.startDate)
    const endDate = new Date(gameEvent.endDate)
    const isActive = now >= startDate && now <= endDate && !gameEvent.isDeactivated

    // Calculate user plays and remaining plays
    const userRewards = eventData.gameEventRewardResults || []
    const totalPlays = userRewards.length
    const maxPlays = parsedConfig.maxSpin
    const remainingPlays = Math.max(0, maxPlays - totalPlays)

    // Calculate total points earned
    const totalPointsEarned = userRewards.reduce((sum, rewardWrapper) => {
      const reward = rewardWrapper.gameEventRewardResult || rewardWrapper
      return sum + (Number(reward.points) || 0)
    }, 0)

    const enhancedGameEvent = {
      ...gameEvent,
      // Enhanced properties
      gameTypeName: GAME_TYPES[1],
      parsedConfig: parsedConfig,
      isActive: isActive,
      remainingPlays: remainingPlays,
      totalPlays: totalPlays,
      maxPlays: maxPlays,
      totalPointsEarned: totalPointsEarned,

      // Formatted dates
      formattedStartDate: startDate.toLocaleDateString("vi-VN"),
      formattedEndDate: endDate.toLocaleDateString("vi-VN"),
      formattedStartTime: startDate.toLocaleString("vi-VN"),
      formattedEndTime: endDate.toLocaleString("vi-VN"),

      // Status calculations
      status: getGameEventStatus(gameEvent, now, startDate, endDate, remainingPlays),
      remainingTimeText: getRemainingTimeText(endDate, now),

      // Spin wheel specific
      canSpin: isActive && remainingPlays > 0,
      nextSpinAvailable: remainingPlays > 0,
    }

    return {
      gameEvent: enhancedGameEvent,
      gameTypeImageUrls: eventData.gameTypeImageUrls || [],
      gameEventRewardResults: userRewards.map((rewardWrapper) => ({
        ...rewardWrapper,
        gameEventRewardResult: {
          ...(rewardWrapper.gameEventRewardResult || rewardWrapper),
          formattedDate: new Date(
            rewardWrapper.gameEventRewardResult?.createdAt || rewardWrapper.createdAt,
          ).toLocaleDateString("vi-VN"),
          formattedTime: new Date(
            rewardWrapper.gameEventRewardResult?.createdAt || rewardWrapper.createdAt,
          ).toLocaleTimeString("vi-VN"),
          formattedDateTime: new Date(
            rewardWrapper.gameEventRewardResult?.createdAt || rewardWrapper.createdAt,
          ).toLocaleString("vi-VN"),
        },
      })),
    }
  } catch (error) {
    // console.error("❌ Error fetching game event:", error.response?.data || error.message)
    throw new Error(error.response?.data?.message || "Lỗi kết nối. Vui lòng thử lại.")
  }
}

// Function to fetch game types
export const fetchGameTypes = async () => {
  try {
    const token = await AsyncStorage.getItem("userToken")
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    console.log("🎮 Fetching game types...")

    const response = await axios.get(`${API_URL_LOGIN}/api/Game/gameTypes`, { headers })

    console.log("🎮 fetchGameTypes response:", JSON.stringify(response.data, null, 2))

    const gameTypes = response.data.gameTypes || []

    // Filter and enhance only spin wheel game type
    const spinWheelGameTypes = gameTypes
      .filter((gameType) => Number(gameType._id) === 1) // Only spin wheel
      .map((gameType) => ({
        ...gameType,
        id: gameType._id,
        name: gameType.name || GAME_TYPES[1] || "Quay trúng thưởng",
        displayName: "Quay trúng thưởng",
        description: "Quay bánh xe để nhận điểm thưởng",
        isSupported: true,
      }))

    console.log(`✅ Found ${spinWheelGameTypes.length} supported game types`)

    return { gameTypes: spinWheelGameTypes }
  } catch (error) {
    console.error("❌ Error fetching game types:", error.response?.data || error.message)
    throw new Error(error.response?.data?.message || "Lỗi kết nối. Vui lòng thử lại.")
  }
}

// Function to fetch user's reward history
export const fetchUserGameRewards = async () => {
  try {
    const token = await AsyncStorage.getItem("userToken")
    if (!token) {
      throw new Error("Vui lòng đăng nhập để xem lịch sử phần thưởng.")
    }

    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }

    console.log("🎮 Fetching user game rewards...")

    const response = await axios.get(`${API_URL_LOGIN}/api/Game/gameEventsRewards/me`, { headers })

    console.log("🎮 fetchUserGameRewards response:", JSON.stringify(response.data, null, 2))

    const rewards = response.data.gameEventRewardResults || []

    const enhancedRewards = rewards
      .filter((rewardWrapper) => {
        // Only include spin wheel game rewards
        const gameEvent = rewardWrapper.gameEvent || {}
        return Number(gameEvent.gameTypeId) === 1
      })
      .map((rewardWrapper) => {
        const reward = rewardWrapper.gameEventRewardResult || rewardWrapper
        const gameEvent = rewardWrapper.gameEvent || {}

        return {
          ...rewardWrapper,
          gameEventRewardResult: {
            ...reward,
            points: Number(reward.points) || 0,
            formattedDate: new Date(reward.createdAt).toLocaleDateString("vi-VN"),
            formattedTime: new Date(reward.createdAt).toLocaleTimeString("vi-VN"),
            formattedDateTime: new Date(reward.createdAt).toLocaleString("vi-VN"),
          },
          gameEvent: {
            ...gameEvent,
            gameTypeName: GAME_TYPES[1] || "Quay trúng thưởng",
            formattedStartDate: new Date(gameEvent.startDate).toLocaleDateString("vi-VN"),
            formattedEndDate: new Date(gameEvent.endDate).toLocaleDateString("vi-VN"),
          },
        }
      })

    // Sort by creation date (newest first)
    enhancedRewards.sort((a, b) => {
      const dateA = new Date(a.gameEventRewardResult?.createdAt || 0)
      const dateB = new Date(b.gameEventRewardResult?.createdAt || 0)
      return dateB - dateA
    })

    // Calculate statistics
    const totalRewards = enhancedRewards.length
    const totalPoints = enhancedRewards.reduce((sum, rewardWrapper) => {
      return sum + (rewardWrapper.gameEventRewardResult?.points || 0)
    }, 0)

    console.log(`✅ Found ${totalRewards} spin wheel rewards, total ${totalPoints} points`)

    return {
      gameEventRewardResults: enhancedRewards,
      statistics: {
        totalRewards,
        totalPoints,
        averagePoints: totalRewards > 0 ? Math.round(totalPoints / totalRewards) : 0,
      },
    }
  } catch (error) {
    console.error("❌ Error fetching user rewards:", error.response?.data || error.message)
    throw new Error(error.response?.data?.message || "Lỗi kết nối. Vui lòng thử lại.")
  }
}

// Function to add a game event reward (spin result)
export const addGameEventReward = async (gameEventId, points) => {
  try {
    const token = await AsyncStorage.getItem("userToken")
    if (!token) {
      throw new Error("Vui lòng đăng nhập để thêm phần thưởng.")
    }

    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }

    const data = {
      gameEventReward: {
        gameEventId: String(gameEventId),
        points: Number(points),
      },
    }

    console.log("🎮 Adding spin wheel reward:", JSON.stringify(data, null, 2))

    const response = await axios.post(`${API_URL_LOGIN}/api/Game/gameEventsRewards`, data, { headers })

    console.log("🎮 addGameEventReward response:", JSON.stringify(response.data, null, 2))

    return {
      ...response.data,
      success: true,
      message: `🎉 Chúc mừng! Bạn đã quay trúng ${points} điểm!`,
      points: Number(points),
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error("❌ Error adding game event reward:", error.response?.data || error.message)

    // Handle specific error cases
    if (error.response?.status === 400) {
      const errorMessage = error.response?.data?.message || ""
      if (errorMessage.includes("spin") || errorMessage.includes("lượt")) {
        throw new Error("Bạn đã hết lượt quay cho sự kiện này.")
      }
      throw new Error("Không thể thêm phần thưởng. Vui lòng kiểm tra lại.")
    } else if (error.response?.status === 404) {
      throw new Error("Sự kiện quay thưởng không tồn tại hoặc đã kết thúc.")
    } else if (error.response?.status === 401) {
      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.")
    } else if (error.response?.status === 403) {
      throw new Error("Bạn không có quyền tham gia sự kiện này.")
    }

    throw new Error(error.response?.data?.message || "Lỗi khi lưu kết quả quay. Vui lòng thử lại.")
  }
}

// Helper function to get game event status
const getGameEventStatus = (gameEvent, now, startDate, endDate, remainingPlays) => {
  if (gameEvent.isDeactivated) return "deactivated"
  if (now < startDate) return "upcoming"
  if (now > endDate) return "ended"
  if (remainingPlays <= 0) return "no_spins_left"
  return "active"
}

// Helper function to check if user can spin
export const canSpinWheel = (gameEvent) => {
  if (!gameEvent) return false
  return gameEvent.isActive && gameEvent.remainingPlays > 0
}

// Helper function to get game event status text
export const getGameEventStatusText = (gameEvent) => {
  if (!gameEvent) return "Không xác định"

  switch (gameEvent.status) {
    case "deactivated":
      return "Đã tắt"
    case "upcoming":
      return "Sắp diễn ra"
    case "ended":
      return "Đã kết thúc"
    case "no_spins_left":
      return "Hết lượt quay"
    case "active":
      return "Đang diễn ra"
    default:
      return "Không xác định"
  }
}

// Helper function to get remaining time text
export const getRemainingTimeText = (endDate, now = new Date()) => {
  if (now > endDate) return "Đã kết thúc"

  const diffTime = endDate - now
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays > 1) return `Còn ${diffDays} ngày`
  if (diffDays === 1) return "Còn 1 ngày"

  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60))
  if (diffHours > 1) return `Còn ${diffHours} giờ`

  const diffMinutes = Math.ceil(diffTime / (1000 * 60))
  if (diffMinutes > 1) return `Còn ${diffMinutes} phút`

  return "Sắp kết thúc"
}

// Helper function to get spin wheel sector by value
export const getSpinWheelSectorByValue = (gameEvent, value) => {
  if (!gameEvent?.parsedConfig?.sectors) return null

  return gameEvent.parsedConfig.sectors.find((sector) => sector.value === value) || null
}

// Helper function to validate spin result
export const validateSpinResult = (gameEvent, resultValue) => {
  if (!gameEvent?.parsedConfig?.sectors) return false

  const validValues = gameEvent.parsedConfig.sectors.map((sector) => sector.value)
  return validValues.includes(Number(resultValue))
}

// Helper function to get random spin result (for testing)
export const getRandomSpinResult = (gameEvent) => {
  if (!gameEvent?.parsedConfig?.sectors) return null

  const sectors = gameEvent.parsedConfig.sectors
  const randomIndex = Math.floor(Math.random() * sectors.length)
  return sectors[randomIndex]
}
