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

  const backgroundColor =
    type === 'success' ? '#4CAF50' :
    type === 'error' ? '#F44336' :
    '#888';

  return (
    <Animated.View style={[styles.container, { backgroundColor, opacity: fadeAnim }]}>
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity onPress={dismissNotification} style={styles.closeButton}>
        <Icon name="close" size={20} color="#FFF" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    left: '10%',
    right: '10%',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  message: {
    flex: 1,
    color: '#FFF',
    fontSize: 15,
  },
  closeButton: {
    marginLeft: 10,
  },
});

export default Notification;
