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
import { fetchGameEvents, addGameEventReward } from '../../config/axios/MiniGame/minigameService';
import { Easing } from 'react-native';
import Svg, { Path, Text as SvgText } from 'react-native-svg';

// Map sector labels to points based on API response
const SECTOR_POINTS = {
  '10 điểm': 10,
  '100 điểm': 100,
  '50 điểm': 50,
  '20 điểm': 20,
  '30 điểm': 30,
  '50 Điểm Thưởng': 50,
  '20 Điểm Thưởng': 20,
  '30 Điểm Thưởng': 30,
  'Chúc bạn may mắn lần sau': 0,
  'Chúc bạn may mắn lần sau!': 0,
};

const SpinWheelGame = () => {
  const route = useRoute();
  const { gameTypeId } = route.params || {};
  const [config, setConfig] = useState(null);
  const [gameEventId, setGameEventId] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const spinAnimation = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const fireworksAnimations = useRef(
    Array(8)
      .fill()
      .map(() => ({
        opacity: new Animated.Value(0),
        scale: new Animated.Value(0),
        translateX: new Animated.Value(0),
        translateY: new Animated.Value(0),
      }))
  ).current;
  const totalRotation = useRef(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinCount, setSpinCount] = useState(0);
  const [result, setResult] = useState(null);
  const [pointsEarned, setPointsEarned] = useState(null);

  // Demo mode configuration
  const demoConfig = {
    sectors: [
      { label: '10 điểm', color: '#ffffff', text: '#000' },
      { label: '100 điểm', color: '#d71919', text: '#f1efef' },
      { label: '50 điểm', color: '#3f1ded', text: '#fcf7f7' },
      { label: 'Chúc bạn may mắn lần sau', color: '#0ff549', text: '#000' },
    ],
    maxSpin: 10,
    numOfSectors: 4,
  };

  useEffect(() => {
    const loadGameEvent = async () => {
      // Validate gameTypeId
      if (!gameTypeId || typeof gameTypeId !== 'string' || gameTypeId.trim() === '') {
        setError('ID loại trò chơi không hợp lệ');
        setConfig(demoConfig);
        setIsDemoMode(true);
        setGameEventId('demo-event-id');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        if (isDemoMode) {
          // Demo mode: use mock data
          setConfig(demoConfig);
          setGameEventId('demo-event-id');
          setError(null);
          setLoading(false);
          return;
        }

        // Real mode: fetch from API
        console.log('gameTypeId:', gameTypeId);
        const response = await fetchGameEvents();
        console.log('fetchGameEvents response:', JSON.stringify(response, null, 2));
        const gameEvents = response.gameEvents || [];
        if (!Array.isArray(gameEvents) || !gameEvents.length) {
          throw new Error('Không tìm thấy sự kiện trò chơi');
        }

        const currentDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
        const event = gameEvents.find(
          (e) =>
            String(e.gameEvent?.gameTypeId) === String(gameTypeId) &&
            new Date(e.gameEvent.startDate) <= currentDate &&
            new Date(e.gameEvent.endDate) >= currentDate &&
            !e.gameEvent.isDeactivated
        );
        console.log('Found event:', JSON.stringify(event, null, 2));

        if (event && event.gameEvent?._id && event.gameEvent?.configJson) {
          const { sectors, maxSpin, numOfSectors } = event.gameEvent.configJson;
          if (Array.isArray(sectors) && sectors.length === numOfSectors && maxSpin > 0) {
            setConfig(event.gameEvent.configJson);
            setGameEventId(event.gameEvent._id);
            setIsDemoMode(false);
          } else {
            throw new Error('Cấu hình trò chơi không hợp lệ: yêu cầu sectors hợp lệ và maxSpin > 0');
          }
        } else {
          throw new Error(`Không tìm thấy sự kiện trò chơi đang hoạt động cho gameTypeId: ${gameTypeId}`);
        }
        setError(null);
      } catch (err) {
        const errorMessage = err.message || 'Không thể tải cấu hình trò chơi';
        console.error('Error in loadGameEvent:', err);
        setError(errorMessage);
        setConfig(demoConfig);
        setGameEventId('demo-event-id');
        setIsDemoMode(true);
      } finally {
        setLoading(false);
      }
    };
    loadGameEvent();
  }, [gameTypeId, isDemoMode]);

  useEffect(() => {
    if (!isSpinning && spinCount < (config?.maxSpin || 10) && (!isDemoMode || gameEventId)) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(buttonScale, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(buttonScale, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isSpinning, spinCount, config, isDemoMode, gameEventId]);

  useEffect(() => {
    if (result) {
      fireworksAnimations.forEach((anim, index) => {
        const angle = (index * 2 * Math.PI) / fireworksAnimations.length;
        const distance = 150;
        Animated.parallel([
          Animated.sequence([
            Animated.timing(anim.opacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(anim.opacity, {
              toValue: 0,
              duration: 800,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(anim.scale, {
            toValue: 1.5,
            duration: 1200,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(anim.translateX, {
            toValue: distance * Math.cos(angle),
            duration: 1200,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(anim.translateY, {
            toValue: distance * Math.sin(angle),
            duration: 1200,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start(() => {
          anim.scale.setValue(0);
          anim.translateX.setValue(0);
          anim.translateY.setValue(0);
        });
      });
    }
  }, [result]);

  const spin = async () => {
    if (isSpinning || spinCount >= (config?.maxSpin || 10)) {
      Alert.alert('Thông báo', spinCount >= (config?.maxSpin || 10) ? 'Hết lượt quay!' : 'Đang quay, vui lòng đợi.');
      return;
    }
    if (!isDemoMode && !gameEventId) {
      Alert.alert('Lỗi', 'Không thể quay: ID sự kiện trò chơi không hợp lệ');
      return;
    }

    const sectors = config?.sectors || [];
    const randomIndex = Math.floor(Math.random() * (config?.numOfSectors || 4));
    const degreesPerSector = 360 / (config?.numOfSectors || 4);
    const targetAngle = randomIndex * degreesPerSector + degreesPerSector / 2;
    const extraRotations = 360 * 5;
    const finalRotation = extraRotations + targetAngle;

    totalRotation.current = finalRotation;

    setIsSpinning(true);
    setResult(null);
    setPointsEarned(null);

    Animated.timing(spinAnimation, {
      toValue: finalRotation,
      duration: 4000,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start(async () => {
      const normalizedRotation = finalRotation % 360;
      const index = Math.floor((360 - normalizedRotation + degreesPerSector / 2) / degreesPerSector) % (config?.numOfSectors || 4);
      const selected = sectors[index]?.label || 'Không xác định';
      const points = SECTOR_POINTS[selected] || 0;

      setIsSpinning(false);
      setSpinCount((prev) => prev + 1);
      setResult(selected);
      setPointsEarned(points);

      if (!isDemoMode) {
        try {
          console.log('Saving reward with gameEventId:', gameEventId, 'points:', points);
          await addGameEventReward(gameEventId, points);
          Alert.alert('Thành công', `Bạn đã nhận được ${points} điểm cho phần thưởng ${selected}!`);
        } catch (error) {
          console.error('Error saving reward:', error.message);
          Alert.alert('Lỗi', 'Không thể lưu phần thưởng. Vui lòng thử lại.');
        }
      } else {
        Alert.alert('Chế độ demo', `Bạn nhận được ${points} điểm cho phần thưởng ${selected}, nhưng điểm không được lưu vì đang ở chế độ demo.`);
      }
    });
  };

  const toggleDemoMode = () => {
    setIsDemoMode((prev) => !prev);
    setSpinCount(0);
    setResult(null);
    setPointsEarned(null);
    setError(null);
    spinAnimation.setValue(0);
    totalRotation.current = 0;
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !isSpinning && spinCount < (config?.maxSpin || 10) && (isDemoMode || !!gameEventId),
    onPanResponderRelease: (evt, gestureState) => {
      if (Math.abs(gestureState.dx) > 50 || Math.abs(gestureState.dy) > 50) {
        spin();
      }
      return true;
    },
  });

  const renderSector = (sector, index) => {
    const startAngle = (360 / (config?.numOfSectors || 4) * index * Math.PI) / 180;
    const endAngle = (360 / (config?.numOfSectors || 4) * (index + 1) * Math.PI) / 180;
    const radius = 170;
    const centerX = 170;
    const centerY = 170;

    const startX = centerX + radius * Math.cos(startAngle);
    const startY = centerY + radius * Math.sin(startAngle);
    const endX = centerX + radius * Math.cos(endAngle);
    const endY = centerY + radius * Math.sin(endAngle);

    const largeArcFlag = (360 / (config?.numOfSectors || 4)) <= 180 ? 0 : 1;
    const path = `
      M ${centerX} ${centerY}
      L ${startX} ${startY}
      A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}
      Z
    `;

    const textAngle = startAngle + (360 / (config?.numOfSectors || 4) / 2) * (Math.PI / 180);
    const textRadius = radius * 0.6;
    const textX = centerX + textRadius * Math.cos(textAngle);
    const textY = centerY + textRadius * Math.sin(textAngle);

    return (
      <Svg key={index}>
        <Path d={path} fill={sector.color} stroke="#FFF" strokeWidth={1} />
        <SvgText
          x={textX}
          y={textY}
          fill={sector.text || '#000'}
          fontSize={12}
          fontWeight="bold"
          textAnchor="middle"
          transform={`rotate(${(360 / (config?.numOfSectors || 4)) * index + (360 / (config?.numOfSectors || 4) / 2)}, ${textX}, ${textY})`}
        >
          {sector.label}
        </SvgText>
      </Svg>
    );
  };

  const renderFireworks = () => {
    return fireworksAnimations.map((anim, index) => (
      <Animated.View
        key={index}
        style={[
          styles.fireworks,
          {
            opacity: anim.opacity,
            transform: [
              { scale: anim.scale },
              { translateX: anim.translateX },
              { translateY: anim.translateY },
            ],
          },
        ]}
      >
        <Text style={styles.fireworksText}>✨</Text>
      </Animated.View>
    ));
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#DC3545" />
        <Text style={styles.loadingText}>Đang tải vòng quay...</Text>
      </View>
    );
  }

  if (error && !config) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vòng Quay May Mắn {isDemoMode ? '(Chế độ Demo)' : ''}</Text>
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
          <Svg width={340} height={340}>
            {config?.sectors.map(renderSector)}
          </Svg>
          <View style={styles.wheelBorder} />
        </Animated.View>
        <View style={styles.pointer} />
        {result && renderFireworks()}
      </View>
      <Animated.View style={[styles.spinButtonContainer, { transform: [{ scale: buttonScale }] }]}>
        <TouchableOpacity
          style={[styles.spinButton, (isSpinning || spinCount >= config.maxSpin) && styles.disabledButton]}
          onPress={spin}
          disabled={isSpinning || spinCount >= config.maxSpin}
        >
          <Text style={styles.spinButtonText}>QUAY NGAY</Text>
        </TouchableOpacity>
      </Animated.View>
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={toggleDemoMode}
      >
        <Text style={styles.toggleButtonText}>
          {isDemoMode ? 'Chuyển sang chế độ thực' : 'Chuyển sang chế độ demo'}
        </Text>
      </TouchableOpacity>
      {result && (
        <View style={styles.result}>
          <Text style={styles.resultText}>
            Kết quả: <Text style={styles.resultHighlight}>{result}</Text>
          </Text>
          <Text style={styles.resultText}>
            Điểm: <Text style={styles.resultHighlight}>{pointsEarned}</Text>
          </Text>
        </View>
      )}
      <Text style={styles.spinCount}>
        Lượt quay còn lại: {config?.maxSpin - spinCount}
      </Text>
      {isDemoMode && (
        <Text style={styles.demoText}>
          Chế độ demo: Điểm không được lưu vào hệ thống.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5E1',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#DC3545',
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  wheelContainer: {
    position: 'relative',
    width: 340,
    height: 340,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 30,
  },
  wheel: {
    width: 340,
    height: 340,
    borderRadius: 170,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  wheelBorder: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
    borderWidth: 5,
    borderColor: '#FFC107',
  },
  pointer: {
    position: 'absolute',
    top: -15,
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 25,
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#DC3545',
    zaggleIndex: 10,
  },
  spinButtonContainer: {
    marginTop: 20,
  },
  spinButton: {
    backgroundColor: '#DC3545',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 50,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#FFC107',
  },
  disabledButton: {
    backgroundColor: '#FFCDD2',
    borderColor: '#B0BEC5',
  },
  spinButtonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  toggleButton: {
    marginTop: 10,
    backgroundColor: '#4caf50',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  toggleButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  result: {
    marginTop: 20,
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    elevation: 3,
  },
  resultText: {
    fontSize: 18,
    color: '#212121',
    marginBottom: 10,
  },
  resultHighlight: {
    fontWeight: 'bold',
    color: '#DC3545',
  },
  spinCount: {
    fontSize: 16,
    color: '#DC3545',
    marginTop: 20,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 18,
    color: '#DC3545',
    marginTop: 10,
  },
  errorText: {
    fontSize: 18,
    color: '#B71C1C',
    textAlign: 'center',
    marginTop: 20,
  },
  demoText: {
    fontSize: 14,
    color: '#B71C1C',
    textAlign: 'center',
    marginTop: 10,
  },
  fireworks: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  fireworksText: {
    fontSize: 50,
    color: '#FFD700',
  },
});

export default SpinWheelGame;