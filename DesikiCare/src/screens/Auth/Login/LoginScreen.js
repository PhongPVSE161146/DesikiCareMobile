import React, { useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import { login } from '../../../redux/authSlice';

// Header image (replace with your actual image path)
const headerImage = require('../../../../assets/DesikiCare.jpg');  // Update the path to your image

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();

  const handleLogin = () => {
    if (email && password) {
      dispatch(login({ email }));
      navigation.navigate('Home');
    } else {
      alert('Vui lòng điền đầy đủ thông tin.');
    }
  };

  const handleGoogleLogin = () => {
    // Implement Google login logic here
    alert('Google login functionality to be implemented.');
  };

  return (
    <View style={styles.container}>
      {/* Header Image */}
      <Image source={headerImage} style={styles.headerImage} />

      {/* Login Form */}
      <View style={styles.formContainer}>
        <Text style={styles.header}>Đăng nhập</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#888"
        />
        <Button title="Đăng nhập" onPress={handleLogin} color="#1E90FF"  style={styles.buttonLogin}/>
        <TouchableOpacity onPress={handleGoogleLogin} style={styles.googleButton}>
          <Image
            source={{ uri: 'https://img.icons8.com/color/48/000000/google-logo.png' }}
            style={styles.googleIcon}
          />
          <Text style={styles.googleButtonText}>Đăng nhập với Google</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.linkText}>Chưa có tài khoản? Đăng ký</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.linkText}>Quên mật khẩu?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerImage: {
    width: '50%',
    height: 200,
    resizeMode: 'cover',
    marginLeft: '25%',
    marginTop: 20,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
buttonLogin: {
    backgroundColor: '#4CAF50', // Màu nền
    borderRadius: 5, // Góc tròn
    paddingVertical: 15, // Padding tương đương 15px
    paddingHorizontal: 32, // Padding tương đương 32px
    alignItems: 'center', // Thay cho text-align: center
    elevation: 2, // Thay cho box-shadow ở trạng thái mặc định
  },
  buttonLoginHover: {
    backgroundColor: '#4CAF50', // Giữ nguyên màu mặc định, thay đổi khi nhấn
    elevation: 2, // Thay cho box-shadow
  },
  buttonLoginActive: {
    backgroundColor: '#3e8e41', // Màu nền khi nhấn
    elevation: 5, // Thay cho box-shadow khi nhấn (0 5px 5px 0 rgba(0,0,0,0.2))
    // Không hỗ trợ transform: translateY, nhưng elevation tạo hiệu ứng tương tự
  },



  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    width: '100%',
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
  linkText: {
    color: '#1E90FF',
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 14,
  },
});

export default LoginScreen;