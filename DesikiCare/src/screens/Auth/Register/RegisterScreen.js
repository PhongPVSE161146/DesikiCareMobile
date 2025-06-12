import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Platform, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000); // Simulate loading
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Đăng Ký</Text>
        <Text style={styles.subHeader}>Tham gia DesikiCare ngay hôm nay</Text>
      </View>
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Icon name="person" size={24} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Họ và tên"
            placeholderTextColor="#999"
            value={fullName}
            onChangeText={setFullName}
          />
        </View>
        <View style={styles.inputContainer}>
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
        <View style={styles.inputContainer}>
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
        <View style={styles.inputContainer}>
          <Icon name="phone" size={24} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Số điện thoại"
            placeholderTextColor="#999"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
        </View>
        <View style={styles.inputContainer}>
          <Icon name="wc" size={24} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Giới tính (Nam/Nữ)"
            placeholderTextColor="#999"
            value={gender}
            onChangeText={setGender}
          />
        </View>
        <View style={styles.inputContainer}>
          <Icon name="calendar-today" size={24} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Ngày sinh (YYYY-MM-DD)"
            placeholderTextColor="#999"
            value={dob}
            onChangeText={setDob}
          />
        </View>
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
    backgroundColor: '#E6F0FA', // Light blue base
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
    borderColor: '#E0E0E0',
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