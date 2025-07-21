import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Animated, Easing } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { login as reduxLogin } from '../../../redux/authSlice';
import authService from '../../../config/axios/Auth/authService';
import Notification from '../../../components/NotiComponnets/Notification';
import { Alert } from 'react-native';

// Try core Switch first; if error persists, use the alternative import below
import { Switch } from 'react-native';
// Alternative: import Switch from '@react-native-community/react-native-switch';

// Logo image
const logoImage = require('../../../../assets/DesikiCare.jpg');

const LoginScreen = ({ navigation, route }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRemember, setIsRemember] = useState(false);
  const [notification, setNotification] = useState(null);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [spinAnim] = useState(new Animated.Value(0));
  const dispatch = useDispatch();

  // Load saved credentials on mount
  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('savedEmail');
        const savedPassword = await AsyncStorage.getItem('savedPassword');
        const savedIsRemember = await AsyncStorage.getItem('isRemember');
        if (savedIsRemember === 'true' && savedEmail && savedPassword) {
          setEmail(savedEmail);
          setPassword(savedPassword);
          setIsRemember(true);
        }
      } catch (error) {
        console.error('Error loading credentials:', error);
        setNotification({ message: 'Lỗi khi tải thông tin đăng nhập.', type: 'error' });
      }
    };
    loadCredentials();
  }, []);

  // Handle navigation params for notification
  useEffect(() => {
    if (route.params?.notification) {
      setNotification(route.params.notification);
    }
  }, [route.params?.notification]);

  // Start spinner animation when loading
  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinAnim.setValue(0);
    }
  }, [isLoading, spinAnim]);

  const validateForm = () => {
    const newErrors = { email: '', password: '' };
    let isValid = true;

    if (!email.trim()) {
      newErrors.email = 'Vui lòng nhập email.';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Vui lòng nhập email hợp lệ.';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu.';
      isValid = false;
    } else if (/\s/.test(password)) {
      newErrors.password = 'Mật khẩu không được chứa khoảng cách.';
      isValid = false;
    }

    setErrors(newErrors);
    if (!isValid) {
      setNotification({ message: 'Tài khoản và mật khẩu không được bỏ trống hoặc không hợp lệ.', type: 'error' });
    }
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.login(email.trim(), password);
      console.log('Login result:', result);

      if (result.success) {
        if (isRemember) {
          try {
            await AsyncStorage.setItem('savedEmail', email.trim());
            await AsyncStorage.setItem('savedPassword', password);
            await AsyncStorage.setItem('isRemember', 'true');
          } catch (e) {
            console.error('Error saving credentials:', e);
            setNotification({ message: 'Lỗi khi lưu thông tin đăng nhập.', type: 'error' });
          }
        } else {
          try {
            await AsyncStorage.removeItem('savedEmail');
            await AsyncStorage.removeItem('savedPassword');
            await AsyncStorage.removeItem('isRemember');
          } catch (e) {
            console.error('Error clearing credentials:', e);
          }
        }

        try {
          dispatch(reduxLogin(result.data));
          console.log('Dispatched reduxLogin with data:', result.data);

          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }).start(() => {
            if (navigation && typeof navigation.reset === 'function') {
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: 'Main',
                    params: {
                      screen: 'Home',
                      params: {
                        notification: {
                          message: 'Đăng nhập thành công!',
                          type: 'success',
                        },
                      },
                    },
                  },
                ],
              });
              console.log('Navigated to Main with Home tab and success notification');
            } else {
              throw new Error('Invalid navigation object');
            }
          });
        } catch (dispatchError) {
          console.error('Dispatch or navigation error:', dispatchError);
          setNotification({ message: 'Lỗi khi đăng nhập. Vui lòng thử lại.', type: 'error' });
          setIsLoading(false);
          fadeAnim.setValue(1);
        }
      } else {
        setNotification({ message: result.message, type: 'error' });
        setIsLoading(false);
        fadeAnim.setValue(1);
      }
    } catch (error) {
      console.error('Login error:', error);
      setNotification({ message: 'Đã xảy ra lỗi không mong muốn.', type: 'error' });
      setIsLoading(false);
      fadeAnim.setValue(1);
    }
  };

  const handleGoogleLogin = () => {
    Alert.alert('Thông tin', 'Chức năng đăng nhập Google sẽ được triển khai.');
  };

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {isLoading ? (
        <Animated.View style={[styles.loadingContainer, { opacity: fadeAnim }]}>
          <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]}>
            <View style={styles.spinnerDot} />
            <View style={[styles.spinnerDot, styles.dot2]} />
            <View style={[styles.spinnerDot, styles.dot3]} />
            <View style={[styles.spinnerDot, styles.dot4]} />
          </Animated.View>
          <Text style={styles.loadingText}>Đang đăng nhập...</Text>
        </Animated.View>
      ) : (
        <>
          <Notification
            message={notification?.message}
            type={notification?.type}
            onDismiss={() => setNotification(null)}
          />
          <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
            <View style={styles.header}>
              <Image source={logoImage} style={styles.logo} />
              <Text style={styles.headerText}>Đăng Nhập</Text>
            </View>
            <View style={styles.formContainer}>
              <View style={[styles.inputContainer, { borderColor: errors.email ? 'red' : '#B0BEC5' }]}>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  placeholderTextColor="#888"
                  autoCapitalize="none"
                />
              </View>
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
              <View style={[styles.inputContainer, { borderColor: errors.password ? 'red' : '#B0BEC5' }]}>
                <TextInput
                  style={styles.input}
                  placeholder="Mật khẩu"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholderTextColor="#888"
                />
              </View>
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
              <View style={styles.rememberRow}>
                <Switch
                  trackColor={{ false: '#ccc', true: '#4CAF50' }}
                  thumbColor={isRemember ? '#fff' : '#f4f3f4'}
                  onValueChange={setIsRemember}
                  value={isRemember}
                />
                <Text style={styles.rememberText}>Ghi nhớ</Text>
                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                  <Text style={styles.forgotText}>Quên mật khẩu?</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>Đăng nhập</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
                <Image
                  source={{ uri: 'https://img.icons8.com/color/48/000000/google-logo.png' }}
                  style={styles.googleIcon}
                />
                <Text style={styles.googleButtonText}>Đăng nhập với Google</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.linkText}>Chưa có tài khoản? Đăng ký</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F7FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0F7FA',
  },
  spinner: {
    width: 60,
    height: 60,
    position: 'relative',
  },
  spinnerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
    position: 'absolute',
    top: 24,
    left: 24,
  },
  dot2: {
    transform: [{ translateX: 20 }],
    backgroundColor: '#34C759',
  },
  dot3: {
    transform: [{ translateY: 20 }],
    backgroundColor: '#FF9500',
  },
  dot4: {
    transform: [{ translateX: -20 }],
    backgroundColor: '#FF3B30',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  formContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    elevation: 5,
  },
  inputContainer: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 10,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  rememberText: {
    marginLeft: 10,
    color: '#333',
  },
  forgotText: {
    color: '#FF5722',
    marginLeft: 50,
  },
  linkText: {
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 10,
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderColor: '#B0BEC5',
    borderWidth: 1,
    marginBottom: 10,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  googleButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default LoginScreen;