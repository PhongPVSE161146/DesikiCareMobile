import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL_LOGIN } from '@env';

// Mapping gameTypeId to game type names
const GAME_TYPES = {
  0: 'Quay trúng thưởng',
  1: 'Chọn 2 ô trùng nhau',
  2: 'Cào thẻ',
  3: 'Điền từ còn trống',
};

// Function to fetch all game events
export const fetchGameEvents = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.get(`${API_URL_LOGIN}/api/Game/gameEvents`, { headers });
    const gameEvents = response.data.gameEvents.map(event => ({
      ...event,
      gameEvent: {
        ...event.gameEvent,
        gameTypeName: GAME_TYPES[event.gameEvent.gameTypeId] || 'Không xác định',
      },
    }));
    return { gameEvents };
  } catch (error) {
    console.error('Error fetching game events:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Lỗi kết nối. Vui lòng thử lại.');
  }
};

// Function to fetch a specific game event by ID
export const fetchGameEventById = async (gameEventId) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.get(`${API_URL_LOGIN}/api/Game/gameEvents/${gameEventId}`, { headers });
    const event = response.data.gameEvent || response.data;
    event.gameTypeName = GAME_TYPES[event.gameTypeId] || 'Không xác định';
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
    return response.data;
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
        gameTypeName: GAME_TYPES[reward.gameEvent.gameTypeId] || 'Không xác định',
      },
    }));
    return { gameEventRewardResults: rewards };
  } catch (error) {
    console.error('Error fetching user rewards:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Lỗi kết nối. Vui lòng thử lại.');
  }
};