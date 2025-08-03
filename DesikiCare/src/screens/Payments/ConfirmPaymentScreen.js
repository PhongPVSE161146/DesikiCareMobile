import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// FIREWORKS COMPONENT
const Fireworks = ({ show, onComplete }) => {
  const animatedValues = useRef([]);
  const particles = useRef([]);

  const createParticles = () => {
    const particleCount = 50;
    const newParticles = [];
    const newAnimatedValues = [];

    for (let i = 0; i < particleCount; i++) {
      const animatedValue = new Animated.ValueXY({ x: 0, y: 0 });
      const opacity = new Animated.Value(1);
      const scale = new Animated.Value(0);

      newAnimatedValues.push({ position: animatedValue, opacity, scale });

      const angle = (Math.PI * 2 * i) / particleCount;
      const velocity = 100 + Math.random() * 100;
      const color = [
        "#FF6B6B",
        "#4ECDC4",
        "#45B7D1",
        "#96CEB4",
        "#FFEAA7",
        "#DDA0DD",
        "#98D8C8",
      ][Math.floor(Math.random() * 7)];

      newParticles.push({
        id: i,
        angle,
        velocity,
        color,
        size: 4 + Math.random() * 4,
        animatedValue,
        opacity,
        scale,
      });
    }

    particles.current = newParticles;
    animatedValues.current = newAnimatedValues;
  };

  const startFireworks = () => {
    createParticles();

    const animations = particles.current.map((particle) => {
      const { angle, velocity, animatedValue, opacity, scale } = particle;

      const endX = Math.cos(angle) * velocity;
      const endY = Math.sin(angle) * velocity;

      return Animated.parallel([
        Animated.timing(animatedValue, {
          toValue: { x: endX, y: endY },
          duration: 1500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 1500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1,
            duration: 200,
            easing: Easing.out(Easing.back(2)),
            useNativeDriver: false,
          }),
          Animated.timing(scale, {
            toValue: 0,
            duration: 1300,
            easing: Easing.in(Easing.quad),
            useNativeDriver: false,
          }),
        ]),
      ]);
    });

    Animated.parallel(animations).start(() => {
      if (onComplete) {
        onComplete();
      }
    });
  };

  useEffect(() => {
    if (show) {
      startFireworks();
    }
  }, [show]);

  if (!show || particles.current.length === 0) {
    return null;
  }

  return (
    <View style={styles.fireworksContainer} pointerEvents="none">
      {particles.current.map((particle) => (
        <Animated.View
          key={particle.id}
          style={[
            styles.particle,
            {
              backgroundColor: particle.color,
              width: particle.size,
              height: particle.size,
              borderRadius: particle.size / 2,
              transform: [
                { translateX: particle.animatedValue.x },
                { translateY: particle.animatedValue.y },
                { scale: particle.scale },
              ],
              opacity: particle.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
};

// CONFETTI COMPONENT
const Confetti = ({ show }) => {
  const confettiPieces = useRef([]);
  const animatedValues = useRef([]);

  const createConfetti = () => {
    const confettiCount = 30;
    const newConfetti = [];
    const newAnimatedValues = [];

    for (let i = 0; i < confettiCount; i++) {
      const animatedValue = new Animated.ValueXY({
        x: Math.random() * screenWidth,
        y: -50,
      });
      const rotation = new Animated.Value(0);

      newAnimatedValues.push({ position: animatedValue, rotation });

      const colors = [
        "#FF6B6B",
        "#4ECDC4",
        "#45B7D1",
        "#96CEB4",
        "#FFEAA7",
        "#DDA0DD",
        "#98D8C8",
      ];
      const shapes = ["square", "circle", "triangle"];

      newConfetti.push({
        id: i,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        size: 6 + Math.random() * 4,
        animatedValue,
        rotation,
        fallSpeed: 2000 + Math.random() * 1000,
        swayAmount: 50 + Math.random() * 50,
      });
    }

    confettiPieces.current = newConfetti;
    animatedValues.current = newAnimatedValues;
  };

  const startConfetti = () => {
    createConfetti();

    const animations = confettiPieces.current.map((piece) => {
      const { animatedValue, rotation, fallSpeed, swayAmount } = piece;

      return Animated.parallel([
        Animated.timing(animatedValue, {
          toValue: {
            x: animatedValue.x._value + (Math.random() - 0.5) * swayAmount,
            y: screenHeight + 100,
          },
          duration: fallSpeed,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.loop(
          Animated.timing(rotation, {
            toValue: 1,
            duration: 1000,
            easing: Easing.linear,
            useNativeDriver: false,
          })
        ),
      ]);
    });

    Animated.parallel(animations).start();
  };

  useEffect(() => {
    if (show) {
      startConfetti();
    }
  }, [show]);

  if (!show || confettiPieces.current.length === 0) {
    return null;
  }

  return (
    <View style={styles.confettiContainer} pointerEvents="none">
      {confettiPieces.current.map((piece) => {
        const rotationInterpolate = piece.rotation.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "360deg"],
        });

        return (
          <Animated.View
            key={piece.id}
            style={[
              styles.confettiPiece,
              {
                backgroundColor: piece.color,
                width: piece.size,
                height: piece.size,
                borderRadius: piece.shape === "circle" ? piece.size / 2 : 0,
                transform: [
                  { translateX: piece.animatedValue.x },
                  { translateY: piece.animatedValue.y },
                  { rotate: rotationInterpolate },
                ],
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const ConfirmPaymentScreen = ({ route, navigation }) => {
  const { paymentData } = route.params || {};
  const [showFireworks, setShowFireworks] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;

  // Animation when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.sequence([
        Animated.spring(checkmarkScale, {
          toValue: 1.2,
          tension: 100,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.spring(checkmarkScale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        setShowFireworks(true);
        setShowConfetti(true);
      }, 500);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (amount) => {
    return amount && typeof amount === "number"
      ? amount.toLocaleString("vi-VN") + "đ"
      : "0đ";
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "N/A";
    try {
      return new Date(dateTime).toLocaleString("vi-VN");
    } catch {
      return dateTime;
    }
  };

  const getPaymentStatus = () => {
    if (!paymentData?.paymentMethod) return "Chờ xử lý"; // Match OrderHistory STATUS_CATEGORIES
    return paymentData.paymentMethod === "bank" || paymentData.paymentMethod === "cod"
      ? "Chờ xử lý"
      : paymentData.desc || "Chờ xử lý";
  };

  const handleNavigateToOrders = () => {
    // Transform paymentData to match OrderHistory's expected structure
    const transformedOrder = {
      order: { _id: paymentData.orderCode },
      orderStatus: { name: getPaymentStatus() },
      orderItems: paymentData.orderData?.cartItems || [],
    };
    navigation.navigate("Main", {
      screen: "PaidOrderHistory",
      params: { newOrder: transformedOrder },
    });
  };

  const handleNavigateToHome = () => {
    navigation.navigate("Main", { screen: "Home" });
  };

  // Validate paymentData
  if (!paymentData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Lỗi</Text>
          <Text style={styles.subtitle}>Không tìm thấy thông tin thanh toán.</Text>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleNavigateToHome}>
            <Ionicons name="home-outline" size={20} color="#E91E63" style={{ marginRight: 8 }} />
            <Text style={styles.secondaryButtonText}>Về trang chủ</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Fireworks show={showFireworks} onComplete={() => setShowFireworks(false)} />
      <Confetti show={showConfetti} />

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Animated.View style={{ transform: [{ scale: checkmarkScale }] }}>
            <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
          </Animated.View>

          <Animated.View style={{ opacity: titleOpacity }}>
            <Text style={styles.title}>Đặt hàng thành công!</Text>
            <Text style={styles.subtitle}>Cảm ơn bạn đã đặt hàng</Text>
          </Animated.View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thông tin đơn hàng</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Mã đơn hàng:</Text>
            <Text style={styles.value}>{paymentData.orderCode || "N/A"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Tổng tiền:</Text>
            <Text style={[styles.value, styles.amount]}>{formatCurrency(paymentData.amount)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Phương thức thanh toán:</Text>
            <Text style={styles.value}>
              {paymentData.paymentMethod === "cod"
                ? "Thanh toán khi nhận hàng"
                : "Chuyển khoản ngân hàng"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Thời gian:</Text>
            <Text style={styles.value}>{formatDateTime(paymentData.transactionDateTime)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Trạng thái:</Text>
            <Text style={[styles.value, styles.status]}>{getPaymentStatus()}</Text>
          </View>
        </View>

        {paymentData.orderData?.cartItems?.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sản phẩm đã đặt</Text>
            {paymentData.orderData.cartItems.map((item, index) => (
              <View key={index} style={styles.productItem}>
                <Text style={styles.productName} numberOfLines={2}>
                  {item.title || "Sản phẩm không xác định"}
                </Text>
                <View style={styles.productDetails}>
                  <Text style={styles.productQuantity}>SL: {item.quantity || 1}</Text>
                  <Text style={styles.productPrice}>{formatCurrency(item.price)}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleNavigateToOrders}>
            <Ionicons name="receipt-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.primaryButtonText}>Xem đơn hàng</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleNavigateToHome}>
            <Ionicons name="home-outline" size={20} color="#E91E63" style={{ marginRight: 8 }} />
            <Text style={styles.secondaryButtonText}>Về trang chủ</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    flex: 1,
  },
  fireworksContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    alignItems: "center",
    justifyContent: "center",
  },
  particle: {
    position: "absolute",
  },
  confettiContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  confettiPiece: {
    position: "absolute",
  },
  header: {
    alignItems: "center",
    padding: 32,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  label: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  amount: {
    color: "#E91E63",
    fontWeight: "bold",
    fontSize: 16,
  },
  status: {
    color: "#4CAF50",
    fontWeight: "bold",
  },
  productItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  productName: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
    fontWeight: "500",
  },
  productDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productQuantity: {
    fontSize: 12,
    color: "#666",
  },
  productPrice: {
    fontSize: 14,
    color: "#E91E63",
    fontWeight: "500",
  },
  buttonContainer: {
    padding: 16,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: "#E91E63",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: "#E91E63",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E91E63",
    flexDirection: "row",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#E91E63",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default ConfirmPaymentScreen;