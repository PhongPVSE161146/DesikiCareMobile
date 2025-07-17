import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL_LOGIN } from '@env';

// Mapping gameTypeId to game type names (use string keys to match MiniGameScreen)
const GAME_TYPES = {
  '1': 'Quay trúng thưởng',
  '2': 'Chọn 2 ô trùng nhau',
  '3': 'Cào thẻ',
  '4': 'Điền từ còn trống',
};

// Function to fetch all game events
export const fetchGameEvents = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw new Error('No user token found. Please log in.');
    }
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    const response = await axios.get(`${API_URL_LOGIN}/api/Game/gameEvents`, { headers });
    console.log('fetchGameEvents raw response:', JSON.stringify(response.data, null, 2)); // Log for debugging
    const gameEvents = response.data.gameEvents || [];
    if (!Array.isArray(gameEvents) || !gameEvents.length) {
      throw new Error('No game events found in response');
    }
    const mappedEvents = gameEvents.map(event => {
      if (!event.gameEvent || !event.gameEvent.gameTypeId) {
        console.warn('Invalid game event structure:', JSON.stringify(event, null, 2));
        return event;
      }
      return {
        ...event,
        gameEvent: {
          ...event.gameEvent,
          gameTypeName: GAME_TYPES[String(event.gameEvent.gameTypeId)] || 'Không xác định',
        },
      };
    });
    return { gameEvents: mappedEvents };
  } catch (error) {
    console.error('Error fetching game events:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Lỗi kết nối. Vui lòng thử lại.');
  }
};

// Function to fetch a specific game event by ID
export const fetchGameEventById = async (gameEventId) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw new Error('No user token found. Please log in.');
    }
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    const response = await axios.get(`${API_URL_LOGIN}/api/Game/gameEvents/${gameEventId}`, { headers });
    console.log('fetchGameEventById response:', JSON.stringify(response.data, null, 2)); // Log for debugging
    const event = response.data.gameEvent || response.data;
    if (!event.gameTypeId) {
      throw new Error('Game event missing gameTypeId');
    }
    event.gameTypeName = GAME_TYPES[String(event.gameTypeId)] || 'Không xác định';
    return { gameEvent: event };
  } catch (error) {
    console.error('Error fetching game event:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Lỗi kết nối. Vui lòng thử lại.');
  }
};

// Function to fetch game types
export const fetchGameTypes = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.get(`${API_URL_LOGIN}/api/Game/gameTypes`, { headers });
    console.log('fetchGameTypes response:', JSON.stringify(response.data, null, 2)); // Log for debugging
    const gameTypes = response.data.gameTypes || response.data || [];
    return { gameTypes };
  } catch (error) {
    console.error('Error fetching game types:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Lỗi kết nối. Vui lòng thử lại.');
  }
};

// Function to fetch user's reward history
export const fetchUserGameRewards = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw new Error('Vui lòng đăng nhập để xem lịch sử phần thưởng.');
    }
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    const response = await axios.get(`${API_URL_LOGIN}/api/Game/gameEventsRewards/me`, { headers });
    const rewards = response.data.gameEventRewardResults.map(reward => ({
      ...reward,
      gameEvent: {
        ...reward.gameEvent,
        gameTypeName: GAME_TYPES[String(reward.gameEvent.gameTypeId)] || 'Không xác định',
      },
    }));
    return { gameEventRewardResults: rewards };
  } catch (error) {
    console.error('Error fetching user rewards:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Lỗi kết nối. Vui lòng thử lại.');
  }
};

// Function to add a game event reward
export const addGameEventReward = async (gameEventId, points) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw new Error('Vui lòng đăng nhập để thêm phần thưởng.');
    }
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    const data = {
      gameEventReward: {
        gameEventId,
        points,
      },
    };

    const response = await axios.post(`${API_URL_LOGIN}/api/Game/gameEventsRewards`, data, { headers });
    return response.data;
  } catch (error) {
    console.error('Error adding game event reward:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Lỗi khi thêm phần thưởng. Vui lòng thử lại.');
  }
};