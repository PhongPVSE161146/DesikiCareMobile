import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { fetchGameEvents } from '../../config/axios/MiniGame/minigameService';
import { Easing } from 'react-native';

const SpinWheelGame = () => {
  const route = useRoute();
  const { gameTypeId } = route.params || {};
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const spinAnimation = useRef(new Animated.Value(0)).current;
  const totalRotation = useRef(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinCount, setSpinCount] = useState(0);
  const [result, setResult] = useState(null);
  const [resultHistory, setResultHistory] = useState([]);

  useEffect(() => {
    const loadGameEvent = async () => {
      if (!gameTypeId) {
        setError('Không tìm thấy ID loại trò chơi');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetchGameEvents();
        const gameEvents = response.gameEvents || response.data || response || [];
        const event = gameEvents.find(
          (e) => String(e.gameEvent?.gameTypeId) === String(gameTypeId)
        );

        if (event && event.gameEvent?.configJson) {
          const { sectors, maxSpin } = event.gameEvent.configJson;
          if (Array.isArray(sectors) && sectors.length > 0 && maxSpin > 0) {
            setConfig(event.gameEvent.configJson);
          } else {
            throw new Error('Cấu hình trò chơi không hợp lệ');
          }
        } else {
          // Fallback config
          setConfig({
            sectors: [
              { label: '100 điểm', color: '#FF6F61', text: '#FFF' },
              { label: '50 điểm', color: '#6B7280', text: '#FFF' },
              { label: 'Thử lại', color: '#FBBF24', text: '#000' },
              { label: '200 điểm', color: '#34D399', text: '#000' },
            ],
            maxSpin: 3,
          });
        }
        setError(null);
      } catch (err) {
        const errorMessage = err.message || 'Không thể tải cấu hình trò chơi';
        setError(errorMessage);
        Alert.alert('Lỗi', errorMessage);
      } finally {
        setLoading(false);
      }
    };
    loadGameEvent();
  }, [gameTypeId]);

  const spin = () => {
    if (isSpinning || spinCount >= (config?.maxSpin || 3)) return;

    const sectors = config?.sectors || [];
    const randomIndex = Math.floor(Math.random() * sectors.length);
    const degreesPerSector = 360 / sectors.length;
    const extraRotation =
      360 * 5 + (360 - randomIndex * degreesPerSector - degreesPerSector / 2);

    totalRotation.current += extraRotation;

    setIsSpinning(true);
    setResult(null);

    Animated.timing(spinAnimation, {
      toValue: totalRotation.current,
      duration: 4000,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start(() => {
      const normalizedRotation = totalRotation.current % 360;
      const index = Math.floor((360 - (normalizedRotation % 360)) / degreesPerSector);
      const selectedIndex = index % sectors.length;

      const selected = sectors[selectedIndex]?.label || 'Không xác định';

      setIsSpinning(false);
      setSpinCount((prev) => prev + 1);
      setResult(selected);
      setResultHistory((prev) => [
        ...prev,
        { id: `${Date.now()}-${selected}`, value: selected },
      ]);
    });
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !isSpinning && spinCount < (config?.maxSpin || 3),
    onPanResponderRelease: (evt, gestureState) => {
      if (Math.abs(gestureState.dx) > 50 || Math.abs(gestureState.dy) > 50) {
        spin();
      }
      return true;
    },
  });

  const renderSector = (sector, index) => {
    const rotate = (360 / (config?.sectors.length || 1)) * index;
    const skewY = -(90 - 360 / (config?.sectors.length || 1));
    return (
      <View
        key={index}
        style={[
          styles.sector,
          {
            transform: [{ rotate: `${rotate}deg` }, { skewY: `${skewY}deg` }],
            backgroundColor: sector.color,
          },
        ]}
      >
        <Text
          style={[
            styles.sectorText,
            {
              transform: [
                { skewY: `${-skewY}deg` },
                { rotate: `${360 / (config?.sectors.length || 1) / 2}deg` },
              ],
              color: sector.text,
            },
          ]}
        >
          {sector.label}
        </Text>
      </View>
    );
  };

  // Render loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  // Render error or no config state
  if (error || !config) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error || 'Không tìm thấy cấu hình trò chơi'}</Text>
      </View>
    );
  }

  // Main render
  return (
    <View style={styles.container}>
      <View style={styles.wheelContainer}>
        <Animated.View
          style={[
            styles.wheel,
            {
              transform: [
                {
                  rotate: spinAnimation.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
          {...panResponder.panHandlers}
        >
          {config.sectors.map(renderSector)}
        </Animated.View>
        <View style={styles.pointer} />
      </View>
      <TouchableOpacity
        style={[styles.spinButton, (isSpinning || spinCount >= config.maxSpin) && styles.disabledButton]}
        onPress={spin}
        disabled={isSpinning || spinCount >= config.maxSpin}
      >
        <Text style={styles.spinButtonText}>Quay Ngay</Text>
      </TouchableOpacity>
      {result && (
        <View style={styles.result}>
          <Text style={styles.resultText}>
            Kết quả vừa quay: <Text style={styles.resultHighlight}>{result}</Text>
          </Text>
          <Text style={styles.historyTitle}>Lịch sử quay:</Text>
          {resultHistory.map((item) => (
            <Text key={item.id} style={styles.historyItem}>
              Lượt {resultHistory.indexOf(item) + 1}: {item.value}
            </Text>
          ))}
        </View>
      )}
      <Text style={styles.spinCount}>
        Lượt quay còn lại: {config.maxSpin - spinCount}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F7FA',
    alignItems: 'center',
    padding: 20,
  },
  wheelContainer: {
    position: 'relative',
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheel: {
    width: 300,
    height: 300,
    borderRadius: 150,
    overflow: 'hidden',
    position: 'absolute',
  },
  sector: {
    position: 'absolute',
    width: 150,
    height: 300,
    left: 150,
    top: 0,
    transformOrigin: '0 150px',
  },
  sectorText: {
    position: 'absolute',
    top: 10,
    left: 10,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  pointer: {
    position: 'absolute',
    top: -20,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 20,
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FF0000',
  },
  spinButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#a5d6a7',
  },
  spinButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  result: {
    marginTop: 20,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 16,
    color: '#333',
  },
  resultHighlight: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
  },
  historyItem: {
    fontSize: 14,
    color: '#666',
  },
  spinCount: {
    fontSize: 16,
    color: '#333',
    marginTop: 10,
  },
  loadingText: {
    fontSize: 16,
    color: '#333',
    marginTop: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default SpinWheelGame;