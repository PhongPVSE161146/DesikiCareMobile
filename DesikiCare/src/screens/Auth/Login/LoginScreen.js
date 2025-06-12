import React, { useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, Image, StyleSheet, Switch } from 'react-native';
import { useDispatch } from 'react-redux';
import { login } from '../../../redux/authSlice';

// Logo image (replace with your actual path)
const logoImage = require('../../../../assets/DesikiCare.jpg');

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('sojonism007@gmail.com');
  const [password, setPassword] = useState('');
  const [isRemember, setIsRemember] = useState(false);
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
    // Implement Google login logic here (e.g., using a library like @react-native-google-signin/google-signin)
    alert('Google login functionality to be implemented.');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={logoImage} style={styles.logo} />
        <Text style={styles.headerText}>Đăng Nhập</Text>
      </View>

      {/* Login Form */}
      <View style={styles.formContainer}>
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
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#888"
        />
        <View style={styles.rememberRow}>
          <Switch
            trackColor={{ false: '#ccc', true: '#4CAF50' }}
            thumbColor={isRemember ? '#fff' : '#f4f3f4'}
            onValueChange={setIsRemember}
            value={isRemember}
          />
          <Text style={styles.rememberText}>Remember</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgotText}>Forgot password!</Text>
          </TouchableOpacity>
        </View>
        <Button title="Log in" onPress={handleLogin} color="#4CAF50" />
        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
          <Image
            source={{ uri: 'https://img.icons8.com/color/48/000000/google-logo.png' }}
            style={styles.googleIcon}
          />
          <Text style={styles.googleButtonText}>Login with Google</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.linkText}>Don't have an account? Signup</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F7FA', // Light cyan background
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
  input: {
    width: '100%',
    height: 50,
    borderColor: '#B0BEC5',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
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
    marginLeft: 30,
    color: '#FF5722', // Orange color for "Forgot password!"
  },
  linkText: {
    color: '#4CAF50', // Green for signup link
    textAlign: 'center',
    marginTop: 10,
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
    marginTop: 10,
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