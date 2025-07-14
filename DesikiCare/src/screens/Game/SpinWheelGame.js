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
import Svg, { Path, Text as SvgText } from 'react-native-svg';

const SpinWheelGame = () => {
  const route = useRoute();
  const { gameTypeId } = route.params || {};
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const spinAnimation = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const fireworksAnimations = useRef(
    Array(8) // Increased number of fireworks
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
          if (Array.isArray(sectors) && sectors.length === 4 && maxSpin > 0) {
            setConfig(event.gameEvent.configJson);
          } else {
            throw new Error('Cấu hình trò chơi không hợp lệ, yêu cầu 4 ô');
          }
        } else {
          setConfig({
            sectors: [
              { label: 'Beatriz', color: '#DC3545', text: '#FFF' },
              { label: 'Diya', color: '#28A745', text: '#000' },
              { label: 'Charles', color: '#FFC107', text: '#000' },
              { label: 'Prize', color: '#007BFF', text: '#FFF' },
            ],
            maxSpin: 10,
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

  useEffect(() => {
    if (!isSpinning && spinCount < (config?.maxSpin || 3)) {
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
  }, [isSpinning, spinCount, config]);

  useEffect(() => {
    if (result) {
      fireworksAnimations.forEach((anim, index) => {
        const angle = (index * 2 * Math.PI) / fireworksAnimations.length;
        const distance = 150; // Increased distance for larger spread
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
            toValue: 1.5, // Increased scale for larger fireworks
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

  const spin = () => {
    if (isSpinning || spinCount >= (config?.maxSpin || 3)) return;

    const sectors = config?.sectors || [];
    const randomIndex = Math.floor(Math.random() * 4);
    const degreesPerSector = 360 / 4; // 90 degrees
    // Calculate target rotation to land in the middle of the selected sector
    const targetAngle = randomIndex * degreesPerSector + degreesPerSector / 2;
    const extraRotations = 360 * 5; // 5 full rotations
    const finalRotation = extraRotations + targetAngle;

    totalRotation.current = finalRotation;

    setIsSpinning(true);
    setResult(null);

    Animated.timing(spinAnimation, {
      toValue: finalRotation,
      duration: 4000,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start(() => {
      // Normalize rotation to 0-360 degrees
      const normalizedRotation = finalRotation % 360;
      // Calculate sector index (inverted due to clockwise rotation)
      const index = Math.floor((360 - normalizedRotation + degreesPerSector / 2) / degreesPerSector) % 4;
      const selected = sectors[index]?.label || 'Không xác định';

      setIsSpinning(false);
      setSpinCount((prev) => prev + 1);
      setResult(selected);
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
    const startAngle = (90 * index * Math.PI) / 180;
    const endAngle = (90 * (index + 1) * Math.PI) / 180;
    const radius = 170;
    const centerX = 170;
    const centerY = 170;

    const startX = centerX + radius * Math.cos(startAngle);
    const startY = centerY + radius * Math.sin(startAngle);
    const endX = centerX + radius * Math.cos(endAngle);
    const endY = centerY + radius * Math.sin(endAngle);

    const largeArcFlag = 90 <= 180 ? 0 : 1;
    const path = `
      M ${centerX} ${centerY}
      L ${startX} ${startY}
      A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}
      Z
    `;

    const textAngle = startAngle + 45 * (Math.PI / 180);
    const textRadius = radius * 0.6;
    const textX = centerX + textRadius * Math.cos(textAngle);
    const textY = centerY + textRadius * Math.sin(textAngle);

    return (
      <Svg key={index}>
        <Path d={path} fill={sector.color} stroke="#FFF" strokeWidth={1} />
        <SvgText
          x={textX}
          y={textY}
          fill={sector.text}
          fontSize={12}
          fontWeight="bold"
          textAnchor="middle"
          transform={`rotate(${90 * index + 45}, ${textX}, ${textY})`}
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

  if (error || !config) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error || 'Không tìm thấy cấu hình trò chơi'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vòng Quay May Mắn</Text>
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
            {config.sectors.map(renderSector)}
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
      {result && (
        <View style={styles.result}>
          <Text style={styles.resultText}>
            Kết quả: <Text style={styles.resultHighlight}>{result}</Text>
          </Text>
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
    width: 349,
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
    zIndex: 10,
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
  fireworks: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  fireworksText: {
    fontSize: 50, // Increased size for bigger fireworks
    color: '#FFD700', // Changed to golden color for more vibrancy
  },
});

export default SpinWheelGame;