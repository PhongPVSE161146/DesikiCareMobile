import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const Notification = ({ 
  message, 
  type = 'success', 
  autoDismiss = 3000, 
  onDismiss,
  position = 'top' // Added position prop
}) => {
  const [visible, setVisible] = useState(!!message);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(position === 'top' ? -100 : 100));

  useEffect(() => {
    if (message) {
      setVisible(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      if (autoDismiss > 0) {
        const timer = setTimeout(() => {
          dismissNotification();
        }, autoDismiss);
        return () => clearTimeout(timer);
      }
    } else {
      setVisible(false);
    }
  }, [message]);

  const dismissNotification = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: position === 'top' ? -100 : 100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      if (onDismiss) onDismiss();
    });
  };

  if (!visible || !message) return null;

  const backgroundColor = 
    type === 'success' ? '#34C759' : // Modern green
    type === 'error' ? '#FF3B30' :  // Modern red
    type === 'warning' ? '#FF9500' : // Added warning type
    type === 'info' ? '#007AFF' :   // Added info type
    '#3C3C43'; // Neutral dark gray

  const iconName = 
    type === 'success' ? 'check-circle' :
    type === 'error' ? 'error' :
    type === 'warning' ? 'warning' :
    'info';

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          backgroundColor,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          [position]: 50, // Dynamic positioning
        }
      ]}
    >
      <View style={styles.content}>
        <Icon name={iconName} size={24} color="#FFF" style={styles.icon} />
        <Text style={styles.message}>{message}</Text>
      </View>
      <TouchableOpacity onPress={dismissNotification} style={styles.closeButton}>
        <Icon name="close" size={20} color="#FFF" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  closeButton: {
    padding: 8,
    margin: -8, // Make the touch area larger
  },
});

export default Notification;