import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Image, ScrollView, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDispatch } from 'react-redux';
import { login as reduxLogin } from '../../../redux/authSlice';
import authService from '../../../config/axios/Auth/authService'; // Adjust the import path
import Notification from '../../../components/NotiComponnets/Notification'; // Adjust the import path

// Logo image (same as LoginScreen)
const logoImage = require('../../../../assets/DesikiCare.jpg');

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState(null); // Store as Date object
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    gender: '',
    dob: '',
  });
  const dispatch = useDispatch();

  const validateForm = () => {
    const newErrors = {
      email: '',
      password: '',
      fullName: '',
      phoneNumber: '',
      gender: '',
      dob: '',
    };
    let isValid = true;

    // Validate fullName
    if (!fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ và tên.';
      isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(fullName.trim())) {
      newErrors.fullName = 'Họ và tên chỉ được chứa chữ cái và khoảng cách.';
      isValid = false;
    }

    // Validate email
    if (!email.trim()) {
      newErrors.email = 'Vui lòng nhập email.';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Vui lòng nhập email hợp lệ.';
      isValid = false;
    }

    // Validate password
    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu.';
      isValid = false;
    } else if (/\s/.test(password)) {
      newErrors.password = 'Mật khẩu không được chứa khoảng cách.';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự.';
      isValid = false;
    }

    // Validate phoneNumber
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Vui lòng nhập số điện thoại.';
      isValid = false;
    } else if (!/^\d{10,15}$/.test(phoneNumber.trim())) {
      newErrors.phoneNumber = 'Số điện thoại phải là 10-15 chữ số.';
      isValid = false;
    }

    // Validate gender
    if (!gender) {
      newErrors.gender = 'Vui lòng chọn giới tính.';
      isValid = false;
    }

    // Validate dob
    if (!dob) {
      newErrors.dob = 'Vui lòng chọn ngày sinh.';
      isValid = false;
    } else {
      const today = new Date();
      const year = dob.getFullYear();
      if (year < 1900 || dob > today) {
        newErrors.dob = 'Ngày sinh không hợp lệ.';
        isValid = false;
      }
    }

    setErrors(newErrors);
    if (!isValid) {
      setNotification({ message: 'Vui lòng kiểm tra lại thông tin.', type: 'error' });
    }
    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Format dob to YYYY-MM-DD for API
      const formattedDob = dob.toISOString().split('T')[0];

      const accountData = {
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        gender: gender.toLowerCase(),
        dob: formattedDob,
        roleId: 0,
        imageBase64: '',
      };

      const result = await authService.register(accountData);
      console.log('Register result:', result); // Debugging API response
      setLoading(false);

      if (result.success) {
        dispatch(reduxLogin(result.data));
        setNotification({ message: 'Đăng ký tài khoản thành công!', type: 'success' });
        setTimeout(() => {
          if (navigation && typeof navigation.reset === 'function') {
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: 'Login',
                  params: {
                    screen: 'Login',
                    params: { notification: { message: 'Đăng ký tài khoản thành công!', type: 'success' } },
                  },
                },
              ],
            });
            console.log('Navigated to Main with Home tab and success notification');
          } else {
            console.error('Navigation object is invalid:', navigation);
            setNotification({ message: 'Lỗi điều hướng. Vui lòng thử lại.', type: 'error' });
          }
        }, 1000); // Delay navigation to show success notification
      } else {
        setNotification({ message: result.message || 'Đăng ký thất bại.', type: 'error' });
      }
    } catch (error) {
      console.error('Register error:', error);
      setLoading(false);
      setNotification({ message: 'Đã xảy ra lỗi không mong muốn.', type: 'error' });
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false); // Close picker after selection
    if (selectedDate) {
      setDob(selectedDate);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Chọn ngày sinh';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleGenderSelect = (value) => {
    setGender(value);
    setShowGenderModal(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Notification
          message={notification?.message}
          type={notification?.type}
          onDismiss={() => setNotification(null)}
        />
        <View style={styles.header}>
          <Image source={logoImage} style={styles.logo} />
          <Text style={styles.headerText}>Đăng Ký</Text>
        </View>
        <View style={styles.formContainer}>
          <View style={[styles.inputContainer, { borderColor: errors.fullName ? 'red' : '#B0BEC5' }]}>
            <Icon name="person" size={24} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Họ và tên"
              value={fullName}
              onChangeText={setFullName}
              placeholderTextColor="#888"
            />
          </View>
          {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}
          <View style={[styles.inputContainer, { borderColor: errors.email ? 'red' : '#B0BEC5' }]}>
            <Icon name="email" size={24} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#888"
            />
          </View>
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          <View style={[styles.inputContainer, { borderColor: errors.password ? 'red' : '#B0BEC5' }]}>
            <Icon name="lock" size={24} color="#666" style={styles.inputIcon} />
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
          <View style={[styles.inputContainer, { borderColor: errors.phoneNumber ? 'red' : '#B0BEC5' }]}>
            <Icon name="phone" size={24} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Số điện thoại"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="numeric"
              placeholderTextColor="#888"
            />
          </View>
          {errors.phoneNumber ? <Text style={styles.errorText}>{errors.phoneNumber}</Text> : null}
          <TouchableOpacity
            style={[styles.inputContainer, { borderColor: errors.gender ? 'red' : '#B0BEC5' }]}
            onPress={() => setShowGenderModal(true)}
          >
            <Icon name="wc" size={24} color="#666" style={styles.inputIcon} />
            <Text style={[styles.input, { color: gender ? '#333' : '#888' }]}>
              {gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : 'Chọn giới tính'}
            </Text>
            <Icon name="arrow-drop-down" size={24} color="#666" style={styles.inputIcon} />
          </TouchableOpacity>
          {errors.gender ? <Text style={styles.errorText}>{errors.gender}</Text> : null}
          <Modal
            visible={showGenderModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowGenderModal(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Chọn giới tính</Text>
                <View style={styles.genderOptionsContainer}>
                  {['nam', 'nữ', 'khác'].map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.genderOption,
                        gender === option && styles.genderOptionSelected,
                      ]}
                      onPress={() => handleGenderSelect(option)}
                    >
                      <Text
                        style={[
                          styles.genderOptionText,
                          gender === option && styles.genderOptionTextSelected,
                        ]}
                      >
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowGenderModal(false)}
                >
                  <Text style={styles.closeButtonText}>Đóng</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          <TouchableOpacity
            style={[styles.inputContainer, { borderColor: errors.dob ? 'red' : '#B0BEC5' }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Icon name="calendar-today" size={24} color="#666" style={styles.inputIcon} />
            <Text style={[styles.input, { color: dob ? '#333' : '#888' }]}>
              {formatDate(dob)}
            </Text>
            <Icon name="arrow-drop-down" size={24} color="#666" style={styles.inputIcon} />
          </TouchableOpacity>
          {errors.dob ? <Text style={styles.errorText}>{errors.dob}</Text> : null}
          <Modal
            visible={showDatePicker}
            transparent
            animationType="fade"
            onRequestClose={() => setShowDatePicker(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Chọn ngày sinh</Text>
                <DateTimePicker
                  value={dob || new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  minimumDate={new Date(1900, 0, 1)}
                  style={styles.datePicker}
                  textColor="#333"
                  accentColor="#4CAF50" // Highlight selected date
                  themeVariant="light"
                />
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.closeButtonText}>Đóng</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          <TouchableOpacity
            style={[styles.registerButton, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Đang đăng ký...' : 'Đăng Ký'}</Text>
          </TouchableOpacity>
          {loading && <ActivityIndicator size="large" color="#4CAF50" style={styles.loadingIndicator} />}
          <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Đã có tài khoản? Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F7FA',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  headerText: {
    fontSize: 30,
    fontWeight: '700',
    color: '#333',
  },
  formContainer: {
    width: '85%',
    padding: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  inputContainer: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  datePicker: {
    width: '100%',
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '85%',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  genderOptionsContainer: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
  },
  genderOption: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 5,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  genderOptionSelected: {
    backgroundColor: '#4CAF50',
  },
  genderOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  genderOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingIndicator: {
    marginTop: 10,
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default RegisterScreen;