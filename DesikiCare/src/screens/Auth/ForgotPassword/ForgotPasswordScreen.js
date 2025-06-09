import React, { useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity } from 'react-native';
import { styles } from '../../../assets/styles';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');

  const handleResetPassword = () => {
    if (email) {
      alert('Link đặt lại mật khẩu đã được gửi đến email của bạn.');
      navigation.navigate('Login');
    } else {
      alert('Vui lòng nhập email.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Quên mật khẩu</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <Button title="Gửi link đặt lại" onPress={handleResetPassword} />
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>Quay lại đăng nhập</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ForgotPasswordScreen;