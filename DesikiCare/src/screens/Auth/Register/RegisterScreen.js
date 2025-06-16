import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import { useDispatch } from 'react-redux';
import { login as reduxLogin } from '../../../redux/authSlice';
import authService from '../../../config/axios/Auth/authService'; // Adjust the import path

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [loading, setLoading] = useState(false);
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

    // Validate fullName (letters and spaces only)
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

    // Validate password (no spaces)
    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu.';
      isValid = false;
    } else if (/\s/.test(password)) {
      newErrors.password = 'Mật khẩu không được chứa khoảng cách.';
      isValid = false;
    }

    // Validate phoneNumber (digits only, 10-15 digits)
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Vui lòng nhập số điện thoại.';
      isValid = false;
    } else if (!/^\d{10,15}$/.test(phoneNumber.trim())) {
      newErrors.phoneNumber = 'Số điện thoại phải là 10-15 chữ số.';
      isValid = false;
    }

    // Validate gender
    const validGenders = ['nam', 'nữ', 'khác'];
    if (!gender) {
      newErrors.gender = 'Vui lòng chọn giới tính.';
      isValid = false;
    } else if (!validGenders.includes(gender.toLowerCase())) {
      newErrors.gender = 'Giới tính phải là "Nam", "Nữ", hoặc "Khác".';
      isValid = false;
    }

    // Validate dob (DD-MM-YYYY, digits and hyphens only)
    if (!dob.trim()) {
      newErrors.dob = 'Vui lòng nhập ngày sinh.';
      isValid = false;
    } else if (!/^\d{2}-\d{2}-\d{4}$/.test(dob.trim())) {
      newErrors.dob = 'Ngày sinh phải theo định dạng DD-MM-YYYY.';
      isValid = false;
    } else if (!/^[0-9-]+$/.test(dob.trim())) {
      newErrors.dob = 'Ngày sinh chỉ được chứa số và dấu gạch ngang.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const accountData = {
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        gender: gender.toLowerCase(),
        dob: dob.trim(),
        roleId: 0,
      };

      const result = await authService.register(accountData);
      setLoading(false);
      if (result.success) {
        dispatch(reduxLogin(result.data));
        navigation.navigate('Login', { notification: { message: 'Đăng ký tài khoản thành công', type: 'success' } });
      } else {
        navigation.navigate('Login', { notification: { message: result.message, type: 'error' } });
      }
    } catch (error) {
      setLoading(false);
      navigation.navigate('Login', { notification: { message: 'Đã xảy ra lỗi không mong muốn.', type: 'error' } });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Đăng Ký</Text>
        <Text style={styles.subHeader}>Tham gia DesikiCare ngay hôm nay</Text>
      </View>
      <View style={styles.formContainer}>
        <View style={[styles.inputContainer, { borderColor: errors.fullName ? 'red' : '#E0E0E0' }]}>
          <Icon name="person" size={24} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Họ và tên"
            placeholderTextColor="#999"
            value={fullName}
            onChangeText={setFullName}
          />
        </View>
        {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}
        <View style={[styles.inputContainer, { borderColor: errors.email ? 'red' : '#E0E0E0' }]}>
          <Icon name="email" size={24} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
        <View style={[styles.inputContainer, { borderColor: errors.password ? 'red' : '#E0E0E0' }]}>
          <Icon name="lock" size={24} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
        <View style={[styles.inputContainer, { borderColor: errors.phoneNumber ? 'red' : '#E0E0E0' }]}>
          <Icon name="phone" size={24} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Số điện thoại"
            placeholderTextColor="#999"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="numeric"
          />
        </View>
        {errors.phoneNumber ? <Text style={styles.errorText}>{errors.phoneNumber}</Text> : null}
        <View style={[styles.inputContainer, { borderColor: errors.gender ? 'red' : '#E0E0E0' }]}>
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
        <View style={[styles.inputContainer, { borderColor: errors.dob ? 'red' : '#E0E0E0' }]}>
          <Icon name="calendar-today" size={24} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Ngày sinh (YYYY-MM-DD)"
            placeholderTextColor="#999"
            value={dob}
            onChangeText={setDob}
            keyboardType="numbers-and-punctuation"
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
        {loading && (
          <ActivityIndicator
            size="large"
            color="#4A90E2"
            style={styles.loadingIndicator}
          />
        )}
        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginText}>Đã có tài khoản? <Text style={styles.loginTextBold}>Đăng nhập</Text></Text>
        </TouchableOpacity>
      </View>
      <View style={styles.pawContainer}>
        <Image source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/paw-print.png' }} style={styles.pawIcon} />
        <Image source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/paw-print.png' }} style={styles.pawIcon} />
        <Image source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/paw-print.png' }} style={styles.pawIcon} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#E6F0FA',
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  header: {
    fontSize: 32,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderWidth: 1,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
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
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#A3BFFA',
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
  loginText: {
    fontSize: 14,
    color: '#666',
  },
  loginTextBold: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  pawContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 20,
  },
  pawIcon: {
    width: 30,
    height: 30,
  },
});

export default RegisterScreen;