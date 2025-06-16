import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Notification = ({ message, type = 'success', autoDismiss = 3000, onDismiss }) => {
  const [visible, setVisible] = useState(!!message);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (message) {
      setVisible(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      if (autoDismiss) {
        const timer = setTimeout(() => {
          dismissNotification();
        }, autoDismiss);
        return () => clearTimeout(timer);
      }
    }
  }, [message]);

  const dismissNotification = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      if (onDismiss) onDismiss();
    });
  };

  if (!visible || !message) return null;

  const backgroundColor = type === 'success' ? '#4A90E2' : type === 'error' ? '#FF3B30' : '#FFA500';

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, backgroundColor }]}>
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity onPress={dismissNotification} style={styles.closeButton}>
        <Icon name="close" size={20} color="#FFF" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  message: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  closeButton: {
    padding: 5,
  },
});

export default Notification;