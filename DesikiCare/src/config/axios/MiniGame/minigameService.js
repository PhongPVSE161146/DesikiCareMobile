import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from "axios"
import { API_URL_LOGIN } from "@env"

// Define game types
const GAME_TYPES = {
  1: "Quay trúng thưởng",
  2: "Cào thẻ",
  3: "MemoryCatching",
}

// Function to parse and validate spin wheel configJson
const parseSpinWheelConfig = (configJson) => {
  try {
    if (!configJson) {
      return getDefaultSpinConfig()
    }

    const config = typeof configJson === "string" ? JSON.parse(configJson) : configJson

    const requiredFields = ["numOfSectors", "sectors", "maxSpin"]

    for (const field of requiredFields) {
      if (!config[field]) {
        return getDefaultSpinConfig()
      }
    }

    if (!Array.isArray(config.sectors) || config.sectors.length !== config.numOfSectors) {
      return getDefaultSpinConfig()
    }

    const validatedSectors = config.sectors.map((sector) => {
      const requiredSectorFields = ["value", "label", "color"]

      for (const field of requiredSectorFields) {
        if (sector[field] === undefined || sector[field] === null) {
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
        text: sector.text || "#ffffff",
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
      enableSound: config.enableSound !== undefined ? Boolean(config.enableSound) : true,
      showConfetti: config.showConfetti !== undefined ? Boolean(config.showConfetti) : true,
    }
  } catch (error) {
    return getDefaultSpinConfig()
  }
}

// Function to parse and validate scratch card configJson
const parseScratchCardConfig = (configJson) => {
  try {
    if (!configJson) {
      return getDefaultScratchCardConfig()
    }

    const config = typeof configJson === "string" ? JSON.parse(configJson) : configJson

    const requiredFields = ["numOfScratchs", "maxScratch", "backCoverImg", "cards"]

    for (const field of requiredFields) {
      if (!config[field]) {
        return getDefaultScratchCardConfig()
      }
    }

    if (!Array.isArray(config.cards) || config.cards.length < 1) {
      return getDefaultScratchCardConfig()
    }

    const validatedCards = config.cards.map((card) => {
      const requiredCardFields = ["label", "text", "img", "point"]

      for (const field of requiredCardFields) {
        if (card[field] === undefined || card[field] === null) {
          return {
            label: "10 points",
            text: "#ffffff",
            img: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwADZQGO4rB7WQAAAABJRU5ErkJggg==",
            point: 10,
          }
        }
      }

      return {
        ...card,
        point: Number(card.point) || 0,
      }
    })

    return {
      numOfScratchs: Number(config.numOfScratchs) || 3,
      maxScratch: Number(config.maxScratch) || 2,
      backCoverImg: config.backCoverImg,
      cards: validatedCards,
      enableSound: config.enableSound !== undefined ? Boolean(config.enableSound) : true,
    }
  } catch (error) {
    return getDefaultScratchCardConfig()
  }
}

// Function to parse and validate memory catching configJson
const parseMemoryCatchingConfig = (configJson) => {
  try {
    if (!configJson) {
      return getDefaultMemoryCatchingConfig()
    }

    const config = typeof configJson === "string" ? JSON.parse(configJson) : configJson

    const requiredFields = ["numOfPairs", "backCoverImg", "originalPoint", "minusPoint", "pairs"]

    for (const field of requiredFields) {
      if (!config[field]) {
        return getDefaultMemoryCatchingConfig()
      }
    }

    if (!Array.isArray(config.pairs) || config.pairs.length !== config.numOfPairs * 2) {
      return getDefaultMemoryCatchingConfig()
    }

    const validatedPairs = config.pairs.map((pair) => {
      if (!pair.img) {
        return {
          img: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwADZQGO4rB7WQAAAABJRU5ErkJggg==",
        }
      }

      return {
        ...pair,
      }
    })

    return {
      numOfPairs: Number(config.numOfPairs) || 2,
      backCoverImg: config.backCoverImg,
      originalPoint: Number(config.originalPoint) || 100,
      minusPoint: Number(config.minusPoint) || 10,
      pairs: validatedPairs,
      enableSound: config.enableSound !== undefined ? Boolean(config.enableSound) : true,
    }
  } catch (error) {
    return getDefaultMemoryCatchingConfig()
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

// Default scratch card configuration
const getDefaultScratchCardConfig = () => ({
  numOfScratchs: 3,
  maxScratch: 2,
  backCoverImg: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwADZQGO4rB7WQAAAABJRU5ErkJggg==",
  cards: [
    { label: "10 points", text: "#ffffff", img: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwADZQGO4rB7WQAAAABJRU5ErkJggg==", point: 10 },
    { label: "20 points", text: "#ffffff", img: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwADZQGO4rB7WQAAAABJRU5ErkJggg==", point: 20 },
    { label: "50 points", text: "#ffffff", img: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwADZQGO4rB7WQAAAABJRU5ErkJggg==", point: 50 },
  ],
  enableSound: true,
})

// Default memory catching configuration
const getDefaultMemoryCatchingConfig = () => ({
  numOfPairs: 2,
  backCoverImg: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwADZQGO4rB7WQAAAABJRU5ErkJggg==",
  originalPoint: 100,
  minusPoint: 10,
  pairs: [
    { img: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwADZQGO4rB7WQAAAABJRU5ErkJggg==" },
    { img: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwADZQGO4rB7WQAAAABJRU5ErkJggg==" },
    { img: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAE5AGOr3Z3YgAAAABJRU5ErkJggg==" },
    { img: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAE5AGOr3Z3YgAAAABJRU5ErkJggg==" },
  ],
  enableSound: true,
})

// Function to parse config based on game type
const parseGameConfig = (gameTypeId, configJson) => {
  switch (Number(gameTypeId)) {
    case 1:
      return parseSpinWheelConfig(configJson)
    case 2:
      return parseScratchCardConfig(configJson)
    case 3:
      return parseMemoryCatchingConfig(configJson)
    default:
      throw new Error("Unsupported game type")
  }
}

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

    const response = await axios.get(`${API_URL_LOGIN}/api/Game/gameEvents`, { headers })

    const gameEvents = response.data.gameEvents || []

    if (!Array.isArray(gameEvents) || !gameEvents.length) {
      return { gameEvents: [] }
    }

    const mappedEvents = gameEvents
      .map((eventWrapper) => {
        try {
          if (!eventWrapper.gameEvent) {
            return null
          }

          const gameEvent = eventWrapper.gameEvent
          const gameTypeId = Number(gameEvent.gameTypeId)

          if (![1, 2, 3].includes(gameTypeId)) {
            return null
          }

          const parsedConfig = parseGameConfig(gameTypeId, gameEvent.configJson)

          const now = new Date()
          const startDate = new Date(gameEvent.startDate)
          const endDate = new Date(gameEvent.endDate)
          const isActive = now >= startDate && now <= endDate && !gameEvent.isDeactivated

          const userRewards = eventWrapper.gameEventRewardResults || []
          const totalPlays = userRewards.length
          const maxPlays = gameTypeId === 1 ? parsedConfig.maxSpin : gameTypeId === 2 ? parsedConfig.maxScratch : parsedConfig.numOfPairs
          const remainingPlays = Math.max(0, maxPlays - totalPlays)

          const totalPointsEarned = userRewards.reduce((sum, rewardWrapper) => {
            const reward = rewardWrapper.gameEventRewardResult || rewardWrapper
            return sum + (Number(reward.points) || 0)
          }, 0)

          return {
            ...eventWrapper,
            gameEvent: {
              ...gameEvent,
              gameTypeName: GAME_TYPES[gameTypeId],
              parsedConfig: parsedConfig,
              isActive: isActive,
              remainingPlays: remainingPlays,
              totalPlays: totalPlays,
              maxPlays: maxPlays,
              totalPointsEarned: totalPointsEarned,
              formattedStartDate: startDate.toLocaleDateString("vi-VN"),
              formattedEndDate: endDate.toLocaleDateString("vi-VN"),
              formattedStartTime: startDate.toLocaleString("vi-VN"),
              formattedEndTime: endDate.toLocaleString("vi-VN"),
              status: getGameEventStatus(gameEvent, now, startDate, endDate, remainingPlays),
              remainingTimeText: getRemainingTimeText(endDate, now),
              canPlay: isActive && remainingPlays > 0,
              nextPlayAvailable: remainingPlays > 0,
            },
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
          return null
        }
      })
      .filter(Boolean)

    const sortedEvents = mappedEvents.sort((a, b) => {
      if (a.gameEvent.isActive !== b.gameEvent.isActive) {
        return b.gameEvent.isActive - a.gameEvent.isActive
      }
      return new Date(b.gameEvent.startDate) - new Date(a.gameEvent.startDate)
    })

    return { gameEvents: sortedEvents }
  } catch (error) {
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

    const response = await axios.get(`${API_URL_LOGIN}/api/Game/gameEvents/${gameEventId}`, { headers })

    const eventData = response.data
    const gameEvent = eventData.gameEvent

    if (!gameEvent) {
      throw new Error("Game event not found in response")
    }

    if (!gameEvent.gameTypeId) {
      throw new Error("Game event missing gameTypeId")
    }

    const gameTypeId = Number(gameEvent.gameTypeId)
    if (![1, 2, 3].includes(gameTypeId)) {
      throw new Error("This game type is not supported.")
    }

    const parsedConfig = parseGameConfig(gameTypeId, gameEvent.configJson)

    const now = new Date()
    const startDate = new Date(gameEvent.startDate)
    const endDate = new Date(gameEvent.endDate)
    const isActive = now >= startDate && now <= endDate && !gameEvent.isDeactivated

    const userRewards = eventData.gameEventRewardResults || []
    const totalPlays = userRewards.length
    const maxPlays = gameTypeId === 1 ? parsedConfig.maxSpin : gameTypeId === 2 ? parsedConfig.maxScratch : parsedConfig.numOfPairs
    const remainingPlays = Math.max(0, maxPlays - totalPlays)

    const totalPointsEarned = userRewards.reduce((sum, rewardWrapper) => {
      const reward = rewardWrapper.gameEventRewardResult || rewardWrapper
      return sum + (Number(reward.points) || 0)
    }, 0)

    const enhancedGameEvent = {
      ...gameEvent,
      gameTypeName: GAME_TYPES[gameTypeId],
      parsedConfig: parsedConfig,
      isActive: isActive,
      remainingPlays: remainingPlays,
      totalPlays: totalPlays,
      maxPlays: maxPlays,
      totalPointsEarned: totalPointsEarned,
      formattedStartDate: startDate.toLocaleDateString("vi-VN"),
      formattedEndDate: endDate.toLocaleDateString("vi-VN"),
      formattedStartTime: startDate.toLocaleString("vi-VN"),
      formattedEndTime: endDate.toLocaleString("vi-VN"),
      status: getGameEventStatus(gameEvent, now, startDate, endDate, remainingPlays),
      remainingTimeText: getRemainingTimeText(endDate, now),
      canPlay: isActive && remainingPlays > 0,
      nextPlayAvailable: remainingPlays > 0,
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

    const response = await axios.get(`${API_URL_LOGIN}/api/Game/gameTypes`, { headers })

    const gameTypes = response.data.gameTypes || []

    const supportedGameTypes = gameTypes
      .filter((gameType) => [1, 2, 3].includes(Number(gameType._id)))
      .map((gameType) => ({
        ...gameType,
        id: gameType._id,
        name: gameType.name || GAME_TYPES[gameType._id] || "Unknown Game",
        displayName: GAME_TYPES[gameType._id] || "Unknown Game",
        description:
          gameType._id === "1"
            ? "Quay bánh xe để nhận điểm thưởng"
            : gameType._id === "2"
            ? "Cào thẻ để nhận phần thưởng bất ngờ"
            : "Tìm các cặp hình giống nhau để kiếm điểm",
        isSupported: true,
      }))

    return { gameTypes: supportedGameTypes }
  } catch (error) {
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

    const response = await axios.get(`${API_URL_LOGIN}/api/Game/gameEventsRewards/me`, { headers })

    const rewards = response.data.gameEventRewardResults || []

    const enhancedRewards = rewards
      .filter((rewardWrapper) => {
        const gameEvent = rewardWrapper.gameEvent || {}
        return [1, 2, 3].includes(Number(gameEvent.gameTypeId))
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
            gameTypeName: GAME_TYPES[gameEvent.gameTypeId] || "Unknown Game",
            formattedStartDate: new Date(gameEvent.startDate).toLocaleDateString("vi-VN"),
            formattedEndDate: new Date(gameEvent.endDate).toLocaleDateString("vi-VN"),
          },
        }
      })

    enhancedRewards.sort((a, b) => {
      const dateA = new Date(a.gameEventRewardResult?.createdAt || 0)
      const dateB = new Date(b.gameEventRewardResult?.createdAt || 0)
      return dateB - dateA
    })

    const totalRewards = enhancedRewards.length
    const totalPoints = enhancedRewards.reduce((sum, rewardWrapper) => {
      return sum + (rewardWrapper.gameEventRewardResult?.points || 0)
    }, 0)

    return {
      gameEventRewardResults: enhancedRewards,
      statistics: {
        totalRewards,
        totalPoints,
        averagePoints: totalRewards > 0 ? Math.round(totalPoints / totalRewards) : 0,
      },
    }
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối. Vui lòng thử lại.")
  }
}

// Function to add a game event reward
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

    const response = await axios.post(`${API_URL_LOGIN}/api/Game/gameEventsRewards`, data, { headers })

    return {
      ...response.data,
      success: true,
      message: `🎉 Chúc mừng! Bạn đã nhận được ${points} điểm!`,
      points: Number(points),
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    if (error.response?.status === 400) {
      const errorMessage = error.response?.data?.message || ""
      if (errorMessage.includes("spin") || errorMessage.includes("lượt")) {
        throw new Error("Bạn đã hết lượt chơi cho sự kiện này.")
      }
      throw new Error("Không thể thêm phần thưởng. Vui lòng kiểm tra lại.")
    } else if (error.response?.status === 404) {
      throw new Error("Sự kiện không tồn tại hoặc đã kết thúc.")
    } else if (error.response?.status === 401) {
      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.")
    } else if (error.response?.status === 403) {
      throw new Error("Bạn không có quyền tham gia sự kiện này.")
    }

    throw new Error(error.response?.data?.message || "Lỗi khi lưu kết quả. Vui lòng thử lại.")
  }
}

// Helper function to get game event status
const getGameEventStatus = (gameEvent, now, startDate, endDate, remainingPlays) => {
  if (gameEvent.isDeactivated) return "deactivated"
  if (now < startDate) return "upcoming"
  if (now > endDate) return "ended"
  if (remainingPlays <= 0) return "no_plays_left"
  return "active"
}

// Helper function to check if user can play
export const canPlay = (gameEvent) => {
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
    case "no_plays_left":
      return "Hết lượt chơi"
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

// Helper function to validate spin result
export const validateSpinResult = (gameEvent, resultValue) => {
  if (!gameEvent?.parsedConfig?.sectors) return false
  const validValues = gameEvent.parsedConfig.sectors.map((sector) => sector.value)
  return validValues.includes(Number(resultValue))
}

// Helper function to validate scratch card result
export const validateScratchCardResult = (gameEvent, resultPoint) => {
  if (!gameEvent?.parsedConfig?.cards) return false
  const validPoints = gameEvent.parsedConfig.cards.map((card) => card.point)
  return validPoints.includes(Number(resultPoint))
}

// Helper function to validate memory catching result
export const validateMemoryCatchingResult = (gameEvent, points) => {
  if (!gameEvent?.parsedConfig) return false
  const { originalPoint, minusPoint, numOfPairs } = gameEvent.parsedConfig
  const maxPossiblePoints = originalPoint * numOfPairs
  const minPossiblePoints = -minusPoint * numOfPairs
  return Number(points) >= minPossiblePoints && Number(points) <= maxPossiblePoints
}

// Helper function to get random spin result
export const getRandomSpinResult = (gameEvent) => {
  if (!gameEvent?.parsedConfig?.sectors) return null
  const sectors = gameEvent.parsedConfig.sectors
  const randomIndex = Math.floor(Math.random() * sectors.length)
  return sectors[randomIndex]
}

// Helper function to get random scratch card result
export const getRandomScratchCardResult = (gameEvent) => {
  if (!gameEvent?.parsedConfig?.cards) return null
  const cards = gameEvent.parsedConfig.cards
  const randomIndex = Math.floor(Math.random() * cards.length)
  return cards[randomIndex]
}

// Helper function to get random memory catching result
export const getRandomMemoryCatchingResult = (gameEvent) => {
  if (!gameEvent?.parsedConfig) return null
  const { originalPoint, minusPoint, numOfPairs } = gameEvent.parsedConfig
  const maxPoints = originalPoint * numOfPairs
  const minPoints = -minusPoint * numOfPairs
  return {
    points: Math.floor(Math.random() * (maxPoints - minPoints + 1)) + minPoints,
  }
}