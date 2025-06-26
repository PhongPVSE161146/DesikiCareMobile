import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import { useDispatch } from 'react-redux';
import { login as reduxLogin } from '../../../redux/authSlice';
import authService from '../../../config/axios/Auth/authService'; // Adjust the import path
import Notification from '../../../components/Notification'; // Adjust the import path

// Logo image (same as LoginScreen)
const logoImage = require('../../../../assets/DesikiCare.jpg');

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
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

    // Validate dob (DD-MM-YYYY format for input, convert to YYYY-MM-DD for API)
    if (!dob.trim()) {
      newErrors.dob = 'Vui lòng nhập ngày sinh.';
      isValid = false;
    } else if (!/^\d{2}-\d{2}-\d{4}$/.test(dob.trim())) {
      newErrors.dob = 'Ngày sinh phải theo định dạng DD-MM-YYYY.';
      isValid = false;
    } else {
      const [day, month, year] = dob.trim().split('-');
      const date = new Date(`${year}-${month}-${day}`);
      if (isNaN(date.getTime()) || parseInt(year) < 1900 || date > new Date()) {
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
      // Convert dob from DD-MM-YYYY to YYYY-MM-DD for API
      const [day, month, year] = dob.trim().split('-');
      const formattedDob = `${year}-${month}-${day}`;

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
              routes: [{ name: 'Main', params: { screen: 'Home' } }],
            });
            console.log('Navigated to Main with Home tab');
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

  return (
    <View style={styles.container}>
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
        <View style={[styles.inputContainer, { borderColor: errors.gender ? 'red' : '#B0BEC5' }]}>
          <Icon name="wc" size={24} color="#666" style={styles.inputIcon} />
          <Picker
            selectedValue={gender}
            onValueChange={(itemValue) => setGender(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Chọn giới tính" value="" />
            <Picker.Item label="Nam" value="nam" />
            <Picker.Item label="Nữ" value="nữ" />
            <Picker.Item label="Khác" value="khác" />
          </Picker>
        </View>
        {errors.gender ? <Text style={styles.errorText}>{errors.gender}</Text> : null}
        <View style={[styles.inputContainer, { borderColor: errors.dob ? 'red' : '#B0BEC5' }]}>
          <Icon name="calendar-today" size={24} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Ngày sinh (DD-MM-YYYY)"
            value={dob}
            onChangeText={setDob}
            keyboardType="numbers-and-punctuation"
            placeholderTextColor="#888"
          />
        </View>
        {errors.dob ? <Text style={styles.errorText}>{errors.dob}</Text> : null}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  picker: {
    flex: 1,
    height: 50,
    color: '#333',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 10,
  },
  registerButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingIndicator: {
    marginTop: 10,
  },
  loginLink: {
    marginTop: 15,
    alignItems: 'center',
  },
  linkText: {
    color: '#4CAF50',
    fontSize: 14,
  },
});

export default RegisterScreen;